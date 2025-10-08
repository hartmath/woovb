import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const router = useRouter()

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register state
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Get user by email
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginEmail)
        .single()

      if (error || !users) {
        setMessage({ type: 'error', text: 'Invalid email or password' })
        return
      }

      // Check password
      const isValidPassword = await bcrypt.compare(loginPassword, users.password_hash)
      
      if (!isValidPassword) {
        setMessage({ type: 'error', text: 'Invalid email or password' })
        return
      }

      // Store user data
      localStorage.setItem('userId', users.id)
      localStorage.setItem('username', users.username)

      setMessage({ type: 'success', text: `Welcome back, ${users.username}!` })
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Login error:', error)
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Validation
    if (!registerUsername || !registerEmail || !registerPassword) {
      setMessage({ type: 'error', text: 'All fields are required' })
      setLoading(false)
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setLoading(false)
      return
    }

    if (registerPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setLoading(false)
      return
    }

    try {
      // Check if email exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', registerEmail)
        .single()

      if (existingUser) {
        setMessage({ type: 'error', text: 'Email already registered' })
        setLoading(false)
        return
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(registerPassword, salt)

      // Create user
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username: registerUsername,
            email: registerEmail,
            password_hash: passwordHash,
          },
        ])
        .select()

      if (error) throw error

      setMessage({ type: 'success', text: 'Registration successful! Please login.' })
      
      // Clear form and switch to login tab
      setRegisterUsername('')
      setRegisterEmail('')
      setRegisterPassword('')
      setRegisterConfirmPassword('')
      
      setTimeout(() => {
        setActiveTab('login')
        setMessage({ type: '', text: '' })
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass p-8 rounded-2xl">
            {/* Logo */}
            <div className="text-center mb-8">
              <img src="/logo.jpg" alt="WOOVB" className="h-16 w-16 rounded-xl mx-auto mb-4 object-cover" />
              <h1 className="text-3xl font-bold text-white">WOOVB</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => {
                  setActiveTab('login')
                  setMessage({ type: '', text: '' })
                }}
                className={`flex-1 py-2 rounded-md transition-all ${
                  activeTab === 'login'
                    ? 'bg-primary text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setActiveTab('register')
                  setMessage({ type: '', text: '' })
                }}
                className={`flex-1 py-2 rounded-md transition-all ${
                  activeTab === 'register'
                    ? 'bg-primary text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Message */}
            {message.text && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  message.type === 'error'
                    ? 'bg-red-500/20 text-red-200 border border-red-500/50'
                    : 'bg-green-500/20 text-green-200 border border-green-500/50'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Username</label>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="johndoe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Password</label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

