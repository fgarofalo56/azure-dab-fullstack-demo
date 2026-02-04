<#
.SYNOPSIS
    Deploys the Azure DAB Full-Stack Demo infrastructure.

.DESCRIPTION
    This script deploys all Azure resources required for the Data API Builder
    demo including ACR, ACI, Azure SQL, and storage accounts.

.PARAMETER ResourceGroupName
    Name of the Azure resource group to deploy to.

.PARAMETER Location
    Azure region for deployment. Default: eastus

.PARAMETER Environment
    Deployment environment (dev, staging, prod). Default: dev

.PARAMETER BaseName
    Base name for all resources. Default: dabdemo

.EXAMPLE
    ./deploy.ps1 -ResourceGroupName "rg-dab-demo" -Location "eastus"

.EXAMPLE
    ./deploy.ps1 -ResourceGroupName "rg-dab-prod" -Environment "prod" -Location "westus2"
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
    [string]$BaseName = "dabdemo"
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

# Deploy Bicep template
Write-Step "Deploying Bicep template..."
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

Write-Host "`nData API Builder:" -ForegroundColor Cyan
Write-Host "   URL: $($outputs.dabUrl.value)"
Write-Host "   REST API: $($outputs.dabUrl.value)/api"
Write-Host "   GraphQL: $($outputs.dabUrl.value)/graphql"

Write-Host "`nFrontend:" -ForegroundColor Cyan
Write-Host "   URL: $($outputs.frontendUrl.value)"

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  NEXT STEPS" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

Write-Host "1. Build and push the DAB container:"
Write-Host "   ./build-push-dab.ps1 -AcrName $($outputs.acrName.value)`n"

Write-Host "2. Build and push the frontend container:"
Write-Host "   ./build-push-frontend.ps1 -AcrName $($outputs.acrName.value)`n"

Write-Host "3. Initialize the database schema:"
Write-Host "   See docs/setup-guide.md for SQL scripts`n"

# Save deployment outputs for later use
$outputPath = Join-Path $PSScriptRoot "..\..\deployment-outputs.json"
$outputs | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding UTF8
Write-Info "Deployment outputs saved to: $outputPath"
