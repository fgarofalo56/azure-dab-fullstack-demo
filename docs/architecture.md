# Architecture Documentation

<div align="center">

![Azure](https://img.shields.io/badge/Microsoft%20Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![Container Apps](https://img.shields.io/badge/Container%20Apps-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Data API Builder](https://img.shields.io/badge/Data%20API%20Builder-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**System Architecture & Design Documentation**

</div>

This document provides a comprehensive overview of the DOT Transportation Data Portal architecture, including system components, data flow, and design decisions.

> **Visual Diagrams**: Interactive Excalidraw diagrams with official Azure icons are available in the [`assets/`](../assets/) folder. Open `.excalidraw` files in VS Code (with Excalidraw extension) or at [excalidraw.com](https://excalidraw.com) for detailed visual representations.

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
- [Auto-Scaling Architecture](#auto-scaling-architecture)
- [Design Decisions](#design-decisions)

---

## System Overview

The DOT Transportation Data Portal is a full-stack web application that demonstrates Azure Data API Builder capabilities using realistic Department of Transportation data patterns.

### Key Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Edge** | Azure Front Door | Global HTTPS load balancer with managed SSL |
| **Frontend** | React 18, TypeScript, Tailwind CSS | User interface |
| **API** | Azure Data API Builder | REST & GraphQL APIs |
| **Database** | Azure SQL Database | Data persistence |
| **Authentication** | Microsoft Entra ID | Identity management |
| **Hosting** | Azure Container Apps | Auto-scaling container runtime |
| **Registry** | Azure Container Registry | Container images |
| **Telemetry** | Application Insights | APM and distributed tracing |
| **Monitoring** | Log Analytics Workspace | Centralized logging & diagnostics |
| **IaC** | Bicep | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Automated deployment pipeline |

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Internet["Internet"]
        User["User<br/>Web Browser"]
    end

    subgraph Azure["Azure Cloud"]
        subgraph Edge["Edge Services"]
            FrontDoor["Azure Front Door<br/>Global Load Balancer<br/>Managed SSL/TLS"]
        end

        subgraph RG["Resource Group: rg-dot-demo"]
            subgraph CAE["Container Apps Environment"]
                Frontend["Frontend<br/>React + Nginx<br/>(Container App)"]
                DAB["Data API Builder<br/>REST + GraphQL<br/>(Container App)"]
            end

            subgraph Data["Data Layer"]
                SQL[("Azure SQL<br/>Database<br/>DOT Data")]
            end

            subgraph Registry["Container Registry"]
                ACR["Azure Container<br/>Registry<br/>Images"]
            end
        end

        subgraph Monitoring["Monitoring"]
            AppInsights["Application<br/>Insights<br/>APM"]
            LAW["Log Analytics<br/>Workspace<br/>Diagnostics"]
        end

        subgraph Identity["Identity"]
            EntraID["Microsoft<br/>Entra ID<br/>Authentication"]
        end
    end

    User -->|HTTPS| FrontDoor
    FrontDoor -->|"Route: /"| Frontend
    FrontDoor -->|"Route: /api/*"| DAB
    Frontend -->|REST/GraphQL| DAB
    DAB -->|SQL TDS| SQL
    Frontend -.->|Auth| EntraID
    DAB -.->|JWT Validation| EntraID
    ACR -.->|Pull Images| Frontend
    ACR -.->|Pull Images| DAB
    Frontend -.->|Telemetry| AppInsights
    DAB -.->|Telemetry| AppInsights
    SQL -.->|Diagnostics| LAW
    ACR -.->|Events| LAW
    FrontDoor -.->|Access Logs| LAW

    style Azure fill:#e3f2fd
    style Edge fill:#ffe6e8
    style RG fill:#bbdefb
    style CAE fill:#c8e6c9
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
| **Read** | GET | Query |
| **Create** | POST | Mutation |
| **Update** | PUT/PATCH | Mutation |
| **Delete** | DELETE | Mutation |
| **Filter** | OData $filter | Filter argument |
| **Sort** | OData $orderby | OrderBy argument |
| **Paginate** | $top/$skip | first/after |
| **Relationships** | $expand | Nested queries |

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
        Attacker["Attacker"]
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
    Attacker -->|Blocked| WAF
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
| **Transport** | Encryption | TLS 1.2+ everywhere (Container Apps native HTTPS) |
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
        subgraph Edge["Edge Services"]
            FrontDoor["Azure Front Door<br/>Standard SKU"]
            FDEndpoint["Front Door Endpoint<br/>HTTPS with managed cert"]
        end

        subgraph RG["Resource Group"]
            subgraph CAE["Container Apps Environment"]
                CA1["Container App: DAB<br/>1 vCPU, 2GB<br/>Scale: 0-10"]
                CA2["Container App: Frontend<br/>0.5 vCPU, 1GB<br/>Scale: 0-10"]
            end

            subgraph Storage["Storage"]
                ACR["Container Registry<br/>Basic SKU"]
                StorageAcc["Storage Account<br/>Standard LRS"]
            end

            subgraph Database["Database"]
                SQLServer["SQL Server"]
                SQLDB["SQL Database<br/>Basic DTU"]
            end

            subgraph Observability["Monitoring"]
                AppInsights["Application Insights"]
                LAW["Log Analytics<br/>Workspace"]
            end
        end
    end

    subgraph EntraID["Microsoft Entra ID"]
        AppReg1["App: DAB API"]
        AppReg2["App: Frontend"]
    end

    FrontDoor --> FDEndpoint
    FDEndpoint -->|"Route: /"| CA2
    FDEndpoint -->|"Route: /api/*"| CA1
    CA1 --> SQLDB
    ACR --> CA1
    ACR --> CA2
    SQLServer --> SQLDB
    CA1 -.-> AppReg1
    CA2 -.-> AppReg2
    CA1 -.-> AppInsights
    CA2 -.-> AppInsights
    AppInsights -.-> LAW
    SQLDB -.-> LAW
    ACR -.-> LAW
```

### Container Architecture

```mermaid
graph TB
    subgraph ACR["Azure Container Registry"]
        DABImage["dab:latest<br/>~150MB"]
        FrontendImage["frontend:latest<br/>~25MB"]
    end

    subgraph CADAB["Container App: DAB"]
        DABContainer["DAB Container<br/>mcr.microsoft.com/azure-databases/data-api-builder"]
        DABSecrets["Secrets<br/>CONNECTION_STRING"]
        DABEnv["Environment Variables<br/>CLIENT_ID<br/>TENANT_ID<br/>APP_INSIGHTS"]
    end

    subgraph CAFrontend["Container App: Frontend"]
        NginxContainer["Nginx Container<br/>nginx:alpine"]
        StaticFiles["React build output<br/>/usr/share/nginx/html"]
    end

    DABImage --> DABContainer
    FrontendImage --> NginxContainer
    DABSecrets --> DABContainer
    DABEnv --> DABContainer
    StaticFiles --> NginxContainer
```

---

## Auto-Scaling Architecture

Container Apps provide HTTP-based auto-scaling with scale-to-zero capability.

```mermaid
flowchart LR
    subgraph Traffic["Incoming Traffic"]
        R1["Request 1"]
        R2["Request 2"]
        RN["Request N"]
    end

    subgraph CAE["Container Apps Environment"]
        subgraph Scaler["KEDA Scaler"]
            HTTPScaler["HTTP Scaler<br/>threshold: 100"]
        end

        subgraph Replicas["Container Replicas"]
            Rep0["Replica 0<br/>(always on if min=1)"]
            Rep1["Replica 1<br/>(scaled up)"]
            RepN["Replica N<br/>(max=10)"]
        end
    end

    subgraph Metrics["Metrics"]
        Requests["Concurrent<br/>Requests"]
        Count["Active<br/>Replicas"]
    end

    R1 --> HTTPScaler
    R2 --> HTTPScaler
    RN --> HTTPScaler

    HTTPScaler --> Rep0
    HTTPScaler --> Rep1
    HTTPScaler --> RepN

    HTTPScaler -.-> Requests
    Replicas -.-> Count
```

### Scaling Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `minReplicas` | 0 | Minimum replicas (0 = scale to zero) |
| `maxReplicas` | 10 | Maximum replicas |
| `httpScaleThreshold` | 100 | Concurrent requests to trigger scale |

### Scale-to-Zero Behavior

1. **Idle Detection**: No requests for ~5 minutes
2. **Scale Down**: Replicas reduced to 0
3. **Cold Start**: First request triggers container start (~2-5 seconds)
4. **Warm Up**: Subsequent requests served immediately

For production workloads requiring instant response, set `minReplicas=1`.

---

## Monitoring Architecture

All resources are configured with diagnostic settings that send logs and metrics to a centralized Log Analytics workspace, plus Application Insights for APM.

```mermaid
flowchart TB
    subgraph Resources["Azure Resources"]
        ACR["Container Registry"]
        CA1["Container App: DAB"]
        CA2["Container App: Frontend"]
        SQL["SQL Database"]
    end

    subgraph Monitoring["Monitoring"]
        AppInsights["Application Insights"]
        LAW["Log Analytics<br/>Workspace"]

        subgraph Tables["Log Tables"]
            AppRequests["requests<br/>dependencies<br/>exceptions"]
            ContainerLogs["ContainerAppConsoleLogs_CL"]
            AzureDiag["AzureDiagnostics"]
            ContainerReg["ContainerRegistryRepositoryEvents"]
        end
    end

    subgraph Analysis["Analysis & Alerting"]
        Workbooks["Azure Workbooks"]
        Alerts["Azure Monitor Alerts"]
        Dashboards["Dashboards"]
    end

    CA1 -->|"Telemetry"| AppInsights
    CA2 -->|"Telemetry"| AppInsights
    AppInsights -->|"APM Data"| AppRequests

    ACR -->|"Registry events"| ContainerReg
    CA1 -->|"Console logs"| ContainerLogs
    CA2 -->|"Console logs"| ContainerLogs
    SQL -->|"Query insights, errors"| AzureDiag

    AppRequests --> LAW
    ContainerLogs --> LAW
    AzureDiag --> LAW
    ContainerReg --> LAW

    LAW --> Workbooks
    LAW --> Alerts
    LAW --> Dashboards
```

### Diagnostic Settings by Resource

| Resource | Log Categories | Metrics |
|----------|---------------|---------|
| **Container Registry** | ContainerRegistryRepositoryEvents, ContainerRegistryLoginEvents | AllMetrics |
| **SQL Database** | SQLInsights, AutomaticTuning, QueryStoreRuntimeStatistics, Errors, Deadlocks, Timeouts, Blocks | Basic, InstanceAndAppAdvanced |
| **Container Apps** | Console logs via environment configuration | Via App Insights |
| **Application Insights** | requests, dependencies, exceptions, traces | Performance counters |

### Key Queries

```kusto
// Application Insights - Failed requests
requests
| where success == false
| summarize count() by name, resultCode
| order by count_ desc

// Container App console logs
ContainerAppConsoleLogs_CL
| where ContainerAppName_s contains "dab"
| where Log_s contains "error" or Log_s contains "fail"
| project TimeGenerated, Log_s

// SQL slow queries
AzureDiagnostics
| where Category == "QueryStoreRuntimeStatistics"
| where duration_d > 1000  // queries > 1 second
| project TimeGenerated, query_hash_s, duration_d

// Container App replica count over time
ContainerAppSystemLogs_CL
| where Reason_s == "ScaledUp" or Reason_s == "ScaledDown"
| project TimeGenerated, ContainerAppName_s, Reason_s, Count_d
```

---

## Design Decisions

### Why Azure Container Apps?

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Container Apps** | Auto-scaling, scale-to-zero, native HTTPS, simple | Regional availability | Best for this use case |
| **ACI** | Simple, serverless | No auto-scaling, no scale-to-zero | Previous implementation |
| **AKS** | Full control, enterprise features | Complex, higher cost | For advanced scenarios |
| **App Service** | Managed, easy | Less container flexibility | Alternative |

**Decision:** Container Apps provides the best balance of simplicity and features for containerized workloads with auto-scaling requirements.

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
| **Bicep** | Yes | Low | Built-in |
| **Terraform** | Provider | Medium | External |
| **ARM** | Yes | High | Built-in |

**Decision:** Bicep offers native Azure support with simpler syntax than ARM templates.

---

## Scalability Summary

### Current Implementation

| Feature | Status | Notes |
|---------|--------|-------|
| **Auto-Scaling** | Implemented | HTTP-based, 0-10 replicas |
| **Scale-to-Zero** | Implemented | Cost savings when idle |
| **Load Balancing** | Implemented | Azure Front Door |
| **APM** | Implemented | Application Insights |
| **Monitoring** | Implemented | Log Analytics |
| **Native HTTPS** | Implemented | Container Apps built-in |
| **Database** | Basic SQL tier | 5 DTUs (sufficient for demo) |

### Production Recommendations

For production workloads:

| Enhancement | Purpose | When to Consider |
|-------------|---------|------------------|
| **minReplicas=1** | Avoid cold starts | Always-on requirement |
| **Azure CDN** | Cache static assets | High traffic, global users |
| **Redis Cache** | Reduce database load | Frequent repeated queries |
| **SQL Premium** | Higher DTUs, geo-replication | Production SLAs required |
| **Private Endpoints** | Network isolation | Security requirements |

---

## References

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Data API Builder Documentation](https://learn.microsoft.com/azure/data-api-builder/)
- [Azure SQL Database Documentation](https://learn.microsoft.com/azure/azure-sql/)
- [Microsoft Entra ID Documentation](https://learn.microsoft.com/azure/active-directory/)
- [Application Insights Documentation](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
