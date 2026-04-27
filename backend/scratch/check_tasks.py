import redis
import os
from dotenv import load_dotenv
import json

load_dotenv(".env")
redis_url = os.getenv("REDIS_URL")

try:
    r = redis.from_url(redis_url)
    tasks = r.lrange("celery", 0, -1)
    print(f"Tasks in queue: {len(tasks)}")
    for t in tasks:
        try:
            data = json.loads(t)
            print(f"Task name: {data.get('headers', {}).get('task')}")
        except:
            print("Could not parse task")

except Exception as e:
    print(f"Error: {e}")
