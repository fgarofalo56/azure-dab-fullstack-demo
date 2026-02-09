# 📦 Azure Container Registry (ACR) Setup Guide

<div align="center">

![ACR](https://img.shields.io/badge/Azure%20Container%20Registry-0078D4?style=for-the-badge&logo=docker&logoColor=white)
![Docker](https://img.shields.io/badge/No%20Docker%20Desktop%20Required-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Beginner](https://img.shields.io/badge/Beginner%20Friendly-4CAF50?style=for-the-badge&logo=checkmarx&logoColor=white)

### 🗄️ Store and manage container images without Docker Desktop

[🤔 What is ACR?](#-what-is-azure-container-registry) • [➕ Create ACR](#-creating-your-registry) • [🔨 Build Images](#-building-images) • [📋 Manage Images](#-managing-images)

---

[![Documentation](https://img.shields.io/badge/📚_Official_Docs-0078D4?style=flat-square)](https://learn.microsoft.com/en-us/azure/container-registry/)
[![Pricing](https://img.shields.io/badge/💰_Pricing_Info-00C853?style=flat-square)](https://azure.microsoft.com/en-us/pricing/details/container-registry/)
[![Best Practices](https://img.shields.io/badge/✨_Best_Practices-512BD4?style=flat-square)](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-best-practices)

</div>

---

## 🤔 What is Azure Container Registry?

Azure Container Registry (ACR) is a managed Docker registry service that stores and manages your container images. Think of it as a **private storage locker** for your application packages.

### ✨ Why Use ACR?

| ✨ Feature | 💡 Benefit |
|:----------|:----------|
| 🔒 **Private** | Your images are only accessible to you |
| 🔗 **Integrated** | Works seamlessly with Azure services |
| 🛡️ **Secure** | Enterprise-grade security and compliance |
| ⚡ **Fast** | Images stored close to your deployments |
| 🏗️ **Build Service** | Build images without local Docker! |

### 📚 Key Concepts

```
┌─────────────────────────────────────────────────────────────────┐
│              📦 Azure Container Registry                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🏠 Registry: acrdotportal.azurecr.io                           │
│  ├── 📁 Repository: dab                                         │
│  │   ├── 🏷️ Tag: v1 (image version 1)                          │
│  │   ├── 🏷️ Tag: v2 (image version 2)                          │
│  │   └── 🏷️ Tag: latest (most recent)                          │
│  │                                                               │
│  └── 📁 Repository: frontend                                    │
│      ├── 🏷️ Tag: v1                                             │
│      └── 🏷️ Tag: latest                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| 🏷️ Term | 📝 Description | 💡 Analogy |
|:--------|:--------------|:----------|
| **Registry** | Your private container storage | Like a library |
| **Repository** | A collection of related images | Like a book series |
| **Tag** | A specific version of an image | Like an edition |

---

## ➕ Creating Your Registry

### 🖱️ Option 1: Azure Portal (Visual Method)

1. **🔐 Sign in** to [Azure Portal](https://portal.azure.com)

2. **🔍 Search** for "Container registries" in the top search bar

3. **➕ Click** **+ Create**

4. **📝 Fill in** the **Basics** tab:

   | 📋 Field | 💡 Value | 📝 Notes |
   |:---------|:--------|:--------|
   | Subscription | Your subscription | |
   | Resource group | `rg-dot-portal-demo` | Create new if needed |
   | Registry name | `acrdotportal` | Must be globally unique, 5-50 alphanumeric characters |
   | Location | `East US 2` | Same as other resources |
   | SKU | `Basic` | Cheapest, good for development |

   > 📸 **Screenshot Reference:**
   > ![Create ACR](https://learn.microsoft.com/en-us/azure/container-registry/media/container-registry-get-started-portal/qs-portal-01.png)
   > *Source: [Microsoft Learn - Create ACR](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal)*

5. **✅ Click** **Review + create**, then **Create**

### ⌨️ Option 2: Azure Cloud Shell (Command Line)

Open Cloud Shell and run:

```bash
# 📋 Set variables
RESOURCE_GROUP="rg-dot-portal-demo"
ACR_NAME="acrdotportal"
LOCATION="eastus2"

# 📁 Create resource group (if not exists)
az group create --name $RESOURCE_GROUP --location $LOCATION

# 📦 Create ACR
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --location $LOCATION
```

### 💰 SKU Comparison

| 📦 SKU | 💾 Storage | 🏗️ Build Minutes | 💵 Price | 🎯 Best For |
|:------|:----------|:----------------|:--------|:----------|
| 🟢 **Basic** | 10 GB | 0 included | ~$5/month | Development, small projects |
| 🟡 **Standard** | 100 GB | 0 included | ~$20/month | Production, medium traffic |
| 🔴 **Premium** | 500 GB | 0 included | ~$50/month | Enterprise, geo-replication |

> 💡 **Tip:** Start with Basic for development. Upgrade when needed.

---

## 🔐 Configuring Access

### 👤 Enable Admin User

The admin user provides simple username/password authentication for Container Apps.

<details>
<summary>🖱️ <b>Via Portal (Click to expand)</b></summary>

1. Go to your ACR → **Settings** → **Access keys**

2. Toggle **Admin user** to **Enabled**

3. **📋 Copy and save** the credentials:
   - Login server: `acrdotportal.azurecr.io`
   - Username: `acrdotportal`
   - Password: (copy one of the passwords)

> 📍 **Portal Path:** Container Registry → Settings → Access keys → Enable the Admin user toggle to reveal credentials.
>
> *Reference: [Microsoft Learn - ACR Authentication](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication)*

</details>

<details>
<summary>⌨️ <b>Via Cloud Shell (Click to expand)</b></summary>

```bash
# ✅ Enable admin user
az acr update --name acrdotportal --admin-enabled true

# 🔑 Get credentials
az acr credential show --name acrdotportal
```

</details>

> ⚠️ **Security Note:** For production, consider using managed identity instead of admin user. See [Security Best Practices](#-security-best-practices).

---

## 🔨 Building Images

### 🚀 Without Docker Desktop: ACR Tasks

ACR Tasks lets you build container images **directly in Azure** without needing Docker Desktop installed locally. This is perfect for:

- 👤 Users without Docker Desktop access
- ☁️ Building from Azure Cloud Shell
- ⚙️ CI/CD pipelines

### 🔄 Understanding the Build Process

```
┌──────────────────────────────────────────────────────────────────┐
│                   🏗️ ACR Tasks Build Flow                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1️⃣ Source Code ─────────▶ 2️⃣ Upload to Azure                   │
│     (Your computer or        (Automatic by az acr build)         │
│      Cloud Shell)                                                 │
│                                       │                           │
│                                       ▼                           │
│                             3️⃣ Build in Azure                    │
│                                (ACR Tasks runs Docker build)      │
│                                       │                           │
│                                       ▼                           │
│                             4️⃣ Push to Registry                  │
│                                (Image stored in ACR)              │
│                                       │                           │
│                                       ▼                           │
│                             5️⃣ Available for Deployment          │
│                                (Container Apps can pull it)       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 🔧 Build Commands

#### 🔨 Build DAB Container

```bash
# 📂 Navigate to the DAB config directory
cd src/dab-config

# 🏗️ Build and push to ACR
az acr build \
  --registry acrdotportal \
  --image dab:v1 \
  .
```

**What each parameter means:**
| 🏷️ Parameter | 📝 Description |
|:------------|:--------------|
| `--registry acrdotportal` | Your ACR name |
| `--image dab:v1` | Repository name and tag |
| `.` | Build context (current directory containing Dockerfile) |

#### 🔨 Build Frontend Container

```bash
# 📂 Navigate to frontend directory
cd src/frontend

# 🏗️ Build and push
az acr build \
  --registry acrdotportal \
  --image frontend:v1 \
  .
```

<details>
<summary>📋 <b>Build with Specific Dockerfile</b></summary>

If your Dockerfile has a different name or location:

```bash
az acr build \
  --registry acrdotportal \
  --image myapp:v1 \
  --file ./docker/Dockerfile.production \
  .
```

</details>

<details>
<summary>📋 <b>Build with Build Arguments</b></summary>

Pass build-time variables:

```bash
az acr build \
  --registry acrdotportal \
  --image frontend:v1 \
  --build-arg VITE_API_URL=https://api.example.com \
  .
```

</details>

---

## 📋 Managing Images

### 👀 View Your Images

<details>
<summary>🖱️ <b>Via Portal</b></summary>

1. Go to your ACR → **Services** → **Repositories**

2. Click on a repository to see all tags

> 📸 **Screenshot Reference:**
> ![ACR Repositories](https://learn.microsoft.com/en-us/azure/container-registry/media/container-registry-get-started-portal/qs-portal-08.png)
> *Source: [Microsoft Learn](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal)*

</details>

<details>
<summary>⌨️ <b>Via Cloud Shell</b></summary>

```bash
# 📋 List all repositories
az acr repository list --name acrdotportal --output table

# 🏷️ List tags for a repository
az acr repository show-tags --name acrdotportal --repository dab --output table

# ℹ️ Get detailed info about an image
az acr repository show \
  --name acrdotportal \
  --image dab:v1
```

</details>

### 🗑️ Delete Images

To save storage space, remove old images:

```bash
# 🗑️ Delete a specific tag
az acr repository delete \
  --name acrdotportal \
  --image dab:v1 \
  --yes

# 🗑️ Delete entire repository
az acr repository delete \
  --name acrdotportal \
  --repository oldapp \
  --yes
```

### 🏷️ Image Tagging Best Practices

| 🏷️ Tag Type | 💡 Example | 🎯 Use Case |
|:-----------|:----------|:----------|
| Version | `v1.0.0` | Production releases |
| Build | `build-123` | CI/CD builds |
| Git SHA | `abc1234` | Traceability |
| `latest` | `latest` | Most recent (use carefully) |
| Environment | `staging` | Environment-specific |

> 💡 **Recommended approach:**
> ```bash
> # Tag with version AND latest
> az acr build --registry acrdotportal --image dab:v1.2.0 .
> az acr build --registry acrdotportal --image dab:latest .
> ```

---

## 🔗 Connecting to Container Apps

### 📋 Method 1: ACR Admin Credentials

When creating a Container App, provide ACR credentials:

1. Go to Container App → **Containers** → **Image source**

2. Select **Azure Container Registry**

3. Fill in:
   | 📋 Field | 💡 Value |
   |:---------|:--------|
   | Registry | `acrdotportal.azurecr.io` |
   | Image | `dab` |
   | Tag | `v1` |

The portal automatically uses admin credentials if enabled.

### ⌨️ Method 2: Via CLI

```bash
# 🔄 Update container app with new image
az containerapp update \
  --name ca-dot-portal-dab \
  --resource-group rg-dot-portal-demo \
  --image acrdotportal.azurecr.io/dab:v1

# 🔐 Or set registry credentials explicitly
az containerapp registry set \
  --name ca-dot-portal-dab \
  --resource-group rg-dot-portal-demo \
  --server acrdotportal.azurecr.io \
  --username acrdotportal \
  --password YOUR_PASSWORD
```

---

## 🔧 Troubleshooting

### ❌ "unauthorized: authentication required"

**Cause:** Container Apps can't access ACR

**Solutions:**
1. ✅ Verify admin user is enabled
2. ✅ Check credentials are correct
3. ✅ Verify registry URL is exact

```bash
# 🔍 Verify admin is enabled
az acr show --name acrdotportal --query adminUserEnabled

# 🔑 Get fresh credentials
az acr credential show --name acrdotportal
```

### ❌ "manifest unknown" or "image not found"

**Cause:** Image or tag doesn't exist

**Solutions:**
1. ✅ Verify the image exists:
   ```bash
   az acr repository list --name acrdotportal
   az acr repository show-tags --name acrdotportal --repository dab
   ```
2. ✅ Check exact spelling of image:tag
3. ✅ Rebuild if needed:
   ```bash
   az acr build --registry acrdotportal --image dab:v1 .
   ```

### ❌ Build Fails with "COPY failed"

**Cause:** File not found during build

**Solutions:**
1. ✅ Check file paths in Dockerfile
2. ✅ Ensure you're building from correct directory
3. ✅ Verify file exists:
   ```bash
   ls -la  # List files in build context
   ```

### ❌ Build Fails with "out of memory"

**Cause:** Image too large for Basic tier

**Solutions:**
1. ✅ Optimize Dockerfile (multi-stage builds)
2. ✅ Upgrade to Standard or Premium tier
3. ✅ Reduce build context (.dockerignore)

---

## 🔒 Security Best Practices

### 🔐 Use Managed Identity (Production)

Instead of admin credentials, use managed identity:

```bash
# 🆔 Create managed identity for Container App
az containerapp identity assign \
  --name ca-dot-portal-dab \
  --resource-group rg-dot-portal-demo \
  --system-assigned

# 🔑 Grant ACR pull permission
ACR_ID=$(az acr show --name acrdotportal --query id -o tsv)
IDENTITY_ID=$(az containerapp show --name ca-dot-portal-dab --resource-group rg-dot-portal-demo --query identity.principalId -o tsv)

az role assignment create \
  --assignee $IDENTITY_ID \
  --scope $ACR_ID \
  --role AcrPull
```

<details>
<summary>🏢 <b>Enable Content Trust (Enterprise)</b></summary>

For production, enable image signing:

```bash
az acr config content-trust update \
  --name acrdotportal \
  --status enabled
```

</details>

<details>
<summary>🛡️ <b>Scan for Vulnerabilities</b></summary>

Enable Microsoft Defender for container registries:

1. Azure Portal → Your ACR → **Security** → **Microsoft Defender**
2. Enable Defender for Containers

</details>

---

## 💰 Cost Management

### 📊 Estimate Your Costs

| 📋 Component | 💵 Basic Tier | 📝 Notes |
|:------------|:------------|:--------|
| Registry | $0.167/day (~$5/month) | Storage included |
| Storage | $0.003/GB/day | Beyond included |
| Build tasks | $0.0001/second | Pay per use |

### 💡 Reduce Costs

1. **🗑️ Delete unused images:**
   ```bash
   # Delete old builds
   az acr repository delete --name acrdotportal --image oldapp:old-tag --yes
   ```

2. **⏱️ Set retention policy:**
   ```bash
   az acr config retention update \
     --name acrdotportal \
     --status enabled \
     --days 30 \
     --type UntaggedManifests
   ```

3. **📄 Use .dockerignore:**
   ```
   # .dockerignore
   node_modules
   .git
   *.md
   tests/
   ```

---

## 📋 Quick Reference

### 🔧 Common Commands

```bash
# ➕ Create registry
az acr create --resource-group RG --name NAME --sku Basic

# 👤 Enable admin
az acr update --name NAME --admin-enabled true

# 🔑 Get credentials
az acr credential show --name NAME

# 🏗️ Build image
az acr build --registry NAME --image REPO:TAG .

# 📋 List repositories
az acr repository list --name NAME

# 🏷️ List tags
az acr repository show-tags --name NAME --repository REPO

# 🗑️ Delete image
az acr repository delete --name NAME --image REPO:TAG --yes
```

### 🔗 Image URL Format

```
REGISTRY.azurecr.io/REPOSITORY:TAG

Examples:
acrdotportal.azurecr.io/dab:v1
acrdotportal.azurecr.io/frontend:latest
```

---

## 📚 Additional Resources

| 📘 Resource | 🔗 Link |
|:-----------|:--------|
| 📖 ACR Documentation | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/container-registry/) |
| 🏗️ ACR Tasks | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-tasks-overview) |
| ✨ ACR Best Practices | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-best-practices) |
| 💰 Pricing Calculator | [Azure Pricing](https://azure.microsoft.com/en-us/pricing/details/container-registry/) |

---

<div align="center">

### 🚀 Ready to deploy your images?

[![Container Apps Guide](https://img.shields.io/badge/📦_Deploy_to_Container_Apps-0078D4?style=for-the-badge)](./container-apps-portal-guide.md)
[![Back to Index](https://img.shields.io/badge/📚_Back_to_Index-gray?style=for-the-badge)](./index.md)

---

**Made with ❤️ for the Azure community**

</div>
