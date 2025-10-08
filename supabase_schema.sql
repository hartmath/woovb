-- WOOVB Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Videos Table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    video_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    filename TEXT NOT NULL,
    thumbnail TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users Table
-- Allow users to read all user profiles (for video author info)
CREATE POLICY "Users can view all profiles"
ON users FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id::text);

-- RLS Policies for Videos Table
-- Allow everyone to view all videos
CREATE POLICY "Anyone can view videos"
ON videos FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert videos
CREATE POLICY "Authenticated users can upload videos"
ON videos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own videos
CREATE POLICY "Users can update own videos"
ON videos FOR UPDATE
TO authenticated
USING (user_id::text = auth.uid()::text);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own videos"
ON videos FOR DELETE
TO authenticated
USING (user_id::text = auth.uid()::text);

-- Create a function to get video statistics
CREATE OR REPLACE FUNCTION get_video_stats()
RETURNS TABLE (
    total_videos BIGINT,
    total_views BIGINT,
    total_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT v.id) as total_videos,
        COALESCE(SUM(v.views), 0) as total_views,
        COUNT(DISTINCT u.id) as total_users
    FROM videos v
    CROSS JOIN users u;
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(vid_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE videos 
    SET views = views + 1 
    WHERE video_id = vid_id;
END;
$$ LANGUAGE plpgsql;

-- Sample data (optional - for testing)
-- Uncomment if you want to add a test user
/*
INSERT INTO users (username, email, password_hash) 
VALUES (
    'Admin User',
    'admin@woovb.com',
    'scrypt:32768:8:1$placeholder$hash' -- Replace with actual hash
) ON CONFLICT (email) DO NOTHING;
*/

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON videos TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE videos_id_seq TO authenticated;

-- Create a view for video details with user information
CREATE OR REPLACE VIEW video_details AS
SELECT 
    v.id,
    v.video_id,
    v.title,
    v.description,
    v.filename,
    v.thumbnail,
    v.views,
    v.created_at,
    u.id as user_id,
    u.username,
    u.email
FROM videos v
JOIN users u ON v.user_id = u.id
ORDER BY v.created_at DESC;

-- Grant access to the view
GRANT SELECT ON video_details TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ WOOVB Database Schema Created Successfully!';
    RAISE NOTICE '📊 Tables: users, videos';
    RAISE NOTICE '🔒 Row Level Security: Enabled';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '   1. Create Storage Bucket: woovb-videos';
    RAISE NOTICE '   2. Set bucket to Public';
    RAISE NOTICE '   3. Add storage policies';
    RAISE NOTICE '   4. Deploy your app!';
END $$;

