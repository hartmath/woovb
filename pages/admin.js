import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { supabase, bucketName } from '../lib/supabase'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [videos, setVideos] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalVideos: 0, totalViews: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    const userId = localStorage.getItem('userId')
    
    if (!userId || parseInt(userId) !== 1) {
      alert('Access denied. Admin only.')
      router.push('/')
      return
    }

    await fetchData()
  }

  async function fetchData() {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, email, created_at')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      setUsers(usersData || [])

      // Fetch videos with user info
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          users!inner(username)
        `)
        .order('created_at', { ascending: false })

      if (videosError) throw videosError

      const formattedVideos = videosData.map(video => ({
        ...video,
        username: video.users?.username || 'Unknown',
      }))
      setVideos(formattedVideos || [])

      // Calculate stats
      const totalUsers = usersData?.length || 0
      const totalVideos = videosData?.length || 0
      const totalViews = videosData?.reduce((sum, v) => sum + (v.views || 0), 0) || 0

      setStats({ totalUsers, totalVideos, totalViews })
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteUser(userId, username) {
    if (userId === 1) {
      alert('Cannot delete the admin account!')
      return
    }

    if (!confirm(`Are you sure you want to delete user "${username}"? This will also delete all their videos.`)) {
      return
    }

    try {
      // Get user's videos
      const userVideos = videos.filter(v => v.user_id === userId)

      // Delete video files from storage
      for (const video of userVideos) {
        if (video.filename) {
          await supabase.storage.from(bucketName).remove([video.filename])
        }
        if (video.thumbnail) {
          await supabase.storage.from(bucketName).remove([video.thumbnail])
        }
      }

      // Delete user (cascade will delete videos)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      alert('User deleted successfully!')
      await fetchData()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  async function handleDeleteVideo(videoId, filename, thumbnail) {
    if (!confirm('Are you sure you want to delete this video?')) {
      return
    }

    try {
      // Delete files from storage
      if (filename) {
        await supabase.storage.from(bucketName).remove([filename])
      }
      if (thumbnail) {
        await supabase.storage.from(bucketName).remove([thumbnail])
      }

      // Delete from database
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('video_id', videoId)

      if (error) throw error

      alert('Video deleted successfully!')
      await fetchData()
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
          <p className="mt-4 text-white/60">Loading admin panel...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-red-400">Admin Panel</h1>
          <p className="text-white/60">Manage users and videos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 glass p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-md transition-all ${
              activeTab === 'users'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-2 rounded-md transition-all ${
              activeTab === 'videos'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Videos ({videos.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass p-6 rounded-xl">
                <p className="text-white/60 mb-2">Total Users</p>
                <p className="text-4xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="glass p-6 rounded-xl">
                <p className="text-white/60 mb-2">Total Videos</p>
                <p className="text-4xl font-bold">{stats.totalVideos}</p>
              </div>
              <div className="glass p-6 rounded-xl">
                <p className="text-white/60 mb-2">Total Views</p>
                <p className="text-4xl font-bold">{stats.totalViews}</p>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {videos.slice(0, 5).map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-semibold">{video.title}</p>
                      <p className="text-sm text-white/60">by {video.username} • {video.views} views</p>
                    </div>
                    <p className="text-sm text-white/60">
                      {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass p-6 rounded-xl overflow-x-auto">
            <h3 className="text-xl font-bold mb-4">All Users</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2">ID</th>
                  <th className="text-left py-3 px-2">Username</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">Joined</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2">{user.id}</td>
                    <td className="py-3 px-2 font-semibold">{user.username}</td>
                    <td className="py-3 px-2 text-white/60">{user.email}</td>
                    <td className="py-3 px-2 text-white/60">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {user.id !== 1 && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="glass p-6 rounded-xl overflow-x-auto">
            <h3 className="text-xl font-bold mb-4">All Videos</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2">Video ID</th>
                  <th className="text-left py-3 px-2">Title</th>
                  <th className="text-left py-3 px-2">Uploader</th>
                  <th className="text-left py-3 px-2">Views</th>
                  <th className="text-left py-3 px-2">Uploaded</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2 font-mono text-sm">{video.video_id}</td>
                    <td className="py-3 px-2 font-semibold">{video.title}</td>
                    <td className="py-3 px-2 text-white/60">{video.username}</td>
                    <td className="py-3 px-2 text-white/60">{video.views}</td>
                    <td className="py-3 px-2 text-white/60">
                      {new Date(video.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteVideo(video.video_id, video.filename, video.thumbnail)}
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

