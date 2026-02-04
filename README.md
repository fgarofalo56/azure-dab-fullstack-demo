# U.S. Department of Transportation - Data API Builder Demo

A comprehensive demonstration of Azure Data API Builder (DAB) showcasing real-world DOT transportation data patterns. Features a React + TypeScript frontend with DOT branding, Azure SQL Database with transportation datasets, and Entra ID authentication.

---

## Architecture Overview

![DOT Transportation Data Portal Architecture](assets/architecture.svg)

<details>
<summary>📋 Text-based Architecture Diagram</summary>

```
┌─────────────────────────────────────────────────────────────────┐
│                     Azure Resource Group                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │   React      │───>│  Data API        │───>│  Azure SQL   │  │
│  │   Frontend   │    │  Builder (DAB)   │    │  Database    │  │
│  │   (ACI)      │    │  (ACI)           │    │              │  │
│  │              │    │                  │    │  ┌────────┐  │  │
│  │  DOT Portal  │    │  REST + GraphQL  │    │  │ DOT    │  │  │
│  └──────────────┘    └──────────────────┘    │  │ Data   │  │  │
│         │                    │               │  └────────┘  │  │
│         │                    │               └──────────────┘  │
│         ▼                    ▼                                  │
│  ┌──────────────┐    ┌──────────────────┐                      │
│  │   Azure      │    │   Azure File     │                      │
│  │   Container  │    │   Share          │                      │
│  │   Registry   │    │   (Persistent)   │                      │
│  └──────────────┘    └──────────────────┘                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Microsoft Entra ID                     │   │
│  │                  (Tenant Authentication)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

</details>

For detailed architecture documentation with Mermaid diagrams, see [docs/architecture.md](docs/architecture.md).

---

## DOT Data Categories

| Category | Icon | Data Source | Description |
|----------|------|-------------|-------------|
| **Railroads** | 🚂 | FRA Form 54 | Federal Railroad Administration accident data |
| **Bridges** | 🌉 | NBI | National Bridge Inventory structural conditions |
| **Public Transit** | 🚌 | NTD | National Transit Database agency metrics |
| **Automobiles** | 🚗 | FARS | NHTSA Fatality Analysis Reporting System |

## Features

- **DOT-Themed Interface**: Professional UI with DOT branding and styling
- **Data API Builder**: Auto-generated REST and GraphQL APIs from Azure SQL
- **Transportation Data Model**: Realistic DOT data patterns with 1,300+ sample records
- **Category-Based Navigation**: Browse data by Railroads, Bridges, Transit, or Automobiles
- **State-Level Analysis**: All data linked to US states with regional groupings
- **Azure Container Instances**: Serverless container hosting
- **Entra ID Authentication**: Secure tenant-only access control
- **Infrastructure as Code**: Complete Bicep deployment scripts

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) (v2.50+)
- [Node.js](https://nodejs.org/) (v18+ LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Azure subscription with resource creation permissions
- Azure AD tenant membership
- SQL Server tools (sqlcmd or SSMS)

## Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/<your-username>/azure-dab-fullstack-demo.git
cd azure-dab-fullstack-demo
cp .env.example .env
# Edit .env with your values
```

### 2. Deploy Azure Infrastructure

```powershell
# Login to Azure
az login

# Deploy all resources
./infrastructure/scripts/deploy.ps1 -ResourceGroupName "rg-dlz-dab-dev-eastus2" -Location "eastus2"
```

### 3. Initialize Database

```powershell
# Navigate to database scripts
cd src/database

# Run initialization (creates schema + seeds data)
./Initialize-Database.ps1 -ServerName "<your-sql-server>.database.windows.net" `
                          -DatabaseName "<your-database>" `
                          -Username "<admin>" `
                          -Password "<password>"
```

### 4. Build and Push Containers

```powershell
# Build and push DAB container
./infrastructure/scripts/build-push-dab.ps1 -AcrName "<your-acr-name>"

# Build and push Frontend container
./infrastructure/scripts/build-push-frontend.ps1 -AcrName "<your-acr-name>"
```

### 5. Access the Application

After deployment completes:
- **Frontend Portal**: `https://<frontend-aci-fqdn>/`
- **DAB REST API**: `https://<dab-aci-fqdn>:5000/api/`
- **DAB GraphQL**: `https://<dab-aci-fqdn>:5000/graphql`

## API Endpoints

### REST API

| Endpoint | Description |
|----------|-------------|
| `GET /api/Category` | DOT data categories |
| `GET /api/State` | US states reference |
| `GET /api/RailroadAccident` | Railroad incident data |
| `GET /api/Bridge` | Bridge inventory data |
| `GET /api/TransitAgency` | Transit agency metrics |
| `GET /api/VehicleFatality` | Vehicle crash fatalities |
| `GET /api/CategorySummary` | Dashboard summary view |

