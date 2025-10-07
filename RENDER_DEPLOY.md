# 🚀 Deploying WOOVB to Render

## Why Render?
✅ **Persistent storage** - Videos are saved permanently
✅ **Free PostgreSQL** database included
✅ **Free tier** - 750 hours/month
✅ **Easy setup** - No serverless complications
✅ **Better for Flask** apps than Vercel

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Create Render Account**
1. Go to **https://render.com**
2. Sign up with your GitHub account

### **Step 2: Create New Web Service**
1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub account (if not already connected)
4. Select repository: **hartmath/woovb**
5. Click **"Connect"**

### **Step 3: Configure Web Service**
Fill in these settings:

**Basic Settings:**
- **Name**: `woovb` (or your preferred name)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

**Instance Type:**
- Select **"Free"** plan

### **Step 4: Add Environment Variables**
Click **"Advanced"** and add:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `SECRET_KEY` | `woovb-secret-key-change-this` |

### **Step 5: Create PostgreSQL Database**
1. In your Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `woovb-db`
   - **Database**: `woovb`
   - **User**: `woovb`
   - **Region**: Same as your web service
   - **Plan**: **Free**
4. Click **"Create Database"**
5. Wait for database to be created

### **Step 6: Connect Database to Web Service**
1. Go back to your **Web Service** settings
2. Scroll to **Environment Variables**
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Click the **"Insert from..."** dropdown
   - Select your database: **woovb-db**
   - Select: **Internal Database URL**
5. Click **"Add"**

### **Step 7: Add Persistent Disk (For Video Storage)**
1. In your Web Service settings
2. Scroll to **"Disks"**
3. Click **"Add Disk"**
4. Configure:
   - **Name**: `woovb-storage`
   - **Mount Path**: `/opt/render/project/src/uploads`
   - **Size**: `1 GB` (free tier)
5. Click **"Save"**

### **Step 8: Deploy**
1. Click **"Create Web Service"**
2. Render will automatically:
   - Pull your code from GitHub
   - Install dependencies
   - Create database tables
   - Start your application
3. Wait 3-5 minutes for deployment

---

## 🎉 **Your App is Live!**

After deployment completes:
1. You'll see: **"Your service is live 🎉"**
2. Click the URL (e.g., `woovb.onrender.com`)
3. Your WOOVB platform is now accessible!

---

## ✅ **What Works Out of the Box:**

✅ User registration & login
✅ Video upload & storage (persistent!)
✅ Video playback
✅ Dashboard & all pages
✅ PostgreSQL database
✅ Mobile responsive design
✅ All features working!

---

## 🔧 **Important Settings:**

### **Automatic Deploys**
Render automatically redeploys when you push to GitHub:
- Push changes → Automatic deployment
- No manual redeploy needed!

### **Custom Domain (Optional)**
To use your own domain:
1. Go to Web Service → **Settings**
2. Scroll to **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Follow instructions to add DNS records

### **Free Tier Limitations**
- **750 hours/month** (enough for 24/7)
- **Spins down after 15 min** of inactivity
- **First request after sleep** takes ~30 seconds
- **1GB disk storage** for videos

### **Upgrade to Paid (Optional)**
If you need:
- No sleep/instant response: **$7/month**
- More storage: **$1/GB/month**
- Better performance: Starter plan **$7/month**

---

## 📊 **Monitoring Your App**

### **View Logs**
1. Go to your Web Service
2. Click **"Logs"** tab
3. See real-time application logs

### **Check Database**
1. Go to your PostgreSQL database
2. Click **"Connect"** 
3. Use connection details to access with tools like pgAdmin

### **Metrics**
1. Click **"Metrics"** tab
2. See:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🆘 **Troubleshooting**

### **Build Failed**
- Check **"Logs"** tab for errors
- Common fix: Make sure `requirements.txt` is correct
- Verify `gunicorn` is in requirements.txt

### **Database Connection Error**
- Make sure `DATABASE_URL` environment variable is set
- Verify database is running (green status)
- Check database and web service are in same region

### **Videos Not Uploading**
- Verify persistent disk is added
- Check mount path: `/opt/render/project/src/uploads`
- View logs for file permission errors

### **App is Slow**
- Free tier spins down after 15 min inactivity
- First request after sleep takes ~30 sec
- Consider upgrading to paid tier for instant response

---

## 🔄 **Update Your App**

To deploy changes:
1. Make changes locally
2. Commit: `git add . && git commit -m "Your changes"`
3. Push: `git push`
4. Render automatically redeploys!

---

## 💡 **Pro Tips**

1. **Keep your app awake**: Use a service like UptimeRobot to ping your app every 5 minutes
2. **Monitor storage**: Check disk usage in Render dashboard
3. **Backup database**: Render auto-backs up, but you can also manual backup
4. **Use environment variables**: Never commit secrets to GitHub

---

## 📚 **Need Help?**

- **Render Docs**: https://render.com/docs
- **Community Forum**: https://community.render.com
- **Status Page**: https://status.render.com

---

## 🎊 **You're All Set!**

Your WOOVB video platform is now:
- ✅ Deployed to Render
- ✅ Using PostgreSQL database
- ✅ With persistent video storage
- ✅ Fully functional and accessible worldwide!

Enjoy your video platform! 🚀

