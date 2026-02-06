<#
.SYNOPSIS
    Builds and pushes the Frontend container image to Azure Container Registry.

.DESCRIPTION
    This script builds the React frontend Docker image and pushes it to the specified
    Azure Container Registry. It handles ACR authentication and supports custom image
    tags and build-time environment variables.

    Configuration can be loaded from a .env file in the repository root.

.PARAMETER AcrName
    The name of the Azure Container Registry (with or without .azurecr.io suffix).

.PARAMETER ImageTag
    The tag to apply to the image. Defaults to 'latest'.

.PARAMETER ApiBaseUrl
    The DAB API base URL for build-time configuration. Default: /api

.PARAMETER AzureAdClientId
    The Azure AD client ID for the frontend app registration.

.PARAMETER AzureAdTenantId
    The Azure AD tenant ID.

.PARAMETER NoPush
    If specified, only builds the image without pushing to ACR.

.PARAMETER EnvFile
    Path to .env file. Default: ../../.env (relative to script)

.EXAMPLE
    # Uses .env file for configuration
    .\build-push-frontend.ps1 -AcrName "acrdabdemodev"

.EXAMPLE
    # Override with explicit parameters
    .\build-push-frontend.ps1 -AcrName "acrdabdemodev" -ImageTag "v1.0.0" -AzureAdClientId "your-client-id"

.NOTES
    Requires: Docker Desktop, Azure CLI
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$AcrName,

    [string]$ImageTag = "latest",

    [string]$SubscriptionId,

    [string]$ApiBaseUrl,

    [string]$AzureAdClientId,

    [string]$AzureAdTenantId,

    [string]$DabClientId,

    [switch]$NoPush,

    [string]$EnvFile
)

$ErrorActionPreference = "Stop"

# =============================================================================
# Helper Functions
# =============================================================================

function Read-EnvFile {
    param([string]$Path)

    $envVars = @{}
    if (Test-Path $Path) {
        Get-Content $Path | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith('#')) {
                $parts = $line -split '=', 2
                if ($parts.Count -eq 2) {
                    $key = $parts[0].Trim()
                    $value = $parts[1].Trim()
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
# Script paths and .env loading
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$FrontendDir = Join-Path $RepoRoot "src\frontend"

# Determine .env file path
if (-not $EnvFile) {
    $EnvFile = Join-Path $RepoRoot ".env"
}

# Load .env file if it exists
$envConfig = @{}
if (Test-Path $EnvFile) {
    $envConfig = Read-EnvFile -Path $EnvFile
}

# =============================================================================
# Resolve Configuration (Parameter > .env > Default)
# =============================================================================

# ACR Name
if (-not $AcrName) {
    $AcrName = $envConfig['ACR_NAME']
}
if (-not $AcrName) {
    Write-Host "ERROR: ACR name is required. Provide via -AcrName parameter or ACR_NAME in .env" -ForegroundColor Red
    exit 1
}

# Normalize ACR name - strip .azurecr.io suffix if provided
if ($AcrName -match '\.azurecr\.io$') {
    $AcrName = $AcrName -replace '\.azurecr\.io$', ''
}

# API Base URL
if (-not $ApiBaseUrl) {
    $ApiBaseUrl = $envConfig['VITE_API_BASE_URL']
}
if (-not $ApiBaseUrl) {
    $ApiBaseUrl = "/api"
}

# Azure AD Client ID
if (-not $AzureAdClientId) {
    $AzureAdClientId = $envConfig['FRONTEND_CLIENT_ID']
}
if (-not $AzureAdClientId) {
    $AzureAdClientId = $envConfig['VITE_AZURE_AD_CLIENT_ID']
}

# Azure AD Tenant ID
if (-not $AzureAdTenantId) {
    $AzureAdTenantId = $envConfig['AZURE_TENANT_ID']
}
if (-not $AzureAdTenantId) {
    $AzureAdTenantId = $envConfig['VITE_AZURE_AD_TENANT_ID']
}

# DAB Client ID (for API scope)
if (-not $DabClientId) {
    $DabClientId = $envConfig['DAB_CLIENT_ID']
}
if (-not $DabClientId) {
    $DabClientId = $envConfig['VITE_DAB_CLIENT_ID']
}

# =============================================================================
# Main Script
# =============================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DOT Demo - Build Frontend Container Image" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $EnvFile) {
    Write-Host "  Loaded config from .env file" -ForegroundColor Green
}

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
Write-Host "Frontend Configuration:" -ForegroundColor White
Write-Host "  API Base URL: $ApiBaseUrl" -ForegroundColor Gray
Write-Host "  Azure AD Client ID: $(if ($AzureAdClientId) { $AzureAdClientId } else { '(not set)' })" -ForegroundColor Gray
Write-Host "  Azure AD Tenant ID: $(if ($AzureAdTenantId) { $AzureAdTenantId } else { '(not set)' })" -ForegroundColor Gray
Write-Host "  DAB Client ID (API): $(if ($DabClientId) { $DabClientId } else { '(not set)' })" -ForegroundColor Gray
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
if ($DabClientId) {
    $buildArgs += "--build-arg", "VITE_DAB_CLIENT_ID=$DabClientId"
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
