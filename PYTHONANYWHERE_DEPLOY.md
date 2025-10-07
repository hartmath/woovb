# 🐍 Deploying WOOVB to PythonAnywhere

## ✅ Why PythonAnywhere?
- ✅ **NO CREDIT CARD** required
- ✅ **Free forever**
- ✅ **Python-optimized**
- ✅ **Easy web interface**
- ✅ **No sleep time**
- ✅ **512MB storage**

---

## 🚀 **Step-by-Step Deployment**

### **Step 1: Create PythonAnywhere Account**
1. Go to **https://www.pythonanywhere.com**
2. Click **"Start running Python online in less than a minute!"**
3. Click **"Create a Beginner account"**
4. Fill in:
   - Username
   - Email
   - Password
5. Click **"Register"**
6. Verify your email

---

### **Step 2: Open a Bash Console**
1. Once logged in, go to **"Consoles"** tab
2. Click **"Bash"** to open a terminal
3. You'll see a command line

---

### **Step 3: Clone Your Repository**
In the Bash console, run these commands:

```bash
# Clone your GitHub repository
git clone https://github.com/hartmath/woovb.git

# Navigate to the project
cd woovb

# Install dependencies
pip3 install --user -r requirements.txt
```

Wait for installation to complete (~2 minutes)

---

### **Step 4: Set Up Web App**
1. Go to **"Web"** tab in PythonAnywhere dashboard
2. Click **"Add a new web app"**
3. Click **"Next"** (accept the default domain)
4. Select Python version: **Python 3.10**
5. Select framework: **Flask**
6. For path, enter: `/home/YOUR_USERNAME/woovb/app.py`
   (Replace YOUR_USERNAME with your PythonAnywhere username)
7. Click **"Next"**

---

### **Step 5: Configure WSGI File**
1. In the **"Web"** tab, scroll to **"Code"** section
2. Click the link under **"WSGI configuration file"**
   - It looks like: `/var/www/youruser_pythonanywhere_com_wsgi.py`
3. **Delete all the content** and replace with:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/YOUR_USERNAME/woovb'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

# Set environment variables
os.environ['SECRET_KEY'] = 'woovb-pythonanywhere-secret-key-2024'

# Import Flask app
from app import app as application
```

**Important:** Replace `YOUR_USERNAME` with your actual PythonAnywhere username!

4. Click **"Save"** (top right)

---

### **Step 6: Configure Static Files**
1. Still in **"Web"** tab, scroll to **"Static files"** section
2. Click **"Enter URL"** and **"Enter path"** to add:

| URL | Directory |
|-----|-----------|
| `/static/` | `/home/YOUR_USERNAME/woovb/static` |
| `/uploads/` | `/home/YOUR_USERNAME/woovb/uploads` |

(Replace YOUR_USERNAME with yours)

3. Click the checkmark to save each one

---

### **Step 7: Initialize Database**
1. Go back to **"Consoles"** tab
2. Open a **Bash console**
3. Run:

```bash
cd woovb
python3
```

4. In the Python console that opens:

```python
from database import init_db
init_db()
exit()
```

You should see "Database initialized!"

---

### **Step 8: Create Uploads Directory**
In the Bash console:

```bash
cd woovb
mkdir -p uploads/videos
chmod 755 uploads
chmod 755 uploads/videos
```

---

### **Step 9: Reload Your Web App**
1. Go to **"Web"** tab
2. Click the big green **"Reload"** button at the top
3. Wait for it to say "Reloaded!"

---

## 🎉 **Your App is Live!**

Your WOOVB platform is now accessible at:
**`http://YOUR_USERNAME.pythonanywhere.com`**

Click the link to visit your site!

---

## ✅ **Test Your App**

1. Visit your URL
2. Click **"Sign Up"** to register
3. Login with your account
4. Upload a test video
5. Browse and watch videos

Everything should work! 🎊

---

## 📋 **Important Settings**

### **Your App Details:**
- **URL:** `YOUR_USERNAME.pythonanywhere.com`
- **Storage:** 512MB (free tier)
- **Database:** SQLite (stored in your files)
- **Bandwidth:** 100,000 hits/day

### **File Locations:**
- **App code:** `/home/YOUR_USERNAME/woovb/`
- **Logs:** In "Web" tab → "Log files" section
- **Database:** `/home/YOUR_USERNAME/woovb/video_platform.db`
- **Videos:** `/home/YOUR_USERNAME/woovb/uploads/videos/`

