from flask import Flask, render_template, request, redirect, url_for, session, flash, send_from_directory, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid
import secrets
import subprocess
from PIL import Image

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['UPLOAD_FOLDER'] = 'uploads/videos'
app.config['THUMBNAIL_FOLDER'] = 'uploads/thumbnails'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size (PythonAnywhere limit)
app.config['ALLOWED_EXTENSIONS'] = {'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'}

# Create upload directories if they don't exist (skip on Vercel/serverless)
try:
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['THUMBNAIL_FOLDER'], exist_ok=True)
except OSError:
    # Read-only filesystem (Vercel) - use Supabase Storage instead
    pass

# MIME type mapping
MIME_TYPES = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'mkv': 'video/x-matroska',
    'flv': 'video/x-flv'
}

@app.template_filter('get_mime_type')
def get_mime_type(filename):
    """Get MIME type from filename extension"""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    return MIME_TYPES.get(ext, 'video/mp4')

# Import database models and functions
from database import init_db, create_user, get_user_by_email, create_video, get_all_videos, get_video_by_id, get_user_videos, increment_views, get_all_users, delete_user, delete_video, get_stats, get_user_by_id

# Initialize database
init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def generate_video_id():
    """Generate a unique video ID"""
    return f"VID-{uuid.uuid4().hex[:12].upper()}"

def generate_thumbnail(video_path, thumbnail_path, time_seconds=2):
    """
    Generate a thumbnail from a video file using ffmpeg
    Falls back to a placeholder if ffmpeg is not available
    """
    try:
        # Try using ffmpeg (best quality)
        subprocess.run([
            'ffmpeg',
            '-i', video_path,
            '-ss', str(time_seconds),
            '-vframes', '1',
            '-vf', 'scale=640:360',
            '-y',
            thumbnail_path
        ], check=True, capture_output=True, timeout=10)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        # Fallback: Create a simple placeholder image
        try:
            from PIL import Image, ImageDraw, ImageFont
            # Create a 640x360 gradient image
            img = Image.new('RGB', (640, 360), color=(120, 81, 169))
            draw = ImageDraw.Draw(img)
            
            # Add a play icon
            center_x, center_y = 320, 180
            play_points = [
                (center_x - 40, center_y - 50),
                (center_x - 40, center_y + 50),
                (center_x + 50, center_y)
            ]
            draw.polygon(play_points, fill=(255, 255, 255))
            
            # Save the placeholder
            img.save(thumbnail_path, 'JPEG', quality=85)
            return True
        except Exception as e:
            print(f"Error creating placeholder thumbnail: {e}")
            return False

@app.route('/')
def index():
    return redirect(url_for('home'))

@app.route('/home')
def home():
    all_videos = get_all_videos()
    featured_video = all_videos[0] if all_videos else None
    return render_template('home.html', videos=all_videos[:15], featured_video=featured_video)

