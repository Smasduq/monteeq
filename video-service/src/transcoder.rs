use tokio::process::Command;
use anyhow::{Result, anyhow};
use std::path::Path;
use tokio::fs;
use crate::storage::StorageManager;
use crate::models::{UserTier, TaskStatus};
use crate::ax_status::StatusMap;

pub struct TranscodingConfig {
    pub preset: String,
    pub max_height: i32,
    pub crf: String,
}

impl TranscodingConfig {
    pub fn for_tier(tier: &UserTier) -> Self {
        match tier {
            UserTier::Free => Self {
                preset: "superfast".to_string(),
                max_height: 720,
                crf: "26".to_string(), // Slightly lower quality for space/speed
            },
            UserTier::Pro => Self {
                preset: "medium".to_string(),
                max_height: 2160, // Support up to 4K
                crf: "23".to_string(), // Better quality
            },
        }
    }
}

pub async fn process(
    video_id: String, // Platform ID
    video_path: &str, // Local filesystem path
    format: &str, 
    tier: UserTier,
    skip_thumbnail: bool, 
    status_map: Option<StatusMap>, 
    task_id: String  // Processing Key
) -> Result<()> {
    let config = TranscodingConfig::for_tier(&tier);
    
    // 1. Metadata extraction
    let (width, height, has_audio) = get_video_metadata(video_path).await?;
    let aspect_ratio = width / height;
    
    // 2. Prep Output
    let output_dir = format!("{}_hls", video_path);
    if !Path::new(&output_dir).exists() {
        fs::create_dir_all(&output_dir).await?;
    }

    // 3. Transcode + Thumbnail Concurrently
    let transcoding_fut = transcode_tiered(video_path, &output_dir, format, &config, status_map.clone(), task_id.clone(), has_audio);
    let v_path = video_path.to_string();
    let thumbnail_fut = async move {
        if !skip_thumbnail {
            generate_thumbnail(&v_path).await
        } else {
            Ok(())
        }
    };

    // Run both. Pro users might benefit from faster total completion time
    let (trans_res, thumb_res) = tokio::join!(transcoding_fut, thumbnail_fut);
    
    trans_res?;
    thumb_res?;

    // 4. Upload to Storage
    if let Ok(storage) = StorageManager::new().await {
        let s3_prefix = format!("videos/{}", task_id);
        if let Some(ref map) = status_map {
            map.insert(task_id.clone(), TaskStatus {
                progress: 98,
                status: "uploading".to_string(),
                message: "Uploading to cloud storage...".to_string(),
            });
        }
        storage.upload_hls_dir(&output_dir, &s3_prefix).await?;
        
        // Upload thumbnail too
        if !skip_thumbnail {
            let thumb_path = format!("{}.jpg", video_path);
            let thumb_key = format!("thumbnails/{}.jpg", video_id);
            storage.upload_file(Path::new(&thumb_path), &thumb_key).await?;
        }
    }

    Ok(())
}

async fn get_video_metadata(video_path: &str) -> Result<(f32, f32, bool)> {
    let output = Command::new("ffprobe")
        .args(&[
            "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=s=x:p=0",
            video_path,
        ])
        .output().await?;

    let s = String::from_utf8(output.stdout)?;
    let parts: Vec<&str> = s.trim().split('x').collect();
    if parts.len() != 2 {
        return Err(anyhow!("Invalid ffprobe output: {}", s));
    }

    let width = parts[0].parse()?;
    let height = parts[1].parse()?;

    // Check for audio
    let audio_output = Command::new("ffprobe")
        .args(&[
            "-v", "error", "-select_streams", "a",
            "-show_entries", "stream=index",
            "-of", "csv=p=0",
            video_path,
        ])
        .output().await?;
    
    let has_audio = !String::from_utf8(audio_output.stdout)?.trim().is_empty();

    Ok((width, height, has_audio))
}