---

## 🔧 **Common Tasks**

### **Update Your Code**
When you push changes to GitHub:

1. Go to **"Consoles"** tab
2. Open **Bash**
3. Run:
```bash
cd woovb
git pull
```
4. Go to **"Web"** tab → Click **"Reload"**

### **View Logs**
1. Go to **"Web"** tab
2. Scroll to **"Log files"** section
3. Click:
   - **Error log** - See errors
   - **Server log** - See access logs

### **Check Disk Space**
In Bash console:
```bash
du -sh ~/woovb
```

### **View Database**
In Bash console:
```bash
cd woovb
sqlite3 video_platform.db
.tables
.exit
```

---

## ⚠️ **Free Tier Limitations**

### **What You Get:**
- ✅ 512MB disk space
- ✅ 100,000 hits/day
- ✅ Always online (no sleep!)
- ✅ No credit card needed

### **Limitations:**
- ⚠️ **512MB storage** - About 50-100 small videos
- ⚠️ **100k daily hits** - If exceeded, site goes down until next day
- ⚠️ **CPU time limits** - Heavy traffic may pause
- ⚠️ **Custom domain** - Need paid plan ($5/month)

### **Upgrade Options:**
If you need more:
- **Hacker plan:** $5/month
  - 1GB storage
  - Custom domain
  - More CPU
  - No daily limits

---

## 🐛 **Troubleshooting**

### **Site shows error page**
1. Check **Error log** in Web tab
2. Common issues:
   - Wrong path in WSGI file
   - Missing dependencies
   - Database not initialized

### **Can't upload videos**
1. Check uploads directory exists:
```bash
ls -la ~/woovb/uploads/
```
2. Check permissions:
```bash
chmod -R 755 ~/woovb/uploads/
```

### **Changes not showing**
1. Always click **"Reload"** in Web tab after changes
2. Clear browser cache (Ctrl+F5)

### **Database error**
1. Re-initialize database:
```bash
cd ~/woovb
python3
>>> from database import init_db
>>> init_db()
>>> exit()
```

### **Import errors**
1. Reinstall dependencies:
```bash
cd ~/woovb
pip3 install --user -r requirements.txt
```
2. Reload web app

---

## 💡 **Pro Tips**

### **1. Monitor Your Storage**
Check regularly:
```bash
du -sh ~/woovb/uploads/
```

### **2. Backup Your Database**
Download regularly from "Files" tab

### **3. Keep Dependencies Updated**
```bash
cd ~/woovb
pip3 install --user --upgrade -r requirements.txt
```

### **4. Schedule Database Backups**
Use PythonAnywhere's "Tasks" tab (paid feature) or do manual backups

### **5. Custom Domain (Paid)**
If you upgrade, you can use your own domain:
- Go to Web tab
- Add CNAME record: `www.yourdomain.com` → `YOUR_USERNAME.pythonanywhere.com`

---

## 📊 **Monitoring**

### **Check Traffic**
- Go to **"Web"** tab
- See requests/day chart

### **View Active Processes**
In Bash console:
```bash
ps aux | grep python
```

### **Database Size**
```bash
du -h ~/woovb/video_platform.db
```

---

## 🔄 **Deployment Checklist**

- [ ] Create PythonAnywhere account
- [ ] Clone repository to Bash console
- [ ] Install dependencies
- [ ] Create web app (Flask, Python 3.10)
- [ ] Configure WSGI file
- [ ] Set up static files mappings
- [ ] Initialize database
- [ ] Create uploads directory
- [ ] Set permissions
- [ ] Reload web app
- [ ] Test: Register, Login, Upload, Watch
- [ ] Bookmark your site URL!

---

## 🆘 **Need Help?**

- **PythonAnywhere Forums:** https://www.pythonanywhere.com/forums/
- **Help Pages:** https://help.pythonanywhere.com/
- **Email Support:** support@pythonanywhere.com

---

## 🎊 **You're All Set!**

Your WOOVB video platform is now:
- ✅ Deployed to PythonAnywhere
- ✅ Using SQLite database
- ✅ With persistent video storage
- ✅ Fully functional and free!
- ✅ No credit card needed!

Enjoy your platform! 🚀

**Your URL:** `http://YOUR_USERNAME.pythonanywhere.com`

