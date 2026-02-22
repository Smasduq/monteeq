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
            dest_path = os.path.join(config.STATIC_DIR, s3_key)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            
            import shutil
            shutil.copy2(local_path, dest_path)
            # Ensure URL uses forward slashes
            url_key = s3_key.replace(os.sep, "/")
            return f"{config.BASE_URL}/static/{url_key}"
        
        else:
            try:
                self.s3_client.upload_file(local_path, self.bucket_name, s3_key)
                return self.get_url(s3_key)
            except Exception as e:
                print(f"S3 Upload failed: {e}")
                raise e

    def get_url(self, s3_key: str) -> str:
        """
        Returns the public URL for a given key.
        """
        url_key = s3_key.replace(os.sep, "/")
        if self.mode == "local":
            return f"{config.BASE_URL}/static/{url_key}"
        else:
            # Backblaze B2 S3-Compatible URLs:
            # {endpoint}/{bucket}/{key}
            endpoint = config.S3_ENDPOINT.rstrip('/')
            return f"{endpoint}/{self.bucket_name}/{url_key}"

    def delete_file(self, s3_key: str):
        """
        Deletes a file from storage.
        """
        if self.mode == "local":
            local_path = os.path.join(config.STATIC_DIR, s3_key.replace("/", os.sep))
            if os.path.exists(local_path):
                try:
                    os.remove(local_path)
                    print(f"Deleted local file: {local_path}")
                except Exception as e:
                    print(f"Failed to delete local file {local_path}: {e}")
        else:
            try:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
                print(f"Deleted S3/B2 object: {s3_key}")
            except Exception as e:
                print(f"Failed to delete B2 object {s3_key}: {e}")

storage = Storage()
