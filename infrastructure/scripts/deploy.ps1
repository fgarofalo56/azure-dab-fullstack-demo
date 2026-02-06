<#
.SYNOPSIS
    Deploys the Azure DAB Full-Stack Demo infrastructure with Container Apps.

.DESCRIPTION
    This script deploys all Azure resources required for the Data API Builder
    demo including ACR, Azure SQL, Container Apps, and supporting services.

    Configuration can be provided via:
    1. A .env file in the repository root (recommended)
    2. Command-line parameters (override .env values)
    3. Interactive prompts (for missing required values)

.PARAMETER ResourceGroupName
    Name of the Azure resource group to deploy to.

.PARAMETER Location
    Azure region for deployment. Default: eastus2

.PARAMETER Environment
    Deployment environment (dev, staging, prod). Default: dev

.PARAMETER BaseName
    Base name for all resources. Default: dabdemo

.PARAMETER SkipContainers
    Skip deploying Container Apps (use for initial infrastructure setup)

.PARAMETER EnvFile
    Path to .env file. Default: ../../.env (relative to script)

.EXAMPLE
    # Use .env file for all configuration
    ./deploy.ps1 -ResourceGroupName "rg-dab-demo"

.EXAMPLE
    # Override .env values with parameters
    ./deploy.ps1 -ResourceGroupName "rg-dab-demo" -Environment "prod" -MinReplicas 1

.EXAMPLE
    # Skip containers for initial infrastructure deployment
    ./deploy.ps1 -ResourceGroupName "rg-dab-demo" -SkipContainers
#>

param(
    [Parameter(Mandatory = $false)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory = $false)]
    [string]$Location,

    [Parameter(Mandatory = $false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,

    [Parameter(Mandatory = $false)]
    [string]$BaseName,

    [Parameter(Mandatory = $false)]
    [switch]$SkipContainers,

    [Parameter(Mandatory = $false)]
    [string]$LogAnalyticsWorkspaceId,

    [Parameter(Mandatory = $false)]
    [switch]$DisableDiagnostics,

    [Parameter(Mandatory = $false)]
    [switch]$SkipFrontDoor,

    [Parameter(Mandatory = $false)]
    [ValidateRange(0, 10)]
    [int]$MinReplicas = -1,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 10)]
    [int]$MaxReplicas = -1,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 1000)]
    [int]$HttpScaleThreshold = -1,

    [Parameter(Mandatory = $false)]
    [string]$EnvFile
)

$ErrorActionPreference = "Stop"

# =============================================================================
# Helper Functions
# =============================================================================

function Write-Step { param($Message) Write-Host "`n>> $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "   $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "   $Message" -ForegroundColor Gray }
function Write-Warn { param($Message) Write-Host "   $Message" -ForegroundColor Yellow }

function Read-EnvFile {
    param([string]$Path)

    $envVars = @{}
    if (Test-Path $Path) {
        Get-Content $Path | ForEach-Object {
            $line = $_.Trim()
            # Skip comments and empty lines
            if ($line -and -not $line.StartsWith('#')) {
                $parts = $line -split '=', 2
                if ($parts.Count -eq 2) {
                    $key = $parts[0].Trim()
                    $value = $parts[1].Trim()
                    # Remove surrounding quotes if present
                    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
                        ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                        $value = $value.Substring(1, $value.Length - 2)
                    }
                    $envVars[$key] = $value
                }
            }
        }
    }
    return $envVars
}

# =============================================================================
# Load Configuration
# =============================================================================

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  Azure DAB Demo - Container Apps Deploy" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Determine .env file path
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

if (-not $EnvFile) {
    $EnvFile = Join-Path $RepoRoot ".env"
}

# Load .env file if it exists
$envConfig = @{}
if (Test-Path $EnvFile) {
    Write-Step "Loading configuration from .env file..."
    $envConfig = Read-EnvFile -Path $EnvFile
    Write-Success "Loaded $($envConfig.Count) settings from .env"
} else {
    Write-Step "No .env file found at $EnvFile"
    Write-Info "Will prompt for required values (create .env from .env.example for easier deployments)"
}

# =============================================================================
# Resolve Configuration (Parameter > .env > Default > Prompt)
# =============================================================================

# Resource Group (required)
if (-not $ResourceGroupName) {
    $ResourceGroupName = $envConfig['AZURE_RESOURCE_GROUP']
}
if (-not $ResourceGroupName) {
    $ResourceGroupName = Read-Host "Enter Resource Group name"
}

# Location
if (-not $Location) {
    $Location = $envConfig['AZURE_LOCATION']
}
if (-not $Location) {
    $Location = "eastus2"
}

# Environment
if (-not $Environment) {
    $Environment = $envConfig['ENVIRONMENT']
}
if (-not $Environment) {
    $Environment = "dev"
}

# Base Name
if (-not $BaseName) {
    $BaseName = $envConfig['BASE_NAME']
}
if (-not $BaseName) {
    $BaseName = "dabdemo"
}

