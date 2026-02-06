# Complete Azure Portal Deployment Guide

<div align="center">

![Portal Deployment](https://img.shields.io/badge/Azure%20Portal-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![Beginner Friendly](https://img.shields.io/badge/Beginner%20Friendly-4CAF50?style=for-the-badge&logo=checkmarx&logoColor=white)
![No Code Required](https://img.shields.io/badge/No%20CLI%20Required-FF9800?style=for-the-badge)

**Deploy the DOT Transportation Data Portal using only the Azure Portal**

[Prerequisites](#prerequisites) | [Step-by-Step](#step-by-step-deployment) | [Verification](#verification) | [Troubleshooting](#troubleshooting)

</div>

---

## Overview

This guide walks you through deploying the complete DOT Transportation Data Portal using **only the Azure Portal** - no command line tools required! Perfect for beginners who prefer a visual, click-based approach.

### What You'll Create

| Resource | Purpose | Estimated Time |
|----------|---------|----------------|
| Resource Group | Container for all resources | 2 min |
| Azure SQL Database | Store transportation data | 10 min |
| Azure Container Registry | Store container images | 5 min |
| Container Apps Environment | Host the containers | 5 min |
| DAB Container App | API backend | 10 min |
| Frontend Container App | React web interface | 10 min |
| Microsoft Entra App Registrations | Authentication | 15 min |

**Total Time:** ~60 minutes for first-time setup

---

## Prerequisites

Before starting, ensure you have:

- [ ] **Azure Account** with an active subscription
  - [Create free account](https://azure.microsoft.com/free/)
- [ ] **Sufficient permissions** to create resources
  - Contributor role on subscription, or
  - Owner/Contributor on a resource group
- [ ] **Access to Microsoft Entra ID**
  - To create app registrations for authentication

> **Tip:** If you're using a work account, check with your IT administrator about permissions.

---

## Step-by-Step Deployment

### Step 1: Create a Resource Group

A resource group is a container that holds all related Azure resources.

1. **Sign in** to the [Azure Portal](https://portal.azure.com)

2. **Search** for "Resource groups" in the top search bar

   ![Search Resource Groups](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/media/manage-resource-groups-portal/search-resource-group.png)
   *Source: [Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal)*

3. Click **+ Create**

4. Fill in the details:
   | Field | Value |
   |-------|-------|
   | Subscription | Select your subscription |
   | Resource group | `rg-dot-portal-demo` |
   | Region | `East US 2` (or closest to you) |

5. Click **Review + create**, then **Create**

> **Best Practice:** Use a consistent naming convention like `rg-` prefix for resource groups.

---

### Step 2: Create Azure SQL Database

The database stores all transportation data that DAB will expose as APIs.

#### 2.1 Create SQL Server

1. **Search** for "SQL servers" and click **+ Create**

2. **Basics tab:**
   | Field | Value |
   |-------|-------|
   | Subscription | Your subscription |
   | Resource group | `rg-dot-portal-demo` |
   | Server name | `sql-dot-portal-demo` (must be globally unique) |
   | Location | Same as resource group |
   | Authentication | SQL authentication |
   | Server admin login | `sqladmin` |
   | Password | Create a strong password (save it!) |

   ![Create SQL Server](https://learn.microsoft.com/en-us/azure/azure-sql/database/media/single-database-create-quickstart/create-database-server.png)
   *Source: [Microsoft Learn - Create SQL Server](https://learn.microsoft.com/en-us/azure/azure-sql/database/single-database-create-quickstart)*

3. Click **Review + create**, then **Create**

#### 2.2 Create Database

1. Once the server is created, go to it and click **+ Create database**

2. **Basics tab:**
   | Field | Value |
   |-------|-------|
   | Database name | `DotTransportationDb` |
   | Want to use SQL elastic pool? | No |
   | Workload environment | Development |
   | Compute + storage | Click "Configure database" |

3. **Configure compute:**
   - Select **Basic** tier for development ($5/month)
   - Or **Standard S0** for production

4. Click **Review + create**, then **Create**

#### 2.3 Configure Firewall

1. Go to your SQL server → **Networking**

2. Under **Firewall rules**:
   - Toggle **Allow Azure services and resources to access this server** to **Yes**

3. To access from your computer, click **+ Add your client IPv4 address**

4. Click **Save**

   ![SQL Firewall](https://learn.microsoft.com/en-us/azure/azure-sql/database/media/secure-database-tutorial/firewall-settings.png)
   *Source: [Microsoft Learn - SQL Firewall](https://learn.microsoft.com/en-us/azure/azure-sql/database/secure-database-tutorial)*

#### 2.4 Initialize Database Schema

You'll need to run the SQL script to create tables. Use **Query editor** in the portal:

1. Go to your database → **Query editor (preview)**

2. Login with your SQL admin credentials

3. Run the initialization script (found in `database/init.sql` in this repo)

---

### Step 3: Create Azure Container Registry

ACR stores your container images that will run in Container Apps.

1. **Search** for "Container registries" and click **+ Create**

2. **Basics tab:**
   | Field | Value |
   |-------|-------|
   | Subscription | Your subscription |
   | Resource group | `rg-dot-portal-demo` |
   | Registry name | `acrdotportal` (must be globally unique, letters/numbers only) |
   | Location | Same as resource group |
   | SKU | **Basic** (cheapest, sufficient for dev) |

   ![Create ACR](https://learn.microsoft.com/en-us/azure/container-registry/media/container-registry-get-started-portal/qs-portal-01.png)
   *Source: [Microsoft Learn - Create ACR](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal)*

3. Click **Review + create**, then **Create**

#### 3.1 Enable Admin User

To allow Container Apps to pull images:

1. Go to your registry → **Access keys**

2. Toggle **Admin user** to **Enabled**

3. **Save the credentials** - you'll need:
   - Login server: `acrdotportal.azurecr.io`
   - Username: `acrdotportal`
   - Password: (copy one of the passwords)

   ![ACR Access Keys](https://learn.microsoft.com/en-us/azure/container-registry/media/container-registry-authentication/acr-access-keys.png)
   *Source: [Microsoft Learn - ACR Access Keys](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication)*

---

### Step 4: Build and Push Container Images

Since you don't have Docker Desktop, use **Azure Cloud Shell** to build images with ACR Tasks.

1. Click the **Cloud Shell** icon (>_) in the top navigation bar

   ![Cloud Shell](https://learn.microsoft.com/en-us/azure/cloud-shell/media/overview/portal-launch-icon.png)

2. Select **Bash** when prompted

3. **Upload your source files** or clone from GitHub:
   ```bash
   git clone https://github.com/YOUR-USERNAME/azure-dab-fullstack-demo.git
   cd azure-dab-fullstack-demo
   ```

4. **Build DAB image:**
   ```bash
   az acr build \
     --registry acrdotportal \
     --image dab:v1 \
     ./src/dab-config
   ```

5. **Build Frontend image:**
   ```bash
   az acr build \
     --registry acrdotportal \
     --image frontend:v1 \
     ./src/frontend
   ```

> **Note:** ACR Tasks builds the images in Azure - no local Docker needed!

For detailed instructions, see [Cloud Shell Deployment Guide](./cloud-shell-deployment-guide.md).

---

### Step 5: Create Container Apps Environment

The environment is a secure boundary for your container apps.

1. **Search** for "Container Apps Environments" and click **+ Create**

2. **Basics tab:**
   | Field | Value |
   |-------|-------|
   | Subscription | Your subscription |
   | Resource group | `rg-dot-portal-demo` |
   | Environment name | `cae-dot-portal` |
   | Region | Same as resource group |
   | Environment type | **Workload profiles** (recommended) |

3. **Monitoring tab:**
   - Create new Log Analytics workspace or select existing
   - Name: `law-dot-portal`

4. Click **Review + create**, then **Create**

   ![Create Environment](https://learn.microsoft.com/en-us/azure/container-apps/media/get-started/azure-container-apps-environment-create.png)
   *Source: [Microsoft Learn - Container Apps Environment](https://learn.microsoft.com/en-us/azure/container-apps/environment)*

---

### Step 6: Create DAB Container App

This container runs Data API Builder to serve your REST and GraphQL APIs.

1. **Search** for "Container Apps" and click **+ Create**

2. **Basics tab:**
   | Field | Value |
   |-------|-------|
   | Subscription | Your subscription |
   | Resource group | `rg-dot-portal-demo` |
   | Container app name | `ca-dot-portal-dab` |
   | Region | Same as resource group |
   | Container Apps Environment | `cae-dot-portal` |

3. **Container tab:**
   | Field | Value |
   |-------|-------|
   | Name | `dab` |
   | Image source | Azure Container Registry |
   | Registry | `acrdotportal.azurecr.io` |
   | Image | `dab` |
   | Image tag | `v1` |
   | CPU and Memory | 1 CPU, 2 Gi memory |

4. **Environment variables** (click **+ Add**):
   | Name | Source | Value |
   |------|--------|-------|
   | `DATABASE_CONNECTION_STRING` | Manual | `Server=sql-dot-portal-demo.database.windows.net;Database=DotTransportationDb;User Id=sqladmin;Password=YOUR_PASSWORD;Encrypt=True;` |
   | `AZURE_TENANT_ID` | Manual | Your tenant ID (find in Microsoft Entra ID → Overview) |
   | `DAB_ENVIRONMENT` | Manual | `Production` |

5. **Ingress tab:**
   | Field | Value |
   |-------|-------|
   | Ingress | **Enabled** |
   | Ingress traffic | Accepting traffic from anywhere |
   | Ingress type | HTTP |
   | Target port | `5000` |

6. Click **Review + create**, then **Create**

   ![Create Container App](https://learn.microsoft.com/en-us/azure/container-apps/media/get-started/azure-container-apps-create-and-deploy.png)
   *Source: [Microsoft Learn - Create Container App](https://learn.microsoft.com/en-us/azure/container-apps/quickstart-portal)*

---

### Step 7: Create Frontend Container App

This container runs the React web application.

1. **Create** another Container App with these settings:

2. **Basics tab:**
   | Field | Value |
   |-------|-------|
   | Container app name | `ca-dot-portal-frontend` |
   | Container Apps Environment | `cae-dot-portal` |

3. **Container tab:**
   | Field | Value |
   |-------|-------|
   | Name | `frontend` |
   | Registry | `acrdotportal.azurecr.io` |
   | Image | `frontend` |
   | Image tag | `v1` |
   | CPU and Memory | 0.5 CPU, 1 Gi memory |

4. **Environment variables:**
   | Name | Value |
   |------|-------|
   | `VITE_API_BASE_URL` | `https://ca-dot-portal-dab.YOUR-REGION.azurecontainerapps.io/api` |
   | `VITE_CLIENT_ID` | (Your frontend app registration client ID - see Step 8) |
   | `VITE_TENANT_ID` | Your tenant ID |

5. **Ingress tab:**
   | Field | Value |
   |-------|-------|
   | Ingress | **Enabled** |
   | Target port | `80` |

6. Click **Review + create**, then **Create**

---

### Step 8: Configure Authentication (Microsoft Entra ID)

#### 8.1 Create DAB App Registration (API)

1. Go to **Microsoft Entra ID** → **App registrations** → **+ New registration**

2. Fill in:
   | Field | Value |
   |-------|-------|
   | Name | `DOT Portal DAB API` |
   | Supported account types | Single tenant |
   | Redirect URI | Leave blank |

3. After creation, go to **Expose an API**:
   - Click **Add** next to Application ID URI
   - Accept default: `api://YOUR-CLIENT-ID`
   - Click **Save**

4. Add a scope:
   - Click **+ Add a scope**
   - Scope name: `access_as_user`
   - Who can consent: Admins and users
   - Display name: "Access DOT Portal API"
   - Description: "Allows the app to access the DOT Portal API"
   - Click **Add scope**

#### 8.2 Create Frontend App Registration

1. Create another app registration:
   | Field | Value |
   |-------|-------|
   | Name | `DOT Portal Frontend` |
   | Supported account types | Single tenant |
   | Redirect URI | Single-page application (SPA) |
   | URI | `https://ca-dot-portal-frontend.YOUR-REGION.azurecontainerapps.io` |

2. Go to **API permissions** → **+ Add a permission**:
   - Select **My APIs** → `DOT Portal DAB API`
   - Check `access_as_user`
   - Click **Add permissions**

3. **Copy the Application (client) ID** - you'll need this for the frontend environment variable

   ![App Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/media/quickstart-register-app/portal-02-app-reg-01.png)
   *Source: [Microsoft Learn - App Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)*

#### 8.3 Update Container Apps with Auth Settings

1. Go back to your **DAB Container App** → **Containers** → **Edit and deploy**

2. Add/update environment variables:
   | Name | Value |
   |------|-------|
   | `AZURE_CLIENT_ID` | DAB API client ID |
   | `AZURE_TENANT_ID` | Your tenant ID |

3. Go to your **Frontend Container App** and update:
   | Name | Value |
   |------|-------|
   | `VITE_CLIENT_ID` | Frontend client ID |
   | `VITE_DAB_CLIENT_ID` | DAB API client ID (for API scope) |

4. Click **Create** to deploy new revisions

---

## Verification

### Test Your Deployment

1. **Get your Frontend URL:**
   - Go to Container Apps → `ca-dot-portal-frontend` → Overview
   - Copy the **Application Url**

2. **Open in browser:**
   - Navigate to the URL
   - You should see the login page

3. **Test the API:**
   - Go to DAB Container App URL + `/api`
   - You should see the DAB health response

4. **Test Data:**
   - After logging in, navigate to different data tables
   - Data should load from your SQL database

### Verify Container Health

1. Go to your Container App → **Revisions**

2. Check that:
   - Revision status is **Running**
   - Replica count shows at least 1 active
   - Health state shows **Healthy**

   ![Revision Health](https://learn.microsoft.com/en-us/azure/container-apps/media/revisions/revision-details.png)

---

## Updating Your Containers

When you make code changes, you need to rebuild and redeploy.

### Option 1: Via Azure Portal

1. **Rebuild the image** (in Cloud Shell):
   ```bash
   az acr build --registry acrdotportal --image dab:v2 ./src/dab-config
   ```

2. Go to **Container Apps** → Your app → **Containers**

3. Click **Edit and deploy**

4. Change the **Image tag** to `v2`

5. Click **Create** to deploy new revision

### Option 2: Via Cloud Shell

```bash
# Update DAB
az containerapp update \
  --name ca-dot-portal-dab \
  --resource-group rg-dot-portal-demo \
  --image acrdotportal.azurecr.io/dab:v2

# Update Frontend
az containerapp update \
  --name ca-dot-portal-frontend \
  --resource-group rg-dot-portal-demo \
  --image acrdotportal.azurecr.io/frontend:v2
```

---

## Common Issues

### Container Won't Start

**Check the logs:**
1. Container Apps → Your app → **Log stream**
2. Look for error messages

**Common fixes:**
- Missing environment variables
- Wrong connection string
- ACR credentials issue

### Authentication Errors

**"AADSTS50011: Reply URL mismatch"**
- Add exact Container App URL to app registration redirect URIs
- No trailing slash!

**"401 Unauthorized"**
- Verify client IDs match
- Check API permissions are granted

### Database Connection Failed

**"Login failed"**
- Verify connection string
- Check SQL firewall allows Azure services
- Confirm credentials are correct

For detailed solutions, see [Troubleshooting Guide](./troubleshooting-guide.md).

---

## Cost Optimization Tips

| Resource | Development Tip | Savings |
|----------|-----------------|---------|
| SQL Database | Use Basic tier | ~$5/month |
| Container Apps | Enable scale-to-zero | Pay only when used |
| ACR | Use Basic tier | ~$5/month |
| Log Analytics | Reduce retention to 30 days | Significant |

**Estimated Development Cost:** ~$15-30/month

---

## Next Steps

- [Configure Auto-Scaling](./auto-scaling-guide.md)
- [Set up CI/CD with GitHub Actions](./ci-cd-guide.md)
- [Review Best Practices](./best-practices-guide.md)
- [Explore DAB Configuration](./dab-configuration-guide.md)

---

## Additional Resources

| Resource | Link |
|----------|------|
| Azure Container Apps Documentation | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/container-apps/) |
| Data API Builder Documentation | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/data-api-builder/) |
| Azure SQL Documentation | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-sql/) |
| Microsoft Entra ID Documentation | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/active-directory/) |

---

<div align="center">

**Need help?** Check the [Troubleshooting Guide](./troubleshooting-guide.md) or [open an issue](https://github.com/your-repo/issues).

[Back to Index](./index.md) | [Cloud Shell Guide](./cloud-shell-deployment-guide.md)

</div>
