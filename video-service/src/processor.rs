use tokio::process::Command;
use anyhow::{Result, anyhow};
use crate::ax_status::StatusMap;
use crate::TaskStatus;
use std::path::Path;
use tokio::fs;

pub async fn process(video_path: &str, format: &str, skip_thumbnail: bool, status_map: Option<StatusMap>, task_id: String) -> Result<()> {
    // 1. Get Dimensions and Aspect Ratio
    let (width, height) = get_video_dimensions(video_path).await?;
    let aspect_ratio = width / height;
    println!("Detected dimensions: {}x{} (AR: {})", width, height, aspect_ratio);
    
    validate_format(aspect_ratio, format)?;

    // 2. Create HLS Directory
    let output_dir = format!("{}_hls", video_path);
    if !Path::new(&output_dir).exists() {
        fs::create_dir_all(&output_dir).await?;
    }

    // 3. Transcode
    if format == "flash" {
        // Flash videos: High quality single resolution HLS (Vertical)
        if let Some(ref map) = status_map {
            map.insert(task_id.clone(), TaskStatus {
                progress: 30,
                status: "processing".to_string(),
                message: "Optimizing vertical flash video for HLS...".to_string(),
            });
        }
        transcode_hls_single(video_path, &output_dir, height as i32).await?;
    } else {
        // Home videos: Multi-bitrate HLS (Horizontal)
        if let Some(ref map) = status_map {
            map.insert(task_id.clone(), TaskStatus {
                progress: 20,
                status: "processing".to_string(),
                message: "Starting multi-bitrate HLS transcoding...".to_string(),
            });
        }
        transcode_hls_multi(video_path, &output_dir, height as i32).await?;
    }

    // 4. Generate master playlist if not existing (FFmpeg might have created it)
    let master_path = format!("{}/master.m3u8", output_dir);
    if !Path::new(&master_path).exists() {
        generate_master_playlist(&output_dir, format).await?;
    }

    // 5. Generate thumbnail
    if !skip_thumbnail {
        if let Some(ref map) = status_map {
            map.insert(task_id.clone(), TaskStatus {
                progress: 95,
                status: "processing".to_string(),
                message: "Generating thumbnail...".to_string(),
            });
        }
        generate_thumbnail(video_path).await?;
    }

    Ok(())
}

