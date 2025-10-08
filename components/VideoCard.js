import Link from 'next/link'
import { supabase, bucketName } from '../lib/supabase'

export default function VideoCard({ video }) {
  const thumbnailUrl = video.thumbnail
    ? supabase.storage.from(bucketName).getPublicUrl(video.thumbnail).data.publicUrl
    : null

  return (
    <Link href={`/watch/${video.video_id}`}>
      <div className="group cursor-pointer">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
              <svg className="w-20 h-20 text-white opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex size-16 items-center justify-center rounded-full bg-primary/90 text-white backdrop-blur-sm transition-transform group-hover:scale-110 shadow-2xl shadow-primary/50">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <h3 className="text-white font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
            <span>{video.username}</span>
            <span>•</span>
            <span>{video.views} views</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

