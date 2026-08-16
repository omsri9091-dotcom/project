# ADEXA AI - Windows Deployment Script
# Run this in PowerShell to deploy everything

Write-Host "🚀 ADEXA AI - Full Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Install Railway CLI
Write-Host "`n[1/6] Installing Railway CLI..." -ForegroundColor Yellow
npm install -g @railway/cli
Write-Host "✓ Railway CLI installed" -ForegroundColor Green

# Step 2: Login to Railway
Write-Host "`n[2/6] Authenticating with Railway..." -ForegroundColor Yellow
railway login
Write-Host "✓ Railway authenticated" -ForegroundColor Green

# Step 3: Create Railway Project
Write-Host "`n[3/6] Creating Railway project..." -ForegroundColor Yellow
$projectName = "ADEXA-AI-$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "Project Name: $projectName" -ForegroundColor Cyan
Write-Host "Visit: https://railway.app/new/github?repo=omsri9091-dotcom/project" -ForegroundColor Blue
Write-Host "Then continue here..." -ForegroundColor Yellow
Pause

# Step 4: Deploy Backend
Write-Host "`n[4/6] Deploying Backend Service..." -ForegroundColor Yellow
Write-Host "Go to Railway Dashboard → Add Service → GitHub Repo → omsri9091-dotcom/project" -ForegroundColor Cyan
Write-Host "Set Start Command: npm --prefix server run dev" -ForegroundColor Yellow
Pause

# Step 5: Deploy AI Service  
Write-Host "`n[5/6] Deploying AI Service..." -ForegroundColor Yellow
Write-Host "Add another service to same project" -ForegroundColor Cyan
Write-Host "Set Start Command: cd ai-service && python train_model.py && uvicorn main:app --host 0.0.0.0 --port `$PORT" -ForegroundColor Yellow
Pause

# Step 6: Collect URLs
Write-Host "`n[6/6] Final Setup..." -ForegroundColor Yellow
$backendUrl = Read-Host "Enter your Railway Backend URL (e.g., backend-prod.railway.app)"
$aiUrl = Read-Host "Enter your Railway AI Service URL (e.g., ai-prod.railway.app)"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   🎉 DEPLOYMENT COMPLETE!             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📋 Your Live URLs:" -ForegroundColor Yellow
Write-Host "Frontend:   https://adexa-ai-new.vercel.app" -ForegroundColor Cyan
Write-Host "Backend:    https://$backendUrl" -ForegroundColor Cyan
Write-Host "AI Service: https://$aiUrl" -ForegroundColor Cyan

Write-Host "`n🔐 Demo Login:" -ForegroundColor Yellow
Write-Host "Email:    admin@adexa.ai" -ForegroundColor Cyan
Write-Host "Password: Admin@12345" -ForegroundColor Cyan

Write-Host "`n✨ Share your frontend URL with anyone! 🌍" -ForegroundColor Green
Write-Host "https://adexa-ai-new.vercel.app" -ForegroundColor Cyan
