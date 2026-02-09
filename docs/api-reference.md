# 📋 API Reference

<div align="center">

![REST API](https://img.shields.io/badge/REST-API-10B981?style=for-the-badge&logo=fastapi&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![DAB](https://img.shields.io/badge/Data%20API%20Builder-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)

### 📚 Complete API documentation for the DOT Transportation Data Portal

[🔐 Authentication](#-authentication) • [🌐 REST API](#-rest-api) • [💎 GraphQL](#-graphql-api) • [❌ Errors](#-error-codes)

---

[![OData](https://img.shields.io/badge/📊_OData-Query_Support-00C853?style=flat-square)]()
[![Documentation](https://img.shields.io/badge/📚_DAB_Docs-0078D4?style=flat-square)](https://learn.microsoft.com/en-us/azure/data-api-builder/)
[![Interactive](https://img.shields.io/badge/🧪_GraphQL-Playground-E10098?style=flat-square)]()

</div>

---

## 📑 Table of Contents

| # | 📍 Section | 📝 Description |
|:-:|:----------|:--------------|
| 1 | [📖 Overview](#-overview) | API capabilities |
| 2 | [🔐 Authentication](#-authentication) | Azure AD tokens |
| 3 | [🔗 Base URLs](#-base-urls) | Endpoint URLs |
| 4 | [🌐 REST API](#-rest-api) | OData query parameters |
| 5 | [💎 GraphQL API](#-graphql-api) | GraphQL queries/mutations |
| 6 | [❌ Error Codes](#-error-codes) | HTTP status codes |
| 7 | [⏱️ Rate Limiting](#-rate-limiting) | Request limits |

---

## 📖 Overview

This API provides access to DOT transportation data through Azure Data API Builder (DAB). Both REST and GraphQL interfaces are available.

### ✨ Key Features

| ✨ Feature | 📝 Description |
|:----------|:--------------|
| 🌐 **RESTful API** | OData-style query parameters |
| 💎 **GraphQL API** | Flexible data queries |
| 🔐 **Azure AD auth** | Secure access |
| ⚡ **Real-time data** | From Azure SQL Database |

---

## 🔐 Authentication

> 🔒 All API requests require a valid Azure AD Bearer token.

### 🔑 Obtaining a Token

```javascript
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: 'YOUR_FRONTEND_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
    redirectUri: window.location.origin,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

// 🔐 Request token
const tokenResponse = await msalInstance.acquireTokenSilent({
  scopes: ['api://YOUR_DAB_CLIENT_ID/.default'],
  account: msalInstance.getAllAccounts()[0],
});

const accessToken = tokenResponse.accessToken;
```

### 📤 Using the Token

Include the token in the `Authorization` header:

```http
GET /api/Category HTTP/1.1
Host: your-app.azurefd.net
Authorization: Bearer eyJ0eXAiOiJKV1QiLC...
Content-Type: application/json
```

---

## 🔗 Base URLs

| 🌍 Environment | 🌐 REST API | 💎 GraphQL |
|:--------------|:-----------|:----------|
| 🏭 Production | `https://your-app.azurefd.net/api` | `https://your-app.azurefd.net/graphql` |
| 🧪 Development | `http://localhost:5000/api` | `http://localhost:5000/graphql` |

---

## 🌐 REST API

### 📊 Query Parameters

DAB supports the following OData-style query parameters:

| 📋 Parameter | 📝 Description | 💡 Example |
|:------------|:--------------|:----------|
| `$first` | Limit number of results | `$first=10` |
| `$after` | Cursor for pagination (base64) | `$after=eyJJZCI6MTB9` |
| `$filter` | Filter expression | `$filter=StateId eq 48` |
| `$orderby` | Sort order | `$orderby=AccidentDate desc` |
| `$select` | Select specific fields | `$select=Id,Name` |

> 📝 **Note:** DAB uses `$first` instead of `$top` and cursor-based pagination with `$after` instead of `$skip`.

### 🔍 Filter Operations

| 🔧 Operator | 📝 Description | 💡 Example |
|:-----------|:--------------|:----------|
| `eq` | Equal | `$filter=StateId eq 48` |
| `ne` | Not equal | `$filter=Status ne 'Closed'` |
| `gt` | Greater than | `$filter=TotalKilled gt 0` |
| `ge` | Greater than or equal | `$filter=YearBuilt ge 1990` |
| `lt` | Less than | `$filter=TrainSpeed lt 50` |
| `le` | Less than or equal | `$filter=Condition le 5` |
| `and` | Logical AND | `$filter=StateId eq 48 and Year gt 2020` |
| `or` | Logical OR | `$filter=Type eq 'A' or Type eq 'B'` |
| `contains` | String contains | `$filter=contains(Name, 'Rail')` |
| `startswith` | String starts with | `$filter=startswith(Code, 'TX')` |

---

### 📦 Endpoints

#### 📂 Categories

Get all transportation data categories.

```http
GET /api/Category
```

**📤 Response:**
```json
{
  "value": [
    {
      "Id": 1,
      "Name": "Railroads",
      "Description": "FRA railroad accident and incident data",
      "Icon": "train",
      "Color": "#1E40AF",
      "SortOrder": 1,
      "IsActive": true
    }
  ]
}
```

---

#### 📊 Category Summaries

Get categories with record counts (view).

```http
GET /api/CategorySummary
```

**📤 Response:**
```json
{
  "value": [
    {
      "CategoryId": 1,
      "CategoryName": "Railroads",
      "Description": "FRA railroad accident and incident data",
      "Icon": "train",
      "Color": "#1E40AF",
      "RecordCount": 300
    }
  ]
}
```

---

#### 🗺️ States

Get US states and territories.

```http
GET /api/State
```

**📤 Response:**
```json
{
  "value": [
    {
      "Id": 1,
      "Code": "AL",
      "Name": "Alabama",
      "Region": "South"
    }
  ]
}
```

---

#### 🚂 Railroad Accidents

FRA Form 54 railroad accident data.

<details>
<summary>📥 <b>GET all</b></summary>

```http
GET /api/RailroadAccident?$first=10&$orderby=AccidentDate desc
```

</details>

<details>
<summary>🔍 <b>GET by ID</b></summary>

```http
GET /api/RailroadAccident/Id/1
```

</details>

<details>
<summary>➕ <b>CREATE</b></summary>

```http
POST /api/RailroadAccident
Content-Type: application/json

{
  "CategoryId": 1,
  "ReportingRailroadName": "BNSF Railway",
  "AccidentDate": "2024-01-15",
  "StateId": 48,
  "AccidentType": "Derailment",
  "TrainSpeed": 35,
  "TotalKilled": 0,
  "TotalInjured": 2,
  "TotalDamage": 150000
}
```

</details>

<details>
<summary>✏️ <b>UPDATE</b></summary>

```http
PATCH /api/RailroadAccident/Id/1
Content-Type: application/json

{
  "TotalDamage": 175000
}
```

</details>

<details>
<summary>🗑️ <b>DELETE</b></summary>

```http
DELETE /api/RailroadAccident/Id/1
```

</details>

**📋 Fields:**

| 📋 Field | 🔧 Type | ✅ Required | 📝 Description |
|:---------|:-------|:----------|:--------------|
| Id | int | Auto | Primary key |
| CategoryId | int | Yes | FK to Category |
| ReportingRailroadCode | string | No | Railroad reporting code |
| ReportingRailroadName | string | Yes | Railroad name |
| AccidentDate | date | Yes | Date of accident |
| AccidentTime | string | No | Time (HH:MM format) |
| StateId | int | Yes | FK to State |
| CountyName | string | No | County name |
| AccidentType | string | Yes | Type of accident |
| TrainSpeed | int | No | Speed in mph |
| TotalKilled | int | No | Number of fatalities |
| TotalInjured | int | No | Number of injuries |
| TotalDamage | decimal | No | Damage in USD |
| HazmatCars | int | No | Hazmat cars involved |

---

#### 🌉 Bridges

National Bridge Inventory data.

**🔍 GET with filter:**
```http
GET /api/Bridge?$filter=OverallCondition eq 'Poor'&$first=10
```

**📋 Fields:**

| 📋 Field | 🔧 Type | ✅ Required | 📝 Description |
|:---------|:-------|:----------|:--------------|
| Id | int | Auto | Primary key |
| CategoryId | int | Yes | FK to Category |
| StructureNumber | string | Yes | NBI structure number |
| StateId | int | Yes | FK to State |
| CountyName | string | No | County name |
| Latitude | decimal | No | GPS latitude |
| Longitude | decimal | No | GPS longitude |
| FacilityCarried | string | No | Road/facility name |
| YearBuilt | int | No | Construction year |
| MainStructureType | string | No | Material type |
| OverallCondition | string | No | Condition rating |
| StructurallyDeficient | bool | No | Deficiency flag |
| AverageDailyTraffic | int | No | ADT count |
| DeckCondition | int | No | Deck rating (0-9) |
| SuperstructureCondition | int | No | Superstructure rating |

---

#### 🚌 Transit Agencies

National Transit Database agency metrics.

**📊 GET top agencies by ridership:**
```http
GET /api/TransitAgency?$orderby=UnlinkedPassengerTrips desc&$first=10
```

**📋 Fields:**

| 📋 Field | 🔧 Type | ✅ Required | 📝 Description |
|:---------|:-------|:----------|:--------------|
| Id | int | Auto | Primary key |
| CategoryId | int | Yes | FK to Category |
| NtdId | string | Yes | NTD identifier |
| AgencyName | string | Yes | Agency name |
| City | string | No | City |
| StateId | int | Yes | FK to State |
| UzaName | string | No | Urbanized area |
| ReportYear | int | No | Report year |
| VehiclesOperatedMaxService | int | No | Fleet size |
| UnlinkedPassengerTrips | bigint | No | Annual ridership |
| VehicleRevenueMiles | bigint | No | Revenue miles |
| TotalOperatingExpenses | bigint | No | Operating costs |

---

#### 🚗 Vehicle Fatalities

FARS vehicle crash fatality data.

**🔍 GET speed-related fatalities:**
```http
GET /api/VehicleFatality?$filter=InvolvesSpeedRelated eq true&$first=10
```

**📋 Fields:**

| 📋 Field | 🔧 Type | ✅ Required | 📝 Description |
|:---------|:-------|:----------|:--------------|
| Id | int | Auto | Primary key |
| CategoryId | int | Yes | FK to Category |
| CaseNumber | string | Yes | FARS case number |
| StateId | int | Yes | FK to State |
| CrashDate | date | Yes | Crash date |
| CrashYear | int | No | Crash year |
| NumberOfVehicles | int | No | Vehicles involved |
| NumberOfFatalities | int | No | Fatality count |
| MannerOfCollision | string | No | Collision type |
| LandUse | string | No | Urban/Rural |
| InvolvesSpeedRelated | bool | No | Speed factor |
| WeatherCondition | string | No | Weather |
| LightCondition | string | No | Lighting |

---

## 💎 GraphQL API

### 🔌 Endpoint

```
POST /graphql
```

### 📤 Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### 📊 Query Examples

<details>
<summary>📂 <b>Get categories</b></summary>

```graphql
{
  categories {
    items {
      Id
      Name
      Description
    }
  }
}
```

</details>

<details>
<summary>🌉 <b>Get bridges with state relation</b></summary>

```graphql
{
  bridges(
    filter: { OverallCondition: { eq: "Poor" } }
    first: 10
    orderBy: { YearBuilt: ASC }
  ) {
    items {
      Id
      StructureNumber
      YearBuilt
      OverallCondition
      state {
        Name
        Code
      }
    }
  }
}
```

</details>

<details>
<summary>🚂 <b>Get railroad accidents with fatalities</b></summary>

```graphql
{
  railroadAccidents(
    filter: { TotalKilled: { gt: 0 } }
    first: 10
    orderBy: { AccidentDate: DESC }
  ) {
    items {
      Id
      ReportingRailroadName
      AccidentDate
      AccidentType
      TotalKilled
      TotalInjured
      state {
        Name
      }
    }
  }
}
```

</details>

### ✏️ Mutations

<details>
<summary>➕ <b>Create record</b></summary>

```graphql
mutation {
  createRailroadAccident(item: {
    CategoryId: 1
    ReportingRailroadName: "Test Railroad"
    AccidentDate: "2024-01-15"
    StateId: 48
    AccidentType: "Derailment"
  }) {
    Id
    ReportingRailroadName
  }
}
```

</details>

<details>
<summary>✏️ <b>Update record</b></summary>

```graphql
mutation {
  updateRailroadAccident(
    Id: 1
    item: { TotalDamage: 175000 }
  ) {
    Id
    TotalDamage
  }
}
```

</details>

<details>
<summary>🗑️ <b>Delete record</b></summary>

```graphql
mutation {
  deleteRailroadAccident(Id: 1) {
    Id
  }
}
```

</details>

---

## ❌ Error Codes

| 🔢 HTTP Status | 🏷️ Code | 📝 Description |
|:--------------|:-------|:--------------|
| 400 | Bad Request | Invalid request syntax or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Token valid but lacks required permissions |
| 404 | Not Found | Requested resource does not exist |
| 409 | Conflict | Resource conflict (e.g., duplicate key) |
| 422 | Unprocessable Entity | Validation error in request body |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Database or service temporarily unavailable |

### 📤 Error Response Format

```json
{
  "error": {
    "code": "BadRequest",
    "message": "Invalid filter expression",
    "details": [
      {
        "field": "$filter",
        "message": "Unknown property 'InvalidField'"
      }
    ]
  }
}
```

---

## ⏱️ Rate Limiting

| 🏷️ Tier | 📊 Requests/Minute | ⚡ Burst |
|:--------|:------------------|:--------|
| 🧪 Development | 60 | 10 |
| 🏭 Production | 1000 | 100 |

When rate limited, you'll receive:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

### 💡 Best Practices

| # | 💡 Practice | 📝 Description |
|:-:|:-----------|:--------------|
| 1 | 🔄 **Exponential backoff** | Implement for retries |
| 2 | 💾 **Cache responses** | Where appropriate |
| 3 | 📄 **Use pagination** | Instead of fetching all records |
| 4 | 📋 **Select needed fields** | With `$select` |

---

## 📚 Additional Resources

| 📘 Resource | 🔗 Link |
|:-----------|:--------|
| 📖 Azure Data API Builder | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/data-api-builder/) |
| 📊 OData Query Options | [Microsoft Learn](https://learn.microsoft.com/en-us/odata/concepts/queryoptions-overview) |
| 💎 GraphQL Specification | [GraphQL.org](https://spec.graphql.org/) |
| 🔐 MSAL.js Documentation | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview) |

---

<div align="center">

### 🆘 Need help?

[![Troubleshooting Guide](https://img.shields.io/badge/🔧_Troubleshooting-FF6B6B?style=for-the-badge)](./troubleshooting-guide.md)
[![Setup Guide](https://img.shields.io/badge/🚀_Setup_Guide-0078D4?style=for-the-badge)](./setup-guide.md)
[![Back to Index](https://img.shields.io/badge/📚_Back_to_Index-gray?style=for-the-badge)](./index.md)

---

**Made with ❤️ for the Azure community**

</div>
