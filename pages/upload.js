import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { supabase, bucketName } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function Upload() {
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const username = localStorage.getItem('username')
    
    if (!userId || !username) {
      router.push('/auth')
      return
    }
    
    setUser({ id: userId, username })
  }, [])

  function handleFileSelect(e) {
    const file = e.target.files[0]
    
    if (!file) return

    // Check file size (50MB limit for better performance)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      alert(`⚠️ File too large!\n\nMaximum size: 50MB\nYour file: ${(file.size / 1024 / 1024).toFixed(2)}MB\n\nPlease compress your video before uploading.`)
      e.target.value = ''
      return
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
    if (!allowedTypes.includes(file.type)) {
      alert('⚠️ Invalid file type!\n\nAllowed formats: MP4, WebM, MOV, AVI')
      e.target.value = ''
      return
    }

    setVideoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleUpload(e) {
    e.preventDefault()

    if (!videoFile || !title.trim()) {
      alert('Please select a video and enter a title')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Generate unique ID
      const videoId = `VID-${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`
      
      // Get file extension
      const fileExt = videoFile.name.split('.').pop()
      const filename = `${videoId}.${fileExt}`

      // Upload video to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filename, videoFile, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            setUploadProgress(percent)
          },
        })

      if (uploadError) throw uploadError

      // Create thumbnail (use a placeholder for now - you can enhance this later)
      const thumbnailFilename = `thumb_${videoId}.jpg`

      // Save to database
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert([
          {
            video_id: videoId,
            title: title.trim(),
            description: description.trim(),
            filename: filename,
            thumbnail: null, // Can be enhanced later with actual thumbnail generation
            user_id: parseInt(user.id),
          },
        ])
        .select()

      if (dbError) throw dbError

      alert(`✅ Video uploaded successfully!\n\nVideo ID: ${videoId}`)
      
      // Reset form
      setTitle('')
      setDescription('')
      setVideoFile(null)
      setPreviewUrl(null)
      document.getElementById('videoInput').value = ''

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Upload error:', error)
      alert(`❌ Upload failed!\n\n${error.message}\n\nPlease try again.`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  if (!user) {
    return <Layout><div className="container mx-auto px-4 py-12 text-center">Loading...</div></Layout>
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Upload Video</h1>

        <form onSubmit={handleUpload} className="glass p-6 md:p-8 rounded-2xl">
          {/* Video File Upload */}
          <div className="mb-6">
            <label className="block text-white/80 mb-3 text-lg font-semibold">Video File</label>
            <div className="relative">
              <input
                id="videoInput"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="videoInput"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-white/5"
              >
                {previewUrl ? (
                  <div className="text-center">
                    <video src={previewUrl} className="max-h-48 rounded-lg mb-2" controls />
                    <p className="text-white/80">{videoFile.name}</p>
                    <p className="text-white/50 text-sm mt-1">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                    </svg>
                    <p className="text-white mb-2">Click to select video</p>
                    <p className="text-white/30 text-xs">MP4, MOV, AVI • Max 50MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-white/80 mb-2 font-semibold">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter video title"
              required
              disabled={uploading}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-white/80 mb-2 font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter video description (optional)"
              rows="4"
              disabled={uploading}
              maxLength={500}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-white/80">Uploading...</span>
                <span className="text-primary font-semibold">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading || !videoFile || !title.trim()}
              className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              disabled={uploading}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-white/80 text-sm font-semibold mb-2">📌 Upload Tips:</p>
            <ul className="text-white/60 text-sm space-y-1">
              <li>• Recommended format: MP4 (H.264)</li>
              <li>• Maximum file size: 50MB</li>
              <li>• Use a descriptive title for better discoverability</li>
              <li>• Add a detailed description to help viewers</li>
            </ul>
          </div>
        </form>
      </div>
    </Layout>
  )
}

