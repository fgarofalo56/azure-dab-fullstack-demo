# Monitoring and Alerting Setup Guide

This guide provides comprehensive instructions for setting up Azure Monitor alerts, creating dashboards, and defining Service Level Objectives (SLOs) for the DOT Transportation Data Portal.

## Table of Contents

1. [Overview](#overview)
2. [Log Analytics Queries](#log-analytics-queries)
3. [Recommended Alerts](#recommended-alerts)
4. [Dashboard Templates](#dashboard-templates)
5. [Service Level Objectives (SLOs)](#service-level-objectives-slos)
6. [Alert Routing](#alert-routing)
7. [Troubleshooting Queries](#troubleshooting-queries)

---

## Overview

The architecture deploys the following monitoring resources:

| Resource | Purpose |
|----------|---------|
| Log Analytics Workspace | Centralized log aggregation |
| Application Insights | Application performance monitoring |
| Container Apps Logs | Container-level diagnostics |
| Front Door Analytics | Edge traffic and WAF logs |

### Access Monitoring Resources

```bash
# Get Log Analytics Workspace ID
az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE_NAME \
  --query customerId -o tsv

# Get Application Insights connection string
az monitor app-insights component show \
  --resource-group $RESOURCE_GROUP \
  --app $APP_INSIGHTS_NAME \
  --query connectionString -o tsv
```

---

## Log Analytics Queries

### Container Apps Performance

```kusto
// Container CPU and Memory Usage
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(1h)
| where ContainerAppName_s contains "dab"
| project TimeGenerated, Log_s, RevisionName_s
| order by TimeGenerated desc
```

### DAB API Request Latency

```kusto
// API Response Times (P50, P90, P99)
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(1h)
| where Log_s contains "request"
| summarize
    p50 = percentile(duration, 50),
    p90 = percentile(duration, 90),
    p99 = percentile(duration, 99)
    by bin(TimeGenerated, 5m)
| render timechart
```

### Front Door Traffic Analysis

```kusto
// Requests by status code
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.CDN"
| where Category == "FrontDoorAccessLog"
| summarize count() by httpStatusCode_d
| render piechart
```

### Failed Authentication Attempts

```kusto
// Failed auth requests
AzureDiagnostics
| where TimeGenerated > ago(24h)
| where httpStatusCode_d == 401 or httpStatusCode_d == 403
| summarize FailedAttempts = count() by bin(TimeGenerated, 1h), clientIp_s
| where FailedAttempts > 10
| order by FailedAttempts desc
```

### SQL Database Performance

```kusto
// Query execution times
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.SQL"
| where Category == "QueryStoreRuntimeStatistics"
| summarize
    AvgDuration = avg(duration_d),
    MaxDuration = max(duration_d)
    by query_id_d
| top 10 by AvgDuration desc
```

---

## Recommended Alerts

### Critical Alerts (P1 - Immediate Response)

#### 1. Container App Unhealthy

```json
{
  "name": "Container App Unhealthy",
  "severity": "Sev1",
  "query": "ContainerAppConsoleLogs_CL | where Log_s contains 'Unhealthy' or Log_s contains 'Failed'",
  "threshold": 1,
  "evaluationFrequency": "PT1M",
  "windowSize": "PT5M",
  "actions": ["Email", "SMS", "Teams"]
}
```

**Configuration:**
```bash
az monitor scheduled-query create \
  --name "DAB Container Unhealthy" \
  --resource-group $RESOURCE_GROUP \
  --scopes "/subscriptions/$SUB_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.OperationalInsights/workspaces/$WORKSPACE" \
  --condition "count > 1" \
  --evaluation-frequency 1m \
  --window-size 5m \
  --severity 1 \
  --action-groups $ACTION_GROUP_ID
```

#### 2. High Error Rate (5xx responses)

```json
{
  "name": "High 5xx Error Rate",
  "severity": "Sev1",
  "metric": "Http5xx",
  "threshold": "5%",
  "evaluationFrequency": "PT1M",
  "windowSize": "PT5M"
}
```

#### 3. Database Connection Failures

```json
{
  "name": "SQL Connection Failures",
  "severity": "Sev1",
  "query": "AzureDiagnostics | where Category == 'Errors' | where error_number_d in (10054, 10060, 40613)",
  "threshold": 3,
  "windowSize": "PT5M"
}
```

### High Priority Alerts (P2 - Response within 30 minutes)

#### 4. High Response Latency

```json
{
  "name": "High API Latency",
  "severity": "Sev2",
  "metric": "ResponseTime",
  "threshold": "2000ms (p95)",
  "evaluationFrequency": "PT5M",
  "windowSize": "PT15M"
}
```

#### 5. Container CPU High

```json
{
  "name": "Container CPU > 80%",
  "severity": "Sev2",
  "metric": "CpuPercentage",
  "threshold": 80,
  "evaluationFrequency": "PT5M",
  "windowSize": "PT15M"
}
```

#### 6. Container Memory High

```json
{
  "name": "Container Memory > 85%",
  "severity": "Sev2",
  "metric": "MemoryPercentage",
  "threshold": 85,
  "evaluationFrequency": "PT5M",
  "windowSize": "PT15M"
}
```

### Medium Priority Alerts (P3 - Response within 4 hours)

#### 7. Elevated 4xx Errors

```json
{
  "name": "High 4xx Error Rate",
  "severity": "Sev3",
  "metric": "Http4xx",
  "threshold": "10%",
  "evaluationFrequency": "PT15M",
  "windowSize": "PT1H"
}
```

#### 8. WAF Blocked Requests

```json
{
  "name": "WAF Blocks Elevated",
  "severity": "Sev3",
  "query": "AzureDiagnostics | where action_s == 'Block'",
  "threshold": 100,
  "windowSize": "PT1H"
}
```

### Deployment Script for All Alerts

```powershell
# Create Action Group
az monitor action-group create `
  --name "DOT-Portal-Alerts" `
  --resource-group $env:RESOURCE_GROUP `
  --short-name "DOTAlerts" `
  --email-receiver "name=TeamLead" "email=teamlead@contoso.com" `
  --sms-receiver "name=OnCall" "country-code=1" "phone-number=5551234567"

# Create metric alerts for Container Apps
$alerts = @(
  @{name="CPU-High"; metric="CpuPercentage"; op="GreaterThan"; threshold=80; severity=2},
  @{name="Memory-High"; metric="MemoryPercentage"; op="GreaterThan"; threshold=85; severity=2},
  @{name="Restart-Count"; metric="RestartCount"; op="GreaterThan"; threshold=5; severity=1}
)

foreach ($alert in $alerts) {
  az monitor metrics alert create `
    --name $alert.name `
    --resource-group $env:RESOURCE_GROUP `
    --scopes $env:CONTAINER_APP_ID `
    --condition "avg $($alert.metric) $($alert.op) $($alert.threshold)" `
    --severity $alert.severity `
    --action-group $env:ACTION_GROUP_ID
}
```

---

## Dashboard Templates

### Overview Dashboard

Create a workbook with the following tiles:

#### Tile 1: Request Volume (last 24h)
```kusto
AzureDiagnostics
| where TimeGenerated > ago(24h)
| summarize Requests = count() by bin(TimeGenerated, 1h)
| render timechart
```

#### Tile 2: Error Rate Trend
```kusto
AzureDiagnostics
| where TimeGenerated > ago(24h)
| summarize
    Total = count(),
    Errors = countif(httpStatusCode_d >= 500)
    by bin(TimeGenerated, 1h)
| extend ErrorRate = Errors * 100.0 / Total
| render timechart
```

#### Tile 3: Response Time Percentiles
```kusto
AzureDiagnostics
| where TimeGenerated > ago(4h)
| summarize
    p50 = percentile(timeTaken_d, 50),
    p90 = percentile(timeTaken_d, 90),
    p99 = percentile(timeTaken_d, 99)
    by bin(TimeGenerated, 5m)
| render timechart
```

#### Tile 4: Top Endpoints by Volume
```kusto
AzureDiagnostics
| where TimeGenerated > ago(1h)
| summarize Count = count() by requestUri_s
| top 10 by Count desc
| render barchart
```

#### Tile 5: Geographic Distribution
```kusto
AzureDiagnostics
| where TimeGenerated > ago(24h)
| summarize Count = count() by clientCountry_s
| render piechart
```

### ARM Template for Dashboard

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": [
    {
      "type": "Microsoft.Portal/dashboards",
      "apiVersion": "2020-09-01-preview",
      "name": "DOT-Portal-Overview",
      "location": "[resourceGroup().location]",
      "tags": {
        "hidden-title": "DOT Transportation Portal - Operations Dashboard"
      },
      "properties": {
        "lenses": [
          {
            "order": 0,
            "parts": [
              {
                "position": {"x": 0, "y": 0, "rowSpan": 4, "colSpan": 6},
                "metadata": {
                  "type": "Extension/Microsoft_OperationsManagementSuite_Workspace/Blade/WorkspaceBlade",
                  "inputs": [{"name": "ComponentId", "value": "[resourceId('Microsoft.OperationalInsights/workspaces', parameters('workspaceName'))]"}]
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

## Service Level Objectives (SLOs)

### Availability SLO

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Availability | 99.9% | Successful requests / Total requests |
| Frontend Availability | 99.9% | Successful page loads / Total page loads |
| Database Availability | 99.95% | Azure SQL SLA |

**Calculation Query:**
```kusto
AzureDiagnostics
| where TimeGenerated > ago(30d)
| summarize
    Total = count(),
    Successful = countif(httpStatusCode_d < 500)
| extend Availability = Successful * 100.0 / Total
```

### Latency SLO

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p50) | < 200ms | 50th percentile response time |
| API Response Time (p90) | < 500ms | 90th percentile response time |
| API Response Time (p99) | < 2000ms | 99th percentile response time |
| Page Load Time | < 3s | Frontend timing API |

**SLO Dashboard Query:**
```kusto
let slo_p50 = 200;
let slo_p90 = 500;
let slo_p99 = 2000;
AzureDiagnostics
| where TimeGenerated > ago(7d)
| summarize
    p50 = percentile(timeTaken_d, 50),
    p90 = percentile(timeTaken_d, 90),
    p99 = percentile(timeTaken_d, 99)
| extend
    p50_met = iif(p50 < slo_p50, "Met", "Missed"),
    p90_met = iif(p90 < slo_p90, "Met", "Missed"),
    p99_met = iif(p99 < slo_p99, "Met", "Missed")
```

### Error Rate SLO

| Metric | Target | Measurement |
|--------|--------|-------------|
| 5xx Error Rate | < 0.1% | Server errors / Total requests |
| 4xx Error Rate | < 5% | Client errors / Total requests |

### Error Budget

Calculate remaining error budget:

```kusto
let slo_target = 99.9;
let measurement_window = 30d;
AzureDiagnostics
| where TimeGenerated > ago(measurement_window)
| summarize
    Total = count(),
    Errors = countif(httpStatusCode_d >= 500)
| extend
    ErrorRate = Errors * 100.0 / Total,
    AllowedErrorRate = 100 - slo_target,
    ErrorBudget = (100 - slo_target) - (Errors * 100.0 / Total)
| project
    CurrentErrorRate = ErrorRate,
    AllowedErrorRate,
    RemainingErrorBudget = ErrorBudget,
    BudgetStatus = iif(ErrorBudget > 0, "Healthy", "Exhausted")
```

---

## Alert Routing

### Email Configuration

```bash
# Create action group with email
az monitor action-group create \
  --name "DOT-Email-Alerts" \
  --resource-group $RESOURCE_GROUP \
  --short-name "DOTEmail" \
  --email-receiver "name=Team" "email=dot-team@contoso.com" \
  --email-receiver "name=OnCall" "email=oncall@contoso.com"
```

### Microsoft Teams Integration

1. Create incoming webhook in Teams channel
2. Configure Logic App to receive alerts and post to Teams

```json
{
  "type": "Microsoft.Logic/workflows",
  "apiVersion": "2019-05-01",
  "name": "AlertToTeams",
  "properties": {
    "definition": {
      "triggers": {
        "manual": {
          "type": "Request",
          "kind": "Http",
          "inputs": {
            "schema": {
              "type": "object",
              "properties": {
                "alertName": {"type": "string"},
                "severity": {"type": "string"},
                "description": {"type": "string"}
              }
            }
          }
        }
      },
      "actions": {
        "PostToTeams": {
          "type": "Http",
          "inputs": {
            "method": "POST",
            "uri": "[parameters('teamsWebhookUrl')]",
            "body": {
              "@type": "MessageCard",
              "title": "@{triggerBody()?['alertName']}",
              "text": "@{triggerBody()?['description']}"
            }
          }
        }
      }
    }
  }
}
```

### PagerDuty Integration

```bash
# Create action group with webhook to PagerDuty
az monitor action-group create \
  --name "DOT-PagerDuty" \
  --resource-group $RESOURCE_GROUP \
  --short-name "DOTPD" \
  --webhook-receiver "name=PagerDuty" \
    "service-uri=https://events.pagerduty.com/integration/YOUR_KEY/enqueue"
```

---

## Troubleshooting Queries

### Recent Errors

```kusto
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(1h)
| where Log_s contains "error" or Log_s contains "exception"
| project TimeGenerated, Log_s, RevisionName_s
| order by TimeGenerated desc
| take 100
```

### Slow Requests

```kusto
AzureDiagnostics
| where TimeGenerated > ago(1h)
| where timeTaken_d > 2000
| project TimeGenerated, requestUri_s, timeTaken_d, httpStatusCode_d
| order by timeTaken_d desc
| take 50
```

### Container Restarts

```kusto
ContainerAppConsoleLogs_CL
| where TimeGenerated > ago(24h)
| where Log_s contains "Starting" or Log_s contains "Stopping"
| project TimeGenerated, Log_s, RevisionName_s
| order by TimeGenerated desc
```

### Failed Database Queries

```kusto
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.SQL"
| where Category == "Errors"
| project TimeGenerated, error_number_d, Message
| order by TimeGenerated desc
| take 100
```

### WAF Blocked Requests Details

```kusto
AzureDiagnostics
| where action_s == "Block"
| project TimeGenerated, clientIp_s, requestUri_s, ruleName_s, ruleSetType_s
| order by TimeGenerated desc
| take 100
```

---

## Quick Reference

### Alert Severity Mapping

| Severity | Response Time | Team Notification |
|----------|---------------|-------------------|
| Sev1 (Critical) | Immediate | SMS + Phone + Email + Teams |
| Sev2 (High) | 30 minutes | Email + Teams |
| Sev3 (Medium) | 4 hours | Email |
| Sev4 (Low) | 24 hours | Dashboard only |

### Key Metrics to Watch

1. **Request Rate** - Traffic volume trends
2. **Error Rate** - Application health
3. **Latency (p99)** - User experience
4. **CPU/Memory** - Resource utilization
5. **Active Connections** - Database health

### Useful Links

- [Azure Monitor Documentation](https://docs.microsoft.com/azure/azure-monitor/)
- [KQL Quick Reference](https://docs.microsoft.com/azure/data-explorer/kql-quick-reference)
- [Container Apps Monitoring](https://docs.microsoft.com/azure/container-apps/observability)
- [Azure SQL Monitoring](https://docs.microsoft.com/azure/azure-sql/database/monitor-tune-overview)

---

*Last Updated: 2026-02-09*
