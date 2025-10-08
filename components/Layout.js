import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Layout({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const userId = localStorage.getItem('userId')
    const username = localStorage.getItem('username')
    
    if (userId && username) {
      setUser({ id: userId, username })
      
      // Check if admin (user id = 1)
      if (parseInt(userId) === 1) {
        setIsAdmin(true)
      }
    }
  }

  async function handleLogout() {
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    setUser(null)
    setIsAdmin(false)
    router.push('/')
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.jpg" alt="WOOVB" className="h-12 w-12 rounded-lg object-cover" />
              <span className="text-2xl font-bold text-white group-hover:text-primary transition-colors">WOOVB</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>

            {/* Nav Links */}
            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Dashboard</Link>
                  <Link href="/upload" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Upload</Link>
                  {isAdmin && (
                    <Link href="/admin" className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="px-6 py-2 rounded-full bg-primary hover:bg-primary-dark transition-colors">Logout</button>
                </>
              ) : (
                <Link href="/auth" className="px-6 py-2 rounded-full bg-primary hover:bg-primary-dark transition-colors">Login</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 glass">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.jpg" alt="WOOVB" className="h-10 w-10 rounded-lg object-cover" />
              <span className="text-xl font-bold text-white">WOOVB</span>
            </Link>
            {user && (
              <button onClick={handleLogout} className="text-sm px-4 py-1.5 rounded-full bg-primary hover:bg-primary-dark transition-colors">Logout</button>
            )}
          </div>
          <form onSubmit={handleSearch} className="mt-3">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {user && (
        <nav className="mobile-nav md:hidden">
          <div className="flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-xs">Home</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="text-xs">Dashboard</span>
            </Link>
            <Link href="/upload" className="flex flex-col items-center gap-1 text-primary">
              <div className="bg-primary rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <span className="text-xs">Upload</span>
            </Link>
            {isAdmin && (
              <Link href="/admin" className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Admin</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}

