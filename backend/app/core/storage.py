import os
import json
import logging
import time
from typing import Optional
import shutil

from google.cloud import storage as gcs_storage
from google.oauth2 import service_account
from sqlalchemy.orm import Session

from app.core import config
from app.db.session import SessionLocal
from app.models.models import Setting

logger = logging.getLogger(__name__)

class Storage:
    def __init__(self):
        self._mode: Optional[str] = None
        self._mode_cache_time: float = 0
        self._cache_ttl: int = 60  # Cache DB mode for 60 seconds

        self.gcs_client = None
        self.gcs_bucket = None
        if config.GCS_BUCKET:
            self._init_gcs_client()

    def _init_gcs_client(self):
        try:
            if config.GCS_CREDENTIALS_JSON:
                creds_dict = json.loads(config.GCS_CREDENTIALS_JSON)
                credentials = service_account.Credentials.from_service_account_info(creds_dict)
                self.gcs_client = gcs_storage.Client(credentials=credentials, project=config.GCS_PROJECT_ID)
            elif config.GCS_CREDENTIALS_PATH and os.path.exists(config.GCS_CREDENTIALS_PATH):
                self.gcs_client = gcs_storage.Client.from_service_account_json(
                    config.GCS_CREDENTIALS_PATH,
                    project=config.GCS_PROJECT_ID
                )
            else:
                self.gcs_client = gcs_storage.Client(project=config.GCS_PROJECT_ID)
            
            self.gcs_bucket = self.gcs_client.bucket(config.GCS_BUCKET)
        except Exception as e:
            logger.error(f"Failed to initialize GCS client: {e}", exc_info=True)

    @property
    def mode(self) -> str:
        """
        Dynamically resolves the storage mode from the database with a TTL cache.
        Falls back to config.STORAGE_MODE if not set in DB.
        """
        current_time = time.time()
        if self._mode and (current_time - self._mode_cache_time) < self._cache_ttl:
            return self._mode

        db = SessionLocal()
        try:
            setting = db.query(Setting).filter(Setting.key == "storage_mode").first()
            if setting and setting.value:
                self._mode = setting.value
            else:
                self._mode = config.STORAGE_MODE
            self._mode_cache_time = current_time
        except Exception as e:
            logger.error(f"Error fetching storage_mode from DB: {e}", exc_info=True)
            self._mode = config.STORAGE_MODE
        finally:
            db.close()
        
        return self._mode

    def upload_file(self, local_path: str, s3_key: str) -> str:
        """
        Uploads a file to the active storage provider and returns its URL.
        """
        current_mode = self.mode
        
        if current_mode == "local":
            return self._upload_local(local_path, s3_key)
        else:
            return self._upload_gcs(local_path, s3_key)

    def _upload_local(self, local_path: str, s3_key: str) -> str:
        dest_path = os.path.join(config.STATIC_DIR, s3_key)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(local_path, dest_path)
        url_key = s3_key.replace(os.sep, "/")
        return f"{config.BASE_URL}/static/{url_key}"

    def _upload_gcs(self, local_path: str, s3_key: str) -> str:
        if not self.gcs_bucket:
            raise ValueError("GCS bucket is not initialized.")
        try:
            blob = self.gcs_bucket.blob(s3_key)
            # Use 5MB chunks for better stability on large files
            blob.chunk_size = 5 * 1024 * 1024 
            # Increase timeout to 10 minutes (600 seconds) for slow networks/large videos
            blob.upload_from_filename(local_path, timeout=600)
            return self.get_url(s3_key, mode="gcs")
        except Exception as e:
            logger.error(f"GCS Upload failed for {s3_key}: {e}", exc_info=True)
            raise

    def upload_file_obj(self, file_obj, s3_key: str) -> str:
        """
        Uploads a file-like object directly to storage (avoids local disk).
        """
        current_mode = self.mode
        
        if current_mode == "local":
            dest_path = os.path.join(config.STATIC_DIR, s3_key)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            with open(dest_path, "wb") as buffer:
                import shutil
                shutil.copyfileobj(file_obj, buffer)
            url_key = s3_key.replace(os.sep, "/")
            return f"{config.BASE_URL}/static/{url_key}"
        else:
            if not self.gcs_bucket:
                raise ValueError("GCS bucket is not initialized.")
            try:
                # Detect content type from the key extension so GCS stores it correctly
                ext = os.path.splitext(s3_key)[1].lower()
                content_type_map = {
                    ".mp4": "video/mp4",
                    ".mov": "video/quicktime",
                    ".avi": "video/x-msvideo",
                    ".mkv": "video/x-matroska",
                    ".webm": "video/webm",
                    ".m3u8": "application/x-mpegURL",
                    ".ts": "video/MP2T",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".png": "image/png",
                }
                content_type = content_type_map.get(ext, "application/octet-stream")
                blob = self.gcs_bucket.blob(s3_key)
                blob.chunk_size = 5 * 1024 * 1024 
                blob.upload_from_file(file_obj, timeout=600, content_type=content_type)
                return self.get_url(s3_key, mode="gcs")
            except Exception as e:
                logger.error(f"GCS Object Upload failed for {s3_key}: {e}", exc_info=True)
                raise

    def get_url(self, s3_key: str, mode: Optional[str] = None) -> str:
        """
        Returns the public URL for a given key.
        """
        current_mode = mode or self.mode
        url_key = s3_key.replace(os.sep, "/")
        
        if current_mode == "local":
            return f"{config.BASE_URL}/static/{url_key}"
        else:
            return f"https://storage.googleapis.com/{config.GCS_BUCKET}/{url_key}"

    def delete_file(self, s3_key: str) -> None:
        """
        Deletes a file from storage.
        """
        current_mode = self.mode
        
        if current_mode == "local":
            local_path = os.path.join(config.STATIC_DIR, s3_key.replace("/", os.sep))
            if os.path.exists(local_path):
                try:
                    os.remove(local_path)
                    logger.info(f"Deleted local file: {local_path}")
                except Exception as e:
                    logger.error(f"Failed to delete local file {local_path}: {e}", exc_info=True)
        else:
            if not self.gcs_bucket:
                logger.error("Cannot delete from GCS: Bucket not initialized.")
                return
            try:
                blob = self.gcs_bucket.blob(s3_key)
                blob.delete()
                logger.info(f"Deleted GCS object: {s3_key}")
            except Exception as e:
                logger.error(f"Failed to delete GCS object {s3_key}: {e}", exc_info=True)

storage = Storage()
