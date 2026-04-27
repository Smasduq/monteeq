import os
import sys
import boto3
from google.cloud import storage as gcs_storage
from supabase import create_client

# Add backend to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core import config

DELETE_AFTER_MIGRATION = False # Set to True to delete from old storage after successful upload

def migrate():
    print("Starting migration to Google Cloud Storage...")
    
    # 1. Initialize Clients
    # S3 (Backblaze)
    s3_client = boto3.client(
        's3',
        endpoint_url=config.S3_ENDPOINT,
        aws_access_key_id=config.S3_ACCESS_KEY,
        aws_secret_access_key=config.S3_SECRET_KEY,
        region_name=config.S3_REGION
    )
    
    # Supabase
    sb_url = config.SUPABASE_URL or ""
    if "/storage/v1/s3" in sb_url:
        sb_url = sb_url.split("/storage/v1/s3")[0]
    if ".storage.supabase.co" in sb_url:
        sb_url = sb_url.replace(".storage.supabase.co", ".supabase.co")
    supabase = create_client(sb_url, config.SUPABASE_KEY)
    
    # GCS
    gcs_client = gcs_storage.Client(project=config.GCS_PROJECT_ID)
    gcs_bucket = gcs_client.bucket(config.GCS_BUCKET)

    # 2. Migrate from Backblaze B2 (S3)
    if config.S3_BUCKET_NAME:
        print(f"Migrating from Backblaze B2 bucket: {config.S3_BUCKET_NAME}")
        try:
            paginator = s3_client.get_paginator('list_objects_v2')
            for page in paginator.paginate(Bucket=config.S3_BUCKET_NAME):
                if 'Contents' in page:
                    for obj in page['Contents']:
                        key = obj['Key']
                        print(f"  Transferring S3: {key}")
                        
                        # Download to memory (if small) or temp file
                        response = s3_client.get_object(Bucket=config.S3_BUCKET_NAME, Key=key)
                        data = response['Body'].read()
                        
                        # Upload to GCS
                        blob = gcs_bucket.blob(key)
                        # Set content type if possible
                        if key.endswith('.m3u8'):
                            blob.content_type = 'application/x-mpegURL'
                        elif key.endswith('.ts'):
                            blob.content_type = 'video/MP2T'
                        elif key.endswith('.jpg') or key.endswith('.jpeg'):
                            blob.content_type = 'image/jpeg'
                        
                        blob.upload_from_string(data)
                        
                        if DELETE_AFTER_MIGRATION:
                            print(f"  Deleting S3: {key}")
                            s3_client.delete_object(Bucket=config.S3_BUCKET_NAME, Key=key)
        except Exception as e:
            print(f"Error migrating from S3: {e}")

    # 3. Migrate from Supabase
    sb_bucket_name = config.SUPABASE_BUCKET_NAME or "monteeq"
    print(f"Migrating from Supabase bucket: {sb_bucket_name}")
    try:
        # Supabase storage list is hierarchical/paginated differently
        # For simplicity, we might need to recurse or assume a structure
        # Let's try listing top-level and recurse 'videos/' and 'thumbs/'
        for folder in ['videos', 'thumbs', 'thumbnails']:
            res = supabase.storage.from_(sb_bucket_name).list(folder)
            for item in res:
                if 'name' in item:
                    key = f"{folder}/{item['name']}"
                    print(f"  Transferring Supabase: {key}")
                    
                    # Download
                    data = supabase.storage.from_(sb_bucket_name).download(key)
                    
                    # Upload to GCS
                    blob = gcs_bucket.blob(key)
                    if key.endswith('.m3u8'):
                        blob.content_type = 'application/x-mpegURL'
                    elif key.endswith('.ts'):
                        blob.content_type = 'video/MP2T'
                    elif key.endswith('.jpg') or key.endswith('.jpeg'):
                        blob.content_type = 'image/jpeg'
                    blob.upload_from_string(data)
                    
                    if DELETE_AFTER_MIGRATION:
                        print(f"  Deleting Supabase: {key}")
                        supabase.storage.from_(sb_bucket_name).remove([key])
    except Exception as e:
        print(f"Error migrating from Supabase: {e}")

    print("Migration finished!")

if __name__ == "__main__":
    migrate()
