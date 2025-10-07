# 🚀 Deploying WOOVB to Vercel

## Step 1: Deploy to Vercel

1. Go to **https://vercel.com**
2. Sign in with your GitHub account
3. Click **"Add New Project"**
4. Import repository: **hartmath/woovb**
5. Click **"Deploy"**

## Step 2: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Select your **woovb** project
3. Click **"Storage"** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Click **"Create"**
7. Vercel will automatically add these environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

8. **Redeploy your project** after adding the database

### Option B: External PostgreSQL (Alternative)

Use **Supabase** (Free tier):
1. Go to **https://supabase.com**
2. Create a new project
3. Get your database connection string
4. In Vercel → Settings → Environment Variables
5. Add: `POSTGRES_URL` = `postgresql://user:pass@host:5432/database`

## Step 3: Set Up Video Storage

### Vercel Blob Storage (Recommended)

1. In your Vercel project dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Blob"**
5. Click **"Create"**
6. Vercel will add `BLOB_READ_WRITE_TOKEN`

**Note:** You'll need to update the video upload code to use Vercel Blob API:
```python
from vercel_blob import put

# In upload route
blob = put(file.filename, file, {'access': 'public'})
video_url = blob['url']
```

### Alternative: Cloudflare R2 (Cheaper for video storage)

1. Sign up at **cloudflare.com**
2. Create R2 bucket
3. Get access credentials
4. Add to Vercel environment variables:
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_ACCOUNT_ID`

## Step 4: Configure Environment Variables

In Vercel → Settings → Environment Variables, add:

```
SECRET_KEY=your-super-secret-key-here-change-this
POSTGRES_URL=automatically-added-by-vercel-postgres
```

## Step 5: Redeploy

After adding database and environment variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to GitHub

## ⚠️ Important Notes

### Current Limitations:
1. **Video Storage**: The current code saves videos to local filesystem, which won't work on Vercel
   - Videos will be lost on each deployment
   - You MUST implement Vercel Blob or external storage (Cloudflare R2, AWS S3)

2. **File Uploads**: Need to modify `app.py` to use cloud storage instead of local `uploads/` folder

### What Works:
✅ User authentication
✅ Database (PostgreSQL)
✅ All pages and UI
✅ Session management

### What Needs Update:
❌ Video upload (needs Vercel Blob/R2/S3)
❌ Video serving (needs cloud storage URLs)
❌ File persistence

## 🔧 Quick Test

After deployment:
1. Visit your Vercel URL (e.g., `woovb.vercel.app`)
2. Register a new account
3. Login
4. Browse pages (should work)
5. Video upload won't work until storage is configured

## 📝 Next Steps

To fully enable video uploads, you need to:

1. **Choose a storage solution** (Vercel Blob or Cloudflare R2)
2. **Update `app.py`** to upload to cloud storage
3. **Update video serving** to stream from cloud URLs
4. **Test deployment**

Would you like help implementing Vercel Blob or Cloudflare R2 storage?

## 🆘 Troubleshooting

**Database connection error:**
- Make sure `POSTGRES_URL` environment variable is set
- Redeploy after adding database

**Videos not uploading:**
- Expected! You need to set up Vercel Blob or external storage

**Application error:**
- Check Vercel logs: Project → Deployments → Click deployment → Runtime Logs

**Need help?**
Contact support or check Vercel documentation at https://vercel.com/docs

