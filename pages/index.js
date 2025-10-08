import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import VideoCard from '../components/VideoCard'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [featuredVideo, setFeaturedVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { q } = router.query

  useEffect(() => {
    fetchVideos()
  }, [q])

  async function fetchVideos() {
    setLoading(true)
    
    try {
      let query = supabase
        .from('videos')
        .select(`
          *,
          users!inner(username)
        `)
        .order('created_at', { ascending: false })
      
      // Search filter
      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Flatten user data
      const formattedVideos = data.map(video => ({
        ...video,
        username: video.users?.username || 'Unknown'
      }))
      
      setVideos(formattedVideos)
      setFeaturedVideo(formattedVideos[0] || null)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {featuredVideo && !q && (
          <div className="mb-12 glass p-8 rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Featured Video
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <VideoCard video={featuredVideo} />
              <div>
                <h3 className="text-2xl font-bold mb-4">{featuredVideo.title}</h3>
                <p className="text-white/70 mb-4">{featuredVideo.description}</p>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>{featuredVideo.username}</span>
                  <span>•</span>
                  <span>{featuredVideo.views} views</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {q && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Search results for "{q}"</h2>
            <p className="text-white/60 mt-2">{videos.length} videos found</p>
          </div>
        )}

        {/* Videos Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {q ? '' : 'All Videos'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-white/60">Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl">
              <svg className="w-24 h-24 mx-auto text-white/20 mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">No videos found</h3>
              <p className="text-white/60">{q ? 'Try a different search term' : 'Be the first to upload a video!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

