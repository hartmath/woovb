import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import VideoCard from '../components/VideoCard'
import { supabase, bucketName } from '../lib/supabase'

export default function Dashboard() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const username = localStorage.getItem('username')
    
    if (!userId || !username) {
      router.push('/auth')
      return
    }
    
    setUser({ id: userId, username })
    fetchUserVideos(userId)
  }, [])

  async function fetchUserVideos(userId) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          users!inner(username)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedVideos = data.map(video => ({
        ...video,
        username: video.users?.username || 'Unknown'
      }))

      setVideos(formattedVideos)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteVideo(videoId, filename, thumbnail) {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      // Delete video file from storage
      if (filename) {
        await supabase.storage.from(bucketName).remove([filename])
      }

      // Delete thumbnail from storage
      if (thumbnail) {
        await supabase.storage.from(bucketName).remove([thumbnail])
      }

      // Delete from database
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('video_id', videoId)

      if (error) throw error

      // Update UI
      setVideos(videos.filter(v => v.video_id !== videoId))
      alert('Video deleted successfully!')
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Failed to delete video')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-white/60">Loading your dashboard...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-white/60">Welcome back, {user?.username}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass p-6 rounded-xl">
            <p className="text-white/60 text-sm mb-1">Total Videos</p>
            <p className="text-3xl font-bold">{videos.length}</p>
          </div>
          <div className="glass p-6 rounded-xl">
            <p className="text-white/60 text-sm mb-1">Total Views</p>
            <p className="text-3xl font-bold">
              {videos.reduce((sum, v) => sum + (v.views || 0), 0)}
            </p>
          </div>
        </div>

        {/* Videos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Videos</h2>
            <button
              onClick={() => router.push('/upload')}
              className="px-6 py-2 rounded-full bg-primary hover:bg-primary-dark transition-colors"
            >
              Upload Video
            </button>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl">
              <svg className="w-24 h-24 mx-auto text-white/20 mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">No videos yet</h3>
              <p className="text-white/60 mb-6">Upload your first video to get started!</p>
              <button
                onClick={() => router.push('/upload')}
                className="px-6 py-2 rounded-full bg-primary hover:bg-primary-dark transition-colors"
              >
                Upload Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="relative group">
                  <VideoCard video={video} />
                  <button
                    onClick={() => handleDeleteVideo(video.video_id, video.filename, video.thumbnail)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete video"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

