# ADEXA AI - Complete Deployment Guide

## 🚀 Deployment Overview
This guide will deploy your full-stack application across multiple platforms:
- **Frontend**: Vercel (Free tier)
- **Backend & AI Service**: Railway (Free tier with $5/month credit)
- **Database**: MongoDB Atlas (Free tier)

---

## ✅ Step 1: Set Up MongoDB Atlas (Free Tier)

### 1.1 Create MongoDB Atlas Account
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or GitHub
3. Create a new project (name it "adexa-ai")

### 1.2 Create a Cluster
1. Click **"Build a Database"**
2. Select **"Shared"** tier (Free)
3. Choose provider: **AWS**, Region: **us-east-1** (or closest to you)
4. Click **"Create Cluster"** (takes 2-3 minutes)

### 1.3 Create Database User
1. Go to **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `adexa-admin`
4. Password: Generate secure password (save it!)
5. Built-in Role: **Atlas Admin**
6. Click **"Add User"**

### 1.4 Add Network Access
1. Go to **"Network Access"**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Clusters"** → Click **"Connect"**
2. Select **"Drivers"** (Node.js)
3. Copy the connection string:
   ```
   mongodb+srv://adexa-admin:PASSWORD@cluster.mongodb.net/adexa-ai?retryWrites=true&w=majority
   ```
4. Replace `PASSWORD` with your actual password
5. **Save this string!**

---

## ✅ Step 2: Set Up Vercel (Frontend Deployment)

### 2.1 Connect GitHub to Vercel
1. Visit: https://vercel.com/signup
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 2.2 Deploy Frontend
1. Go to Vercel Dashboard
2. Click **"Add New"** → **"Project"**
3. Search for your `omsri9091-dotcom/project` repository
4. Click **"Import"**
5. **Root Directory**: Select `client`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. **Environment Variables**: Add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (You'll update this after backend deployment)
9. Click **"Deploy"**
10. **Copy your Vercel frontend URL** (e.g., `adexa-ai.vercel.app`)

### 2.3 Update Vercel Environment Variable
Once backend is deployed:
1. Go to **Settings** → **Environment Variables**
2. Update `VITE_API_URL` with your actual Railway backend URL
3. Redeploy: Click **"Deployments"** → **"..."** → **"Redeploy"**

---

## ✅ Step 3: Deploy Backend to Railway

### 3.1 Connect GitHub to Railway
1. Visit: https://railway.app/
2. Click **"Start Project"**
3. Select **"Deploy from GitHub"**
4. Authorize GitHub access
5. Select your `omsri9091-dotcom/project` repository

### 3.2 Deploy Backend Service
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select the repo, click **"Open in Railway"**
3. A new project opens - click **"Add Service"** → **"GitHub Repo"**
4. Select your repo
5. **Root Directory**: Leave empty (Railway auto-detects)
6. Once deployed, Railway auto-detects it's a Node.js app
7. Click on the **Backend Service** → **"Settings"**
8. Set **Start Command**: `npm --prefix server run dev`
9. Go to **"Variables"** tab and add:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://adexa-admin:PASSWORD@cluster.mongodb.net/adexa-ai?retryWrites=true&w=majority
   JWT_SECRET=generate-a-random-secret-key-here
   CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
   AI_SERVICE_URL=https://your-ai-service-url.railway.app
   ```
10. **Copy your Railway Backend URL** (e.g., `adexa-ai-backend.railway.app`)
11. Click **"Deploy"**

---

## ✅ Step 4: Deploy AI Service to Railway

### 4.1 Create AI Service
1. In the same Railway project, click **"Add Service"** → **"GitHub Repo"**
2. Select your repo again
3. Once deployed, click on **AI Service** → **"Settings"**
4. Set **Start Command**:
   ```
   cd ai-service && python train_model.py && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Go to **"Variables"** tab and add:
   ```
   PORT=8000
   PYTHONUNBUFFERED=1
   ```
6. Click **"Deploy"**
7. **Copy your Railway AI Service URL** (e.g., `adexa-ai-ml.railway.app`)

---

## ✅ Step 5: Update All URLs

After all services are deployed, update the environment variables:

### Update Backend Server
Backend Railway → Settings → Variables:
```
CORS_ORIGIN=https://your-vercel-url.vercel.app
AI_SERVICE_URL=https://your-ai-service.railway.app
```

### Update Frontend Vercel
Frontend Vercel → Settings → Environment Variables:
```
VITE_API_URL=https://your-backend.railway.app
```

Redeploy all services after updating URLs.

---

## ✅ Step 6: Test the Deployment

1. **Frontend**: Open https://your-frontend.vercel.app
2. **Backend API**: Visit https://your-backend.railway.app/health (or check server logs)
3. **AI Service**: Visit https://your-ai-service.railway.app/docs
4. **Try logging in** with demo credentials:
   - Email: `admin@adexa.ai`
   - Password: `Admin@12345`

---

## 🔗 Useful Links
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Your GitHub**: https://github.com/omsri9091-dotcom/project

---

## 💡 Tips
- Keep your MongoDB password and JWT secret safe
- Railway gives $5/month free credit (more than enough for small projects)
- Vercel free tier includes unlimited deployments
- If services go down, check Railway/Vercel logs for errors
- Database backups: MongoDB Atlas free tier includes daily backups

---

## ❌ Troubleshooting

### Backend can't connect to MongoDB
- Check MongoDB connection string in `MONGODB_URI`
- Verify IP whitelist includes `0.0.0.0/0`
- Check username and password are correct

### Frontend shows CORS errors
- Update `CORS_ORIGIN` in backend to match Vercel URL
- Redeploy backend after changing

### AI Service not responding
- Check Python version (requires 3.10+)
- Verify `train_model.py` runs without errors locally
- Check Railway logs for exceptions

---

## Next Steps
1. Push these config files to GitHub: `git add . && git commit -m "Add deployment configs" && git push`
2. Follow the steps above in order
3. Test each service
4. Share your live URLs with others!

**Your application will be live and accessible from any device with internet access!** 🎉
