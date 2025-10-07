import sqlite3
from datetime import datetime
import os

DATABASE = 'video_platform.db'

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with tables"""
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
            user_id INTEGER NOT NULL,
            views INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
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

def create_video(video_id, title, description, filename, user_id):
    """Create a new video entry"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO videos (video_id, title, description, filename, user_id) VALUES (?, ?, ?, ?, ?)',
        (video_id, title, description, filename, user_id)
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

