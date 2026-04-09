import sqlite3
import os

db_path = "/home/smasduq/montage/backend/montage.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, status, video_url FROM videos WHERE status = 'pending' AND video_url LIKE '%.m3u8' LIMIT 5;")
    rows = cursor.fetchall()
    print("Pending Videos with HLS:")
    for row in rows:
        print(row)
    conn.close()
