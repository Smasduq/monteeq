import redis
import os
from dotenv import load_dotenv

load_dotenv(".env")
redis_url = os.getenv("REDIS_URL")
print(f"Using Redis URL: {redis_url[:20]}...")

try:
    r = redis.from_url(redis_url)
    # Celery default queue is 'celery'
    queue_len = r.llen("celery")
    print(f"Celery queue length: {queue_len}")
    
    # Check Rust service queues (from queue.rs)
    pro_len = r.llen("tasks:pro")
    free_len = r.llen("tasks:free")
    print(f"Rust tasks:pro length: {pro_len}")
    print(f"Rust tasks:free length: {free_len}")

except Exception as e:
    print(f"Error connecting to Redis: {e}")
