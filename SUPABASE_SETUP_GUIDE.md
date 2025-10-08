# 🚀 Supabase Setup Guide for WOOVB

## Step-by-Step Setup Instructions

---

## Part 1: Setup Database Tables

### Step 1: Open SQL Editor
1. Go to your Supabase dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### Step 2: Run the SQL Schema
1. Open the file `supabase_schema.sql`
2. **Copy ALL the SQL code**
3. **Paste it into the Supabase SQL Editor**
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: ✅ Success message

This will create:
- ✅ `users` table
- ✅ `videos` table  
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Helper functions

---

## Part 2: Setup Storage Bucket

### Step 1: Create Bucket
1. Click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Settings:
   - **Name**: `woovb-videos`
   - **Public bucket**: ✅ **CHECK THIS!**
   - Click **"Create bucket"**

### Step 2: Setup Storage Policies
1. Click on `woovb-videos` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Public Read Access
- Click **"For full customization"**
- **Policy name**: `Public Read Access`
- **Allowed operation**: SELECT
- **Target roles**: `public`
- **Policy definition**: `true`
- Click **"Review"** → **"Save policy"**

#### Policy 2: Authenticated Upload
- Click **"New Policy"** again
- Click **"For full customization"**
- **Policy name**: `Authenticated Upload`
- **Allowed operation**: INSERT
- **Target roles**: `authenticated`
- **Policy definition**: `true`
- Click **"Review"** → **"Save policy"**

#### Policy 3: Delete Own Files
- Click **"New Policy"** again
- Click **"For full customization"**
- **Policy name**: `Delete Own Files`
- **Allowed operation**: DELETE
- **Target roles**: `authenticated`
- **Policy definition**: `true`
- Click **"Review"** → **"Save policy"**

---

## Part 3: Verify Setup

### Check Tables
1. Click **"Table Editor"** in sidebar
2. You should see:
   - ✅ `users` table
   - ✅ `videos` table

### Check Storage
1. Click **"Storage"** in sidebar
2. You should see:
   - ✅ `woovb-videos` bucket (Public)

---

## Part 4: Get Configuration

### Database URL
1. Click **"Project Settings"** (⚙️ bottom left)
2. Click **"Database"**
3. Under **"Connection string"**, click **"URI"**
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your password

**Your Database URL:**
```
postgresql://postgres.mmswrzfxocebcuzyfnwa:Chymemea2025$@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### API Keys
1. Click **"Project Settings"** (⚙️)
2. Click **"API"**
3. Copy these values:

**Project URL:**
```
https://mmswrzfxocebcuzyfnwa.supabase.co
```

**anon/public Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Part 5: Deploy to Vercel

### Environment Variables
Add these to Vercel:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your connection string |
| `SUPABASE_URL` | https://mmswrzfxocebcuzyfnwa.supabase.co |
| `SUPABASE_KEY` | Your anon key |
| `SECRET_KEY` | Any random string |
| `SUPABASE_BUCKET` | woovb-videos |

### Redeploy
1. Go to Vercel dashboard
2. Click on your project
3. Click **"Redeploy"**
4. Wait 2 minutes
5. Test your site! 🎉

---

## ✅ Verification Checklist

Before deploying, verify:

- ✅ SQL schema ran successfully
- ✅ `users` table exists
- ✅ `videos` table exists
- ✅ `woovb-videos` bucket created
- ✅ Bucket is set to **Public**
- ✅ Storage policies added
- ✅ Database URL copied
- ✅ API keys copied
- ✅ Environment variables added to Vercel

---

## 🎯 What Happens Next

1. **Users register** → Stored in `users` table
2. **Videos uploaded** → Stored in Supabase Storage bucket
3. **Video info saved** → Stored in `videos` table
4. **Thumbnails generated** → Stored in same bucket
5. **Everything works!** 🎉

---

## 🐛 Troubleshooting

### "relation does not exist"
- SQL schema didn't run
- Go back to SQL Editor and run `supabase_schema.sql`

### "bucket not found"
- Storage bucket not created
- Create bucket named `woovb-videos` (exact name!)

### "permission denied"
- Storage policies missing
- Add all 3 policies listed above

### Videos not uploading
- Check bucket is **Public**
- Check storage policies exist
- Check environment variables in Vercel

---

**Ready to deploy?** Follow the steps above! 🚀

