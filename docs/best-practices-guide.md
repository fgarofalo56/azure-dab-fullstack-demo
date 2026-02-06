# Best Practices Guide

<div align="center">

![Best Practices](https://img.shields.io/badge/Best%20Practices-00C853?style=for-the-badge&logo=checkmarx&logoColor=white)
![Security](https://img.shields.io/badge/Security-FF6B6B?style=for-the-badge&logo=security&logoColor=white)
![Performance](https://img.shields.io/badge/Performance-4ECDC4?style=for-the-badge&logo=speedtest&logoColor=white)

**Expert recommendations for a secure, efficient, and maintainable deployment**

</div>

---

## Table of Contents

1. [Security Best Practices](#-security-best-practices)
2. [Performance Best Practices](#-performance-best-practices)
3. [Cost Optimization](#-cost-optimization)
4. [Reliability & Availability](#-reliability--availability)
5. [Monitoring & Logging](#-monitoring--logging)
6. [DevOps Best Practices](#-devops-best-practices)
7. [DAB-Specific Best Practices](#-dab-specific-best-practices)
8. [Checklist](#-deployment-checklist)

---

## Security Best Practices

### 1. Never Commit Secrets to Source Control

```
❌ BAD - Secrets in code
├── .env                    # Contains passwords
├── dab-config.json         # Contains connection string
└── appsettings.json        # Contains API keys

✅ GOOD - Secrets in Azure
├── Environment Variables   # Set via Container Apps
├── Azure Key Vault         # Secure secret storage
└── Managed Identity        # Passwordless authentication
```

#### How to Store Secrets Properly

**Option A: Environment Variables (Simple)**
```bash
# Set secrets as env vars (not visible in config files)
az containerapp update \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --set-env-vars "DATABASE_PASSWORD=secretref:db-password"
```

**Option B: Key Vault (Recommended for Production)**
```bash
# Create Key Vault
az keyvault create \
  --name YOUR_KEYVAULT \
  --resource-group YOUR_RG \
  --location eastus2

# Add secret
az keyvault secret set \
  --vault-name YOUR_KEYVAULT \
  --name "DatabasePassword" \
  --value "your-secret-password"
```

> **Reference:** [Azure Key Vault Best Practices](https://learn.microsoft.com/en-us/azure/key-vault/general/best-practices)

---

### 2. Use Managed Identity (No Passwords!)

Instead of using passwords, let Azure handle authentication automatically.

```
┌─────────────────────────────────────────────────────────────┐
│               MANAGED IDENTITY FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐         ┌──────────────┐                │
│   │ Container    │ ──────► │   Azure      │                │
│   │ App          │  "Who   │   Active     │                │
│   │              │  am I?" │   Directory  │                │
│   └──────────────┘         └──────────────┘                │
│          │                        │                         │
│          │                        │ "You are app-xyz"       │
│          │                        ▼                         │
│          │                 ┌──────────────┐                │
│          └────────────────►│   SQL        │                │
│             Access Token   │   Database   │                │
│             (No password!) │              │                │
│                            └──────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Enable Managed Identity

```bash
# Enable system-assigned managed identity
az containerapp identity assign \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --system-assigned

# Grant access to SQL Database
az sql server ad-admin create \
  --resource-group YOUR_RG \
  --server YOUR_SQL_SERVER \
  --display-name "Container App" \
  --object-id $(az containerapp identity show --name YOUR_APP --resource-group YOUR_RG --query principalId -o tsv)
```

---

### 3. Enable HTTPS Only

Always enforce HTTPS for all communications.

```bash
# Container Apps - HTTPS is default, verify it's not disabled
az containerapp ingress show \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --query "allowInsecure"
# Should return: false
```

---

### 4. Implement Least Privilege Access

| Role | What They Can Do | Who Should Have It |
|------|------------------|-------------------|
| Reader | View resources only | Most team members |
| Contributor | Manage resources | DevOps team |
| Owner | Full control + permissions | Only administrators |

```bash
# Assign Reader role to a user
az role assignment create \
  --role "Reader" \
  --assignee user@example.com \
  --resource-group YOUR_RG
```

---

### 5. Enable Audit Logging

```bash
# Enable diagnostic logs for Container Apps
az monitor diagnostic-settings create \
  --name "audit-logs" \
  --resource YOUR_APP_RESOURCE_ID \
  --workspace YOUR_LOG_ANALYTICS_WORKSPACE_ID \
  --logs '[{"category": "ContainerAppSystemLogs", "enabled": true}]'
```

---

## Performance Best Practices

### 1. Right-Size Your Containers

| Workload Type | Recommended CPU | Recommended Memory |
|---------------|-----------------|-------------------|
| Light API (< 100 req/s) | 0.5 cores | 1 Gi |
| Medium API (100-500 req/s) | 1 core | 2 Gi |
| Heavy API (> 500 req/s) | 2 cores | 4 Gi |
| Frontend (static) | 0.25 cores | 0.5 Gi |

```bash
# Update resources based on actual usage
az containerapp update \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --cpu 1 \
  --memory 2Gi
```

---

### 2. Configure Auto-Scaling Properly

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTO-SCALING CONFIGURATION                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Development/Test:                                          │
│  ┌────────────────────────────────────┐                    │
│  │ Min Replicas: 0 (scale to zero)    │                    │
│  │ Max Replicas: 3                     │                    │
│  │ Scale Threshold: 100 requests       │                    │
│  └────────────────────────────────────┘                    │
│                                                              │
│  Production:                                                │
│  ┌────────────────────────────────────┐                    │
│  │ Min Replicas: 2 (always available) │                    │
│  │ Max Replicas: 10                    │                    │
│  │ Scale Threshold: 50 requests        │                    │
│  └────────────────────────────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```bash
# Production scaling configuration
az containerapp update \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --min-replicas 2 \
  --max-replicas 10 \
  --scale-rule-name "http-scaling" \
  --scale-rule-type "http" \
  --scale-rule-http-concurrency 50
```

---

### 3. Enable Caching in DAB

Add caching to `dab-config.json`:

```json
{
  "runtime": {
    "cache": {
      "enabled": true,
      "ttl-seconds": 300
    }
  }
}
```

---

### 4. Optimize Database Queries

| Practice | Why It Helps |
|----------|--------------|
| Add indexes on filtered columns | Faster WHERE clauses |
| Use pagination ($first, $after) | Reduce data transfer |
| Select only needed fields ($select) | Less data processing |
| Enable SQL Query Store | Monitor slow queries |

---

## Cost Optimization

### 1. Use Scale-to-Zero for Non-Production

```bash
# Development environment - scale to zero when idle
az containerapp update \
  --name YOUR_DEV_APP \
  --resource-group YOUR_RG \
  --min-replicas 0 \
  --max-replicas 3
```

**Cost Impact:**
| Scenario | With Scale-to-Zero | Without |
|----------|-------------------|---------|
| Dev app idle 20 hrs/day | ~$5/month | ~$50/month |
| Test app idle 16 hrs/day | ~$15/month | ~$50/month |

---

### 2. Choose Right SKU Tiers

| Resource | Dev/Test Tier | Production Tier |
|----------|---------------|-----------------|
| Azure SQL | Basic ($5/mo) | Standard S1 ($30/mo) |
| Container Registry | Basic ($5/mo) | Standard ($20/mo) |
| Front Door | Standard ($35/mo) | Premium (varies) |

---

### 3. Set Budget Alerts

```bash
# Create a budget with alert
az consumption budget create \
  --budget-name "monthly-limit" \
  --amount 100 \
  --time-grain Monthly \
  --start-date 2024-01-01 \
  --end-date 2024-12-31 \
  --resource-group YOUR_RG \
  --notifications '{"90_percent": {"enabled": true, "threshold": 90, "operator": "GreaterThan", "contactEmails": ["you@example.com"]}}'
```

---

### 4. Clean Up Unused Resources

```bash
# Find unused resources
az resource list \
  --resource-group YOUR_RG \
  --query "[?tags.environment=='unused']" \
  --output table

# Delete old container images
az acr repository show-manifests \
  --name YOUR_ACR \
  --repository YOUR_IMAGE \
  --orderby time_asc \
  --query "[:-5]" # Keep only last 5
```

---

## Reliability & Availability

### 1. Always Configure Health Probes

```json
// Container App health probe configuration
{
  "probes": [
    {
      "type": "liveness",
      "httpGet": {
        "path": "/health",
        "port": 5000
      },
      "initialDelaySeconds": 30,
      "periodSeconds": 30,
      "failureThreshold": 3
    },
    {
      "type": "readiness",
      "httpGet": {
        "path": "/health",
        "port": 5000
      },
      "initialDelaySeconds": 10,
      "periodSeconds": 10
    }
  ]
}
```

---

### 2. Use Multiple Replicas in Production

```bash
# Ensure at least 2 replicas for high availability
az containerapp update \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --min-replicas 2
```

---

### 3. Configure Retry Policies

For the frontend making API calls:

```typescript
// Implement exponential backoff
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
}
```

---

### 4. Plan for Disaster Recovery

| Component | Backup Strategy | Recovery Time |
|-----------|-----------------|---------------|
| SQL Database | Automated backups | Point-in-time restore |
| Container Images | ACR geo-replication | Deploy from replica |
| Configuration | Git repository | Redeploy from code |
| Secrets | Key Vault backup | Restore from backup |

---

## Monitoring & Logging

### 1. Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app YOUR_APP_INSIGHTS \
  --location eastus2 \
  --resource-group YOUR_RG \
  --application-type web

# Get connection string
CONNECTION_STRING=$(az monitor app-insights component show \
  --app YOUR_APP_INSIGHTS \
  --resource-group YOUR_RG \
  --query connectionString -o tsv)

# Add to container app
az containerapp update \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --set-env-vars "APPLICATIONINSIGHTS_CONNECTION_STRING=$CONNECTION_STRING"
```

---

### 2. Set Up Alerts

```bash
# Alert on high error rate
az monitor metrics alert create \
  --name "high-error-rate" \
  --resource-group YOUR_RG \
  --scopes YOUR_APP_RESOURCE_ID \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --action YOUR_ACTION_GROUP
```

---

### 3. Create Dashboards

In Azure Portal:
1. Go to **Dashboard**
2. Click **+ New dashboard**
3. Add tiles for:
   - Container App metrics (requests, latency)
   - SQL Database metrics (DTU, connections)
   - Error rates
   - Cost tracking

---

## DevOps Best Practices

### 1. Use Infrastructure as Code

All Azure resources should be defined in code (Bicep/ARM/Terraform).

```bicep
// Example: main.bicep
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'my-app'
  location: location
  properties: {
    // ... configuration
  }
}
```

---

### 2. Implement CI/CD Pipelines

```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and push to ACR
        run: |
          az acr build -r ${{ secrets.ACR_NAME }} -t myapp:${{ github.sha }} .

      - name: Deploy to Container Apps
        run: |
          az containerapp update -n myapp -g my-rg --image ${{ secrets.ACR_NAME }}.azurecr.io/myapp:${{ github.sha }}
```

---

### 3. Use Semantic Versioning for Images

```bash
# Tag images with version numbers
az acr build \
  --registry YOUR_ACR \
  --image myapp:1.2.3 \
  --image myapp:latest \
  .
```

| Tag Type | Example | Use Case |
|----------|---------|----------|
| Semantic | `1.2.3` | Production releases |
| Git SHA | `abc1234` | Traceability |
| Latest | `latest` | Development only |

---

### 4. Separate Environments

```
┌─────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT STRATEGY                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Development          Staging            Production        │
│   ┌──────────┐        ┌──────────┐       ┌──────────┐      │
│   │ rg-dev   │        │ rg-stg   │       │ rg-prod  │      │
│   │          │        │          │       │          │      │
│   │ Scale:   │        │ Scale:   │       │ Scale:   │      │
│   │ 0-3      │        │ 1-5      │       │ 2-10     │      │
│   │          │        │          │       │          │      │
│   │ Cost:    │        │ Cost:    │       │ Cost:    │      │
│   │ Low      │        │ Medium   │       │ Higher   │      │
│   └──────────┘        └──────────┘       └──────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## DAB-Specific Best Practices

### 1. Secure Your Entities

Always specify permissions explicitly:

```json
{
  "entities": {
    "SensitiveData": {
      "permissions": [
        {
          "role": "authenticated",
          "actions": [
            {
              "action": "read",
              "fields": {
                "include": ["Id", "Name"],
                "exclude": ["SSN", "CreditCard"]
              }
            }
          ]
        }
      ]
    }
  }
}
```

---

### 2. Use Stored Procedures for Complex Operations

```json
{
  "entities": {
    "GetReportData": {
      "source": {
        "type": "stored-procedure",
        "object": "sp_GetReportData",
        "parameters": {
          "startDate": "date",
          "endDate": "date"
        }
      }
    }
  }
}
```

---

### 3. Enable Request Logging

```json
{
  "runtime": {
    "telemetry": {
      "application-insights": {
        "enabled": true,
        "connection-string": "@env('APPLICATIONINSIGHTS_CONNECTION_STRING')"
      }
    }
  }
}
```

---

## Deployment Checklist

Use this checklist before every production deployment:

### Pre-Deployment

- [ ] All secrets stored in Key Vault or env vars (not in code)
- [ ] Health probes configured
- [ ] Correct resource limits set
- [ ] CORS configured correctly
- [ ] Authentication tested
- [ ] Database firewall rules in place
- [ ] Managed identity configured (if using)

### Deployment

- [ ] Image tagged with version number
- [ ] Deployment tested in staging first
- [ ] Rollback plan ready
- [ ] Team notified of deployment

### Post-Deployment

- [ ] Health check passing
- [ ] Smoke tests passing
- [ ] Monitoring alerts configured
- [ ] Logs being collected
- [ ] Performance metrics normal
- [ ] Cost estimate verified

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                   BEST PRACTICES SUMMARY                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SECURITY                    PERFORMANCE                    │
│  ✓ No secrets in code        ✓ Right-size containers       │
│  ✓ Use managed identity      ✓ Configure auto-scaling      │
│  ✓ HTTPS only                ✓ Enable caching              │
│  ✓ Least privilege access    ✓ Optimize queries            │
│                                                              │
│  COST                        RELIABILITY                    │
│  ✓ Scale to zero (dev)       ✓ Health probes               │
│  ✓ Right SKU tiers           ✓ Multiple replicas           │
│  ✓ Budget alerts             ✓ Retry policies              │
│  ✓ Clean up unused           ✓ DR planning                 │
│                                                              │
│  OPERATIONS                  DEVOPS                         │
│  ✓ Application Insights      ✓ Infrastructure as code      │
│  ✓ Alerts configured         ✓ CI/CD pipelines             │
│  ✓ Dashboards created        ✓ Semantic versioning         │
│  ✓ Log Analytics             ✓ Environment separation      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

<div align="center">

**Ready to deploy?**

[Cloud Shell Guide](./cloud-shell-deployment-guide.md) | [Portal Guide](./beginners-guide-portal.md) | [Back to Index](./index.md)

</div>