# SQL Password
$sqlPassword = $envConfig['SQL_ADMIN_PASSWORD']
if (-not $sqlPassword) {
    Write-Step "SQL credentials required..."
    $sqlPasswordSecure = Read-Host -AsSecureString "Enter SQL admin password"
    $sqlPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sqlPasswordSecure)
    )
}

# DAB Client ID
$dabClientId = $envConfig['DAB_CLIENT_ID']
if (-not $dabClientId) {
    Write-Step "Azure AD app registrations required..."
    $dabClientId = Read-Host "Enter DAB Backend App Client ID"
}

# Frontend Client ID
$frontendClientId = $envConfig['FRONTEND_CLIENT_ID']
if (-not $frontendClientId) {
    $frontendClientId = Read-Host "Enter Frontend App Client ID"
}

# Log Analytics Workspace ID (optional - if not provided, diagnostics will be limited)
if (-not $LogAnalyticsWorkspaceId) {
    $LogAnalyticsWorkspaceId = $envConfig['LOG_ANALYTICS_WORKSPACE_ID']
}
# No default - if not provided, Container Apps won't have Log Analytics integration
# Set LOG_ANALYTICS_WORKSPACE_ID in .env or use -LogAnalyticsWorkspaceId parameter

# Scaling parameters (-1 means not set, use .env or default)
if ($MinReplicas -eq -1) {
    $minReplicasEnv = $envConfig['MIN_REPLICAS']
    $MinReplicas = if ($minReplicasEnv) { [int]$minReplicasEnv } else { 0 }
}
if ($MaxReplicas -eq -1) {
    $maxReplicasEnv = $envConfig['MAX_REPLICAS']
    $MaxReplicas = if ($maxReplicasEnv) { [int]$maxReplicasEnv } else { 10 }
}
if ($HttpScaleThreshold -eq -1) {
    $thresholdEnv = $envConfig['HTTP_SCALE_THRESHOLD']
    $HttpScaleThreshold = if ($thresholdEnv) { [int]$thresholdEnv } else { 100 }
}

# =============================================================================
# Azure Login Check
# =============================================================================

Write-Step "Checking Azure CLI authentication..."
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "   Not logged in. Please run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Success "Logged in as: $($account.user.name)"
Write-Info "Subscription: $($account.name)"

# Get tenant ID from current session
$tenantId = $account.tenantId

# =============================================================================
# Create Resource Group
# =============================================================================

Write-Step "Ensuring resource group exists..."
$rgExists = az group exists --name $ResourceGroupName
if ($rgExists -eq "false") {
    az group create --name $ResourceGroupName --location $Location --output none
    Write-Success "Created resource group: $ResourceGroupName"
} else {
    Write-Info "Resource group already exists: $ResourceGroupName"
}

# =============================================================================
# Deploy Bicep Template
# =============================================================================

$deployContainers = -not $SkipContainers
$enableDiagnostics = -not $DisableDiagnostics
$deployFrontDoor = -not $SkipFrontDoor

Write-Step "Deployment Configuration:"
Write-Info "Resource Group: $ResourceGroupName"
Write-Info "Location: $Location"
Write-Info "Environment: $Environment"
Write-Info "Base Name: $BaseName"
Write-Info "Deploy Containers: $deployContainers"
Write-Info "Auto-scaling: $MinReplicas - $MaxReplicas replicas (threshold: $HttpScaleThreshold)"

if ($SkipContainers) {
    Write-Warn "Container Apps will be skipped (push images to ACR first, then run again)"
}

$deploymentName = "dab-demo-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$bicepPath = Join-Path $PSScriptRoot "..\bicep\main.bicep"

Write-Step "Deploying Azure resources..."

$deployment = az deployment group create `
    --resource-group $ResourceGroupName `
    --name $deploymentName `
    --template-file $bicepPath `
    --parameters `
        environment=$Environment `
        baseName=$BaseName `
        sqlAdminPassword=$sqlPassword `
        tenantId=$tenantId `
        dabClientId=$dabClientId `
        frontendClientId=$frontendClientId `
        deployContainers=$deployContainers `
        logAnalyticsWorkspaceId=$LogAnalyticsWorkspaceId `
        enableDiagnostics=$enableDiagnostics `
        deployFrontDoor=$deployFrontDoor `
        minReplicas=$MinReplicas `
        maxReplicas=$MaxReplicas `
        httpScaleThreshold=$HttpScaleThreshold `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "   Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Success "Deployment completed successfully!"

# =============================================================================
# Display Results
# =============================================================================

$outputs = $deployment.properties.outputs

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Azure Container Registry:" -ForegroundColor Cyan
Write-Host "   Name: $($outputs.acrName.value)"
Write-Host "   Login Server: $($outputs.acrLoginServer.value)"

Write-Host "`nAzure SQL:" -ForegroundColor Cyan
Write-Host "   Server: $($outputs.sqlServerFqdn.value)"
Write-Host "   Database: $($outputs.sqlDatabaseName.value)"

