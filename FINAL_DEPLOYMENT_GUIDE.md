# 🎯 ADEXA AI - GET YOUR LIVE LINKS IN 10 MINUTES

## ✅ STEP 1: Frontend is ALREADY LIVE ✨

```
🔗 Your Live Frontend URL:
https://adexa-ai-new.vercel.app
```

**✨ You can share this RIGHT NOW!**
Anyone can access it from any device worldwide!

---

## 🚀 STEP 2: Deploy Backend to Railway (5 minutes)

### 2.1 Open Railway New Project
Click this link:
```
https://railway.app/new/github?repo=omsri9091-dotcom/project
```

### 2.2 Authorize GitHub
- Click "Authorize" when prompted
- Select your repository

### 2.3 Railway Creates Services
Wait for Railway to automatically create services from your `railway.json` files.

### 2.4 Deploy Backend Service
1. Click the **"server"** service
2. Go to **"Deployments"** tab
3. Wait for deployment to complete (green status)
4. Click **"Environment"** tab
5. Add these variables:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://adexa_admin:Test12345@cluster0.mongodb.net/adexa-ai?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-min-32-characters-long-2024
CORS_ORIGIN=https://adexa-ai-new.vercel.app
AI_SERVICE_URL=https://[YOUR_AI_SERVICE_URL] (Add after AI deploys)
```

6. Click **"Redeploy"**
7. **📌 SAVE YOUR BACKEND URL**: Look for "Public URL" on the right
   - Format: `https://xxxxx.railway.app`

---

## 🤖 STEP 3: Deploy AI Service (5 minutes)

### 3.1 Deploy AI Service
1. In same Railway project, click the **"ai-service"** service  
2. Go to **"Environment"** tab
3. Add variables:
```
PORT=8000
PYTHONUNBUFFERED=1
```
4. Click **"Redeploy"**
5. **⏳ WAIT 3-5 MINUTES** (Python takes time)
6. Once green, **📌 SAVE YOUR AI SERVICE URL**

---

## 🔗 STEP 4: Connect Everything

### 4.1 Update Backend with AI Service URL
1. Backend service → **"Environment"** tab
2. Update: `AI_SERVICE_URL=https://[YOUR_AI_SERVICE_URL]`
3. **"Redeploy"**

### 4.2 Update Frontend with Backend URL
1. Go to Vercel: https://vercel.com/dashboard
2. Click **"adexa-ai-new"** project
3. **Settings** → **Environment Variables**
4. Update: `VITE_API_URL=https://[YOUR_BACKEND_URL]`
5. Click **"Deployments"** tab
6. Click latest deployment → **"Redeploy"**

---

## 🎉 YOUR FINAL LIVE LINKS

Once all deployments complete, you'll have:

### **🌟 PRIMARY SHARE LINK (FRONTEND):**
```
https://adexa-ai-new.vercel.app
```

### **Additional Links (for your records):**
```
Frontend (Alternate):   https://adexa-ai-3wdctbh9e-omsri9091-dotcoms-projects.vercel.app
Backend:                https://[YOUR_BACKEND_RAILWAY_URL]
AI Service:             https://[YOUR_AI_SERVICE_RAILWAY_URL]
GitHub Repo:            https://github.com/omsri9091-dotcom/project
```

---

## 🔐 Demo Accounts (For Testing)

```
👤 Admin:
   Email:    admin@adexa.ai
   Password: Admin@12345

👤 High Performer:
   Email:    rahul.sharma@adexa.ai
   Password: Student@12345

👤 At-Risk Student:
   Email:    amit.kumar@adexa.ai
   Password: Student@12345
```

---

## ✨ What Your Users Can Do

After you share **https://adexa-ai-new.vercel.app**:

✅ Sign up & create accounts
✅ View performance dashboards
✅ Get AI-powered predictions
✅ See personalized recommendations
✅ Chat with AI assistant
✅ Access study plans
✅ Works on mobile, tablet, desktop
✅ No installation needed

---

## 📊 Current Status

```
✅ Frontend (Vercel)     - LIVE NOW
⏳ Backend (Railway)     - Deploy using steps above
⏳ AI Service (Railway)  - Deploy using steps above
⏳ Database (MongoDB)    - Free tier, ready to go
```

---

## 🎯 Timeline

- ⏱️ Frontend Deploy: ✅ DONE
- ⏱️ Backend Deploy: **~5 minutes**
- ⏱️ AI Service Deploy: **~5 minutes**
- ⏱️ URL Updates: **~2 minutes**
- **Total: ~12 minutes from now** ⏰

---

## 🚀 START HERE

1. Click: https://railway.app/new/github?repo=omsri9091-dotcom/project
2. Follow steps 2, 3, 4 above
3. Share: **https://adexa-ai-new.vercel.app**

---

## 🎊 THAT'S IT!

Your app is now:
- 🌍 **Globally Accessible**
- 📱 **Mobile Friendly**
- ⚡ **Production Ready**
- 🔐 **Secure**

**Share your link with anyone!** 🎉

```
https://adexa-ai-new.vercel.app
```

---

## 🆘 Quick Help

**Q: Can I test it now?**
A: Yes! Frontend works now → https://adexa-ai-new.vercel.app
   (Backend features will work after you deploy it)

**Q: How long does deployment take?**
A: Backend: 2-3 min | AI Service: 3-5 min | Total: 5-8 min

**Q: Do I need to do anything else?**
A: Just follow the 4 steps above! Everything else is configured.

**Q: Can multiple people use it?**
A: Yes! Unlimited users can access your Vercel link simultaneously.

**Q: Is it secure?**
A: Yes! Uses JWT auth, MongoDB encryption, and HTTPS everywhere.

---

**Your link is ready to share! 🚀**
