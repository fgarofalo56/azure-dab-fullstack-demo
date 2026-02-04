<#
.SYNOPSIS
    Builds and pushes the Frontend container image to Azure Container Registry.

.DESCRIPTION
    This script builds the React frontend Docker image and pushes it to the specified
    Azure Container Registry. It handles ACR authentication and supports custom image
    tags and build-time environment variables.

.PARAMETER AcrName
    The name of the Azure Container Registry (without .azurecr.io suffix).

.PARAMETER ImageTag
    The tag to apply to the image. Defaults to 'latest'.

.PARAMETER SubscriptionId
    Optional Azure subscription ID. Uses default if not specified.

.PARAMETER ApiBaseUrl
    The DAB API base URL for build-time configuration.

.PARAMETER AzureAdClientId
    The Azure AD client ID for the frontend app registration.

.PARAMETER AzureAdTenantId
    The Azure AD tenant ID.

.PARAMETER NoPush
    If specified, only builds the image without pushing to ACR.

.EXAMPLE
    .\build-push-frontend.ps1 -AcrName "acrdabdemodev"

.EXAMPLE
    .\build-push-frontend.ps1 -AcrName "acrdabdemodev" -ImageTag "v1.0.0" -ApiBaseUrl "https://dabdemo-dev-dab.eastus.azurecontainer.io:5000/api"

.NOTES
    Requires: Docker Desktop, Azure CLI
    Author: DOT Demo Project
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$AcrName,

    [string]$ImageTag = "latest",

    [string]$SubscriptionId,

    [string]$ApiBaseUrl = "/api",

    [string]$AzureAdClientId,

    [string]$AzureAdTenantId,

    [switch]$NoPush
)

$ErrorActionPreference = "Stop"

# Script paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$FrontendDir = Join-Path $RepoRoot "src\frontend"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DOT Demo - Build Frontend Container Image" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Validate Docker is running
Write-Host "Checking Docker..." -ForegroundColor Gray
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "  Docker is running" -ForegroundColor Green

# Validate Dockerfile exists
$dockerfile = Join-Path $FrontendDir "Dockerfile"
if (-not (Test-Path $dockerfile)) {
    Write-Host "ERROR: Dockerfile not found at $dockerfile" -ForegroundColor Red
    exit 1
}
Write-Host "  Dockerfile found" -ForegroundColor Green

# Image configuration
$acrLoginServer = "$AcrName.azurecr.io"
$imageName = "frontend"
$fullImageName = "$acrLoginServer/${imageName}:${ImageTag}"

Write-Host ""
Write-Host "Build Configuration:" -ForegroundColor White
Write-Host "  ACR: $acrLoginServer" -ForegroundColor Gray
Write-Host "  Image: $imageName" -ForegroundColor Gray
Write-Host "  Tag: $ImageTag" -ForegroundColor Gray
Write-Host "  Full Name: $fullImageName" -ForegroundColor Gray
Write-Host ""

# Build arguments for Vite environment variables
$buildArgs = @()
if ($ApiBaseUrl) {
    $buildArgs += "--build-arg", "VITE_API_BASE_URL=$ApiBaseUrl"
}
if ($AzureAdClientId) {
    $buildArgs += "--build-arg", "VITE_AZURE_AD_CLIENT_ID=$AzureAdClientId"
}
if ($AzureAdTenantId) {
    $buildArgs += "--build-arg", "VITE_AZURE_AD_TENANT_ID=$AzureAdTenantId"
}

# Build the image
Write-Host "Building Docker image..." -ForegroundColor Cyan
Push-Location $FrontendDir
try {
    $dockerCmd = @("build", "-t", $fullImageName, "-t", "${acrLoginServer}/${imageName}:latest")
    $dockerCmd += $buildArgs
    $dockerCmd += "."

    Write-Host "  Command: docker $($dockerCmd -join ' ')" -ForegroundColor Gray
    docker @dockerCmd

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Build completed successfully" -ForegroundColor Green
}
finally {
    Pop-Location
}

# Push to ACR if not NoPush
if (-not $NoPush) {
    Write-Host ""
    Write-Host "Logging in to Azure Container Registry..." -ForegroundColor Cyan

    # Check if logged in to Azure
    $account = az account show 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Not logged in to Azure. Running 'az login'..." -ForegroundColor Yellow
        az login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Azure login failed" -ForegroundColor Red
            exit 1
        }
    }

    # Set subscription if specified
    if ($SubscriptionId) {
        az account set --subscription $SubscriptionId
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to set subscription" -ForegroundColor Red
            exit 1
        }
    }

    # Login to ACR
    az acr login --name $AcrName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: ACR login failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ACR login successful" -ForegroundColor Green

    # Push the image
    Write-Host ""
    Write-Host "Pushing image to ACR..." -ForegroundColor Cyan

    docker push $fullImageName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker push failed" -ForegroundColor Red
        exit 1
    }

    # Also push latest tag if not already latest
    if ($ImageTag -ne "latest") {
        docker push "${acrLoginServer}/${imageName}:latest"
    }

    Write-Host "  Push completed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Frontend image build completed!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Image: $fullImageName" -ForegroundColor White

if ($NoPush) {
    Write-Host ""
    Write-Host "Note: Image was NOT pushed to ACR (--NoPush specified)" -ForegroundColor Yellow
    Write-Host "To push manually, run:" -ForegroundColor Gray
    Write-Host "  az acr login --name $AcrName" -ForegroundColor Gray
    Write-Host "  docker push $fullImageName" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Deployment Notes:" -ForegroundColor Cyan
Write-Host "  - Environment variables are baked in at build time" -ForegroundColor Gray
Write-Host "  - Update VITE_* vars and rebuild for config changes" -ForegroundColor Gray
Write-Host "  - Nginx serves the static files on port 80" -ForegroundColor Gray
Write-Host ""
