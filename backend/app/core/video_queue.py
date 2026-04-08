import json
import redis
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class VideoQueue:
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL)
        self.queue_name = "video_tasks"

    def push_task(self, video_id: str, task_id: str, target_format: str = "home"):
        """
        Pushes a video transcoding task to the Redis queue for the Rust worker.
        """
        task_data = {
            "video_id": str(video_id),
            "task_id": str(task_id),
            "target_format": target_format
        }
        self.redis.lpush(self.queue_name, json.dumps(task_data))
        return task_id

# Global instance
video_queue = VideoQueue()