if ($outputs.containersDeployed.value -eq $true) {
    Write-Host "`nContainer Apps Environment:" -ForegroundColor Cyan
    Write-Host "   Name: $($outputs.containerAppEnvironmentName.value)"

    Write-Host "`nData API Builder Container App:" -ForegroundColor Cyan
    Write-Host "   Name: $($outputs.dabContainerAppName.value)"
    Write-Host "   URL: $($outputs.dabContainerAppUrl.value)"

    Write-Host "`nFrontend Container App:" -ForegroundColor Cyan
    Write-Host "   Name: $($outputs.frontendContainerAppName.value)"
    Write-Host "   URL: $($outputs.frontendContainerAppUrl.value)"

    Write-Host "`nAuto-Scaling Configuration:" -ForegroundColor Cyan
    Write-Host "   Min Replicas: $($outputs.scalingMinReplicas.value)"
    Write-Host "   Max Replicas: $($outputs.scalingMaxReplicas.value)"
    Write-Host "   Scale Threshold: $($outputs.scalingHttpThreshold.value) concurrent requests"

    if ($outputs.appInsightsName.value) {
        Write-Host "`nApplication Insights:" -ForegroundColor Cyan
        Write-Host "   Name: $($outputs.appInsightsName.value)"
    }

    if ($outputs.frontDoorDeployed.value -eq $true) {
        Write-Host "`nAzure Front Door (HTTPS):" -ForegroundColor Green
        Write-Host "   Hostname: $($outputs.frontDoorHostname.value)"
        Write-Host "   Frontend URL: $($outputs.frontDoorUrl.value)" -ForegroundColor Green
        Write-Host "   REST API: $($outputs.frontDoorApiUrl.value)"
        Write-Host "   GraphQL: $($outputs.frontDoorGraphqlUrl.value)"
        Write-Host ""
        Write-Host "   ** Use the Front Door URL for HTTPS access with MSAL authentication **" -ForegroundColor Yellow
    }
} else {
    Write-Host "`nContainer Apps:" -ForegroundColor Yellow
    Write-Host "   Not deployed (push images to ACR and run again without -SkipContainers)"
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  NEXT STEPS" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

if ($SkipContainers -or $outputs.containersDeployed.value -eq $false) {
    Write-Host "1. Build and push the DAB container:" -ForegroundColor White
    Write-Host "   ./build-push-dab.ps1 -AcrName $($outputs.acrName.value)`n"

    Write-Host "2. Build and push the frontend container:" -ForegroundColor White
    Write-Host "   ./build-push-frontend.ps1 -AcrName $($outputs.acrName.value)`n"

    Write-Host "3. Initialize the database schema:" -ForegroundColor White
    Write-Host "   cd ../../src/database"
    Write-Host "   ./Initialize-Database.ps1 -ServerName '$($outputs.sqlServerFqdn.value)' -DatabaseName '$($outputs.sqlDatabaseName.value)' -Username 'sqladmin' -Password '<your-password>'`n"

    Write-Host "4. Deploy Container Apps (after images are pushed):" -ForegroundColor White
    Write-Host "   ./deploy.ps1 -ResourceGroupName $ResourceGroupName`n"
} else {
    Write-Host "1. Initialize the database schema (if not done):" -ForegroundColor White
    Write-Host "   cd ../../src/database"
    Write-Host "   ./Initialize-Database.ps1 -ServerName '$($outputs.sqlServerFqdn.value)' -DatabaseName '$($outputs.sqlDatabaseName.value)' -Username 'sqladmin' -Password '<password>'`n"

    if ($outputs.frontDoorDeployed.value -eq $true) {
        Write-Host "2. Update Azure AD App Registration redirect URIs:" -ForegroundColor White
        Write-Host "   Add: $($outputs.frontDoorUrl.value)`n"

        Write-Host "3. Access your application via Front Door (HTTPS):" -ForegroundColor White
        Write-Host "   Frontend: $($outputs.frontDoorUrl.value)" -ForegroundColor Green
        Write-Host "   DAB API:  $($outputs.frontDoorApiUrl.value)`n"
    } else {
        Write-Host "2. Access your application via Container Apps:" -ForegroundColor White
        Write-Host "   Frontend: $($outputs.frontendContainerAppUrl.value)"
        Write-Host "   DAB API:  $($outputs.dabContainerAppUrl.value)`n"
    }

    Write-Host "4. Monitor auto-scaling:" -ForegroundColor White
    Write-Host "   az containerapp show -n $($outputs.dabContainerAppName.value) -g $ResourceGroupName --query 'properties.runningStatus'"
    Write-Host "   az containerapp replica list -n $($outputs.dabContainerAppName.value) -g $ResourceGroupName`n"
}

# Save deployment outputs for later use
$outputPath = Join-Path $RepoRoot "deployment-outputs.json"
$outputs | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding UTF8
Write-Info "Deployment outputs saved to: $outputPath"
