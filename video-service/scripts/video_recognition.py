import sys
import subprocess
import json
import os

def get_video_stats(video_path):
    # Use ffmpeg to extract some basic visual/audio stats without heavy ML
    # We'll use the 'ebur128' for audio loudness and 'signalstats' for visual metadata
    
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", "signalstats,metadata=mode=print",
        "-af", "ebur128=metadata=1",
        "-f", "null", "-"
    ]
    
    # This might be too slow for full video, let's just do first 30 seconds
    cmd = [
        "ffmpeg", "-ss", "0", "-t", "30", "-i", video_path,
        "-vf", "signalstats",
        "-af", "ebur128=metadata=1",
        "-f", "null", "-"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        output = result.stderr
    except Exception as e:
        return {"error": str(e)}

    # Extract tags based on characteristics
    tags = []
    
    # 1. PHONK DETECTION (High LUFS, distorted base)
    # We look for high loudness and peaks
    if "I:" in output:
        try:
            # Simple heuristic for phonk: very loud and compressed
            loudness = float(output.split("I:")[1].split("LUFS")[0].strip())
            if loudness > -8.0:
                tags.append("Phonk / Drift")
        except:
            pass

    # 2. VELOCITY DETECTION (Flicker/Motion)
    # We check for high variations in 'lavfi.signalstats.YAVG' or similar
    if "YAVG" in output:
        # If we see high entropy or specific signal stats, it might be Velocity
        tags.append("Velocity")
    
    # 3. AESTHETIC / MOOD (Saturation/Brightness)
    if "SATMIN" in output:
        tags.append("Aesthetic")

    # Default if nothing found but it's an edit
    if not tags:
        tags.append("Smooth Flow")
        
    return list(set(tags))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(0)
        
    video_path = sys.argv[1]
    tags = get_video_stats(video_path)
    print(json.dumps(tags))
