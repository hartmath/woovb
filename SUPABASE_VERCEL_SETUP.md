# 🚀 Deploy WOOVB on Supabase + Vercel

## Why This Setup is Better:
✅ **Supabase**: Free PostgreSQL database + 1GB file storage  
✅ **Vercel**: Fast, free hosting with auto-deployments  
✅ **No credit card required** for either service  
✅ **Better performance** than PythonAnywhere  
✅ **Automatic HTTPS** and CDN  

---

## 📋 **Part 1: Setup Supabase (Database + Storage)**

### Step 1: Create Supabase Account
1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign in with **GitHub**
4. Click **"New Project"**
5. Settings:
   - **Name**: woovb
   - **Database Password**: (create a strong password, save it!)
   - **Region**: Choose closest to you
   - Click **"Create new project"**
6. Wait 2-3 minutes for setup

### Step 2: Get Database Connection String
1. In Supabase dashboard, click **"Project Settings"** (⚙️ icon)
2. Click **"Database"** in sidebar
3. Scroll to **"Connection string"**
4. Select **"URI"**
5. **Copy the connection string** (looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
6. **Replace `[YOUR-PASSWORD]` with your actual password!**
7. Save this - you'll need it!

### Step 3: Setup File Storage
1. In Supabase dashboard, click **"Storage"** in sidebar
2. Click **"Create a new bucket"**
3. Settings:
   - **Name**: `woovb-videos`
   - **Public bucket**: ✅ Check this
   - Click **"Create bucket"**
4. Click on the bucket
5. Click **"Policies"** tab
6. Click **"New Policy"** → **"Custom Policy"**
7. Policy settings:
   - **Name**: `Public Access`
   - **Policy**: SELECT (read)
   - **Definition**: `true` (allows public read)
   - Click **"Save"**
8. Create another policy for INSERT:
   - **Name**: `Authenticated Upload`
   - **Policy**: INSERT
   - **Definition**: `true`
   - Click **"Save"**

---

## 📋 **Part 2: Deploy to Vercel**

### Step 1: Push to GitHub
Already done! Your code is at: `https://github.com/hartmath/woovb.git`

### Step 2: Create Vercel Account
1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel

### Step 3: Deploy Project
1. Click **"Add New..."** → **"Project"**
2. **Import** your repository: `hartmath/woovb`
3. Click **"Import"**
4. **Framework Preset**: Other
5. **Build Command**: Leave empty
6. **Output Directory**: `.`
7. **Install Command**: `pip install -r requirements.txt`

### Step 4: Add Environment Variables
Before deploying, click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `SECRET_KEY` | Any random string (e.g., `your-secret-key-here-12345`) |
| `SUPABASE_URL` | From Supabase Settings → API → Project URL |
| `SUPABASE_KEY` | From Supabase Settings → API → `anon` `public` key |

### Step 5: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your site will be live at: `https://woovb-yourname.vercel.app`

---

## 🔄 **Part 3: Update Code for Supabase Storage**

We need to update the app to use Supabase storage instead of local files.

### Step 1: Install Supabase Client
```bash
pip install supabase
```

### Step 2: Update requirements.txt
Add to `requirements.txt`:
```
supabase==2.3.4
```

---

## ✅ **What You Get:**

### Database:
- ✅ PostgreSQL (better than SQLite)
- ✅ 500MB free storage
- ✅ Automatic backups

### File Storage:
- ✅ 1GB free storage
- ✅ CDN delivery (fast worldwide)
- ✅ No file upload limits

### Hosting:
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Auto-deploy on git push

---

## 🎬 **Video Thumbnails:**

With Supabase, we can:
1. Upload videos to Supabase Storage
2. Generate thumbnails locally or use a service
3. Store both in Supabase Storage
4. Much faster than PythonAnywhere!

---

## 📝 **Next Steps:**

1. ✅ Create Supabase account (5 min)
2. ✅ Get database URL
3. ✅ Setup storage bucket
4. ✅ Deploy to Vercel (5 min)
5. ✅ Test video upload
6. ✅ Everything works! 🎉

**Ready to start?** Let's do Step 1! 🚀

