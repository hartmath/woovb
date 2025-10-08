"""
Script to generate thumbnails for existing videos that don't have them
Run this script after deploying the thumbnail feature to generate thumbnails for old videos
"""
import os
import subprocess
from PIL import Image, ImageDraw
from database import get_all_videos, get_db

UPLOAD_FOLDER = 'uploads/videos'
THUMBNAIL_FOLDER = 'uploads/thumbnails'

# Create thumbnail directory if it doesn't exist
os.makedirs(THUMBNAIL_FOLDER, exist_ok=True)

def generate_thumbnail(video_path, thumbnail_path, time_seconds=2):
    """Generate a thumbnail from a video file"""
    try:
        # Try using ffmpeg (best quality)
        subprocess.run([
            'ffmpeg',
            '-i', video_path,
            '-ss', str(time_seconds),
            '-vframes', '1',
            '-vf', 'scale=640:360',
            '-y',
            thumbnail_path
        ], check=True, capture_output=True, timeout=10)
        print(f"✓ Generated thumbnail using ffmpeg: {thumbnail_path}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        # Fallback: Create a simple placeholder image
        try:
            # Create a 640x360 gradient image
            img = Image.new('RGB', (640, 360), color=(120, 81, 169))
            draw = ImageDraw.Draw(img)
            
            # Add a play icon
            center_x, center_y = 320, 180
            play_points = [
                (center_x - 40, center_y - 50),
                (center_x - 40, center_y + 50),
                (center_x + 50, center_y)
            ]
            draw.polygon(play_points, fill=(255, 255, 255))
            
            # Save the placeholder
            img.save(thumbnail_path, 'JPEG', quality=85)
            print(f"✓ Generated placeholder thumbnail: {thumbnail_path}")
            return True
        except Exception as e:
            print(f"✗ Error creating thumbnail: {e}")
            return False

def update_video_thumbnail(video_id, thumbnail_filename):
    """Update video thumbnail in database"""
    try:
        # Check if we're using PostgreSQL or SQLite
        DATABASE_URL = os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URL')
        
        conn = get_db()
        cursor = conn.cursor()
        
        if DATABASE_URL:
            cursor.execute(
                'UPDATE videos SET thumbnail = %s WHERE video_id = %s',
                (thumbnail_filename, video_id)
            )
        else:
            cursor.execute(
                'UPDATE videos SET thumbnail = ? WHERE video_id = ?',
                (thumbnail_filename, video_id)
            )
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"✗ Error updating database: {e}")
        return False

def main():
    print("🎬 Generating thumbnails for existing videos...\n")
    
    videos = get_all_videos()
    processed = 0
    skipped = 0
    
    for video in videos:
        video_id = video['video_id']
        filename = video['filename']
        thumbnail = video.get('thumbnail')
        
        # Skip if thumbnail already exists
        if thumbnail:
            print(f"⏭️  Skipping {video_id} (already has thumbnail)")
            skipped += 1
            continue
        
        # Generate thumbnail
        video_path = os.path.join(UPLOAD_FOLDER, filename)
        thumbnail_filename = f"{video_id}.jpg"
        thumbnail_path = os.path.join(THUMBNAIL_FOLDER, thumbnail_filename)
        
        # Check if video file exists
        if not os.path.exists(video_path):
            print(f"⚠️  Video file not found: {video_path}")
            continue
        
        print(f"📹 Processing {video_id}...")
        
        # Generate and update
        if generate_thumbnail(video_path, thumbnail_path):
            if update_video_thumbnail(video_id, thumbnail_filename):
                processed += 1
            else:
                print(f"⚠️  Failed to update database for {video_id}")
        else:
            print(f"⚠️  Failed to generate thumbnail for {video_id}")
    
    print(f"\n✅ Complete! Processed: {processed}, Skipped: {skipped}")

if __name__ == '__main__':
    main()

