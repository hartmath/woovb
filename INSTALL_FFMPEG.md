# 🎬 Install ffmpeg for Video Thumbnails

## Windows Installation (5 minutes)

### Step 1: Download
1. Go to: https://www.gyan.dev/ffmpeg/builds/
2. Download: **ffmpeg-release-essentials.zip** (Click the big blue button)
3. Or direct link: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip

### Step 2: Extract
1. Extract the downloaded ZIP file
2. You'll see a folder like: `ffmpeg-7.1-essentials_build`
3. Rename it to just: `ffmpeg`
4. Move it to: `C:\ffmpeg`
5. Final structure: `C:\ffmpeg\bin\ffmpeg.exe`

### Step 3: Add to PATH
Open PowerShell as Administrator and run:
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ffmpeg\bin", [EnvironmentVariableTarget]::Machine)
```

Or manually:
1. Press `Win + X` → System
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find `Path`
5. Click "Edit"
6. Click "New"
7. Add: `C:\ffmpeg\bin`
8. Click OK on everything

### Step 4: Verify Installation
**Close and reopen** PowerShell, then run:
```bash
ffmpeg -version
```

You should see ffmpeg version information!

### Step 5: Regenerate Thumbnails
```bash
cd "C:\Users\DAMMIE\Desktop\New folder"
python generate_missing_thumbnails.py
```

---

## Alternative: Use Existing Placeholders

If you prefer to deploy now and add ffmpeg later:
- The purple gradient thumbnails look professional
- They match your branding perfectly
- You can add real thumbnails anytime by:
  1. Installing ffmpeg
  2. Running `python generate_missing_thumbnails.py`

---

## PythonAnywhere Installation

On PythonAnywhere (free tier), ffmpeg is **not available**.

**Solution**: Generate thumbnails locally with ffmpeg, then upload:
```bash
# Locally (with ffmpeg installed)
python generate_missing_thumbnails.py

# Then upload to PythonAnywhere
# The thumbnail images will be in uploads/thumbnails/
```

Or just use the placeholder thumbnails - they look great!

---

## Troubleshooting

### "ffmpeg not recognized"
- Did you restart PowerShell after adding to PATH?
- Is ffmpeg.exe at `C:\ffmpeg\bin\ffmpeg.exe`?
- Try opening a NEW PowerShell window

### Thumbnails still not showing
- Run: `python generate_missing_thumbnails.py`
- Check if files exist in `uploads/thumbnails/`
- Refresh browser (Ctrl + F5)

---

That's it! Real video thumbnails! 🎉