async fn get_video_dimensions(video_path: &str) -> Result<(f32, f32)> {
    let output = Command::new("ffprobe")
        .args(&[
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=s=x:p=0",
            video_path,
        ])
        .output().await?;

    if !output.status.success() {
        return Err(anyhow!("ffprobe failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    let s = String::from_utf8(output.stdout)?;
    let parts: Vec<&str> = s.trim().split('x').collect();
    if parts.len() != 2 {
        return Err(anyhow!("Invalid ffprobe output: {}", s));
    }

    let width: f32 = parts[0].parse()?;
    let height: f32 = parts[1].parse()?;
    
    Ok((width, height))
}

fn validate_format(ratio: f32, target: &str) -> Result<()> {
    match target {
        "home" => {
            if ratio < 1.0 { return Err(anyhow!("Invalid aspect ratio for Home (Horizontal expected)")); }
        }
        "flash" => {
            if ratio > 1.0 { return Err(anyhow!("Invalid aspect ratio for Flash (Vertical expected)")); }
        }
        _ => return Err(anyhow!("Unknown format")),
    }
    Ok(())
}

async fn transcode_hls_single(input: &str, output_dir: &str, height: i32) -> Result<()> {
    println!("Transcoding single HLS variant: {}p", height);
    
    let status = Command::new("ffmpeg")
        .args(&[
            "-i", input,
            "-c:v", "libx264",
            "-crf", "23",
            "-preset", "fast",
            "-c:a", "aac",
            "-b:a", "128k",
            "-f", "hls",
            "-hls_time", "4",
            "-hls_playlist_type", "vod",
            "-hls_segment_filename", &format!("{}/720p_%03d.ts", output_dir),
            &format!("{}/720p.m3u8", output_dir),
        ])
        .status().await?;

    if !status.success() {
        return Err(anyhow!("ffmpeg single-bitrate HLS failed"));
    }
    Ok(())
}

async fn transcode_hls_multi(input: &str, output_dir: &str, source_height: i32) -> Result<()> {
    println!("Transcoding multi-bitrate HLS from {}p", source_height);
    
    let output_pattern = format!("{}/%v.m3u8", output_dir);
    let segment_pattern = format!("{}/%v_%03d.ts", output_dir);
    
    let mut args = vec![
        "-i", input,
    ];
    
    let filter;
    let stream_map;
    
    if source_height >= 1080 {
        filter = "[0:v]split=3[v1][v2][v3]; [v1]scale=w=-2:h=1080[v1out]; [v2]scale=w=-2:h=720[v2out]; [v3]scale=w=-2:h=480[v3out]".to_string();
        stream_map = "v:0,a:0,name:1080p v:1,a:0,name:720p v:2,a:0,name:480p".to_string();
        args.extend_from_slice(&[
            "-filter_complex", &filter,
            "-map", "[v1out]", "-c:v:0", "libx264", "-b:v:0", "5000k", "-maxrate:v:0", "5500k", "-bufsize:v:0", "10000k",
            "-map", "[v2out]", "-c:v:1", "libx264", "-b:v:1", "2800k", "-maxrate:v:1", "3100k", "-bufsize:v:1", "5600k",
            "-map", "[v3out]", "-c:v:2", "libx264", "-b:v:2", "1200k", "-maxrate:v:2", "1350k", "-bufsize:v:2", "2400k",
            "-map", "0:a?", "-c:a:0", "aac", "-b:a:0", "128k",
        ]);
    } else {
        filter = "[0:v]split=2[v1][v2]; [v1]scale=w=-2:h=720[v1out]; [v2]scale=w=-2:h=480[v2out]".to_string();
        stream_map = "v:0,a:0,name:720p v:1,a:0,name:480p".to_string();
        args.extend_from_slice(&[
            "-filter_complex", &filter,
            "-map", "[v1out]", "-c:v:0", "libx264", "-b:v:0", "2800k", "-maxrate:v:0", "3100k", "-bufsize:v:0", "5600k",
            "-map", "[v2out]", "-c:v:1", "libx264", "-b:v:1", "1200k", "-maxrate:v:1", "1350k", "-bufsize:v:1", "2400k",
            "-map", "0:a?", "-c:a:0", "aac", "-b:a:0", "128k",
        ]);
    }

    args.extend_from_slice(&[
        "-f", "hls",
        "-hls_time", "6",
        "-hls_playlist_type", "vod",
        "-master_pl_name", "master.m3u8",
        "-hls_segment_filename", &segment_pattern,
        "-var_stream_map", &stream_map,
        &output_pattern,
    ]);

    let status = Command::new("ffmpeg")
        .args(&args)
        .status().await?;

    if !status.success() {
        return Err(anyhow!("ffmpeg multi-bitrate HLS failed"));
    }
    Ok(())
}

async fn generate_master_playlist(output_dir: &str, format: &str) -> Result<()> {
    let master_path = format!("{}/master.m3u8", output_dir);
    
    // Determine which variants should exist based on the logic in transcode_hls_multi
    // This is a fallback in case FFmpeg didn't create it, but it should match the naming.
    let content = if format == "flash" {
        "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=720x1280\n720p.m3u8".to_string()
    } else {
        // We check for the presence of 1080p.m3u8 to decide which template to use
        let p1080 = format!("{}/1080p.m3u8", output_dir);
        if Path::new(&p1080).exists() {
            "#EXTM3U\n#EXT-X-VERSION:3\n\
            #EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080\n1080p.m3u8\n\
            #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n720p.m3u8\n\
            #EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480\n480p.m3u8".to_string()
        } else {
            "#EXTM3U\n#EXT-X-VERSION:3\n\
            #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n720p.m3u8\n\
            #EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480\n480p.m3u8".to_string()
        }
    };
    
    fs::write(master_path, content).await?;
    Ok(())
}

async fn generate_thumbnail(video_path: &str) -> Result<()> {
    let thumb_path = format!("{}.jpg", video_path);
    println!("Generating thumbnail for {}", video_path);
    let status = Command::new("ffmpeg")
        .args(&[
            "-i", video_path,
            "-ss", "00:00:01",
            "-vframes", "1",
            "-q:v", "2",
            "-y",
            &thumb_path,
        ])
        .status().await?;

    if !status.success() {
        return Err(anyhow!("ffmpeg thumbnail generation failed"));
    }
    Ok(())
}
