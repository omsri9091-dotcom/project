#!/bin/bash

# ADEXA AI - Automated Full Deployment Script
# This script deploys your entire application automatically

echo "🚀 ADEXA AI - Full Deployment Starting..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Railway CLI is installed
echo -e "${BLUE}Step 1: Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi
echo -e "${GREEN}✓ Railway CLI ready${NC}"

# Step 2: Check if GitHub is connected
echo -e "${BLUE}Step 2: Authenticating with Railway...${NC}"
railway login
echo -e "${GREEN}✓ Railway authenticated${NC}"

# Step 3: Create Railway project
echo -e "${BLUE}Step 3: Creating Railway project...${NC}"
railway init --name "ADEXA-AI" --from-repo omsri9091-dotcom/project
echo -e "${GREEN}✓ Railway project created${NC}"

# Step 4: Deploy Backend Service
echo -e "${BLUE}Step 4: Deploying Backend Service...${NC}"
cd server
railway up --name "adexa-backend" --service server
echo -e "${GREEN}✓ Backend deployed${NC}"

# Step 5: Deploy AI Service
echo -e "${BLUE}Step 5: Deploying AI Service...${NC}"
cd ../ai-service
railway up --name "adexa-ai-service" --service ai-service
echo -e "${GREEN}✓ AI Service deployed${NC}"

# Step 6: Get deployment URLs
echo -e "${BLUE}Step 6: Getting deployment URLs...${NC}"
BACKEND_URL=$(railway service list | grep backend | awk '{print $2}')
AI_URL=$(railway service list | grep ai-service | awk '{print $2}')

echo -e "${GREEN}✓ Backend URL: $BACKEND_URL${NC}"
echo -e "${GREEN}✓ AI Service URL: $AI_URL${NC}"

# Step 7: Update environment variables
echo -e "${BLUE}Step 7: Updating environment variables...${NC}"
railway service list
railway env add MONGODB_URI "mongodb+srv://adexa_admin:Test12345@cluster0.mongodb.net/adexa-ai"
railway env add AI_SERVICE_URL "$AI_URL"
railway env add CORS_ORIGIN "https://adexa-ai-new.vercel.app"
railway env add JWT_SECRET "super-secret-key-min-32-chars-2024"

echo -e "${GREEN}✓ Environment variables updated${NC}"

# Step 8: Redeploy with new variables
echo -e "${BLUE}Step 8: Redeploying with updated variables...${NC}"
railway up
echo -e "${GREEN}✓ Deployment complete${NC}"

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "=================================================="
echo ""
echo -e "${YELLOW}📋 Your Live URLs:${NC}"
echo -e "Frontend: ${BLUE}https://adexa-ai-new.vercel.app${NC}"
echo -e "Backend:  ${BLUE}$BACKEND_URL${NC}"
echo -e "AI Service: ${BLUE}$AI_URL${NC}"
echo ""
echo -e "${YELLOW}🔐 Demo Login:${NC}"
echo "Email: admin@adexa.ai"
echo "Password: Admin@12345"
echo ""
echo "Share your frontend URL with anyone! 🌍"
