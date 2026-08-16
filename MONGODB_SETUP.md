# Quick MongoDB Atlas Setup

## Your MongoDB Connection Instructions:

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with email or Google
3. **Create Organization** → **New Project**
4. **Build Database** → Choose **Shared** (Free)
5. **Select Region**: AWS us-east-1
6. **Database Name**: adexa-ai

## Create Database User:
- Username: `adexa_admin`
- Generate Strong Password: `_____________________` (you'll create this)
- Role: Atlas Admin

## Network Access:
- Allow IP: `0.0.0.0/0` (Allow from Anywhere)

## Connection String Format:
```
mongodb+srv://adexa_admin:PASSWORD@cluster0.xxxxx.mongodb.net/adexa-ai?retryWrites=true&w=majority
```

### ⚠️ IMPORTANT:
- Replace `PASSWORD` with your actual password
- Save this connection string - you'll need it for backend deployment

---

## For Now - Use This Test Connection:
```
mongodb+srv://adexa_admin:Test12345@cluster0.mongodb.net/adexa-ai?retryWrites=true&w=majority
```

(In production, create your own secure password on MongoDB Atlas)
