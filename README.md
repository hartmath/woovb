# 🎥 WOOVB - Custom Video Hosting Platform

A lightweight, custom-built video hosting platform with user authentication and video management. Built from scratch with Python Flask, HTML, CSS, and JavaScript.

**Website:** woovb.com

## ✨ Features

- **Modern Dark Homepage**: Beautiful streaming platform homepage inspired by modern video platforms
- **User Authentication**: Register, login, and secure password management
- **Video Upload**: Upload videos with automatic unique ID generation (VID-XXXXXXXXXXXX format)
- **Custom Video Player**: HTML5 Video.js player with custom controls and keyboard shortcuts
- **Video Management**: Personal dashboard to manage your uploaded videos
- **Browse & Search**: Explore all videos with real-time search functionality
- **Featured Videos**: Showcase your best content on the homepage
- **View Counter**: Track video views automatically
- **SQLite Database**: Lightweight database for user accounts and video metadata
- **Responsive Design**: Modern, beautiful UI that works on all devices
- **Purple Brand Theme**: Custom WOOVB branding with purple color scheme

## 🎬 Video Player Features

The custom Video.js player includes:
- Play/pause, volume, and playback controls
- Playback speed adjustment (0.5x, 1x, 1.5x, 2x)
- Picture-in-Picture mode
- Full-screen support
- **Keyboard Shortcuts**:
  - `Space` - Play/Pause
  - `Left Arrow` - Rewind 5 seconds
  - `Right Arrow` - Forward 5 seconds
  - `Up Arrow` - Increase volume
  - `Down Arrow` - Decrease volume
  - `F` - Toggle fullscreen
  - `M` - Mute/Unmute

## 📋 Requirements

- Python 3.8 or higher
- pip (Python package manager)

## 🚀 Installation & Setup

### 1. Clone or Download the Project

```bash
cd video-platform
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Application

```bash
python app.py
```

The application will start on `http://localhost:5000`

### 4. First Time Setup

1. Open your browser and go to `http://localhost:5000`
2. You'll see the WOOVB homepage with featured videos
3. Click "Sign Up" to create your account
4. Fill in your username, email, and password
5. Login with your credentials
6. Click "Upload" button to start uploading videos!
7. Browse and search videos from the homepage

## 📁 Project Structure

```
video-platform/
├── app.py                 # Main Flask application
├── database.py           # Database models and functions
├── requirements.txt      # Python dependencies
├── README.md            # This file
├── video_platform.db    # SQLite database (created automatically)
├── templates/           # HTML templates
│   ├── base.html       # Base template
│   ├── login.html      # Login page
│   ├── register.html   # Registration page
│   ├── dashboard.html  # User dashboard
│   ├── videos.html     # Browse all videos
│   └── watch.html      # Video player page
├── static/             # Static files
│   ├── css/
│   │   └── style.css   # Main stylesheet
│   └── js/
│       └── main.js     # JavaScript utilities
└── uploads/            # Uploaded video files
    └── videos/         # Video storage directory
```

## 🎯 Usage

### Uploading Videos

1. Login to your account
2. Go to the Dashboard
3. Fill in the video title and description
4. Click "Choose Video File" and select your video
5. Click "Upload Video"
6. Your video will be assigned a unique ID (e.g., VID-A1B2C3D4E5F6)

### Watching Videos

1. Go to "Browse Videos" from the navigation
2. Click on any video thumbnail to watch
3. Use keyboard shortcuts for better control
4. The video ID is displayed for reference

### Supported Video Formats

- MP4 (recommended)
- AVI
- MOV
- MKV
- WebM
- FLV

## 🔒 Security Features

- Password hashing using Werkzeug's security functions
- Session-based authentication
- File type validation for uploads
- SQL injection protection with parameterized queries
- Secure filename handling

## ⚙️ Configuration

You can modify these settings in `app.py`:

```python
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # Max file size (500MB)
app.config['ALLOWED_EXTENSIONS'] = {'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'}
```

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `username` - User's display name
- `email` - Unique email address
- `password_hash` - Hashed password
- `created_at` - Registration timestamp

### Videos Table
- `id` - Primary key
- `video_id` - Unique video identifier (VID-XXXXXXXXXXXX)
- `title` - Video title
- `description` - Video description
- `filename` - Stored filename
- `user_id` - Foreign key to users
- `views` - View count
- `created_at` - Upload timestamp

## 🔄 Upgrading to PostgreSQL

To upgrade from SQLite to PostgreSQL for production:

1. Install psycopg2: `pip install psycopg2-binary`
2. Update `database.py` to use PostgreSQL connection
3. Update database connection string in configuration

## 📝 Notes

- The application runs in debug mode by default. For production, set `debug=False` in `app.py`
- Videos are stored in the `uploads/videos/` directory
- Database file `video_platform.db` is created automatically on first run
- Each video gets a unique 12-character ID for tracking

## 🚀 Production Deployment

For production deployment:

1. Set `app.config['SECRET_KEY']` to a strong, random value
2. Disable debug mode: `app.run(debug=False)`
3. Use a production WSGI server (Gunicorn, uWSGI)
4. Set up proper file storage (cloud storage recommended)
5. Use PostgreSQL instead of SQLite
6. Configure proper security headers
7. Set up HTTPS/SSL

## 🐛 Troubleshooting

**Videos won't upload:**
- Check file size (default max: 500MB)
- Verify file format is supported
- Ensure `uploads/videos/` directory exists and is writable

**Can't login:**
- Verify email and password are correct
- Check if account was created successfully
- Database file should exist and be accessible

**Video won't play:**
- Browser must support HTML5 video
- Video format should be compatible (MP4 recommended)
- Check browser console for errors

## 👤 Author

Built for Dammie by AI Assistant

## 📄 License

This project is open source and available for personal and commercial use.

---

**Enjoy your custom video platform! 🎉**

