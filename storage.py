"""
Supabase Storage Helper for Video Uploads
"""
import os
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
BUCKET_NAME = os.environ.get('SUPABASE_BUCKET', 'woovb-videos')

supabase: Client = None

def init_supabase():
    """Initialize Supabase client"""
    global supabase
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        return True
    return False

def upload_to_supabase(file_data, filename, content_type='video/mp4'):
    """Upload file to Supabase Storage"""
    try:
        if not supabase:
            init_supabase()
        
        # Upload to Supabase Storage
        res = supabase.storage.from_(BUCKET_NAME).upload(
            filename,
            file_data,
            {
                'content-type': content_type,
                'upsert': 'true'
            }
        )
        
        # Get public URL
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
        return public_url
    except Exception as e:
        print(f"Error uploading to Supabase: {e}")
        return None

def get_file_url(filename):
    """Get public URL for a file"""
    try:
        if not supabase:
            init_supabase()
        return supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
    except Exception as e:
        print(f"Error getting file URL: {e}")
        return None

def delete_from_supabase(filename):
    """Delete file from Supabase Storage"""
    try:
        if not supabase:
            init_supabase()
        supabase.storage.from_(BUCKET_NAME).remove([filename])
        return True
    except Exception as e:
        print(f"Error deleting from Supabase: {e}")
        return False

# Initialize on import
init_supabase()

