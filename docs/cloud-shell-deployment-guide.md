# ☁️ Complete Cloud Shell Deployment Guide

<div align="center">

![Azure Cloud Shell](https://img.shields.io/badge/Azure%20Cloud%20Shell-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![No Docker Desktop](https://img.shields.io/badge/No%20Docker%20Desktop-Required-success?style=for-the-badge&logo=docker&logoColor=white)
![Intermediate](https://img.shields.io/badge/Level-Intermediate-yellow?style=for-the-badge)

### 🚀 Deploy containers to Azure without installing anything on your computer

[📋 Prerequisites](#-prerequisites) • [📦 ACR Setup](#-step-1-set-up-container-registry) • [🔨 Build Images](#-step-2-build-container-images) • [🚀 Deploy](#-step-3-deploy-container-apps)

---

[![Estimated Time](https://img.shields.io/badge/⏱️_Time-55_minutes-blue?style=flat-square)]()
[![Cloud Shell](https://img.shields.io/badge/☁️_Cloud_Shell-Required-0078D4?style=flat-square)](https://shell.azure.com)
[![No Local Install](https://img.shields.io/badge/💻_Local_Install-None-00C853?style=flat-square)]()

</div>

---

## 📖 Overview

This guide shows you how to deploy the DOT Transportation Data Portal using **only Azure Cloud Shell** - no Docker Desktop, no local installations required. Everything happens in your web browser!

### 🎯 What You'll Accomplish

| 📍 Step | 📝 Description | ⏱️ Time |
|:--------|:--------------|:--------|
| 1️⃣ | Set up Azure Container Registry | 10 min |
| 2️⃣ | Build container images using ACR Tasks | 15 min |
| 3️⃣ | Deploy to Azure Container Apps | 20 min |
| 4️⃣ | Configure and verify | 10 min |

### 💡 Why Cloud Shell?

Many organizations restrict installing Docker Desktop on work computers. Cloud Shell solves this by providing:

| ✨ Feature | 📝 Description |
|:----------|:--------------|
| 📦 **Pre-installed tools** | Azure CLI, Docker, and more ready to use |
| 🚫 **No local installation** | Works from any computer with a browser |
| 🔗 **Azure integration** | Direct access to Azure services |
| 🌐 **Browser-based** | Access from anywhere |

---

## 📋 Prerequisites

Before starting, ensure you have:

| ✅ Requirement | 🔍 How to Check | ❌ If Missing |
|:--------------|:----------------|:-------------|
| Azure subscription | [portal.azure.com](https://portal.azure.com) | [Create free account](https://azure.microsoft.com/free/) |
| Existing resource group | Search "Resource groups" in portal | See Step 0 below |
| Azure SQL Database | Search "SQL databases" in portal | [Database Setup Guide](./setup-guide.md) |
| Entra ID App Registrations | Search "App registrations" in portal | [Auth Setup Guide](./setup-guide.md) |

---

## 0️⃣ Step 0: Create Resource Group (If Needed)

> 💡 **Skip this step** if you already have a resource group.

<details>
<summary>🖱️ <b>Using Azure Portal</b></summary>

1. Go to [portal.azure.com](https://portal.azure.com)
2. Search for **"Resource groups"**
3. Click **"+ Create"**
4. Fill in:
   - **Subscription:** Your subscription
   - **Resource group:** `rg-dot-portal-dev`
   - **Region:** `East US 2`
5. Click **"Review + create"** → **"Create"**

</details>

<details>
<summary>⌨️ <b>Using Cloud Shell</b></summary>

```bash
# ➕ Create resource group
az group create \
  --name rg-dot-portal-dev \
  --location eastus2
```

</details>

---

## 1️⃣ Step 1: Set Up Container Registry

Azure Container Registry (ACR) stores your container images. Think of it like a private Docker Hub.

### 1.1 🚀 Open Cloud Shell

1. Go to [portal.azure.com](https://portal.azure.com)
2. Click the **Cloud Shell** button (☁️) in the top menu

![Cloud Shell Icon](https://learn.microsoft.com/en-us/azure/cloud-shell/media/overview/portal-launch-icon.png)

3. Select **Bash** if prompted
4. Wait for the shell to initialize

### 1.2 ⚙️ Set Up Variables

Copy and paste these commands into Cloud Shell. **Modify the values** for your environment:

```bash
# ============================================
# 📋 CONFIGURATION - MODIFY THESE VALUES
# ============================================

# 📁 Your resource group name
RESOURCE_GROUP="rg-dot-portal-dev"

# 🌍 Azure region (use same as your other resources)
LOCATION="eastus2"

# 📦 Container Registry name (must be globally unique, lowercase, no dashes)
ACR_NAME="acrdotportaldev"

# 🏗️ Container Apps Environment name
CAE_NAME="dotportal-dev-cae"

# 📱 Container App names
DAB_APP_NAME="dotportal-dev-dab"
FRONTEND_APP_NAME="dotportal-dev-frontend"

# 🔐 Your Azure AD/Entra ID settings (get from Azure Portal > App registrations)
TENANT_ID="your-tenant-id"
FRONTEND_CLIENT_ID="your-frontend-client-id"
DAB_CLIENT_ID="your-dab-client-id"

# 🗄️ Your SQL Database connection string
# Get from: Azure Portal > SQL databases > your-db > Connection strings
SQL_CONNECTION_STRING="Server=yourserver.database.windows.net;Database=yourdb;User Id=youradmin;Password=yourpassword;"
```

> 💡 **How to find these values:**
>
> | 🏷️ Value | 📍 Where to Find |
> |:---------|:----------------|
> | **Tenant ID** | Azure Portal → Microsoft Entra ID → Overview → Tenant ID |
> | **Client IDs** | Azure Portal → App registrations → Your app → Application (client) ID |
> | **SQL Connection String** | Azure Portal → SQL databases → Your database → Connection strings → ADO.NET |

### 1.3 📦 Create Container Registry

```bash
# ➕ Create the container registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# ✅ Verify it was created
az acr show --name $ACR_NAME --output table
```

**Expected Output:**
```
NAME              RESOURCE GROUP      LOCATION    SKU    LOGIN SERVER
----------------  ------------------  ----------  -----  ----------------------------
acrdotportaldev   rg-dot-portal-dev   eastus2     Basic  acrdotportaldev.azurecr.io
```

### 1.4 🔑 Get ACR Credentials

```bash
# 🔗 Get the ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"

# 🔐 Get the ACR password (save this!)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv)
echo "ACR Password saved to variable (don't share this!)"
```

> 📚 **Reference:** [Azure Container Registry Documentation](https://learn.microsoft.com/en-us/azure/container-registry/)

---

## 2️⃣ Step 2: Build Container Images

Instead of building on your local machine with Docker Desktop, we'll use **ACR Tasks** to build images directly in Azure!

### 2.1 📥 Clone the Repository in Cloud Shell

```bash
# 🏠 Go to your home directory
cd ~

# 📥 Clone the repository
git clone https://github.com/your-org/azure-dab-fullstack-demo.git

# 📂 Navigate to the project
cd azure-dab-fullstack-demo
```

> 📝 **Note:** If this is a private repository, you'll need to authenticate. See [Git Authentication in Cloud Shell](https://learn.microsoft.com/en-us/azure/devops/repos/git/auth-overview).

### 2.2 🔨 Build the DAB (Backend) Image

```bash
# 📂 Navigate to DAB config directory
cd ~/azure-dab-fullstack-demo/src/dab-config

# 👀 View the Dockerfile to understand what we're building
cat Dockerfile

# 🏗️ Build the image using ACR Tasks (this runs in Azure, not locally!)
az acr build \
  --registry $ACR_NAME \
  --image dab:latest \
  --file Dockerfile \
  .

echo "✅ DAB image built successfully!"
```

> 💡 **What's happening:**
> 1. Azure uploads your Dockerfile and source files
> 2. ACR builds the image on Azure's servers
> 3. The image is automatically stored in your registry
> 4. No Docker Desktop needed!

### 2.3 🔨 Build the Frontend Image

```bash
# 📂 Navigate to frontend directory
cd ~/azure-dab-fullstack-demo/src/frontend

# 🏗️ Build with environment variables baked in
az acr build \
  --registry $ACR_NAME \
  --image frontend:latest \
  --file Dockerfile \
  --build-arg VITE_API_BASE_URL=/api \
  --build-arg VITE_AZURE_AD_CLIENT_ID=$FRONTEND_CLIENT_ID \
  --build-arg VITE_AZURE_AD_TENANT_ID=$TENANT_ID \
  --build-arg VITE_DAB_CLIENT_ID=$DAB_CLIENT_ID \
  .

echo "✅ Frontend image built successfully!"
```

### 2.4 ✅ Verify Images Were Created

```bash
# 📋 List all images in your registry
az acr repository list --name $ACR_NAME --output table

# 🏷️ Check the tags for each image
az acr repository show-tags --name $ACR_NAME --repository dab --output table
az acr repository show-tags --name $ACR_NAME --repository frontend --output table
```

**Expected Output:**
```
Result
--------
dab
frontend
```

> 📚 **Learn More:** [ACR Tasks Documentation](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-tasks-overview)

---

## 3️⃣ Step 3: Deploy Container Apps

Now we'll create the Container Apps Environment and deploy our containers.

### 3.1 🏗️ Create Container Apps Environment

The environment is a secure boundary around your container apps.

```bash
# ➕ Create the Container Apps Environment
az containerapp env create \
  --name $CAE_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# ✅ Verify creation
az containerapp env show \
  --name $CAE_NAME \
  --resource-group $RESOURCE_GROUP \
  --output table
```

> ⏳ **This takes 2-3 minutes.** You'll see output like:
> ```
> Name                Location    ResourceGroup
> ------------------  ----------  ------------------
> dotportal-dev-cae   East US 2   rg-dot-portal-dev
> ```

### 3.2 🚀 Deploy DAB Container App

```bash
# 🚀 Deploy the DAB (Data API Builder) container
az containerapp create \
  --name $DAB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CAE_NAME \
  --image "$ACR_LOGIN_SERVER/dab:latest" \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --target-port 5000 \
  --ingress external \
  --cpu 1 \
  --memory 2Gi \
  --min-replicas 0 \
  --max-replicas 10 \
  --env-vars \
    "DATABASE_CONNECTION_STRING=$SQL_CONNECTION_STRING" \
    "AZURE_AD_TENANT_ID=$TENANT_ID" \
    "AZURE_AD_CLIENT_ID=$DAB_CLIENT_ID"

# 🔗 Get the DAB URL
DAB_URL=$(az containerapp show \
  --name $DAB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo "🌐 DAB URL: https://$DAB_URL"
```

### 3.3 🚀 Deploy Frontend Container App

```bash
# 🚀 Deploy the Frontend container
az containerapp create \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CAE_NAME \
  --image "$ACR_LOGIN_SERVER/frontend:latest" \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --target-port 80 \
  --ingress external \
  --cpu 0.5 \
  --memory 1Gi \
  --min-replicas 0 \
  --max-replicas 10

# 🔗 Get the Frontend URL
FRONTEND_URL=$(az containerapp show \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo "🌐 Frontend URL: https://$FRONTEND_URL"
```

### 3.4 ✅ Verify Deployments

```bash
# 📋 List all container apps
az containerapp list \
  --resource-group $RESOURCE_GROUP \
  --output table

# 🔍 Check DAB health
curl -s "https://$DAB_URL/api" | head -20

# 🔍 Check Frontend health
curl -s -o /dev/null -w "%{http_code}" "https://$FRONTEND_URL/health"
```

---

## 4️⃣ Step 4: Configure and Test

### 4.1 🔐 Update Entra ID Redirect URIs

You need to add your new URLs to the app registration:

1. Go to **Azure Portal** → **Microsoft Entra ID** → **App registrations**
2. Click your **Frontend app registration**
3. Go to **Authentication** in the left menu
4. Under **Single-page application** → **Redirect URIs**, add:
   - `https://YOUR-FRONTEND-URL` (the URL from step 3.3)
5. Click **Save**

### 4.2 🧪 Test the Application

1. 🌐 Open your browser
2. 🔗 Navigate to: `https://YOUR-FRONTEND-URL`
3. 🔐 Click **"Sign in with Microsoft"**
4. ✅ Verify you can see the dashboard with data

### 4.3 🔧 Test the API

```bash
# 🧪 Test the REST API (requires authentication in real app)
curl "https://$DAB_URL/api/Category"

# 🧪 Test GraphQL endpoint
curl "https://$DAB_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ categories { items { Id Name } } }"}'
```

---

## 🔄 Updating Your Deployment

When you make code changes, here's how to update:

<details>
<summary>📦 <b>Update DAB Image</b></summary>

```bash
# 📂 Navigate to DAB directory
cd ~/azure-dab-fullstack-demo/src/dab-config

# 🔨 Rebuild the image
az acr build \
  --registry $ACR_NAME \
  --image dab:latest \
  .

# 🔄 Update the container app to use new image
az containerapp update \
  --name $DAB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image "$ACR_LOGIN_SERVER/dab:latest"
```

</details>

<details>
<summary>🖥️ <b>Update Frontend Image</b></summary>

```bash
# 📂 Navigate to frontend directory
cd ~/azure-dab-fullstack-demo/src/frontend

# 🔨 Rebuild the image
az acr build \
  --registry $ACR_NAME \
  --image frontend:latest \
  --build-arg VITE_API_BASE_URL=/api \
  --build-arg VITE_AZURE_AD_CLIENT_ID=$FRONTEND_CLIENT_ID \
  --build-arg VITE_AZURE_AD_TENANT_ID=$TENANT_ID \
  --build-arg VITE_DAB_CLIENT_ID=$DAB_CLIENT_ID \
  .

# 🔄 Update the container app
az containerapp update \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image "$ACR_LOGIN_SERVER/frontend:latest"
```

</details>

---

## 📜 Complete Script Reference

<details>
<summary>📋 <b>Click to expand full deployment script</b></summary>

Here's a complete script you can save and run:

```bash
#!/bin/bash
# ============================================
# 🚀 DOT Portal - Complete Deployment Script
# Run this in Azure Cloud Shell
# ============================================

set -e  # Exit on error

# ============================================
# 📋 CONFIGURATION - MODIFY THESE VALUES
# ============================================
RESOURCE_GROUP="rg-dot-portal-dev"
LOCATION="eastus2"
ACR_NAME="acrdotportaldev"
CAE_NAME="dotportal-dev-cae"
DAB_APP_NAME="dotportal-dev-dab"
FRONTEND_APP_NAME="dotportal-dev-frontend"
TENANT_ID="your-tenant-id"
FRONTEND_CLIENT_ID="your-frontend-client-id"
DAB_CLIENT_ID="your-dab-client-id"
SQL_CONNECTION_STRING="your-connection-string"
REPO_URL="https://github.com/your-org/azure-dab-fullstack-demo.git"

# ============================================
# 1️⃣ STEP 1: Create Container Registry
# ============================================
echo "📦 Creating Container Registry..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv)

# ============================================
# 2️⃣ STEP 2: Clone and Build Images
# ============================================
echo "📥 Cloning repository..."
cd ~
rm -rf azure-dab-fullstack-demo
git clone $REPO_URL
cd azure-dab-fullstack-demo

echo "🔨 Building DAB image..."
cd src/dab-config
az acr build --registry $ACR_NAME --image dab:latest .

echo "🔨 Building Frontend image..."
cd ../frontend
az acr build --registry $ACR_NAME --image frontend:latest \
  --build-arg VITE_API_BASE_URL=/api \
  --build-arg VITE_AZURE_AD_CLIENT_ID=$FRONTEND_CLIENT_ID \
  --build-arg VITE_AZURE_AD_TENANT_ID=$TENANT_ID \
  --build-arg VITE_DAB_CLIENT_ID=$DAB_CLIENT_ID \
  .

# ============================================
# 3️⃣ STEP 3: Create Container Apps Environment
# ============================================
echo "🏗️ Creating Container Apps Environment..."
az containerapp env create \
  --name $CAE_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# ============================================
# 4️⃣ STEP 4: Deploy Container Apps
# ============================================
echo "🚀 Deploying DAB..."
az containerapp create \
  --name $DAB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CAE_NAME \
  --image "$ACR_LOGIN_SERVER/dab:latest" \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --target-port 5000 \
  --ingress external \
  --cpu 1 --memory 2Gi \
  --min-replicas 0 --max-replicas 10 \
  --env-vars \
    "DATABASE_CONNECTION_STRING=$SQL_CONNECTION_STRING" \
    "AZURE_AD_TENANT_ID=$TENANT_ID" \
    "AZURE_AD_CLIENT_ID=$DAB_CLIENT_ID"

echo "🚀 Deploying Frontend..."
az containerapp create \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CAE_NAME \
  --image "$ACR_LOGIN_SERVER/frontend:latest" \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --target-port 80 \
  --ingress external \
  --cpu 0.5 --memory 1Gi \
  --min-replicas 0 --max-replicas 10

# ============================================
# 5️⃣ STEP 5: Display Results
# ============================================
echo ""
echo "============================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "============================================"
DAB_URL=$(az containerapp show --name $DAB_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)
FRONTEND_URL=$(az containerapp show --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)
echo "🔌 DAB API:    https://$DAB_URL"
echo "🖥️ Frontend:   https://$FRONTEND_URL"
echo ""
echo "⚠️ Don't forget to add https://$FRONTEND_URL to your"
echo "   Entra ID app registration redirect URIs!"
echo "============================================"
```

</details>

---

## 🔧 Troubleshooting

### ❌ Common Issues

| ❌ Problem | ✅ Solution |
|:----------|:----------|
| "ACR name already taken" | Choose a different, globally unique name |
| "Image build failed" | Check Dockerfile syntax, ensure all files exist |
| "Container won't start" | Check env vars, especially connection string |
| "401 Unauthorized" | Verify ACR credentials are correct |
| "Connection refused" | Wait for container to fully start |

### 📋 Viewing Logs

```bash
# 📋 View container app logs
az containerapp logs show \
  --name $DAB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --follow

# 📋 View specific revision logs
az containerapp revision list \
  --name $DAB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --output table
```

### 🔄 Restarting an App

```bash
# 🔍 Get current revision
REVISION=$(az containerapp revision list \
  --name $DAB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "[0].name" \
  --output tsv)

# 🔄 Restart the revision
az containerapp revision restart \
  --name $DAB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --revision $REVISION
```

For more troubleshooting, see: [Complete Troubleshooting Guide](./troubleshooting-guide.md)

---

## 📚 Reference Links

| 📘 Topic | 🔗 Link |
|:--------|:--------|
| ☁️ Azure Cloud Shell | https://learn.microsoft.com/azure/cloud-shell/ |
| 🏗️ ACR Tasks | https://learn.microsoft.com/azure/container-registry/container-registry-tasks-overview |
| 📦 Container Apps CLI | https://learn.microsoft.com/cli/azure/containerapp |
| 🔌 Data API Builder | https://learn.microsoft.com/azure/data-api-builder/ |

---

## 🎬 Video Tutorials

| 📺 Topic | 🔗 Link |
|:--------|:--------|
| ☁️ Cloud Shell Basics | [Azure Cloud Shell Quickstart](https://learn.microsoft.com/en-us/azure/cloud-shell/quickstart) |
| 🏗️ ACR Tasks | [Build Images with ACR Tasks](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-tutorial-quick-task) |
| 📦 Container Apps | [Deploy a Container App](https://learn.microsoft.com/en-us/azure/container-apps/quickstart-portal) |

---

<div align="center">

### 🆘 Need more help?

[![Troubleshooting](https://img.shields.io/badge/🔧_Troubleshooting_Guide-FF6B6B?style=for-the-badge)](./troubleshooting-guide.md)
[![Best Practices](https://img.shields.io/badge/✨_Best_Practices-4CAF50?style=for-the-badge)](./best-practices-guide.md)
[![Back to Index](https://img.shields.io/badge/📚_Back_to_Index-gray?style=for-the-badge)](./index.md)

---

**Made with ❤️ for the Azure community**

</div>
