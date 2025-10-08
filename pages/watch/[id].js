import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import VideoCard from '../../components/VideoCard'
import { supabase, bucketName } from '../../lib/supabase'
import videojs from 'video.js'

export default function Watch() {
  const [video, setVideo] = useState(null)
  const [relatedVideos, setRelatedVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      fetchVideo()
      fetchRelatedVideos()
    }
  }, [id])

  useEffect(() => {
    // Initialize Video.js player
    if (video && videoRef.current && !playerRef.current) {
      const videoUrl = supabase.storage.from(bucketName).getPublicUrl(video.filename).data.publicUrl

      playerRef.current = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        aspectRatio: '16:9',
        preload: 'metadata',
        sources: [
          {
            src: videoUrl,
            type: `video/${video.filename.split('.').pop()}`,
          },
        ],
      })

      // Error handling
      playerRef.current.on('error', function () {
        const error = playerRef.current.error()
        console.error('Video error:', error)

        const errorMessages = {
          1: 'Video loading aborted by user',
          2: 'Network error - could not load video',
          3: 'Video format not supported by browser',
          4: 'Video not found or server error',
        }

        const message = errorMessages[error.code] || 'Unknown error loading video'
        alert(`⚠️ Video Error\n\n${message}\n\nTry:\n• Refreshing the page\n• Using a different browser\n• Checking your internet connection`)
      })
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [video])

  async function fetchVideo() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          users!inner(username)
        `)
        .eq('video_id', id)
        .single()

      if (error) throw error

      const formattedVideo = {
        ...data,
        username: data.users?.username || 'Unknown',
      }

      setVideo(formattedVideo)

      // Increment view count
      await supabase.rpc('increment_video_views', { video_id_param: id })
    } catch (error) {
      console.error('Error fetching video:', error)
      alert('Video not found')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRelatedVideos() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          users!inner(username)
        `)
        .neq('video_id', id)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error

      const formattedVideos = data.map(video => ({
        ...video,
        username: video.users?.username || 'Unknown',
      }))

      setRelatedVideos(formattedVideos)
    } catch (error) {
      console.error('Error fetching related videos:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-white/60">Loading video...</p>
        </div>
      </Layout>
    )
  }

  if (!video) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-white/80">Video not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="mb-6 rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered"
                playsInline
              />
            </div>

            {/* Video Info */}
            <div className="glass p-6 rounded-xl">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{video.title}</h1>

              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="text-lg font-semibold text-primary">{video.username}</p>
                  <p className="text-white/60 text-sm">{video.views + 1} views</p>
                </div>
                <div className="text-white/60 text-sm">
                  {new Date(video.created_at).toLocaleDateString()}
                </div>
              </div>

              {video.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-white/70 whitespace-pre-wrap">{video.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Videos */}
          <div>
            <h2 className="text-xl font-bold mb-4">Related Videos</h2>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

