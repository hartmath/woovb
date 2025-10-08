import os
from datetime import datetime

# Check if we're on Render/Cloud (PostgreSQL) or local (SQLite)
DATABASE_URL = os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URL')

if DATABASE_URL:
    # PostgreSQL for Vercel
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from urllib.parse import urlparse
    
    def get_db():
        """Get PostgreSQL database connection"""
        # Parse the database URL
        result = urlparse(DATABASE_URL)
        conn = psycopg2.connect(
            host=result.hostname,
            database=result.path[1:],
            user=result.username,
            password=result.password,
            port=result.port
        )
        return conn
    
    def init_db():
        """Initialize PostgreSQL database with tables"""
        conn = get_db()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Videos table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id SERIAL PRIMARY KEY,
                video_id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                filename TEXT NOT NULL,
                thumbnail TEXT,
                user_id INTEGER NOT NULL,
                views INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Add thumbnail column if it doesn't exist (for existing databases)
        try:
            cursor.execute('ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail TEXT')
        except:
            pass  # Column already exists
        
        conn.commit()
        conn.close()
    
    def create_user(username, email, password_hash):
        """Create a new user"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id',
            (username, email, password_hash)
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return user_id
    
    def get_user_by_email(email):
        """Get user by email"""
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None
    
    def get_user_by_id(user_id):
        """Get user by ID"""
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None
    
    def create_video(video_id, title, description, filename, thumbnail, user_id):
        """Create a new video entry"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO videos (video_id, title, description, filename, thumbnail, user_id) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
            (video_id, title, description, filename, thumbnail, user_id)
        )
        vid_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return vid_id
    
    def get_video_by_id(video_id):
        """Get video by video_id"""
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            SELECT v.*, u.username 
            FROM videos v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.video_id = %s
        ''', (video_id,))
        video = cursor.fetchone()
        conn.close()
        return dict(video) if video else None
    
    def get_all_videos():
        """Get all videos"""
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            SELECT v.*, u.username 
            FROM videos v 
            JOIN users u ON v.user_id = u.id 
            ORDER BY v.created_at DESC
        ''')
        videos = cursor.fetchall()
        conn.close()
        return [dict(video) for video in videos]
    
    def get_user_videos(user_id):
        """Get videos uploaded by a specific user"""
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            SELECT v.*, u.username 
            FROM videos v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.user_id = %s
            ORDER BY v.created_at DESC
        ''', (user_id,))
        videos = cursor.fetchall()
        conn.close()
        return [dict(video) for video in videos]
    
    def increment_views(video_id):
        """Increment view count for a video"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE videos SET views = views + 1 WHERE video_id = %s', (video_id,))
        conn.commit()
        conn.close()
    
    # Admin functions
    def get_all_users():
        """Get all users for admin panel"""
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC')
        users = cursor.fetchall()
        conn.close()
        return [dict(user) for user in users]
    
    def delete_user(user_id):
        """Delete a user and their videos"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
        conn.commit()
        conn.close()
    
    def delete_video(video_id):
        """Delete a video"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM videos WHERE video_id = %s', (video_id,))
        conn.commit()
        conn.close()
    
    def get_stats():
        """Get platform statistics"""
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute('SELECT COUNT(*) as total_users FROM users')
        total_users = cursor.fetchone()['total_users']
        
        cursor.execute('SELECT COUNT(*) as total_videos FROM videos')
        total_videos = cursor.fetchone()['total_videos']
        
        cursor.execute('SELECT COALESCE(SUM(views), 0) as total_views FROM videos')
        total_views = cursor.fetchone()['total_views']
        
        conn.close()
        return {
            'total_users': total_users,
            'total_videos': total_videos,
            'total_views': total_views
        }

else:
    # SQLite for local development
    import sqlite3
    
    DATABASE = 'video_platform.db'
    
    def get_db():
        """Get SQLite database connection"""
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db():
        """Initialize SQLite database with tables"""
        conn = get_db()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Videos table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                filename TEXT NOT NULL,
                thumbnail TEXT,
                user_id INTEGER NOT NULL,
                views INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Add thumbnail column if it doesn't exist (for existing databases)
        try:
            cursor.execute('PRAGMA table_info(videos)')
            columns = [column[1] for column in cursor.fetchall()]
            if 'thumbnail' not in columns:
                cursor.execute('ALTER TABLE videos ADD COLUMN thumbnail TEXT')
                conn.commit()
        except:
            pass  # Column already exists
        
        conn.commit()
        conn.close()
    
    def create_user(username, email, password_hash):
        """Create a new user"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    
    def get_user_by_email(email):
        """Get user by email"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None
    
    def get_user_by_id(user_id):
        """Get user by ID"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None
    
    def create_video(video_id, title, description, filename, thumbnail, user_id):
        """Create a new video entry"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO videos (video_id, title, description, filename, thumbnail, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            (video_id, title, description, filename, thumbnail, user_id)
        )
        conn.commit()
        vid_id = cursor.lastrowid
        conn.close()
        return vid_id
    
    def get_video_by_id(video_id):
        """Get video by video_id"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT v.*, u.username 
            FROM videos v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.video_id = ?
        ''', (video_id,))
        video = cursor.fetchone()
        conn.close()
        return dict(video) if video else None
    
    def get_all_videos():
        """Get all videos"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT v.*, u.username 
            FROM videos v 
            JOIN users u ON v.user_id = u.id 
            ORDER BY v.created_at DESC
        ''')
        videos = cursor.fetchall()
        conn.close()
        return [dict(video) for video in videos]
    
    def get_user_videos(user_id):
        """Get videos uploaded by a specific user"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT v.*, u.username 
            FROM videos v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.user_id = ?
            ORDER BY v.created_at DESC
        ''', (user_id,))
        videos = cursor.fetchall()
        conn.close()
        return [dict(video) for video in videos]
    
    def increment_views(video_id):
        """Increment view count for a video"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE videos SET views = views + 1 WHERE video_id = ?', (video_id,))
        conn.commit()
        conn.close()
    
    # Admin functions
    def get_all_users():
        """Get all users for admin panel"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC')
        users = cursor.fetchall()
        conn.close()
        return [dict(user) for user in users]
    
    def delete_user(user_id):
        """Delete a user and their videos"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()
    
    def delete_video(video_id):
        """Delete a video"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM videos WHERE video_id = ?', (video_id,))
        conn.commit()
        conn.close()
    
    def get_stats():
        """Get platform statistics"""
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) as total_users FROM users')
        total_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) as total_videos FROM videos')
        total_videos = cursor.fetchone()[0]
        
        cursor.execute('SELECT COALESCE(SUM(views), 0) as total_views FROM videos')
        total_views = cursor.fetchone()[0]
        
        conn.close()
        return {
            'total_users': total_users,
            'total_videos': total_videos,
            'total_views': total_views
        }
