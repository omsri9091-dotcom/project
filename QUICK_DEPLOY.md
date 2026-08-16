# 🚀 ADEXA AI - 5 Minute Quick Deploy

## ✅ Your Frontend is LIVE!
```
🔗 https://adexa-ai-new.vercel.app
```
**Already accessible from any device!** ✨

---

## ⚡ Deploy Backend & AI in 5 Minutes

### **Option A: FASTEST (Auto-Deploy Script)** 

Run this in PowerShell:
```powershell
cd "C:\Users\Om Srivastava\Desktop\ADEXA AI"
.\deploy-all.ps1
```

Then follow the interactive prompts (2 minutes).

---

### **Option B: Manual (5 minutes)**

#### **Step 1: Go to Railway** (1 min)
```
https://railway.app/new/github?repo=omsri9091-dotcom/project
```
- Sign in with GitHub
- Click "Deploy"
- Wait for deployment

#### **Step 2: Configure Backend Service** (2 min)
1. Click the Backend service
2. **Settings** → **Variables** → Add:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://adexa_admin:Test12345@cluster0.mongodb.net/adexa-ai?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-min-32-chars-2024
CORS_ORIGIN=https://adexa-ai-new.vercel.app
AI_SERVICE_URL=[YOUR_AI_URL]
```
3. **Deploy** tab → Set start command:
```
npm --prefix server run dev
```
4. Click **Deploy**
5. Copy your Backend URL

#### **Step 3: Configure AI Service** (2 min)
1. Add another service (same project)
2. Set **Variables**:
```
PORT=8000
PYTHONUNBUFFERED=1
```
3. **Deploy** tab → Set start command:
```
cd ai-service && python train_model.py && uvicorn main:app --host 0.0.0.0 --port $PORT
```
4. Deploy
5. Copy your AI URL

---

## 🎯 Your Final Links

### **SHARE THIS LINK:**
```
https://adexa-ai-new.vercel.app
```

**BACKUP LINK (if needed):**
```
https://adexa-ai-3wdctbh9e-omsri9091-dotcoms-projects.vercel.app
```

---

## 🔐 Demo Accounts to Test

```
👤 Admin Account:
   Email:    admin@adexa.ai
   Password: Admin@12345

👤 Student Account (High Performer):
   Email:    rahul.sharma@adexa.ai
   Password: Student@12345

👤 At-Risk Student:
   Email:    amit.kumar@adexa.ai
   Password: Student@12345
```

---

## ✨ What Works Now?

✅ Frontend - LIVE & Accessible
✅ UI/UX - Beautiful & Responsive  
✅ Auth Pages - Login & Register
✅ Navigation - All pages load

⏳ After Backend Deploy:
✅ Database - MongoDB
✅ APIs - All working
✅ Predictions - AI models active
✅ Dashboards - Real data display

---

## 🌍 Share With Anyone!

Your app is **publicly accessible**:
- ✅ Works on desktop, tablet, mobile
- ✅ Works from any country
- ✅ No VPN needed
- ✅ No local setup needed

Just share: **https://adexa-ai-new.vercel.app**

---

## 🆘 Troubleshooting

**Backend won't deploy?**
- Check MongoDB connection string
- Verify JWT_SECRET is set
- Check logs in Railway dashboard

**CORS errors?**
- Update `CORS_ORIGIN` to match your Vercel URL
- Redeploy backend

**AI service timing out?**
- Python takes 3-5 min to build
- Check Railway logs for import errors

---

## 📊 Architecture (Now Live)

```
Your Device (Mobile/Desktop/Tablet)
          ↓
🟢 Frontend (Vercel) - LIVE ✨
    adexa-ai-new.vercel.app
          ↓
🟡 Backend (Railway) - Deploy Now
    your-backend.railway.app
          ↓ + ↓
      🗄️ Database          🤖 AI Service
    MongoDB Atlas        Railway
          
```

---

## 🎊 YOU'RE ALMOST THERE!

1. ✅ Frontend deployed
2. ⏳ Backend deployment (5 min)
3. ⏳ AI service deployment (5 min)
4. 🎉 FULLY LIVE!

**Total time: 10 minutes**

---

**Start here:** https://railway.app/new/github?repo=omsri9091-dotcom/project

**Questions?** Check the detailed guides in the repo:
- `RAILWAY_DEPLOYMENT.md` - Step by step
- `MONGODB_SETUP.md` - Database guide
- `DEPLOYMENT_GUIDE.md` - Complete architecture

🚀 **Let's GO!**