@app.route('/public-videos')
def public_videos():
    all_videos = get_all_videos()
    return render_template('home.html', videos=all_videos, featured_video=all_videos[0] if all_videos else None)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Validation
        if not username or not email or not password:
            flash('All fields are required', 'error')
            return render_template('auth.html', active_tab='register')
        
        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return render_template('auth.html', active_tab='register')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long', 'error')
            return render_template('auth.html', active_tab='register')
        
        # Check if user exists
        if get_user_by_email(email):
            flash('Email already registered', 'error')
            return render_template('auth.html', active_tab='register')
        
        # Create user
        password_hash = generate_password_hash(password)
        create_user(username, email, password_hash)
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('auth.html', active_tab='register')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = get_user_by_email(email)
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash(f'Welcome back, {user["username"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password', 'error')
    
    return render_template('auth.html', active_tab='login')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'success')
    return redirect(url_for('home'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_videos = get_user_videos(session['user_id'])
    return render_template('dashboard.html', videos=user_videos)

@app.route('/upload')
def upload_page():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if 'video' not in request.files:
        return jsonify({'error': 'No video file'}), 400
    
    file = request.files['video']
    title = request.form.get('title', 'Untitled Video')
    description = request.form.get('description', '')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique video ID
        video_id = generate_video_id()
        
        # Create safe filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{video_id}.{file_extension}"
        thumbnail_filename = f"{video_id}.jpg"
        
        # Save video file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Generate thumbnail
        thumbnail_path = os.path.join(app.config['THUMBNAIL_FOLDER'], thumbnail_filename)
        generate_thumbnail(filepath, thumbnail_path)
        
        # Save to database with thumbnail
        create_video(video_id, title, description, filename, thumbnail_filename, session['user_id'])
        
        flash(f'Video uploaded successfully! Video ID: {video_id}', 'success')
        return jsonify({'success': True, 'video_id': video_id})
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/videos')
def videos():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    all_videos = get_all_videos()
    return render_template('videos.html', videos=all_videos)

@app.route('/watch/<video_id>')
def watch(video_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    video = get_video_by_id(video_id)
    
    if not video:
        flash('Video not found', 'error')
        return redirect(url_for('home'))
    
    # Increment view count
    increment_views(video_id)
    
    return render_template('watch.html', video=video)

@app.route('/uploads/videos/<filename>')
def serve_video(filename):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Get file extension and determine MIME type
    file_ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    
    response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Set proper MIME type
    if file_ext in MIME_TYPES:
        response.headers['Content-Type'] = MIME_TYPES[file_ext]
    
    # Add headers for video streaming
    response.headers['Accept-Ranges'] = 'bytes'
    response.headers['Cache-Control'] = 'public, max-age=3600'
    response.headers['Access-Control-Allow-Origin'] = '*'
    
    return response

@app.route('/uploads/thumbnails/<filename>')
def serve_thumbnail(filename):
    """Serve video thumbnails"""
    return send_from_directory(app.config['THUMBNAIL_FOLDER'], filename)

@app.route('/search')
def search():
    query = request.args.get('q', '')
    if not query:
        return redirect(url_for('home'))
    
    all_videos = get_all_videos()
    # Simple search in title and description
    filtered_videos = [v for v in all_videos if query.lower() in v['title'].lower() or (v['description'] and query.lower() in v['description'].lower())]
    
    return render_template('home.html', videos=filtered_videos, featured_video=filtered_videos[0] if filtered_videos else None, search_query=query)

@app.route('/api/videos')
def api_videos():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    videos = get_all_videos()
    return jsonify(videos)

# Admin panel routes
@app.route('/admin')
def admin_panel():
    if 'user_id' not in session:
        flash('Please login to access admin panel', 'error')
        return redirect(url_for('login'))
    
    # Check if user is admin (user_id = 1 or you can add is_admin field)
    current_user = get_user_by_id(session['user_id'])
    if not current_user or current_user['id'] != 1:
        flash('Access denied. Admin only.', 'error')
        return redirect(url_for('home'))
    
    # Get all data
    users = get_all_users()
    all_videos = get_all_videos()
    stats = get_stats()
    
    return render_template('admin.html', users=users, videos=all_videos, stats=stats)

@app.route('/admin/delete-user/<int:user_id>', methods=['POST'])
def admin_delete_user(user_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Check if user is admin
    current_user = get_user_by_id(session['user_id'])
    if not current_user or current_user['id'] != 1:
        return jsonify({'error': 'Access denied'}), 403
    
    # Don't allow deleting yourself
    if user_id == session['user_id']:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    # Delete user and their videos
    user_videos = get_user_videos(user_id)
    for video in user_videos:
        # Delete video file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], video['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)
    
    delete_user(user_id)
    flash('User deleted successfully', 'success')
    return jsonify({'success': True})

@app.route('/admin/delete-video/<video_id>', methods=['POST'])
def admin_delete_video(video_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Check if user is admin
    current_user = get_user_by_id(session['user_id'])
    if not current_user or current_user['id'] != 1:
        return jsonify({'error': 'Access denied'}), 403
    
    # Get video to delete file
    video = get_video_by_id(video_id)
    if video:
        # Delete video file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], video['filename'])
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Delete from database
        delete_video(video_id)
        flash('Video deleted successfully', 'success')
        return jsonify({'success': True})
    
    return jsonify({'error': 'Video not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

