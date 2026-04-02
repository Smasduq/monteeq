import os
import boto3
from botocore.exceptions import NoCredentialsError
from app.core import config
from supabase import create_client, Client
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import Setting

class Storage:
    def __init__(self):
        self._mode = None
        self.bucket_name = config.S3_BUCKET_NAME
        
        # S3 Client (Always initialize if config exists, for transitions)
        self.s3_client = boto3.client(
            's3',
            endpoint_url=config.S3_ENDPOINT,
            aws_access_key_id=config.S3_ACCESS_KEY,
            aws_secret_access_key=config.S3_SECRET_KEY,
            region_name=config.S3_REGION
        )

        # Supabase Client - Ensure URL is just the base project URL
        sb_url = config.SUPABASE_URL or ""
        # Clean up S3-compatible fragments
        if "/storage/v1/s3" in sb_url:
            sb_url = sb_url.split("/storage/v1/s3")[0]
        # Clean up .storage subdomain if present (SDK wants main project URL)
        if ".storage.supabase.co" in sb_url:
            sb_url = sb_url.replace(".storage.supabase.co", ".supabase.co")
        
        self.sb_url = sb_url
        self.supabase: Client = create_client(sb_url, config.SUPABASE_KEY)
        self.supabase_bucket = config.SUPABASE_BUCKET_NAME or config.S3_BUCKET_NAME

    @property
    def mode(self) -> str:
        """
        Dynamically resolves the storage mode from the database.
        Falls back to config.STORAGE_MODE if not set in DB.
        """
        db = SessionLocal()
        try:
            setting = db.query(Setting).filter(Setting.key == "storage_mode").first()
            if setting:
                return setting.value
        except Exception as e:
            print(f"Error fetching storage_mode from DB: {e}")
        finally:
            db.close()
        
        return config.STORAGE_MODE

    def upload_file(self, local_path: str, s3_key: str) -> str:
        """
        Uploads a file to the active storage provider and returns its URL.
        """
        current_mode = self.mode
        
        if current_mode == "local":
            dest_path = os.path.join(config.STATIC_DIR, s3_key)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            
            import shutil
            shutil.copy2(local_path, dest_path)
            url_key = s3_key.replace(os.sep, "/")
            return f"{config.BASE_URL}/static/{url_key}"
        
        elif current_mode == "supabase":
            try:
                with open(local_path, 'rb') as f:
                    self.supabase.storage.from_(self.supabase_bucket).upload(
                        path=s3_key,
                        file=f,
                        file_options={"cache-control": "3600", "upsert": "true"}
                    )
                return self.get_url(s3_key, mode="supabase")
            except Exception as e:
                print(f"Supabase Upload failed: {e}")
                raise e
        
        else: # Default/S3
            try:
                self.s3_client.upload_file(local_path, self.bucket_name, s3_key)
                return self.get_url(s3_key, mode="s3")
            except Exception as e:
                print(f"S3 Upload failed: {e}")
                raise e

    def get_url(self, s3_key: str, mode: str = None) -> str:
        """
        Returns the public URL for a given key.
        """
        current_mode = mode or self.mode
        url_key = s3_key.replace(os.sep, "/")
        
        if current_mode == "local":
            return f"{config.BASE_URL}/static/{url_key}"
        elif current_mode == "supabase":
            # Use SDK to get public URL
            res = self.supabase.storage.from_(self.supabase_bucket).get_public_url(url_key)
            return res
        else:
            # Backblaze B2 S3-Compatible URLs: {endpoint}/{bucket}/{key}
            endpoint = config.S3_ENDPOINT.rstrip('/')
            return f"{endpoint}/{self.bucket_name}/{url_key}"

    def delete_file(self, s3_key: str):
        """
        Deletes a file from storage.
        """
        current_mode = self.mode
        
        if current_mode == "local":
            local_path = os.path.join(config.STATIC_DIR, s3_key.replace("/", os.sep))
            if os.path.exists(local_path):
                try:
                    os.remove(local_path)
                    print(f"Deleted local file: {local_path}")
                except Exception as e:
                    print(f"Failed to delete local file {local_path}: {e}")
        elif current_mode == "supabase":
            try:
                self.supabase.storage.from_(self.supabase_bucket).remove([s3_key])
                print(f"Deleted Supabase object: {s3_key}")
            except Exception as e:
                print(f"Failed to delete Supabase object {s3_key}: {e}")
        else:
            try:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
                print(f"Deleted S3/B2 object: {s3_key}")
            except Exception as e:
                print(f"Failed to delete B2 object {s3_key}: {e}")

storage = Storage()
