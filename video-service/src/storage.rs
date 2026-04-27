use google_cloud_storage::client::{Client, ClientConfig};
use google_cloud_storage::http::objects::upload::{Media, UploadObjectRequest, UploadType};
use google_cloud_storage::http::objects::get::GetObjectRequest;
use google_cloud_storage::http::objects::download::Range;
use anyhow::{Result, anyhow};
use std::path::Path;
use tokio::fs;

pub struct StorageManager {
    client: Client,
    bucket: String,
}

impl StorageManager {
    pub async fn new() -> Result<Self> {
        let config = ClientConfig::default().with_auth().await?;
        let client = Client::new(config);
        let bucket = std::env::var("GCS_BUCKET").map_err(|_| anyhow!("GCS_BUCKET not set"))?;
        
        Ok(Self { client, bucket })
    }

    /// Recursively upload HLS directory to GCS
    pub async fn upload_hls_dir(&self, local_dir: &str, gcs_prefix: &str) -> Result<()> {
        let mut entries = fs::read_dir(local_dir).await?;

        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_file() {
                let filename = path.file_name().unwrap().to_str().unwrap();
                let key = format!("{}/{}", gcs_prefix, filename);
                self.upload_file(&path, &key).await?;
            }
        }
        Ok(())
    }

    pub async fn upload_file(&self, local_path: &Path, key: &str) -> Result<()> {
        let data = fs::read(local_path).await?;
        let content_length = data.len() as u64;
        let mime_type = match local_path.extension().and_then(|s| s.to_str()) {
            Some("m3u8") => "application/x-mpegURL",
            Some("ts") => "video/MP2T",
            Some("jpg") | Some("jpeg") => "image/jpeg",
            _ => "application/octet-stream",
        };

        // In google-cloud-storage 0.14, we use UploadType::Simple with Media
        // Media has name, content_type, and content_length fields
        let upload_type = UploadType::Simple(Media {
            name: key.to_string().into(),
            content_type: mime_type.to_string().into(),
            content_length: Some(content_length),
        });

        let request = UploadObjectRequest {
            bucket: self.bucket.clone(),
            ..Default::default()
        };

        self.client
            .upload_object(
                &request,
                data,
                &upload_type,
            )
            .await
            .map_err(|e| anyhow!("Upload failed: {}", e))?;

        Ok(())
    }

    pub async fn download_file(&self, key: &str, local_path: &Path) -> Result<()> {
        let request = GetObjectRequest {
            bucket: self.bucket.clone(),
            object: key.to_string(),
            ..Default::default()
        };

        let data = self.client.download_object(&request, &Range::default()).await
            .map_err(|e| anyhow!("Download failed from GCS: {}", e))?;

        fs::write(local_path, data).await?;
        Ok(())
    }
}
