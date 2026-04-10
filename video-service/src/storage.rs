use aws_sdk_s3::Client;
use aws_sdk_s3::primitives::ByteStream;
use anyhow::{Result, anyhow};
use std::path::Path;
use tokio::fs;

pub struct StorageManager {
    client: Client,
    bucket: String,
}

impl StorageManager {
    pub async fn new() -> Result<Self> {
        let config = aws_config::load_from_env().await;
        let client = Client::new(&config);
        let bucket = std::env::var("S3_BUCKET_NAME").map_err(|_| anyhow!("S3_BUCKET_NAME not set"))?;
        
        Ok(Self { client, bucket })
    }

    /// Recursively upload HLS directory to S3
    pub async fn upload_hls_dir(&self, local_dir: &str, s3_prefix: &str) -> Result<()> {
        let mut entries = fs::read_dir(local_dir).await?;

        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_file() {
                let filename = path.file_name().unwrap().to_str().unwrap();
                let key = format!("{}/{}", s3_prefix, filename);
                self.upload_file(&path, &key).await?;
            }
        }
        Ok(())
    }

    pub async fn upload_file(&self, local_path: &Path, key: &str) -> Result<()> {
        let body = ByteStream::from_path(local_path).await?;
        
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .body(body)
            .send()
            .await
            .map_err(|e| anyhow!("Upload failed: {}", e))?;

        Ok(())
    }
}
