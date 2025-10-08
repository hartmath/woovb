-- Drop existing tables if they exist (careful with this in production!)
-- DROP TABLE IF EXISTS videos CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Create the 'users' table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'videos' table
CREATE TABLE IF NOT EXISTS public.videos (
    id SERIAL PRIMARY KEY,
    video_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    filename TEXT NOT NULL,
    thumbnail TEXT,
    user_id INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_video_id ON public.videos (video_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos (user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- Create function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id_param TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.videos
    SET views = views + 1
    WHERE video_id = video_id_param;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert to users" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to delete their own data" ON public.users;
DROP POLICY IF EXISTS "Admin bypass RLS users" ON public.users;

DROP POLICY IF EXISTS "Allow public read access to videos" ON public.videos;
DROP POLICY IF EXISTS "Allow authenticated users to insert videos" ON public.videos;
DROP POLICY IF EXISTS "Allow video owners to update their videos" ON public.videos;
DROP POLICY IF EXISTS "Allow video owners to delete their videos" ON public.videos;
DROP POLICY IF EXISTS "Admin bypass RLS videos" ON public.videos;

-- RLS Policies for 'users' table
CREATE POLICY "Allow public read access to users" ON public.users
FOR SELECT USING (true);

CREATE POLICY "Allow public insert to users" ON public.users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own data" ON public.users
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to delete their own data" ON public.users
FOR DELETE USING (true);

-- Admin bypass policy (user with ID 1 is admin)
CREATE POLICY "Admin bypass RLS users" ON public.users
AS PERMISSIVE FOR ALL TO public
USING (id = 1);

-- RLS Policies for 'videos' table
CREATE POLICY "Allow public read access to videos" ON public.videos
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert videos" ON public.videos
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow video owners to update their videos" ON public.videos
FOR UPDATE USING (true);

CREATE POLICY "Allow video owners to delete their videos" ON public.videos
FOR DELETE USING (true);

-- Admin bypass policy for videos
CREATE POLICY "Admin bypass RLS videos" ON public.videos
AS PERMISSIVE FOR ALL TO public
USING (EXISTS (SELECT 1 FROM public.users WHERE id = 1));

-- Grant necessary permissions
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.videos TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

