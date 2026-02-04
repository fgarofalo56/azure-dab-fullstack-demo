# Azure Data API Builder Full-Stack Demo

A complete demonstration of Azure Data API Builder (DAB) deployed to Azure Container Instances with a React + TypeScript frontend, Azure SQL Database, and Entra ID authentication.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Azure Resource Group                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │   React      │───>│  Data API        │───>│  Azure SQL   │  │
│  │   Frontend   │    │  Builder (DAB)   │    │  Database    │  │
│  │   (ACI)      │    │  (ACI)           │    │              │  │
│  └──────────────┘    └──────────────────┘    └──────────────┘  │
│         │                    │                                   │
│         │                    │                                   │
│         ▼                    ▼                                   │
│  ┌──────────────┐    ┌──────────────────┐                       │
│  │   Azure      │    │   Azure File     │                       │
│  │   Container  │    │   Share          │                       │
│  │   Registry   │    │   (Persistent)   │                       │
│  └──────────────┘    └──────────────────┘                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Microsoft Entra ID                     │   │
│  │                  (Tenant Authentication)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- **Data API Builder**: Auto-generated REST and GraphQL APIs from Azure SQL
- **React Frontend**: Modern TypeScript UI consuming DAB endpoints
- **Azure Container Instances**: Serverless container hosting
- **Azure Container Registry**: Private container image storage
- **Entra ID Authentication**: Tenant-only access control
- **Infrastructure as Code**: Complete Bicep deployment scripts
- **Persistent Storage**: Azure File Share for container data

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) (v2.50+)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+ LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Azure subscription with permissions to create resources
- Azure AD tenant membership

## Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/<your-username>/azure-dab-fullstack-demo.git
cd azure-dab-fullstack-demo
cp .env.example .env
# Edit .env with your values
```

### 2. Deploy Azure Infrastructure

```bash
# Login to Azure
az login

# Deploy all resources
./infrastructure/scripts/deploy.ps1 -ResourceGroupName "rg-dab-demo" -Location "eastus"
```

### 3. Build and Push Containers

```bash
# Build and push DAB container
./infrastructure/scripts/build-push-dab.ps1

# Build and push Frontend container
./infrastructure/scripts/build-push-frontend.ps1
```

### 4. Access the Application

After deployment completes, access your application at:
- Frontend: `https://<your-aci-fqdn>/`
- DAB REST API: `https://<your-aci-fqdn>/api/`
- DAB GraphQL: `https://<your-aci-fqdn>/graphql`

## Project Structure

```
azure-dab-fullstack-demo/
├── .github/
│   └── workflows/           # CI/CD pipelines
├── .claude/                 # Claude Code configuration
├── docs/
│   ├── setup-guide.md       # Detailed setup instructions
│   ├── architecture.md      # Architecture deep-dive
│   └── troubleshooting.md   # Common issues and solutions
├── infrastructure/
│   ├── bicep/
│   │   ├── main.bicep       # Main deployment template
│   │   ├── modules/         # Reusable Bicep modules
│   │   └── parameters/      # Environment parameters
│   └── scripts/
│       ├── deploy.ps1       # Deployment script
│       ├── build-push-dab.ps1
│       └── build-push-frontend.ps1
├── src/
│   ├── dab-config/
│   │   ├── dab-config.json  # DAB configuration
│   │   └── Dockerfile       # DAB container image
│   └── frontend/
│       ├── src/             # React TypeScript source
│       ├── Dockerfile       # Frontend container image
│       └── package.json
├── tests/                   # Integration and E2E tests
├── .env.example             # Environment template
├── CLAUDE.md                # Claude Code project config
└── README.md                # This file
```

## Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/setup-guide.md) | Step-by-step deployment instructions |
| [Architecture](docs/architecture.md) | Detailed architecture documentation |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and solutions |
| [Contributing](CONTRIBUTING.md) | How to contribute |

## Security

- All traffic is encrypted via HTTPS
- Entra ID authentication required for all endpoints
- Azure SQL uses private endpoints (optional)
- Container Registry is private
- Secrets stored in Azure Key Vault (optional)

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- [Azure Data API Builder](https://github.com/Azure/data-api-builder)
- [Microsoft Learn - DAB Documentation](https://learn.microsoft.com/azure/data-api-builder/)
