# 🗄️ DOT Transportation Database

<div align="center">

![Azure SQL](https://img.shields.io/badge/Azure%20SQL-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![Data API Builder](https://img.shields.io/badge/DAB-Ready-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Sample Data](https://img.shields.io/badge/Sample-Data-00C853?style=for-the-badge&logo=database&logoColor=white)

### 📊 SQL scripts for the DOT Transportation Data Portal

[📋 Data Model](#-data-model-overview) • [📦 Tables](#-tables) • [👁️ Views](#-views) • [🚀 Usage](#-usage)

---

[![Record Count](https://img.shields.io/badge/📊_Records-~1,300-blue?style=flat-square)]()
[![Categories](https://img.shields.io/badge/📂_Categories-4-orange?style=flat-square)]()
[![States](https://img.shields.io/badge/🗺️_States-51-green?style=flat-square)]()

</div>

---

## 📖 Overview

This directory contains SQL scripts to initialize the database with a DOT (Department of Transportation) data model and sample data.

> 💡 **Purpose:** Demonstrate Azure Data API Builder capabilities using realistic transportation data patterns based on actual DOT datasets.

---

## 📋 Data Model Overview

### 📂 Categories

| 📂 Category | 🏢 Source | 📝 Description |
|:-----------|:---------|:--------------|
| 🚂 **Railroads** | FRA Form 54 | Federal Railroad Administration accident and incident data |
| 🌉 **Bridges** | NBI | National Bridge Inventory structural condition data |
| 🚌 **Public Transit** | NTD | National Transit Database agency metrics and ridership |
| 🚗 **Automobiles** | FARS | Fatality Analysis Reporting System crash data |

---

## 📊 Schema Diagram

```
┌─────────────────┐
│  📂 Categories  │
└────────┬────────┘
         │ 1:N
         ▼
┌──────────────────┬───────────────┬─────────────────┬───────────────────┐
│ 🚂 Railroad      │ 🌉 Bridges    │ 🚌 Transit      │ 🚗 Vehicle        │
│    Accidents     │               │    Agencies     │    Fatalities     │
└────────┬─────────┴───────┬───────┴────────┬────────┴─────────┬─────────┘
         │                 │                │                  │
         └────────┬────────┴────────────────┴──────────────────┘
                  │ N:1
                  ▼
          ┌───────────────┐
          │  🗺️ States    │
          └───────────────┘
```

---

## 📦 Tables

### 📋 Reference Tables

#### 📂 Categories

Defines the four DOT data categories.

| 📋 Field | 📝 Description |
|:---------|:--------------|
| Id | Primary key |
| Name | Category name |
| Description | Full description |
| Icon | UI icon identifier |
| Color | UI color code |
| SortOrder | Display order |

#### 🗺️ States

US States and DC reference data.

| 📋 Field | 📝 Description |
|:---------|:--------------|
| Id | Primary key |
| Code | 2-letter state code |
| Name | Full state name |
| Region | Geographic region |

---

### 📊 Data Tables

#### 🚂 RailroadAccidents (FRA Form 54)

Railroad equipment accidents and incidents with:

| 📋 Category | 📝 Data Included |
|:-----------|:----------------|
| 🏢 **Railroad Info** | Reporting railroad identification |
| 📅 **When/Where** | Date, time, and location (state, county, milepost) |
| 🚨 **Accident Details** | Accident type (derailment, collision, etc.) |
| 🚂 **Train Details** | Speed, direction, equipment type |
| 🌤️ **Conditions** | Weather and visibility |
| ☣️ **Hazmat** | Hazardous materials information |
| 📊 **Impact** | Casualties and damage amounts |

#### 🌉 Bridges (National Bridge Inventory)

Bridge structural data including:

| 📋 Category | 📝 Data Included |
|:-----------|:----------------|
| 🆔 **Identification** | Structure identification and location |
| 📏 **Physical** | Length, width, lanes |
| 🚗 **Traffic** | Average daily traffic (ADT) |
| 🏗️ **Structure** | Type and materials |
| 📊 **Condition** | Ratings (0-9 scale) |
| ⚠️ **Status** | Structurally deficient/obsolete flags |
| 🔍 **Inspection** | Dates and owner information |

#### 🚌 TransitAgencies (NTD)

Public transit agency metrics:

| 📋 Category | 📝 Data Included |
|:-----------|:----------------|
| 🆔 **Identification** | Agency identification (NTD ID) |
| 📍 **Location** | City and urban area |
| 📊 **Service Metrics** | Ridership, vehicle miles, hours |
| 💰 **Financial** | Expenses, fare revenue |
| 📈 **Performance** | Calculated performance metrics |

#### 🚗 VehicleFatalities (FARS)

Motor vehicle crash fatality data:

| 📋 Category | 📝 Data Included |
|:-----------|:----------------|
| 🆔 **Case Info** | Case identification and location |
| 📅 **Timing** | Date, time, day of week |
| 🚗 **Crash Details** | Collision type, conditions |
| 📊 **Counts** | Vehicle and person counts |
| ⚠️ **Factors** | Contributing factors (alcohol, speed, etc.) |
| 🏙️ **Area** | Rural/Urban classification |

---

## 👁️ Views

| 👁️ View | 📝 Description |
|:--------|:--------------|
| `vw_CategorySummary` | 📊 Record counts by category for dashboard |
| `vw_RailroadAccidentsByState` | 🚂 Accident statistics aggregated by state |
| `vw_BridgeConditionByState` | 🌉 Bridge condition summary by state |
| `vw_TransitSummaryByState` | 🚌 Transit metrics aggregated by state |
| `vw_VehicleFatalitiesByState` | 🚗 Fatality statistics by state and year |

---

## 🚀 Usage

### 📋 Prerequisites

| ✅ Requirement | 📝 Description |
|:--------------|:--------------|
| 🗄️ **Database** | SQL Server 2019+ or Azure SQL Database |
| 🔧 **Tools** | `sqlcmd` utility or SqlServer PowerShell module |

### ▶️ Initialize Database

#### 📜 Using PowerShell Script

```powershell
# 🖥️ Local SQL Server
.\Initialize-Database.ps1 -ServerName "localhost" -DatabaseName "DOTTransportDemo"

# ☁️ Azure SQL Database
.\Initialize-Database.ps1 -ServerName "myserver.database.windows.net" `
                          -DatabaseName "dotdemo" `
                          -Username "admin" `
                          -Password "SecureP@ss"
```

#### 📝 Manual Execution

```sql
-- 1️⃣ Create schema
:r 001-schema.sql

-- 2️⃣ Seed sample data
:r 002-seed-data.sql
```

### ✅ Verify Installation

```sql
-- 📊 Check record counts
SELECT 'Categories' AS TableName, COUNT(*) AS Records FROM Categories
UNION ALL SELECT 'States', COUNT(*) FROM States
UNION ALL SELECT 'RailroadAccidents', COUNT(*) FROM RailroadAccidents
UNION ALL SELECT 'Bridges', COUNT(*) FROM Bridges
UNION ALL SELECT 'TransitAgencies', COUNT(*) FROM TransitAgencies
UNION ALL SELECT 'VehicleFatalities', COUNT(*) FROM VehicleFatalities;
```

### 📊 Expected Output (Approximate)

| 📦 Table | 📊 Records |
|:---------|:----------|
| 📂 Categories | 4 |
| 🗺️ States | 51 |
| 🚂 RailroadAccidents | 300 |
| 🌉 Bridges | 400 |
| 🚌 TransitAgencies | ~150 |
| 🚗 VehicleFatalities | 400 |
| **📊 Total** | **~1,300** |

---

## 📚 Data Sources Reference

The sample data structure is based on real DOT datasets:

| 📊 Dataset | 🏢 Agency | 🔗 URL |
|:----------|:---------|:-------|
| 🚂 Rail Equipment Accidents | FRA | [data.transportation.gov](https://data.transportation.gov) |
| 🌉 National Bridge Inventory | FHWA | [fhwa.dot.gov/bridge/nbi](https://www.fhwa.dot.gov/bridge/nbi.cfm) |
| 🚌 National Transit Database | FTA | [transit.dot.gov/ntd](https://www.transit.dot.gov/ntd) |
| 🚗 FARS | NHTSA | [nhtsa.gov/fars](https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars) |

> ⚠️ **Note:** This demo uses synthetic sample data that follows the structure and patterns of real DOT data. For actual transportation data, please refer to the official sources above.

---

## 🔌 DAB Configuration

The Data API Builder configuration (`src/dab-config/dab-config.json`) exposes these tables via REST and GraphQL:

### 🌐 REST Endpoints

| 📋 Endpoint | 📝 Type |
|:-----------|:-------|
| `GET /api/Category` | 📦 Table |
| `GET /api/State` | 📦 Table |
| `GET /api/RailroadAccident` | 📦 Table |
| `GET /api/Bridge` | 📦 Table |
| `GET /api/TransitAgency` | 📦 Table |
| `GET /api/VehicleFatality` | 📦 Table |
| `GET /api/CategorySummary` | 👁️ View |
| `GET /api/RailroadAccidentsByState` | 👁️ View |
| `GET /api/BridgeConditionByState` | 👁️ View |
| `GET /api/TransitSummaryByState` | 👁️ View |
| `GET /api/VehicleFatalitiesByState` | 👁️ View |

### 💎 GraphQL

All entities are available via GraphQL at `/graphql` with introspection enabled.

**Example query:**
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

---

<div align="center">

### 📚 Related Documentation

[![DAB Configuration](https://img.shields.io/badge/🔌_DAB_Configuration-512BD4?style=for-the-badge)](../../docs/dab-configuration-guide.md)
[![API Reference](https://img.shields.io/badge/📋_API_Reference-10B981?style=for-the-badge)](../../docs/api-reference.md)
[![Setup Guide](https://img.shields.io/badge/🚀_Setup_Guide-0078D4?style=for-the-badge)](../../docs/setup-guide.md)

---

**Made with ❤️ for the Azure community**

</div>
