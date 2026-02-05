# Architecture Documentation

This document provides a comprehensive overview of the DOT Transportation Data Portal architecture, including system components, data flow, and design decisions.

---

## Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Component Details](#component-details)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Database Schema](#database-schema)
- [API Architecture](#api-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Design Decisions](#design-decisions)

---

## System Overview

The DOT Transportation Data Portal is a full-stack web application that demonstrates Azure Data API Builder capabilities using realistic Department of Transportation data patterns.

### Key Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, TypeScript, Tailwind CSS | User interface |
| **API** | Azure Data API Builder | REST & GraphQL APIs |
| **Database** | Azure SQL Database | Data persistence |
| **Authentication** | Microsoft Entra ID | Identity management |
| **Hosting** | Azure Container Instances | Container runtime |
| **Registry** | Azure Container Registry | Container images |
| **Monitoring** | Log Analytics Workspace | Centralized logging & diagnostics |
| **IaC** | Bicep | Infrastructure as Code |

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Internet["Internet"]
        User["👤 User<br/>Web Browser"]
    end

    subgraph Azure["Azure Cloud"]
        subgraph RG["Resource Group: rg-dot-demo"]
            subgraph Compute["Compute Layer"]
                Frontend["🖥️ Frontend<br/>React + Nginx<br/>(ACI)"]
                DAB["⚡ Data API Builder<br/>REST + GraphQL<br/>(ACI)"]
            end

            subgraph Data["Data Layer"]
                SQL[("💾 Azure SQL<br/>Database<br/>DOT Data")]
                Storage["📁 Azure Storage<br/>File Share"]
            end

            subgraph Registry["Container Registry"]
                ACR["📦 Azure Container<br/>Registry<br/>Images"]
            end
        end

        subgraph Monitoring["Monitoring"]
            LAW["📊 Log Analytics<br/>Workspace<br/>Diagnostics"]
        end

        subgraph Identity["Identity"]
            EntraID["🔐 Microsoft<br/>Entra ID<br/>Authentication"]
        end
    end

    User -->|HTTPS| Frontend
    Frontend -->|REST/GraphQL| DAB
    DAB -->|SQL TDS| SQL
    DAB -.->|Config| Storage
    Frontend -.->|Auth| EntraID
    DAB -.->|JWT Validation| EntraID
    ACR -.->|Pull Images| Frontend
    ACR -.->|Pull Images| DAB
    Frontend -.->|Logs| LAW
    DAB -.->|Logs| LAW
    SQL -.->|Diagnostics| LAW
    ACR -.->|Events| LAW

    style Azure fill:#e3f2fd
    style RG fill:#bbdefb
    style Compute fill:#c8e6c9
    style Data fill:#fff3e0
    style Identity fill:#f3e5f5
    style Monitoring fill:#e8f5e9
```

---

## Component Details

### Frontend Application

```mermaid
graph TB
    subgraph Frontend["React Frontend"]
        App[App.tsx]

        subgraph Auth["Authentication"]
            MSAL[MSAL Provider]
            AuthWrapper[Auth Wrapper]
        end

        subgraph Pages["Pages/Views"]
            Login[Login Page]
            Dashboard[Dashboard]
            DataViews[Data Views]
        end

        subgraph Components["Components"]
            ErrorBoundary[Error Boundary]
            Pagination[Pagination]
            GraphQLExplorer[GraphQL Explorer]
            DataTables[Data Tables]
        end

        subgraph State["State Management"]
            ReactQuery[React Query]
            LocalState[Local State]
        end
    end

    App --> Auth
    Auth --> Pages
    Pages --> Components
    Components --> State
    State -->|API Calls| DAB["DAB API"]
```

#### Key Features

| Feature | Implementation | Description |
|---------|----------------|-------------|
| **Authentication** | MSAL.js | Azure AD integration |
| **Data Fetching** | React Query | Caching, refetching, pagination |
| **Error Handling** | Error Boundaries | Graceful error recovery |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Routing** | React Router | SPA navigation |

### Data API Builder

```mermaid
graph LR
    subgraph Clients
        REST[REST Client]
        GQL[GraphQL Client]
    end

    subgraph DAB["Data API Builder"]
        subgraph Endpoints
            RestAPI["/api/*<br/>REST Endpoints"]
            GraphQLAPI["/graphql<br/>GraphQL Endpoint"]
        end

        subgraph Middleware
            Auth[JWT Authentication]
            CORS[CORS Handler]
            Logging[Request Logging]
        end

        subgraph Engine
            OData[OData Parser]
            GQLEngine[GraphQL Engine]
            QueryBuilder[SQL Query Builder]
        end
    end

    subgraph Database
        SQL[(Azure SQL)]
    end

    REST --> RestAPI
    GQL --> GraphQLAPI
    RestAPI --> Auth
    GraphQLAPI --> Auth
    Auth --> CORS
    CORS --> OData
    CORS --> GQLEngine
    OData --> QueryBuilder
    GQLEngine --> QueryBuilder
    QueryBuilder --> SQL
```

#### API Capabilities

| Capability | REST | GraphQL |
|------------|------|---------|
| **Read** | ✅ GET | ✅ Query |
| **Create** | ✅ POST | ✅ Mutation |
| **Update** | ✅ PUT/PATCH | ✅ Mutation |
| **Delete** | ✅ DELETE | ✅ Mutation |
| **Filter** | ✅ OData $filter | ✅ Filter argument |
| **Sort** | ✅ OData $orderby | ✅ OrderBy argument |
| **Paginate** | ✅ $top/$skip | ✅ first/after |
| **Relationships** | ✅ $expand | ✅ Nested queries |

---

## Data Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant EntraID as Microsoft Entra ID
    participant DAB as Data API Builder
    participant SQL as Azure SQL

    User->>Frontend: Click "Sign in"
    Frontend->>EntraID: Redirect to login
    EntraID->>User: Show login form
    User->>EntraID: Enter credentials
    EntraID->>EntraID: Validate credentials
    EntraID->>Frontend: Return ID token + Access token
    Frontend->>Frontend: Store tokens (session)
    Frontend->>DAB: API request + Bearer token
    DAB->>EntraID: Validate JWT
    EntraID-->>DAB: Token valid
    DAB->>SQL: Execute query
    SQL-->>DAB: Return data
    DAB-->>Frontend: JSON response
    Frontend-->>User: Display data
```

### Data Request Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant DAB as Data API Builder
    participant SQL as Azure SQL

    Frontend->>DAB: GET /api/Bridge?$top=25&$filter=...

    activate DAB
    DAB->>DAB: Parse OData query
    DAB->>DAB: Build SQL query
    DAB->>SQL: SELECT TOP 25 * FROM Bridges WHERE ...

    activate SQL
    SQL-->>DAB: Result set
    deactivate SQL

    DAB->>DAB: Serialize to JSON
    DAB-->>Frontend: { "value": [...], "@odata.count": 400 }
    deactivate DAB

    Frontend->>Frontend: Update React Query cache
    Frontend->>Frontend: Render data table
```

---

## Security Architecture

```mermaid
flowchart TB
    subgraph External
        User["User"]
        Attacker["🚫 Attacker"]
    end

    subgraph Perimeter["Security Perimeter"]
        WAF["Web Application<br/>Firewall (optional)"]
        NSG["Network Security<br/>Groups"]
    end

    subgraph AppLayer["Application Layer"]
        subgraph Frontend["Frontend"]
            SPA["SPA Security"]
            CSP["Content Security Policy"]
            XSS["XSS Protection"]
        end

        subgraph API["API Layer"]
            JWT["JWT Validation"]
            RBAC["Role-Based Access"]
            RLS["Row-Level Security"]
        end
    end

    subgraph DataLayer["Data Layer"]
        Encryption["Encryption at Rest"]
        TLS["TLS in Transit"]
        Firewall["SQL Firewall"]
    end

    User -->|HTTPS| WAF
    Attacker -->|❌| WAF
    WAF --> NSG
    NSG --> Frontend
    Frontend --> JWT
    JWT --> RBAC
    RBAC --> RLS
    RLS --> Encryption
    Encryption --> Firewall
```

### Security Layers

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **Network** | DDoS, Firewall | Azure DDoS, NSG, SQL Firewall |
| **Transport** | Encryption | TLS 1.2+ everywhere |
| **Authentication** | Identity | Microsoft Entra ID + JWT |
| **Authorization** | Access Control | DAB permissions, database RLS |
| **Application** | Input Validation | Strict request parsing |
| **Data** | Encryption | Azure SQL TDE |

---

## Database Schema

```mermaid
erDiagram
    Categories ||--o{ RailroadAccidents : contains
    Categories ||--o{ Bridges : contains
    Categories ||--o{ TransitAgencies : contains
    Categories ||--o{ VehicleFatalities : contains

    States ||--o{ RailroadAccidents : location
    States ||--o{ Bridges : location
    States ||--o{ TransitAgencies : location
    States ||--o{ VehicleFatalities : location

    Categories {
        int Id PK
        string Name
        string Description
        string Icon
        string Color
        int SortOrder
        bool IsActive
    }

    States {
        int Id PK
        char(2) Code
        string Name
        string Region
    }

    RailroadAccidents {
        int Id PK
        int CategoryId FK
        int StateId FK
        string ReportingRailroadName
        date AccidentDate
        string AccidentType
        int TotalKilled
        int TotalInjured
        decimal TotalDamage
    }

    Bridges {
        int Id PK
        int CategoryId FK
        int StateId FK
        string StructureNumber
        int YearBuilt
        string OverallCondition
        bool StructurallyDeficient
        int AverageDailyTraffic
    }

    TransitAgencies {
        int Id PK
        int CategoryId FK
        int StateId FK
        string NtdId
        string AgencyName
        string City
        bigint UnlinkedPassengerTrips
        decimal TotalOperatingExpenses
    }

    VehicleFatalities {
        int Id PK
        int CategoryId FK
        int StateId FK
        string CaseNumber
        date CrashDate
        int NumberOfFatalities
        string MannerOfCollision
        bool InvolvesSpeedRelated
    }
```

---

## API Architecture

### REST Endpoints

```mermaid
graph LR
    subgraph REST["REST API (/api)"]
        subgraph Tables["Table Endpoints"]
            GET_Cat["GET /Category"]
            GET_State["GET /State"]
            GET_RR["GET /RailroadAccident"]
            GET_Bridge["GET /Bridge"]
            GET_Transit["GET /TransitAgency"]
            GET_Vehicle["GET /VehicleFatality"]
        end

        subgraph Views["View Endpoints"]
            GET_CS["GET /CategorySummary"]
            GET_RRAS["GET /RailroadAccidentsByState"]
            GET_BCS["GET /BridgeConditionByState"]
            GET_TSS["GET /TransitSummaryByState"]
            GET_VFS["GET /VehicleFatalitiesByState"]
        end
    end

    subgraph OData["OData Features"]
        Filter["$filter"]
        OrderBy["$orderby"]
        Top["$top"]
        Skip["$skip"]
        Select["$select"]
        Count["$count"]
    end

    Tables --> OData
    Views --> OData
```

### GraphQL Schema

```mermaid
graph TB
    subgraph Schema["GraphQL Schema"]
        Query["Query"]

        Query --> categories
        Query --> states
        Query --> bridges
        Query --> railroadAccidents
        Query --> transitAgencies
        Query --> vehicleFatalities

        subgraph Types["Types"]
            Category["Category"]
            State["State"]
            Bridge["Bridge"]
            RailroadAccident["RailroadAccident"]
            TransitAgency["TransitAgency"]
            VehicleFatality["VehicleFatality"]
        end

        categories --> Category
        states --> State
        bridges --> Bridge
        railroadAccidents --> RailroadAccident
        transitAgencies --> TransitAgency
        vehicleFatalities --> VehicleFatality

        Bridge --> State
        RailroadAccident --> State
        TransitAgency --> State
        VehicleFatality --> State
    end
```

---

## Deployment Architecture

### Azure Resources

```mermaid
graph TB
    subgraph Subscription["Azure Subscription"]
        subgraph RG["Resource Group"]
            subgraph Network["Networking"]
                PIP1["Public IP<br/>DAB"]
                PIP2["Public IP<br/>Frontend"]
            end

            subgraph Containers["Container Instances"]
                ACI1["ACI: DAB<br/>1 vCPU, 1.5GB"]
                ACI2["ACI: Frontend<br/>0.5 vCPU, 0.5GB"]
            end

            subgraph Storage["Storage"]
                ACR["Container Registry<br/>Basic SKU"]
                StorageAcc["Storage Account<br/>Standard LRS"]
                FileShare["File Share<br/>dab-config"]
            end

            subgraph Database["Database"]
                SQLServer["SQL Server"]
                SQLDB["SQL Database<br/>Basic DTU"]
            end
        end
    end

    subgraph EntraID["Microsoft Entra ID"]
        AppReg1["App: DAB API"]
        AppReg2["App: Frontend"]
    end

    PIP1 --> ACI1
    PIP2 --> ACI2
    ACI1 --> SQLDB
    ACI1 --> FileShare
    ACR --> ACI1
    ACR --> ACI2
    StorageAcc --> FileShare
    SQLServer --> SQLDB
    ACI1 -.-> AppReg1
    ACI2 -.-> AppReg2
```

### Container Architecture

```mermaid
graph TB
    subgraph ACR["Azure Container Registry"]
        DABImage["dab:latest<br/>~150MB"]
        FrontendImage["frontend:latest<br/>~25MB"]
    end

    subgraph ACIDAB["ACI: DAB"]
        DABContainer["DAB Container<br/>mcr.microsoft.com/azure-databases/data-api-builder"]
        DABConfig["Volume: /app/config<br/>dab-config.json"]
        DABEnv["Environment Variables<br/>CONNECTION_STRING<br/>CLIENT_ID<br/>TENANT_ID"]
    end

    subgraph ACIFrontend["ACI: Frontend"]
        NginxContainer["Nginx Container<br/>nginx:alpine"]
        StaticFiles["Volume: /usr/share/nginx/html<br/>React build output"]
    end

    DABImage --> DABContainer
    FrontendImage --> NginxContainer
    DABConfig --> DABContainer
    DABEnv --> DABContainer
    StaticFiles --> NginxContainer
```

---

## Monitoring Architecture

All resources are configured with diagnostic settings that send logs and metrics to a centralized Log Analytics workspace.

```mermaid
flowchart TB
    subgraph Resources["Azure Resources"]
        ACR["Container Registry"]
        ACI1["ACI: DAB"]
        ACI2["ACI: Frontend"]
        SQL["SQL Database"]
        Storage["Storage Account"]
    end

    subgraph Monitoring["Monitoring"]
        LAW["Log Analytics<br/>Workspace"]

        subgraph Tables["Log Tables"]
            ContainerLogs["ContainerInstanceLog_CL"]
            AzureDiag["AzureDiagnostics"]
            ContainerReg["ContainerRegistryRepositoryEvents"]
            StorageLogs["StorageBlobLogs<br/>StorageFileLogs"]
        end
    end

    subgraph Analysis["Analysis & Alerting"]
        Workbooks["Azure Workbooks"]
        Alerts["Azure Monitor Alerts"]
        Dashboards["Dashboards"]
    end

    ACR -->|"Registry events"| ContainerReg
    ACI1 -->|"Container logs"| ContainerLogs
    ACI2 -->|"Container logs"| ContainerLogs
    SQL -->|"Query insights, errors"| AzureDiag
    Storage -->|"Access logs"| StorageLogs

    ContainerLogs --> LAW
    AzureDiag --> LAW
    ContainerReg --> LAW
    StorageLogs --> LAW

    LAW --> Workbooks
    LAW --> Alerts
    LAW --> Dashboards
```

### Diagnostic Settings by Resource

| Resource | Log Categories | Metrics |
|----------|---------------|---------|
| **Container Registry** | ContainerRegistryRepositoryEvents, ContainerRegistryLoginEvents | AllMetrics |
| **SQL Database** | SQLInsights, AutomaticTuning, QueryStoreRuntimeStatistics, Errors, Deadlocks, Timeouts, Blocks | Basic, InstanceAndAppAdvanced |
| **Storage Account** | StorageBlobLogs, StorageFileLogs | Transaction |
| **Container Instances** | ContainerInstanceLogs (via Log Analytics integration) | - |

### Key Queries

```kusto
// DAB container startup and errors
ContainerInstanceLog_CL
| where ContainerGroup_s contains "dab"
| where Message contains "error" or Message contains "fail"
| project TimeGenerated, Message

// SQL slow queries
AzureDiagnostics
| where Category == "QueryStoreRuntimeStatistics"
| where duration_d > 1000  // queries > 1 second
| project TimeGenerated, query_hash_s, duration_d

// Container restart events
ContainerInstanceLog_CL
| where Message contains "Starting"
| summarize RestartCount = count() by bin(TimeGenerated, 1h), ContainerGroup_s
```

---

## Design Decisions

### Why Azure Container Instances?

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **ACI** | Simple, serverless, low cost | Limited scaling | ✅ Best for demo |
| **AKS** | Scalable, production-ready | Complex, higher cost | For production |
| **App Service** | Managed, easy | Less container flexibility | Alternative |

### Why Data API Builder?

| Approach | Development Time | Flexibility | Maintenance |
|----------|------------------|-------------|-------------|
| **Custom API** | Weeks | High | High |
| **DAB** | Hours | Medium | Low |
| **Direct SQL** | N/A | Low | N/A |

**Decision:** DAB provides the best balance for rapid development with sufficient flexibility.

### Why Bicep over Terraform?

| Tool | Azure Native | Learning Curve | State Management |
|------|--------------|----------------|------------------|
| **Bicep** | ✅ Yes | Low | Built-in |
| **Terraform** | ❌ Provider | Medium | External |
| **ARM** | ✅ Yes | High | Built-in |

**Decision:** Bicep offers native Azure support with simpler syntax than ARM templates.

---

## Scalability Considerations

### Current Limitations (Demo)

- Single ACI instances (no load balancing)
- Basic SQL tier (5 DTUs)
- No auto-scaling
- No CDN for static assets

### Production Recommendations

```mermaid
graph TB
    subgraph Production["Production Architecture"]
        CDN["Azure CDN"]
        FrontDoor["Azure Front Door"]
        AKS["Azure Kubernetes Service"]
        SQLHA["SQL Database<br/>Premium/Hyperscale"]
        Redis["Azure Redis Cache"]
        AppInsights["Application Insights"]
    end

    CDN --> FrontDoor
    FrontDoor --> AKS
    AKS --> SQLHA
    AKS --> Redis
    AKS --> AppInsights
```

---

## References

- [Azure Data API Builder Documentation](https://learn.microsoft.com/azure/data-api-builder/)
- [Azure Container Instances Documentation](https://learn.microsoft.com/azure/container-instances/)
- [Azure SQL Database Documentation](https://learn.microsoft.com/azure/azure-sql/)
- [Microsoft Entra ID Documentation](https://learn.microsoft.com/azure/active-directory/)
