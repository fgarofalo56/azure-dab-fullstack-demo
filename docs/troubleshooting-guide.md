# Complete Troubleshooting Guide

<div align="center">

![Troubleshooting](https://img.shields.io/badge/Troubleshooting-FF6B6B?style=for-the-badge&logo=bug&logoColor=white)
![Comprehensive](https://img.shields.io/badge/100%2B%20Solutions-4ECDC4?style=for-the-badge)

**Solutions for every common problem you might encounter**

</div>

---

## Table of Contents

1. [Quick Diagnosis](#-quick-diagnosis)
2. [Container Startup Issues](#-container-startup-issues)
3. [Authentication Issues](#-authentication-issues)
4. [Database Connectivity](#-database-connectivity)
5. [ACR Issues](#-acr-issues)
6. [Networking Issues](#-networking-issues)
7. [Build Failures](#-build-failures)
8. [Performance Problems](#-performance-problems)
9. [Getting Help](#-getting-help)

---

## Quick Diagnosis

### First Steps for Any Problem

```
┌─────────────────────────────────────────────────────────────┐
│                    TROUBLESHOOTING FLOWCHART                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. What's the error message?                               │
│     │                                                       │
│     ▼                                                       │
│  2. Check container logs                                    │
│     │                                                       │
│     ▼                                                       │
│  3. Verify environment variables                            │
│     │                                                       │
│     ▼                                                       │
│  4. Check network/firewall                                  │
│     │                                                       │
│     ▼                                                       │
│  5. Review Azure resource health                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Essential Diagnostic Commands

```bash
# Check container app status
az containerapp show \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --query "properties.runningStatus"

# View recent logs
az containerapp logs show \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --tail 100

# List all revisions
az containerapp revision list \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --output table

# Check revision health
az containerapp revision show \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --revision REVISION_NAME \
  --query "properties.healthState"
```

---

## Container Startup Issues

### Problem: Container Won't Start

**Symptoms:**
- Revision shows "Provisioning" indefinitely
- Health state shows "Unhealthy"
- No response from the app URL

#### Step 1: Check the Logs

```bash
# View startup logs
az containerapp logs show \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --type console \
  --follow
```

#### Step 2: Common Causes & Solutions

| Cause | How to Identify | Solution |
|-------|-----------------|----------|
| Missing environment variable | Log shows "undefined" or "null" error | Add the missing env var |
| Wrong port configured | Log shows "listening on port X" but app expects Y | Update `--target-port` |
| Image pull failed | Log shows "ImagePullBackOff" | Check ACR credentials |
| Memory/CPU too low | Log shows "OOMKilled" | Increase resources |
| Startup timeout | App takes too long to respond | Increase `initialDelaySeconds` |

#### Solution: Fix Missing Environment Variables

```bash
# List current env vars
az containerapp show \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --query "properties.template.containers[0].env"

# Update env vars
az containerapp update \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --set-env-vars "VARIABLE_NAME=value"
```

#### Solution: Fix Port Configuration

```bash
# Update target port
az containerapp ingress update \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --target-port 5000
```

#### Solution: Increase Resources

```bash
# Update CPU and memory
az containerapp update \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --cpu 1.0 \
  --memory 2Gi
```

---

### Problem: "CrashLoopBackOff" or Repeated Restarts

**Symptoms:**
- Container starts then crashes repeatedly
- Logs show application errors

#### Diagnosis

```bash
# Check how many restarts
az containerapp revision show \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --revision REVISION_NAME \
  --query "properties.template.containers[0].restartCount"

# View crash logs
az containerapp logs show \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --tail 200
```

#### Common Causes

| Error in Logs | Meaning | Solution |
|---------------|---------|----------|
| `ECONNREFUSED` | Can't connect to database | Check SQL firewall/connection string |
| `ENOENT: no such file` | Missing file in container | Check Dockerfile COPY commands |
| `permission denied` | Wrong file permissions | Add chmod in Dockerfile |
| `Module not found` | Missing dependency | Rebuild image with all deps |

---

### Problem: Health Probes Failing

**Symptoms:**
- App starts but then gets marked unhealthy
- 503 errors after initial success

#### Check Health Probe Configuration

```bash
# View current probes
az containerapp show \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  --query "properties.template.containers[0].probes"
```

#### Solution: Adjust Probe Settings

For DAB containers, update via Azure Portal:

1. Go to **Container Apps** → Your App → **Containers**
2. Click **Edit and deploy**
3. Expand **Health probes**
4. Adjust:
   - **Liveness probe path:** `/`
   - **Readiness probe path:** `/`
   - **Initial delay:** `30` seconds (increase if app starts slowly)
   - **Period:** `30` seconds
   - **Failure threshold:** `3`

Or via CLI (create new revision):

```bash
# Create revision with adjusted probes
az containerapp create \
  --name YOUR_APP_NAME \
  --resource-group YOUR_RG \
  ... \
  --probe-liveness-path "/" \
  --probe-liveness-initial-delay 30 \
  --probe-liveness-period 30 \
  --probe-readiness-path "/" \
  --probe-readiness-initial-delay 15
```

---

## Authentication Issues

### Problem: "AADSTS50011: Reply URL Mismatch"

**Symptoms:**
- Login fails with redirect error
- Error mentions "reply URL" or "redirect URI"

![AADSTS50011 Error](https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/media/error-code-aadsts50011-redirect-uri-mismatch/aadsts50011-error.png)
*Source: [Microsoft Learn - AADSTS50011](https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/error-code-aadsts50011-redirect-uri-mismatch)*

#### Solution

1. **Find your exact app URL:**
   ```bash
   az containerapp show \
     --name YOUR_FRONTEND_APP \
     --resource-group YOUR_RG \
     --query "properties.configuration.ingress.fqdn" \
     --output tsv
   ```

2. **Add to App Registration:**
   - Azure Portal → **Microsoft Entra ID** → **App registrations**
   - Click your frontend app
   - Go to **Authentication**
   - Under **Single-page application** → **Redirect URIs**
   - Add: `https://YOUR-EXACT-URL` (no trailing slash!)
   - Click **Save**

> **Important:** The URL must match EXACTLY - including `https://` and no trailing `/`

---

### Problem: "401 Unauthorized" on API Calls

**Symptoms:**
- Frontend loads but API calls fail
- Network tab shows 401 errors

#### Diagnosis

```bash
# Test if DAB is responding at all
curl -I https://YOUR-DAB-URL/api

# Check if the authentication is configured
az containerapp show \
  --name YOUR_DAB_APP \
  --resource-group YOUR_RG \
  --query "properties.template.containers[0].env"
```

#### Possible Causes & Solutions

| Cause | Check | Solution |
|-------|-------|----------|
| Missing bearer token | Browser DevTools → Network → Request headers | Check MSAL configuration |
| Wrong audience | Token has wrong `aud` claim | Update DAB client ID |
| Token expired | Token `exp` claim is in the past | Refresh token or re-login |
| DAB auth not configured | dab-config.json | Add authentication section |

#### Solution: Verify DAB Authentication Config

Check `dab-config.json` has correct settings:

```json
{
  "runtime": {
    "host": {
      "authentication": {
        "provider": "AzureAD",
        "jwt": {
          "audience": "api://YOUR-DAB-CLIENT-ID",
          "issuer": "https://sts.windows.net/YOUR-TENANT-ID/"
        }
      }
    }
  }
}
```

---

### Problem: "AADSTS700016: Application Not Found"

**Symptoms:**
- Login fails immediately
- Error mentions application ID not found

#### Cause

The client ID in your frontend doesn't exist in your Entra ID tenant.

#### Solution

1. Verify the client ID:
   ```bash
   # Check what client ID is being used
   # Look at your frontend container env vars
   az containerapp show \
     --name YOUR_FRONTEND_APP \
     --resource-group YOUR_RG \
     --query "properties.template.containers[0].env" \
     --output table
   ```

2. Verify the app registration exists:
   - Azure Portal → **Microsoft Entra ID** → **App registrations**
   - Search for the client ID
   - If not found, create the app registration

---

## Database Connectivity

### Problem: "Login failed for user"

**Symptoms:**
- DAB container starts but can't connect to database
- Logs show SQL authentication errors

#### Diagnosis

```bash
# View DAB logs for SQL errors
az containerapp logs show \
  --name YOUR_DAB_APP \
  --resource-group YOUR_RG \
  --tail 50 | grep -i "sql\|login\|connection"
```

#### Common Causes & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Login failed" | Wrong username/password | Update connection string |
| "Cannot open database" | Database doesn't exist | Create the database |
| "A network-related error" | Firewall blocking | Add firewall rule |
| "SSL Provider: Certificate" | SSL/TLS issue | Add `TrustServerCertificate=True` |

#### Solution: Update Connection String

```bash
# Update the connection string env var
az containerapp update \
  --name YOUR_DAB_APP \
  --resource-group YOUR_RG \
  --set-env-vars "DATABASE_CONNECTION_STRING=Server=yourserver.database.windows.net;Database=yourdb;User Id=youradmin;Password=yourpassword;Encrypt=True;TrustServerCertificate=False"
```

---

### Problem: Firewall Blocking Connection

**Symptoms:**
- "A network-related or instance-specific error"
- Connection timeouts

#### Solution: Allow Azure Services

**Via Azure Portal:**
1. Go to **SQL servers** → Your server
2. Click **Networking** in left menu
3. Under **Firewall rules**:
   - Toggle **Allow Azure services** to **Yes**
4. Click **Save**

**Via Azure CLI:**
```bash
az sql server firewall-rule create \
  --resource-group YOUR_RG \
  --server YOUR_SQL_SERVER \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## ACR Issues

### Problem: "unauthorized: authentication required"

**Symptoms:**
- Container app can't pull image from ACR
- "ImagePullBackOff" in logs

#### Diagnosis

```bash
# Check if ACR admin is enabled
az acr show --name YOUR_ACR --query "adminUserEnabled"

# Get ACR credentials
az acr credential show --name YOUR_ACR
```

#### Solution: Update Container App Registry Credentials

```bash
# Get current ACR password
ACR_PASSWORD=$(az acr credential show --name YOUR_ACR --query "passwords[0].value" -o tsv)

# Update container app with correct credentials
az containerapp registry set \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --server YOUR_ACR.azurecr.io \
  --username YOUR_ACR \
  --password $ACR_PASSWORD
```

---

### Problem: "Image Not Found"

**Symptoms:**
- Error: "manifest unknown" or "not found"

#### Diagnosis

```bash
# List images in ACR
az acr repository list --name YOUR_ACR --output table

# List tags for specific image
az acr repository show-tags --name YOUR_ACR --repository YOUR_IMAGE --output table
```

#### Solution: Verify Image Exists and Name is Correct

```bash
# Correct image format: REGISTRY.azurecr.io/IMAGE:TAG
# Example: acrdotportal.azurecr.io/dab:latest

# Rebuild if needed
az acr build --registry YOUR_ACR --image YOUR_IMAGE:latest .
```

---

## Networking Issues

### Problem: "502 Bad Gateway"

**Symptoms:**
- App URL returns 502 error
- Sometimes works, sometimes doesn't

#### Common Causes

| Cause | Diagnosis | Solution |
|-------|-----------|----------|
| Container not ready | Check replica count | Wait for scale-up |
| Wrong target port | Check ingress config | Update target port |
| App crashed | Check logs | Fix application error |
| Resource limits | Check CPU/memory | Increase limits |

#### Solution: Force Container Restart

```bash
# Get revision name
REVISION=$(az containerapp revision list \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --query "[0].name" -o tsv)

# Restart
az containerapp revision restart \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --revision $REVISION
```

---

### Problem: CORS Errors

**Symptoms:**
- Browser console shows "CORS policy" errors
- API calls blocked

#### Solution: Update DAB CORS Configuration

In `dab-config.json`:

```json
{
  "runtime": {
    "host": {
      "cors": {
        "origins": ["https://your-frontend-url.azurecontainerapps.io", "*"],
        "allow-credentials": false
      }
    }
  }
}
```

Then rebuild and redeploy the DAB container.

---

## Build Failures

### Problem: ACR Build Fails

**Symptoms:**
- `az acr build` command fails
- Error during Docker build

#### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "COPY failed: file not found" | File path wrong | Check paths in Dockerfile |
| "npm ERR! code ENOENT" | package.json missing | Ensure file exists |
| "permission denied" | Wrong file permissions | Add `RUN chmod` |
| "Could not resolve host" | Network issue | Retry or check DNS |

#### Solution: Debug Build Locally

If you have Docker Desktop available:

```bash
# Build locally to see full errors
docker build -t test-image .

# If no Docker, use verbose output
az acr build --registry YOUR_ACR --image test:debug . --verbose
```

---

### Problem: "Out of Memory" During Build

**Symptoms:**
- Build fails with memory errors
- "Killed" message in build output

#### Solution: Use Premium ACR Tier

```bash
# Upgrade ACR to Premium for more build resources
az acr update --name YOUR_ACR --sku Premium

# Then retry build
az acr build --registry YOUR_ACR --image YOUR_IMAGE:latest .
```

---

## Performance Problems

### Problem: Slow Response Times

**Symptoms:**
- API calls take several seconds
- Timeouts occur

#### Diagnosis

```bash
# Check current resource allocation
az containerapp show \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --query "properties.template.containers[0].resources"

# Check replica count
az containerapp show \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --query "properties.template.scale"
```

#### Solutions

| Issue | Solution |
|-------|----------|
| Cold start (scale from 0) | Set `--min-replicas 1` |
| Not enough CPU | Increase `--cpu` |
| Not enough memory | Increase `--memory` |
| Not enough replicas | Increase `--max-replicas` |

```bash
# Increase resources
az containerapp update \
  --name YOUR_APP \
  --resource-group YOUR_RG \
  --cpu 2 \
  --memory 4Gi \
  --min-replicas 1 \
  --max-replicas 10
```

---

## Getting Help

### Collect Information for Support

Before asking for help, gather:

```bash
# Export diagnostic information
echo "=== App Status ===" > diagnostics.txt
az containerapp show --name YOUR_APP --resource-group YOUR_RG >> diagnostics.txt 2>&1

echo "=== Recent Logs ===" >> diagnostics.txt
az containerapp logs show --name YOUR_APP --resource-group YOUR_RG --tail 100 >> diagnostics.txt 2>&1

echo "=== Revisions ===" >> diagnostics.txt
az containerapp revision list --name YOUR_APP --resource-group YOUR_RG --output table >> diagnostics.txt 2>&1
```

### Resources

| Resource | Link |
|----------|------|
| Azure Status | https://status.azure.com |
| Container Apps Docs | https://learn.microsoft.com/azure/container-apps/ |
| DAB Troubleshooting | https://learn.microsoft.com/azure/data-api-builder/troubleshoot |
| Stack Overflow | https://stackoverflow.com/questions/tagged/azure-container-apps |
| GitHub Issues | https://github.com/Azure/data-api-builder/issues |

---

<div align="center">

**Still stuck?**

Check [Azure Support](https://azure.microsoft.com/support/options/) for professional assistance.

[Back to Index](./index.md) | [Best Practices](./best-practices-guide.md)

</div>