All endpoints support OData query parameters:
```
GET /api/Bridge?$filter=overallCondition eq 'Poor'&$top=10&$orderby=yearBuilt
```

### GraphQL

```graphql
{
  bridges(filter: { overallCondition: { eq: "Poor" } }, first: 10) {
    items {
      structureNumber
      yearBuilt
      overallCondition
      state {
        name
        code
      }
    }
  }
}
```

## Project Structure

```
azure-dab-fullstack-demo/
├── .github/workflows/         # CI/CD pipelines
├── assets/
│   ├── architecture.svg       # Architecture diagram
│   └── architecture.excalidraw # Editable source
├── docs/
│   ├── architecture.md        # System architecture (Mermaid)
│   ├── dab-configuration-guide.md  # DAB setup & extension guide
│   ├── deployment-guide-portal.md  # Manual Azure Portal deployment
│   └── deployment-guide-scripts.md # PowerShell deployment guide
├── infrastructure/
│   ├── bicep/
│   │   └── main.bicep         # Azure infrastructure (Bicep)
│   └── scripts/
│       ├── deploy.ps1         # Infrastructure deployment
│       ├── build-push-dab.ps1 # DAB container build
│       └── build-push-frontend.ps1 # Frontend container build
├── src/
│   ├── database/
│   │   ├── 001-schema.sql     # DOT database schema
│   │   ├── 002-seed-data.sql  # Sample transportation data (~1,300 records)
│   │   ├── Initialize-Database.ps1 # DB setup script
│   │   └── README.md          # Database documentation
│   ├── dab-config/
│   │   ├── dab-config.json    # DAB entity configuration (11 entities)
│   │   └── Dockerfile         # DAB container image
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx        # DOT-themed React app
│       │   ├── components/    # Reusable UI components
│       │   ├── utils/         # API utilities & helpers
│       │   ├── types/         # TypeScript interfaces
│       │   └── __tests__/     # Vitest test suite
│       ├── Dockerfile         # Frontend container image
│       └── vitest.config.ts   # Test configuration
├── .env.example               # Environment template
├── CLAUDE.md                  # Project configuration
└── README.md
```

## Database Schema

```
Categories ──┬── RailroadAccidents
             ├── Bridges
             ├── TransitAgencies
             └── VehicleFatalities
                      │
States ──────────────┘ (all tables link to States)
```

See [src/database/README.md](src/database/README.md) for complete schema documentation.

## Local Development

### Frontend Development

```bash
cd src/frontend
npm install
npm run dev   # Starts Vite dev server on port 3000
```

### DAB Local Development

```bash
cd src/dab-config

# Set connection string
export DATABASE_CONNECTION_STRING="Server=localhost;Database=DOTDemo;..."

# Start DAB
dab start
```

## Security

- All traffic encrypted via HTTPS
- Entra ID authentication required for all API endpoints
- Role-based permissions (authenticated: read-only, admin: full CRUD)
- Container Registry is private
- SQL credentials stored as deployment parameters (Key Vault recommended for production)

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System architecture with component details and Mermaid diagrams |
| [DAB Configuration Guide](docs/dab-configuration-guide.md) | How to configure, extend, and add entities to Data API Builder |
| [Deployment Guide (Scripts)](docs/deployment-guide-scripts.md) | Automated deployment using PowerShell and Azure CLI |
| [Deployment Guide (Portal)](docs/deployment-guide-portal.md) | Step-by-step manual deployment via Azure Portal |
| [Database README](src/database/README.md) | Database schema, ERD, and data dictionary |

---

## Data Sources Reference

Sample data patterns based on real DOT datasets:

| Dataset | Agency | Official Source |
|---------|--------|-----------------|
| Rail Equipment Accidents | FRA | [railroads.dot.gov](https://railroads.dot.gov/safety-data) |
| National Bridge Inventory | FHWA | [fhwa.dot.gov/bridge/nbi](https://www.fhwa.dot.gov/bridge/nbi.cfm) |
| National Transit Database | FTA | [transit.dot.gov/ntd](https://www.transit.dot.gov/ntd) |
| FARS | NHTSA | [nhtsa.gov/fars](https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars) |

**Disclaimer**: This demo uses synthetic sample data that follows the structure of real DOT datasets. For official transportation data, please refer to the sources above.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- [U.S. Department of Transportation](https://www.transportation.gov/)
- [Azure Data API Builder](https://github.com/Azure/data-api-builder)
- [Microsoft Learn - DAB Documentation](https://learn.microsoft.com/azure/data-api-builder/)
- [data.transportation.gov](https://data.transportation.gov/) - DOT Open Data Portal
