# DOT Transportation Database

This directory contains SQL scripts to initialize the database with a DOT (Department of Transportation) data model and sample data.

## Data Model Overview

The database is designed to demonstrate Azure Data API Builder capabilities using realistic transportation data patterns based on actual DOT datasets.

### Categories

| Category | Source | Description |
|----------|--------|-------------|
| **Railroads** | FRA Form 54 | Federal Railroad Administration accident and incident data |
| **Bridges** | NBI | National Bridge Inventory structural condition data |
| **Public Transit** | NTD | National Transit Database agency metrics and ridership |
| **Automobiles** | FARS | Fatality Analysis Reporting System crash data |

## Schema Diagram

```
┌─────────────┐
│ Categories  │
└──────┬──────┘
       │ 1:N
       ▼
┌──────────────────┬───────────────┬─────────────────┬───────────────────┐
│ RailroadAccidents│    Bridges    │ TransitAgencies │ VehicleFatalities │
└────────┬─────────┴───────┬───────┴────────┬────────┴─────────┬─────────┘
         │                 │                │                  │
         └────────┬────────┴────────────────┴──────────────────┘
                  │ N:1
                  ▼
          ┌───────────┐
          │  States   │
          └───────────┘
```

## Tables

### Reference Tables

#### Categories
- Defines the four DOT data categories
- Fields: Id, Name, Description, Icon, Color, SortOrder

#### States
- US States and DC reference data
- Fields: Id, Code (2-letter), Name, Region

### Data Tables

#### RailroadAccidents (FRA Form 54)
Railroad equipment accidents and incidents with:
- Reporting railroad identification
- Date, time, and location (state, county, milepost)
- Accident type (derailment, collision, etc.)
- Train details (speed, direction, equipment type)
- Weather and visibility conditions
- Hazmat information
- Casualties and damage amounts

#### Bridges (National Bridge Inventory)
Bridge structural data including:
- Structure identification and location
- Physical characteristics (length, width, lanes)
- Traffic volumes (ADT)
- Structure type and materials
- Condition ratings (0-9 scale)
- Structurally deficient/obsolete flags
- Inspection dates and owner information

#### TransitAgencies (NTD)
Public transit agency metrics:
- Agency identification (NTD ID)
- Location and urban area
- Service metrics (ridership, vehicle miles, hours)
- Financial data (expenses, fare revenue)
- Calculated performance metrics

#### VehicleFatalities (FARS)
Motor vehicle crash fatality data:
- Case identification and location
- Date, time, day of week
- Crash characteristics (collision type, conditions)
- Vehicle and person counts
- Contributing factors (alcohol, speed, etc.)
- Rural/Urban classification

## Views

| View | Description |
|------|-------------|
| `vw_CategorySummary` | Record counts by category for dashboard |
| `vw_RailroadAccidentsByState` | Accident statistics aggregated by state |
| `vw_BridgeConditionByState` | Bridge condition summary by state |
| `vw_TransitSummaryByState` | Transit metrics aggregated by state |
| `vw_VehicleFatalitiesByState` | Fatality statistics by state and year |

## Usage

### Prerequisites

- SQL Server 2019+ or Azure SQL Database
- `sqlcmd` utility or SqlServer PowerShell module

### Initialize Database

```powershell
# Using the PowerShell script
.\Initialize-Database.ps1 -ServerName "localhost" -DatabaseName "DOTTransportDemo"

# Or with SQL authentication
.\Initialize-Database.ps1 -ServerName "myserver.database.windows.net" -DatabaseName "dotdemo" -Username "admin" -Password "SecureP@ss"
```

### Manual Execution

```sql
-- 1. Create schema
:r 001-schema.sql

-- 2. Seed sample data
:r 002-seed-data.sql
```

### Verify Installation

```sql
-- Check record counts
SELECT 'Categories' AS TableName, COUNT(*) AS Records FROM Categories
UNION ALL SELECT 'States', COUNT(*) FROM States
UNION ALL SELECT 'RailroadAccidents', COUNT(*) FROM RailroadAccidents
UNION ALL SELECT 'Bridges', COUNT(*) FROM Bridges
UNION ALL SELECT 'TransitAgencies', COUNT(*) FROM TransitAgencies
UNION ALL SELECT 'VehicleFatalities', COUNT(*) FROM VehicleFatalities;
```

Expected output (approximate):
- Categories: 4
- States: 51
- RailroadAccidents: 300
- Bridges: 400
- TransitAgencies: ~150
- VehicleFatalities: 400

**Total: ~1,300 records**

## Data Sources Reference

The sample data structure is based on real DOT datasets:

| Dataset | Agency | URL |
|---------|--------|-----|
| Rail Equipment Accidents | FRA | [data.transportation.gov](https://data.transportation.gov) |
| National Bridge Inventory | FHWA | [fhwa.dot.gov/bridge/nbi](https://www.fhwa.dot.gov/bridge/nbi.cfm) |
| National Transit Database | FTA | [transit.dot.gov/ntd](https://www.transit.dot.gov/ntd) |
| FARS | NHTSA | [nhtsa.gov/fars](https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars) |

**Note:** This demo uses synthetic sample data that follows the structure and patterns of real DOT data. For actual transportation data, please refer to the official sources above.

## DAB Configuration

The Data API Builder configuration (`src/dab-config/dab-config.json`) exposes these tables via REST and GraphQL:

### REST Endpoints
- `GET /api/Category`
- `GET /api/State`
- `GET /api/RailroadAccident`
- `GET /api/Bridge`
- `GET /api/TransitAgency`
- `GET /api/VehicleFatality`
- `GET /api/CategorySummary` (view)
- `GET /api/RailroadAccidentsByState` (view)
- `GET /api/BridgeConditionByState` (view)
- `GET /api/TransitSummaryByState` (view)
- `GET /api/VehicleFatalitiesByState` (view)

### GraphQL
All entities are available via GraphQL at `/graphql` with introspection enabled.

Example query:
```graphql
{
  categories {
    items {
      id
      name
      description
      railroadAccidents {
        items {
          id
          accidentType
          accidentDate
        }
      }
    }
  }
}
```
