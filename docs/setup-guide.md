# Setup Guide: Azure Data API Builder Full-Stack Demo

This guide walks you through deploying the complete Azure Data API Builder demo from scratch.

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

### 3. Run the Deployment Script

```powershell
cd infrastructure/scripts

# Deploy with defaults (dev environment)
./deploy.ps1 -ResourceGroupName "rg-dab-demo"

# Or specify all parameters
./deploy.ps1 `
    -ResourceGroupName "rg-dab-demo" `
    -Location "eastus" `
    -Environment "dev" `
    -BaseName "dabdemo"
```

The script will prompt you for:
- SQL admin password (minimum 8 characters, complex)
- DAB Backend Client ID
- Frontend Client ID

### 4. Wait for Deployment

The deployment takes approximately 5-10 minutes. You'll see outputs including:
- ACR login server
- SQL Server FQDN
- Container instance URLs

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

### 2. Create Sample Schema

```sql
-- Create a sample Products table
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Price DECIMAL(18,2) NOT NULL,
    Category NVARCHAR(50),
    InStock BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Create a sample Categories table
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(200)
);

-- Add foreign key
ALTER TABLE Products
ADD CONSTRAINT FK_Products_Categories
FOREIGN KEY (Category) REFERENCES Categories(Name);

-- Insert sample data
INSERT INTO Categories (Name, Description) VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Clothing', 'Apparel and fashion items'),
    ('Books', 'Books and publications');

INSERT INTO Products (Name, Description, Price, Category) VALUES
    ('Laptop', 'High-performance laptop', 999.99, 'Electronics'),
    ('Smartphone', 'Latest smartphone model', 699.99, 'Electronics'),
    ('T-Shirt', 'Cotton t-shirt', 29.99, 'Clothing'),
    ('Programming Book', 'Learn to code', 49.99, 'Books');
```

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
cd src/dab-config

# Build the container
docker build -t dab:latest .

# Tag for ACR
docker tag dab:latest "$acrName.azurecr.io/dab:latest"

# Push to ACR
docker push "$acrName.azurecr.io/dab:latest"
```

### 3. Build and Push Frontend Container

```powershell
cd src/frontend

# Install dependencies and build
npm install
npm run build

# Build the container
docker build -t frontend:latest .

# Tag for ACR
docker tag frontend:latest "$acrName.azurecr.io/frontend:latest"

# Push to ACR
docker push "$acrName.azurecr.io/frontend:latest"
```

### 4. Restart Container Instances

```powershell
# Restart to pull new images
az container restart --name "dabdemo-dev-dab" --resource-group "rg-dab-demo"
az container restart --name "dabdemo-dev-frontend" --resource-group "rg-dab-demo"
```

---

## Verify Deployment

### 1. Check Container Status

```powershell
# Check DAB container
az container show --name "dabdemo-dev-dab" --resource-group "rg-dab-demo" --query "instanceView.state"

# Check Frontend container
az container show --name "dabdemo-dev-frontend" --resource-group "rg-dab-demo" --query "instanceView.state"
```

### 2. Test DAB Endpoints

```powershell
# Get DAB URL from deployment outputs
$dabUrl = "http://dabdemo-dev-dab.eastus.azurecontainer.io:5000"

# Test REST API (will require auth in production)
curl "$dabUrl/api/Product"

# Test GraphQL endpoint
curl -X POST "$dabUrl/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ products { items { id name price } } }"}'
```

### 3. Access Frontend

Open your browser and navigate to:
```
http://dabdemo-dev-frontend.eastus.azurecontainer.io
```

You'll be prompted to sign in with your Azure AD credentials.

---

## Troubleshooting

### Container Won't Start

```powershell
# Check container logs
az container logs --name "dabdemo-dev-dab" --resource-group "rg-dab-demo"

# Check container events
az container show --name "dabdemo-dev-dab" --resource-group "rg-dab-demo" --query "instanceView.events"
```

### SQL Connection Failed

1. Verify firewall rules allow Azure services
2. Check connection string in container environment
3. Ensure SQL credentials are correct

### Authentication Issues

1. Verify app registration scopes are configured
2. Check admin consent was granted
3. Verify tenant ID matches across all configurations

### Image Pull Failed

1. Verify ACR credentials in ACI
2. Check image exists in ACR:
   ```powershell
   az acr repository list --name $acrName
   ```

---

## Next Steps

- [Architecture Documentation](architecture.md)
- [API Reference](api-reference.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

**Need help?** Open an issue on GitHub or check the [Azure DAB documentation](https://learn.microsoft.com/azure/data-api-builder/).
