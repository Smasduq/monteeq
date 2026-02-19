import os
import boto3
from botocore.exceptions import NoCredentialsError
from app.core import config

class Storage:
    def __init__(self):
        self.mode = config.STORAGE_MODE
        self.bucket_name = config.S3_BUCKET_NAME
        
        if self.mode == "s3":
            self.s3_client = boto3.client(
                's3',
                endpoint_url=config.S3_ENDPOINT,
                aws_access_key_id=config.S3_ACCESS_KEY,
                aws_secret_access_key=config.S3_SECRET_KEY,
                region_name=config.S3_REGION
            )

    def upload_file(self, local_path: str, s3_key: str) -> str:
        """
        Uploads a file to the configured storage and returns its URL.
        """
        if self.mode == "local":
            # Fallback to current local logic
            dest_dir = os.path.dirname(os.path.join(config.STATIC_DIR, s3_key))
            os.makedirs(dest_dir, exist_ok=True)
            dest_path = os.path.join(config.STATIC_DIR, s3_key)
            
            import shutil
            shutil.copy2(local_path, dest_path)
            return f"{config.BASE_URL}/static/{s3_key}"
        
        else:
            # Upload to S3/Backblaze B2
            try:
                self.s3_client.upload_file(local_path, self.bucket_name, s3_key)
                
                # For Backblaze B2, the public URL typically follows this format:
                # https://f000.backblazeb2.com/file/bucket-name/object-key
                # However, S3 endpoints often work as:
                # {endpoint}/{bucket}/{key}
                
                # We'll construct a generic S3-style URL first, 
                # but B2 specific ones might need custom logic if not using a friendly URL
                
                # Check if it's a B2 native endpoint to construct a "friendly" URL if possible
                if "backblazeb2.com" in config.S3_ENDPOINT:
                    # Construct B2 direct download URL (Friendly URL style)
                    # example: https://s3.us-west-004.backblazeb2.com/my-bucket/video.mp4
                    # Native B2: https://f00x.backblazeb2.com/file/my-bucket/video.mp4
                    return f"{config.S3_ENDPOINT}/{self.bucket_name}/{s3_key}"
                
                return f"{config.S3_ENDPOINT}/{self.bucket_name}/{s3_key}"
                
            except Exception as e:
                print(f"S3 Upload failed: {e}")
                raise e

    def get_url(self, s3_key: str) -> str:
        """
        Returns the public URL for a given key.
        """
        if self.mode == "local":
            return f"{config.BASE_URL}/static/{s3_key}"
        else:
            return f"{config.S3_ENDPOINT}/{self.bucket_name}/{s3_key}"

storage = Storage()
