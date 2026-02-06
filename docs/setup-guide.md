# Setup Guide: Azure Data API Builder Full-Stack Demo

<div align="center">

![Setup](https://img.shields.io/badge/Setup-Guide-00C853?style=for-the-badge&logo=rocket&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![DAB](https://img.shields.io/badge/Data%20API%20Builder-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)

**Complete deployment from scratch to running application**

</div>

This guide walks you through deploying the complete Azure Data API Builder demo from scratch with Azure Container Apps.

> **Estimated Time:** 45-60 minutes
> **Difficulty:** Intermediate
> **Result:** Fully functional DOT Transportation Data Portal

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Azure AD App Registrations](#azure-ad-app-registrations)
3. [Deploy Azure Infrastructure](#deploy-azure-infrastructure)
4. [Configure Azure SQL Database](#configure-azure-sql-database)
5. [Build and Push Containers](#build-and-push-containers)
6. [Verify Deployment](#verify-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

| Tool | Version | Installation |
|------|---------|--------------|
| Azure CLI | 2.50+ | `winget install Microsoft.AzureCLI` |
| .NET SDK | 8.0+ | `winget install Microsoft.DotNet.SDK.8` |
| Node.js | 18+ LTS | `winget install OpenJS.NodeJS.LTS` |
| Docker Desktop | Latest | `winget install Docker.DockerDesktop` |
| DAB CLI | Latest | `dotnet tool install -g Microsoft.DataApiBuilder` |

### Verify Installations

```powershell
# Check all tools are installed
az --version
dotnet --version
node --version
docker --version
dab --version
```

### Azure Requirements

- Azure subscription with Contributor access
- Permission to create Azure AD app registrations
- Member of the Azure AD tenant (for authentication testing)

---

## Azure AD App Registrations

You need to create two app registrations for authentication.

### 1. DAB Backend App Registration

This app secures the Data API Builder endpoints.

```powershell
# Create the app registration
az ad app create \
    --display-name "DAB Demo Backend" \
    --sign-in-audience "AzureADMyOrg" \
    --web-redirect-uris "https://localhost:5000/.auth/login/aad/callback"

# Note the Application (client) ID from the output
```

**Manual Steps in Azure Portal:**

1. Go to **Azure Portal** > **Azure Active Directory** > **App registrations**
2. Select **DAB Demo Backend**
3. Go to **Expose an API**
4. Click **Add a scope**:
   - Scope name: `access_as_user`
   - Admin consent display name: `Access DAB API`
   - Admin consent description: `Allows the app to access DAB API on behalf of the user`
5. Copy the **Application ID URI** (e.g., `api://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 2. Frontend App Registration

This app handles user authentication in the React SPA.

```powershell
# Create the app registration
az ad app create \
    --display-name "DAB Demo Frontend" \
    --sign-in-audience "AzureADMyOrg" \
    --spa-redirect-uris "http://localhost:3000" "http://localhost:5173"

# Note the Application (client) ID from the output
```

**Manual Steps in Azure Portal:**

1. Go to **Azure Portal** > **Azure Active Directory** > **App registrations**
2. Select **DAB Demo Frontend**
3. Go to **API permissions**
4. Click **Add a permission** > **My APIs** > **DAB Demo Backend**
5. Select the `access_as_user` scope
6. Click **Grant admin consent**

### 3. Record Your App IDs

```
DAB Backend Client ID:    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Frontend Client ID:       yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
Tenant ID:                zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz
```

---

## Deploy Azure Infrastructure

### 1. Clone the Repository

```powershell
git clone https://github.com/<your-username>/azure-dab-fullstack-demo.git
cd azure-dab-fullstack-demo
```

### 2. Login to Azure

```powershell
az login
az account set --subscription "<your-subscription-id>"
```

### 3. Run the Deployment Script (Two Phases)

#### Phase 1: Infrastructure Only

```powershell
cd infrastructure/scripts

# Deploy infrastructure without Container Apps
./deploy.ps1 -ResourceGroupName "rg-dab-demo" -Location "eastus2" -SkipContainers
```

The script will prompt you for:
- SQL admin password (minimum 8 characters, complex)
- DAB Backend Client ID
- Frontend Client ID

#### Phase 2: Full Deployment

After building and pushing images (step 5):

```powershell
# Deploy Container Apps
./deploy.ps1 -ResourceGroupName "rg-dab-demo" -Location "eastus2"
```

### 4. Deployment Output

After successful deployment, you'll see:

```
============================================
Deployment completed successfully!
============================================

Container Apps Environment:
   Name: dabdemo-dev-cae

Data API Builder Container App:
   Name: dabdemo-dev-ca-dab
   URL: https://dabdemo-dev-ca-dab.nicebeach-xxxxx.eastus2.azurecontainerapps.io

Frontend Container App:
   Name: dabdemo-dev-ca-frontend
   URL: https://dabdemo-dev-ca-frontend.nicebeach-xxxxx.eastus2.azurecontainerapps.io

Auto-Scaling Configuration:
   Min Replicas: 0 (scale-to-zero enabled)
   Max Replicas: 10
   Scale Threshold: 100 concurrent requests

Azure Front Door (HTTPS):
   Frontend URL: https://dabdemodev.xxxxx.azurefd.net
   REST API: https://dabdemodev.xxxxx.azurefd.net/api
   GraphQL: https://dabdemodev.xxxxx.azurefd.net/graphql
```

---

## Configure Azure SQL Database

### 1. Connect to Azure SQL

Use Azure Data Studio or SQL Server Management Studio:

```
Server: <your-sql-server>.database.windows.net
Database: dabdemo-dev-db
Authentication: SQL Login
Username: sqladmin
Password: <your-password>
```

### 2. Initialize Database

```powershell
cd src/database

./Initialize-Database.ps1 -ServerName "<sql-server>.database.windows.net" `
                          -DatabaseName "<database-name>" `
                          -Username "sqladmin" `
                          -Password "<your-password>"
```

### 3. Verify Data

```sql
SELECT 'Categories' AS TableName, COUNT(*) AS Records FROM Categories
UNION ALL SELECT 'States', COUNT(*) FROM States
UNION ALL SELECT 'RailroadAccidents', COUNT(*) FROM RailroadAccidents
UNION ALL SELECT 'Bridges', COUNT(*) FROM Bridges
UNION ALL SELECT 'TransitAgencies', COUNT(*) FROM TransitAgencies
UNION ALL SELECT 'VehicleFatalities', COUNT(*) FROM VehicleFatalities;
```

Expected: ~1,300 total records

---

## Build and Push Containers

### 1. Login to Azure Container Registry

```powershell
# Get ACR credentials
$acrName = "acrdabdemodev"  # From deployment output
az acr login --name $acrName
```

### 2. Build and Push DAB Container

```powershell
cd infrastructure/scripts

./build-push-dab.ps1 -AcrName $acrName
```

### 3. Build and Push Frontend Container

```powershell
./build-push-frontend.ps1 -AcrName $acrName `
    -AzureAdClientId "<frontend-client-id>" `
    -AzureAdTenantId "<tenant-id>"
```

### 4. Deploy Container Apps

```powershell
# Run Phase 2 deployment
./deploy.ps1 -ResourceGroupName "rg-dab-demo" -Location "eastus2"
```

---

## Verify Deployment

### 1. Check Container App Status

```powershell
# Check DAB Container App
az containerapp show --name "dabdemo-dev-ca-dab" --resource-group "rg-dab-demo" --query "properties.runningStatus"

# Check replicas (may be 0 if scale-to-zero)
az containerapp replica list --name "dabdemo-dev-ca-dab" --resource-group "rg-dab-demo"
```

### 2. Test DAB Endpoints

```powershell
# Get Container App URL
$dabUrl = az containerapp show --name "dabdemo-dev-ca-dab" --resource-group "rg-dab-demo" --query "properties.configuration.ingress.fqdn" -o tsv

# Test API (will trigger cold start if scaled to zero)
curl "https://$dabUrl/"

# Test via Front Door
$frontDoorUrl = (Get-Content ..\..\deployment-outputs.json | ConvertFrom-Json).frontDoorUrl.value
curl "$frontDoorUrl/api/Category"
```

### 3. Access Frontend

Open your browser and navigate to either:

**Front Door URL (recommended):**
```
https://<your-front-door-endpoint>.azurefd.net
```

**Container App URL:**
```
https://<frontend-container-app>.azurecontainerapps.io
```

You'll be prompted to sign in with your Azure AD credentials.

### 4. Update App Registration

Add the production URLs as redirect URIs:

1. Go to **Azure Portal** > **App registrations** > **DAB Demo Frontend**
2. Go to **Authentication**
3. Add the Container App and Front Door URLs as redirect URIs

---

## Troubleshooting

### Container App Won't Start

```powershell
# Check container logs
az containerapp logs show --name "dabdemo-dev-ca-dab" --resource-group "rg-dab-demo" --follow

# Check system events
az containerapp logs show --name "dabdemo-dev-ca-dab" --resource-group "rg-dab-demo" --type system
```

### SQL Connection Failed

1. Verify firewall rules allow Azure services
2. Check connection string in container secrets
3. Ensure SQL credentials are correct

### Authentication Issues

1. Verify app registration scopes are configured
2. Check admin consent was granted
3. Verify tenant ID matches across all configurations
4. Ensure redirect URIs are correct

### Image Pull Failed

1. Verify ACR credentials
2. Check image exists in ACR:
   ```powershell
   az acr repository list --name $acrName
   az acr repository show-tags --name $acrName --repository dab
   ```

### Cold Start Delays

With scale-to-zero enabled (`minReplicas=0`), the first request after idle will experience a cold start (2-5 seconds).

**Solution:** Set `minReplicas=1` for production:
```powershell
./deploy.ps1 -ResourceGroupName "rg-dab-demo" -MinReplicas 1
```

---

## Next Steps

- [Architecture Documentation](architecture.md)
- [Auto-Scaling Guide](auto-scaling-guide.md)
- [CI/CD Guide](ci-cd-guide.md)
- [API Reference](dab-configuration-guide.md)

---

**Need help?** Open an issue on GitHub or check the [Azure Container Apps documentation](https://learn.microsoft.com/azure/container-apps/).
