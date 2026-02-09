# Container Apps Portal Guide

<div align="center">

![Container Apps](https://img.shields.io/badge/Azure%20Container-Apps-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Portal](https://img.shields.io/badge/Azure-Portal-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)

**Step-by-step guide for deploying Container Apps via Azure Portal**

</div>

This guide provides detailed step-by-step instructions for deploying and managing Azure Container Apps through the Azure Portal.

> **Estimated Time:** 30-45 minutes
> **Prerequisite:** Completed [ACR Setup Guide](./acr-setup-guide.md) with pushed container images

---

## Table of Contents

- [Creating a Container Apps Environment](#creating-a-container-apps-environment)
- [Creating the DAB Container App](#creating-the-dab-container-app)
- [Creating the Frontend Container App](#creating-the-frontend-container-app)
- [Configuring Environment Variables and Secrets](#configuring-environment-variables-and-secrets)
- [Setting Up Auto-Scaling Rules](#setting-up-auto-scaling-rules)
- [Updating Container Images](#updating-container-images)
- [Viewing Logs and Metrics](#viewing-logs-and-metrics)
- [Managing Revisions](#managing-revisions)

---

## Creating a Container Apps Environment

The Container Apps Environment is a secure boundary around Container Apps that share the same virtual network and logging configuration.

### Step 1: Navigate to Create Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **+ Create a resource**
3. Search for **Container Apps Environment**
4. Click **Create**

![Container Apps Quickstart](https://learn.microsoft.com/en-us/azure/container-apps/media/get-started/azure-container-apps-quickstart.png)

> **Tip:** The environment acts as a Kubernetes namespace - apps within it can communicate via internal DNS.

### Step 2: Configure Basics

| Field | Value | Notes |
|-------|-------|-------|
| **Subscription** | Your subscription | |
| **Resource group** | `rg-dab-demo` | Create new or select existing |
| **Environment name** | `cae-dab-demo` | Must be unique in resource group |
| **Region** | `East US 2` | Choose your preferred region |

### Step 3: Configure Workload Profiles (Optional)

For development/demo purposes:
- Leave **Workload profiles** unchecked (uses Consumption plan)

### Step 4: Configure Monitoring

| Field | Value |
|-------|-------|
| **Log Analytics workspace** | Select existing or create new |
| **Workspace name** | `law-dab-demo` |

### Step 5: Review and Create

1. Click **Review + create**
2. Verify all settings
3. Click **Create**
4. Wait for deployment to complete (~2-3 minutes)

---

## Creating the DAB Container App

### Step 1: Start Creation

1. Navigate to **Resource groups** → `rg-dab-demo`
2. Click **+ Create**
3. Search for **Container App**
4. Click **Create**

> **Portal Steps:** Search for "Container App" → Create → Configure basics, container image, and ingress settings.

### Step 2: Configure Basics

| Field | Value |
|-------|-------|
| **Subscription** | Your subscription |
| **Resource group** | `rg-dab-demo` |
| **Container app name** | `ca-dab` |
| **Deployment source** | Container image |
| **Region** | Same as environment |
| **Container Apps Environment** | Select `cae-dab-demo` |

### Step 3: Configure Container

1. Uncheck **Use quickstart image**
2. Configure image source:

| Field | Value |
|-------|-------|
| **Image source** | Azure Container Registry |
| **Registry** | Select your ACR (e.g., `acrdabdemo`) |
| **Image** | `dab` |
| **Image tag** | `latest` |

3. Configure resources:

| Field | Value |
|-------|-------|
| **CPU and Memory** | 1 vCPU, 2 Gi memory |

4. Add environment variables (click **+ Add**):

| Name | Source | Value |
|------|--------|-------|
| `ASPNETCORE_ENVIRONMENT` | Manual entry | `Production` |
| `AZURE_AD_CLIENT_ID` | Manual entry | `<your-dab-client-id>` |
| `AZURE_AD_TENANT_ID` | Manual entry | `<your-tenant-id>` |

5. Add secrets (click **+ Add** under Secrets):

| Name | Source | Value |
|------|--------|-------|
| `database-connection-string` | Manual entry | Your SQL connection string |

6. Reference secret in environment variable:

| Name | Source | Value |
|------|--------|-------|
| `DATABASE_CONNECTION_STRING` | Reference a secret | `database-connection-string` |

### Step 4: Configure Ingress

| Field | Value |
|-------|-------|
| **Ingress** | Enabled |
| **Ingress traffic** | Accepting traffic from anywhere |
| **Ingress type** | HTTP |
| **Client certificate mode** | Ignore |
| **Transport** | Auto |
| **Target port** | `5000` |

### Step 5: Review and Create

1. Click **Review + create**
2. Verify settings, especially:
   - Environment variables
   - Secret references
   - Port configuration
3. Click **Create**
4. Wait for deployment (~2-3 minutes)

---

## Creating the Frontend Container App

### Step 1: Start Creation

1. Navigate to **Resource groups** → `rg-dab-demo`
2. Click **+ Create** → **Container App**

### Step 2: Configure Basics

| Field | Value |
|-------|-------|
| **Container app name** | `ca-frontend` |
| **Container Apps Environment** | Select `cae-dab-demo` |

### Step 3: Configure Container

| Field | Value |
|-------|-------|
| **Image source** | Azure Container Registry |
| **Registry** | Select your ACR |
| **Image** | `frontend` |
| **Image tag** | `latest` |
| **CPU and Memory** | 0.5 vCPU, 1 Gi memory |

No environment variables needed (baked into Docker image).

### Step 4: Configure Ingress

| Field | Value |
|-------|-------|
| **Ingress** | Enabled |
| **Ingress traffic** | Accepting traffic from anywhere |
| **Target port** | `80` |

### Step 5: Review and Create

1. Click **Review + create**
2. Click **Create**

---

## Configuring Environment Variables and Secrets

### Adding Environment Variables

1. Navigate to your Container App
2. Go to **Containers** in the left menu
3. Click **Edit and deploy**
4. Click on your container name
5. Scroll to **Environment variables**
6. Click **+ Add**
7. Enter name and value
8. Click **Save**
9. Click **Create** to deploy new revision

### Adding Secrets

1. Navigate to your Container App
2. Go to **Secrets** in the left menu
3. Click **+ Add**
4. Enter:
   - **Key:** Secret name (e.g., `database-connection-string`)
   - **Type:** Container Apps Secret
   - **Value:** Secret value
5. Click **Add**

### Referencing Secrets in Environment Variables

1. Go to **Containers** → **Edit and deploy**
2. Click on container
3. Add environment variable:
   - **Name:** `DATABASE_CONNECTION_STRING`
   - **Source:** Reference a secret
   - **Value:** Select `database-connection-string`
4. Save and create new revision

---

## Setting Up Auto-Scaling Rules

### Navigate to Scale Settings

1. Go to your Container App
2. Click **Scale and replicas** in the left menu
3. Click **Edit and deploy**

### Configure Replica Limits

1. Go to the **Scale** tab
2. Set:
   - **Min replicas:** `0` (for scale-to-zero)
   - **Max replicas:** `10`

### Add HTTP Scaling Rule

1. Under **Scale rule**, click **+ Add**
2. Configure:

| Field | Value |
|-------|-------|
| **Rule name** | `http-rule` |
| **Type** | HTTP scaling |
| **Concurrent requests** | `100` |

3. Click **Add**

### Deploy Changes

1. Click **Create**
2. Wait for new revision to deploy

### Verify Scaling Configuration

1. Go to **Scale and replicas**
2. View current replica count
3. Check active scale rules

---

## Updating Container Images

### Method 1: Deploy New Revision (Portal)

1. Navigate to your Container App
2. Go to **Containers**
3. Click **Edit and deploy**
4. Click on the container
5. Change the **Image tag** to the new version
6. Click **Save**
7. Click **Create**

### Method 2: Quick Update (Portal)

1. Go to **Revisions and replicas**
2. Click **+ Create new revision**
3. Update the container image tag
4. Click **Create**

### Method 3: Azure CLI

```bash
az containerapp update \
  --name ca-dab \
  --resource-group rg-dab-demo \
  --image acrdabdemo.azurecr.io/dab:v2.0.0
```

---

## Viewing Logs and Metrics

### Console Logs (Real-time)

1. Navigate to your Container App
2. Go to **Log stream** in the left menu
3. Select:
   - **Logs:** System or Application
4. View real-time logs

### Historical Logs (Log Analytics)

1. Go to **Logs** in the left menu
2. Run KQL queries:

```kusto
// Recent container logs
ContainerAppConsoleLogs_CL
| where ContainerAppName_s == "ca-dab"
| order by TimeGenerated desc
| take 100
| project TimeGenerated, Log_s
```

### Metrics

1. Go to **Metrics** in the left menu
2. Select metric:
   - **Replica Count** - Current replicas
   - **Requests** - HTTP request count
   - **CPU Usage Percentage** - Per replica
   - **Memory Working Set Bytes** - Per replica

### Create Alert

1. In Metrics view, click **New alert rule**
2. Configure:
   - **Signal:** e.g., Replica Count
   - **Condition:** e.g., Less than 1
   - **Action:** Email, webhook, etc.
3. Click **Create**

---

## Managing Revisions

### View Revisions

1. Navigate to your Container App
2. Go to **Revisions and replicas**
3. View all revisions with:
   - Status (Active/Inactive)
   - Replica count
   - Traffic percentage

### Activate/Deactivate Revision

1. In **Revisions and replicas**
2. Click the three dots (**...**) on a revision
3. Select **Activate** or **Deactivate**

### Traffic Splitting

For gradual rollouts:

1. Go to **Revisions and replicas**
2. Click **Revision mode** → **Multiple**
3. For each active revision, set traffic percentage
4. Click **Save**

### Rollback to Previous Revision

1. Go to **Revisions and replicas**
2. Find the previous working revision
3. Click **Activate** to make it active
4. Optionally deactivate the faulty revision

---

## Best Practices

### Naming Conventions

| Resource | Pattern | Example |
|----------|---------|---------|
| Environment | `cae-{project}-{env}` | `cae-dab-demo` |
| Container App | `ca-{service}` | `ca-dab`, `ca-frontend` |
| Secret | `{service}-{secret-type}` | `dab-connection-string` |

### Security

1. **Never** put secrets in environment variables as plain text
2. Use **Secrets** for sensitive values
3. Reference secrets in environment variables
4. Use managed identity where possible

### Cost Optimization

1. Use scale-to-zero (`minReplicas=0`) for dev/test
2. Right-size CPU and memory
3. Monitor actual resource usage
4. Consider workload profiles for predictable loads

### Monitoring

1. Enable Log Analytics integration
2. Set up alerts for:
   - Replica count drops to 0 (production)
   - High error rate
   - High response times
3. Review metrics regularly

---

## Related Documentation

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Container Apps Scaling](https://learn.microsoft.com/azure/container-apps/scale-app)
- [Container Apps Networking](https://learn.microsoft.com/azure/container-apps/networking)
- [Auto-Scaling Guide](./auto-scaling-guide.md)
