# 🚀 Railway Deployment Guide - Complete Setup

## **What You'll Deploy:**
- Backend (Node.js + Express + TypeScript)
- AI Service (Python + FastAPI)
- Both in ONE Railway project

---

## **Step 1: Create Railway Account & Project**

1. Go to: **https://railway.app/**
2. Click **"Start Project"**
3. **Sign up with GitHub** (authorize access)
4. Click **"New Project"**

---

## **Step 2: Deploy Backend Service**

### 2.1 Add Service from GitHub
1. In Railway Dashboard → Click **"Add Service"** (+ button)
2. Select **"GitHub Repo"**
3. Find and select: **`omsri9091-dotcom/project`**
4. Railway auto-detects it's a monorepo
5. Once deployed, click on the service card

### 2.2 Configure Backend Service
1. **Settings** tab
2. **Root Directory**: Leave blank (Railway will auto-detect)
3. Click **"Variables"** tab
4. Add these environment variables:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://adexa_admin:Test12345@cluster0.mongodb.net/adexa-ai?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-2024
CORS_ORIGIN=https://adexa-ai-3wdctbh9e-omsri9091-dotcoms-projects.vercel.app
AI_SERVICE_URL=https://your-ai-service-railway-url.railway.app
```

5. Go to **"Deploy"** tab
6. Set **Start Command**:
   ```
   npm --prefix server run dev
   ```

7. Click **"Deploy"** button

8. **Wait 2-3 minutes** for deployment
9. Once green, copy the Railway URL (e.g., `backend-prod.railway.app`)

---

## **Step 3: Deploy AI Service**

### 3.1 Add Another Service
1. In same Railway project → Click **"Add Service"** 
2. Select **"GitHub Repo"**
3. Same repo: `omsri9091-dotcom/project`
4. Click **"Add"**

### 3.2 Configure AI Service
1. **Settings** tab
2. **Root Directory**: Leave blank
3. Click **"Variables"** tab
4. Add:
   ```
   PORT=8000
   PYTHONUNBUFFERED=1
   ```

5. Go to **"Deploy"** tab
6. Set **Start Command**:
   ```
   cd ai-service && python train_model.py && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

7. Click **"Deploy"**
8. **Wait 3-5 minutes** (Python takes longer)
9. Once green, copy the Railway URL (e.g., `ai-service-prod.railway.app`)

---

## **Step 4: Update Environment Variables**

Once both services are deployed:

### Backend Service Updates:
1. Click Backend service → **Variables**
2. Update:
   ```
   AI_SERVICE_URL=https://your-ai-service-railway-url.railway.app
   ```
3. Click **"Redeploy"**

### Frontend Updates (Vercel):
1. Go to **https://vercel.com/dashboard**
2. Click your **adexa-ai-new** project
3. **Settings** → **Environment Variables**
4. Update:
   ```
   VITE_API_URL=https://your-backend-railway-url.railway.app
   ```
5. Click **"Deployments"** tab
6. Click latest deployment → **"Redeploy"**

---

## **Step 5: Test Everything**

✅ Frontend: https://adexa-ai-new.vercel.app
✅ Backend: https://your-backend-url.railway.app/health
✅ AI Service: https://your-ai-url.railway.app/docs

Try logging in with:
- Email: `admin@adexa.ai`
- Password: `Admin@12345`

---

## **🔗 Key URLs to Save:**

| Service | Type | URL |
|---------|------|-----|
| Frontend | Vercel | https://adexa-ai-new.vercel.app |
| Backend | Railway | (copy from Railway) |
| AI Service | Railway | (copy from Railway) |
| Database | MongoDB Atlas | (save connection string) |

---

## **💡 Tips:**

- Railway free tier: $5/month free credit (plenty!)
- Check logs if deployment fails: **Logs** tab in Railway
- Takes 2-5 minutes per service to deploy
- Python service takes longer than Node.js

---

## **❌ Troubleshooting:**

### Backend won't start:
- Check MongoDB connection string is correct
- Check PORT is 5000
- View **Logs** tab for errors

### AI Service won't start:
- Python needs to build environment (takes time)
- View **Logs** for import errors
- Check `train_model.py` runs without errors locally

### CORS errors:
- Update `CORS_ORIGIN` in Backend with exact Vercel URL
- Redeploy backend after changing

---

**Ready? Go to https://railway.app and start deploying!** 🚀
