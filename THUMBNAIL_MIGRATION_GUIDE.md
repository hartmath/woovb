# 🖼️ Video Thumbnails Migration Guide

## What's New?
Your WOOVB site now **automatically generates thumbnails** from uploaded videos! Real thumbnails extracted from actual video frames.

---

## 🚀 Deploy to PythonAnywhere

### Step 1: Update Code
```bash
cd woovb
git pull origin main
```

### Step 2: Install New Dependencies
```bash
pip3 install --user Pillow
```

### Step 3: Generate Thumbnails for Existing Videos (Optional)
If you have existing videos without thumbnails:
```bash
python3 generate_missing_thumbnails.py
```

### Step 4: Reload Web App
1. Go to **"Web"** tab
2. Click **"Reload"** button ♻️

---

## ✨ How It Works

### For New Videos:
- **Automatic!** When users upload videos, thumbnails are generated automatically
- Uses `ffmpeg` if available (extracts frame at 2 seconds)
- Falls back to PIL-generated placeholder if ffmpeg not available
- Thumbnails saved in `uploads/thumbnails/`

### For Old Videos:
- Run `generate_missing_thumbnails.py` to create thumbnails for existing videos
- Script checks each video and generates thumbnail if missing

---

## 📁 What Was Added

### New Files:
- `requirements.txt` - Python dependencies (includes Pillow)
- `generate_missing_thumbnails.py` - Script to generate thumbnails for old videos
- `THUMBNAIL_MIGRATION_GUIDE.md` - This file!

### Updated Files:
- `app.py` - Thumbnail generation function, new route `/uploads/thumbnails/<filename>`
- `database.py` - Added `thumbnail` column to videos table
- All template files - Now display actual thumbnails instead of gradients

---

## 🐛 Troubleshooting

### Thumbnails Not Showing?
1. Check if `uploads/thumbnails/` folder exists
2. Run the migration script: `python3 generate_missing_thumbnails.py`
3. Reload your web app

### "ffmpeg not found" Warning?
- That's okay! The system will create a purple placeholder thumbnail instead
- Placeholder looks professional and matches your branding
- To enable video frame extraction, install ffmpeg (PythonAnywhere may not have it)

### New Uploads Not Creating Thumbnails?
1. Check folder permissions: `ls -la uploads/`
2. Make sure `uploads/thumbnails/` is writable
3. Check error logs in PythonAnywhere

---

## 🎨 What You'll See

### Before (Gradient Placeholders):
- Purple/indigo gradient backgrounds
- Play icon overlay
- Generic look

### After (Real Thumbnails):
- Actual frame from video (at 2 seconds)
- Professional look
- YouTube-style presentation
- Still has play button overlay

---

## 📊 Database Changes

Added `thumbnail` column to `videos` table:
```sql
-- PostgreSQL & SQLite
ALTER TABLE videos ADD COLUMN thumbnail TEXT;
```

This happens automatically when you restart your app! No manual SQL needed.

---

## 🔍 File Structure

```
woovb/
├── uploads/
│   ├── videos/          # Video files
│   └── thumbnails/      # NEW! Thumbnail images
├── app.py
├── database.py
├── requirements.txt     # NEW! Dependencies
└── generate_missing_thumbnails.py  # NEW! Migration script
```

---

## ✅ Verification

After deployment, test by:
1. Uploading a new video
2. Check if thumbnail appears on home page
3. Check if thumbnail appears in dashboard
4. Verify thumbnail file exists in `uploads/thumbnails/`

---

## 💡 Tips

- **Thumbnail size**: 640x360 pixels (16:9 aspect ratio)
- **Format**: JPEG
- **Quality**: 85%
- **Extraction time**: Frame at 2 seconds into video
- **Fallback**: Purple gradient with play icon if extraction fails

---

That's it! Your videos now have beautiful thumbnails! 🎉

