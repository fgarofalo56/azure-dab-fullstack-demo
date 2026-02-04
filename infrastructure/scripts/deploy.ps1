<#
.SYNOPSIS
    Deploys the Azure DAB Full-Stack Demo infrastructure.

.DESCRIPTION
    This script deploys all Azure resources required for the Data API Builder
    demo including ACR, ACI, Azure SQL, and storage accounts.

    Supports two-phase deployment:
    1. First run with -SkipContainers to deploy infrastructure only
    2. Build and push container images to ACR
    3. Run again with -ContainersOnly to deploy containers

.PARAMETER ResourceGroupName
    Name of the Azure resource group to deploy to.

.PARAMETER Location
    Azure region for deployment. Default: eastus

.PARAMETER Environment
    Deployment environment (dev, staging, prod). Default: dev

.PARAMETER BaseName
    Base name for all resources. Default: dabdemo

.PARAMETER SkipContainers
    Skip deploying container instances (use for initial infrastructure setup)

.PARAMETER ContainersOnly
    Deploy only the container instances (use after images are pushed to ACR)

.PARAMETER LogAnalyticsWorkspaceId
    Full resource ID of the Log Analytics workspace for diagnostic settings.
    Example: /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/{name}

.PARAMETER DisableDiagnostics
    Disable diagnostic settings for all resources.

.EXAMPLE
    ./deploy.ps1 -ResourceGroupName "rg-dab-demo" -Location "eastus" -SkipContainers

.EXAMPLE
    ./deploy.ps1 -ResourceGroupName "rg-dab-demo" -Location "eastus" -ContainersOnly

.EXAMPLE
    ./deploy.ps1 -ResourceGroupName "rg-dab-prod" -Environment "prod" -Location "westus2"

.EXAMPLE
    ./deploy.ps1 -ResourceGroupName "rg-dab-demo" -LogAnalyticsWorkspaceId "/subscriptions/.../workspaces/my-workspace"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory = $false)]
    [string]$Location = "eastus",

    [Parameter(Mandatory = $false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",

    [Parameter(Mandatory = $false)]
    [string]$BaseName = "dabdemo",

    [Parameter(Mandatory = $false)]
    [switch]$SkipContainers,

    [Parameter(Mandatory = $false)]
    [switch]$ContainersOnly,

    [Parameter(Mandatory = $false)]
    [string]$LogAnalyticsWorkspaceId = "/subscriptions/a60a2fdd-c133-4845-9beb-31f470bf3ef5/resourceGroups/rg-alz-dev-logging/providers/Microsoft.OperationalInsights/workspaces/alz-dev-dataObservability-logAnalyticsWorkspace",

    [Parameter(Mandatory = $false)]
    [switch]$DisableDiagnostics
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Step { param($Message) Write-Host "`n>> $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "   $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "   $Message" -ForegroundColor Gray }

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  Azure DAB Demo - Infrastructure Deploy" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Check Azure CLI login
Write-Step "Checking Azure CLI authentication..."
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "   Not logged in. Please run 'az login' first." -ForegroundColor Red
    exit 1
}
Write-Success "Logged in as: $($account.user.name)"
Write-Info "Subscription: $($account.name)"

# Create resource group if it doesn't exist
Write-Step "Ensuring resource group exists..."
$rgExists = az group exists --name $ResourceGroupName
if ($rgExists -eq "false") {
    az group create --name $ResourceGroupName --location $Location --output none
    Write-Success "Created resource group: $ResourceGroupName"
} else {
    Write-Info "Resource group already exists: $ResourceGroupName"
}

# Prompt for SQL password
Write-Step "Setting up SQL credentials..."
$sqlPassword = Read-Host -AsSecureString "Enter SQL admin password"
$sqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sqlPassword)
)

# Prompt for Azure AD app registrations
Write-Step "Setting up Azure AD app registrations..."
Write-Host "   You need to create two Azure AD app registrations:" -ForegroundColor Yellow
Write-Host "   1. DAB Backend App - for Data API Builder authentication" -ForegroundColor Yellow
Write-Host "   2. Frontend App - for React SPA authentication" -ForegroundColor Yellow
Write-Host ""

$dabClientId = Read-Host "Enter DAB Backend App Client ID"
$frontendClientId = Read-Host "Enter Frontend App Client ID"

# Get tenant ID
$tenantId = $account.tenantId

# Determine if we should deploy containers
$deployContainers = -not $SkipContainers
if ($ContainersOnly) {
    $deployContainers = $true
}

# Determine if diagnostics should be enabled
$enableDiagnostics = -not $DisableDiagnostics

# Deploy Bicep template
if ($SkipContainers) {
    Write-Step "Deploying infrastructure only (containers will be skipped)..."
} elseif ($ContainersOnly) {
    Write-Step "Deploying containers only..."
} else {
    Write-Step "Deploying full infrastructure with containers..."
}

if ($enableDiagnostics -and $LogAnalyticsWorkspaceId) {
    Write-Info "Diagnostics enabled - sending logs to Log Analytics workspace"
}

$deploymentName = "dab-demo-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

$bicepPath = Join-Path $PSScriptRoot "..\bicep\main.bicep"

$deployment = az deployment group create `
    --resource-group $ResourceGroupName `
    --name $deploymentName `
    --template-file $bicepPath `
    --parameters `
        environment=$Environment `
        baseName=$BaseName `
        sqlAdminPassword=$sqlPasswordPlain `
        tenantId=$tenantId `
        dabClientId=$dabClientId `
        frontendClientId=$frontendClientId `
        deployContainers=$deployContainers `
        logAnalyticsWorkspaceId=$LogAnalyticsWorkspaceId `
        enableDiagnostics=$enableDiagnostics `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "   Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Success "Deployment completed successfully!"

# Get outputs
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
    Write-Host "`nData API Builder:" -ForegroundColor Cyan
    Write-Host "   URL: $($outputs.dabUrl.value)"
    Write-Host "   REST API: $($outputs.dabUrl.value)/api"
    Write-Host "   GraphQL: $($outputs.dabUrl.value)/graphql"

    Write-Host "`nFrontend:" -ForegroundColor Cyan
    Write-Host "   URL: $($outputs.frontendUrl.value)"
} else {
    Write-Host "`nContainers:" -ForegroundColor Yellow
    Write-Host "   Not deployed (use -ContainersOnly after pushing images)"
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

    Write-Host "4. Deploy containers (after images are pushed):" -ForegroundColor White
    Write-Host "   ./deploy.ps1 -ResourceGroupName $ResourceGroupName -Location $Location -ContainersOnly`n"
} else {
    Write-Host "1. Initialize the database schema (if not done):" -ForegroundColor White
    Write-Host "   cd ../../src/database"
    Write-Host "   ./Initialize-Database.ps1 -ServerName '$($outputs.sqlServerFqdn.value)' -DatabaseName '$($outputs.sqlDatabaseName.value)' -Username 'sqladmin' -Password '<your-password>'`n"

    Write-Host "2. Access your application:" -ForegroundColor White
    Write-Host "   Frontend: $($outputs.frontendUrl.value)"
    Write-Host "   DAB API:  $($outputs.dabUrl.value)/api`n"
}

# Save deployment outputs for later use
$outputPath = Join-Path $PSScriptRoot "..\..\deployment-outputs.json"
$outputs | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding UTF8
Write-Info "Deployment outputs saved to: $outputPath"