async fn transcode_tiered(
    input: &str, 
    output_dir: &str, 
    format: &str, 
    config: &TranscodingConfig,
    status_map: Option<StatusMap>,
    task_id: String,
    has_audio: bool
) -> Result<()> {
    let mut args = vec![
        "-i", input,
        "-preset", &config.preset,
        "-crf", &config.crf,
    ];

    if has_audio {
        args.extend_from_slice(&["-c:a", "aac", "-b:a", "128k"]);
    }

    args.extend_from_slice(&[
        "-f", "hls",
        "-hls_time", "6",
        "-hls_playlist_type", "vod",
        "-master_pl_name", "master.m3u8",
    ]);

    let source_height = get_video_height(input).await?;
    let target_height = source_height.min(config.max_height);

    // Build adaptive stream map based on tier
    let (filter, stream_map) = if format == "flash" {
        // Single quality for flash (Vertical)
        (
            format!("[0:v]scale=w=-2:h={}[vout]", target_height),
            if has_audio { "v:0,a:0,name:720p".to_string() } else { "v:0,name:720p".to_string() }
        )
    } else if config.max_height <= 720 {
        // Free tier multi-bitrate (capped)
        (
            "[0:v]split=2[v1][v2]; [v1]scale=w=-2:h=720[v1out]; [v2]scale=w=-2:h=480[v2out]".to_string(),
            if has_audio { "v:0,a:0,name:720p v:1,a:0,name:480p".to_string() } else { "v:0,name:720p v:1,name:480p".to_string() }
        )
    } else {
        // Pro tier full multi-bitrate
        (
            "[0:v]split=3[v1][v2][v3]; [v1]scale=w=-2:h=1080[v1out]; [v2]scale=w=-2:h=720[v2out]; [v3]scale=w=-2:h=480[v3out]".to_string(),
            if has_audio { "v:0,a:0,name:1080p v:1,a:0,name:720p v:2,a:0,name:480p".to_string() } else { "v:0,name:1080p v:1,name:720p v:2,name:480p".to_string() }
        )
    };

    // Add filter complex and mapping
    args.extend_from_slice(&["-filter_complex", &filter]);
    
    // Simplification for the example: mapping outputs based on split
    if filter.contains("split=3") {
         args.extend_from_slice(&[
            "-map", "[v1out]", "-c:v:0", "libx264", "-b:v:0", "5000k",
            "-map", "[v2out]", "-c:v:1", "libx264", "-b:v:1", "2800k",
            "-map", "[v3out]", "-c:v:2", "libx264", "-b:v:2", "1200k",
        ]);
    } else if filter.contains("split=2") {
        args.extend_from_slice(&[
            "-map", "[v1out]", "-c:v:0", "libx264", "-b:v:0", "2800k",
            "-map", "[v2out]", "-c:v:1", "libx264", "-b:v:1", "1200k",
        ]);
    } else {
        args.extend_from_slice(&[
            "-map", "[vout]", "-c:v:0", "libx264", "-b:v:0", "2800k",
        ]);
    }

    if has_audio {
        args.extend_from_slice(&["-map", "0:a?", "-c:a:0", "aac", "-b:a:0", "128k"]);
    }

    let segment_filename = format!("{}/%v_%03d.ts", output_dir);
    let output_pattern = format!("{}/%v.m3u8", output_dir);

    args.extend_from_slice(&[
        "-hls_segment_filename", &segment_filename,
        "-var_stream_map", &stream_map,
        &output_pattern,
    ]);

    if let Some(ref map) = status_map {
        map.insert(task_id, TaskStatus {
            progress: 15,
            status: "processing".to_string(),
            message: format!("Compressing and optimizing video (Tier: {:?})", tier),
        });
    }

    let output = Command::new("ffmpeg").args(&args).output().await?;
    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        eprintln!("FFmpeg Error: {}", err);
        return Err(anyhow!("FFmpeg failed: {}", err));
    }
    Ok(())
}

async fn get_video_height(input: &str) -> Result<i32> {
    let output = Command::new("ffprobe")
        .args(&["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=height", "-of", "csv=p=0", input])
        .output().await?;
    let s = String::from_utf8(output.stdout)?;
    Ok(s.trim().parse()?)
}

async fn generate_thumbnail(video_path: &str) -> Result<()> {
    let thumb_path = format!("{}.jpg", video_path);
    let status = Command::new("ffmpeg")
        .args(&["-i", video_path, "-ss", "00:00:01", "-vframes", "1", "-q:v", "2", "-y", &thumb_path])
        .status().await?;
    if !status.success() {
        return Err(anyhow!("Thumbnail generation failed"));
    }
    Ok(())
}
