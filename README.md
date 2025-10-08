# WOOVB - Video Hosting Platform

Modern video hosting platform built with **Next.js** and **Supabase**.

![WOOVB](./public/logo.jpg)

## ✨ Features

- 🎬 **Video Upload & Hosting** - Upload videos up to 50MB
- 👤 **User Authentication** - Register, login, and manage your account
- 📊 **Dashboard** - View and manage your uploaded videos
- 🎥 **Custom Video Player** - Built with Video.js
- 🔍 **Search** - Find videos easily
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🎨 **Modern UI** - Purple-branded dark theme with glassmorphism
- 🛡️ **Admin Panel** - Manage users and videos (admin only)
- 📈 **View Tracking** - Track video views

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Video Player**: Video.js
- **Hosting**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/hartmath/woovb.git
cd woovb

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Visit http://localhost:3000

## 🔧 Setup

### 1. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL in `supabase_schema_updated.sql` in Supabase SQL Editor
3. Create a storage bucket named `woovb-videos` (public)
4. Copy your Supabase URL and anon key to `.env.local`

### 2. Vercel Deployment

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_BUCKET`
4. Deploy!

## 📖 Documentation

See `NEXTJS_DEPLOYMENT.md` for detailed deployment instructions.

## 🎯 Features

### User Features
- Register and login
- Upload videos with title and description
- View your dashboard
- Manage your videos
- Search for videos
- Watch videos with custom player

### Admin Features
- View platform statistics
- Manage all users
- Manage all videos
- Delete users and videos

## 🔐 Admin Access

The first user to register (user ID = 1) becomes the admin. Admin can access the admin panel at `/admin`.

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 License

MIT

## 👤 Author

**Dammie**

## 🙏 Acknowledgments

- Built with Next.js
- Powered by Supabase
- Video player by Video.js
- Styled with Tailwind CSS
