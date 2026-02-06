<#
.SYNOPSIS
    Builds and pushes the DAB (Data API Builder) container image to Azure Container Registry.

.DESCRIPTION
    This script builds the DAB Docker image from the dab-config directory and pushes it
    to the specified Azure Container Registry. It handles ACR authentication and
    supports custom image tags.

    Configuration can be loaded from a .env file in the repository root.

.PARAMETER AcrName
    The name of the Azure Container Registry (with or without .azurecr.io suffix).

.PARAMETER ImageTag
    The tag to apply to the image. Defaults to 'latest'.

.PARAMETER SubscriptionId
    Optional Azure subscription ID. Uses default if not specified.

.PARAMETER NoPush
    If specified, only builds the image without pushing to ACR.

.PARAMETER EnvFile
    Path to .env file. Default: ../../.env (relative to script)

.EXAMPLE
    # Uses .env file for ACR name
    .\build-push-dab.ps1

.EXAMPLE
    # Explicit ACR name
    .\build-push-dab.ps1 -AcrName "acrdabdemodev"

.EXAMPLE
    .\build-push-dab.ps1 -AcrName "acrdabdemodev" -ImageTag "v1.0.0"

.NOTES
    Requires: Docker Desktop, Azure CLI
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$AcrName,

    [string]$ImageTag = "latest",

    [string]$SubscriptionId,

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
$DabConfigDir = Join-Path $RepoRoot "src\dab-config"

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
# Resolve Configuration (Parameter > .env > Prompt)
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

# =============================================================================
# Main Script
# =============================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DOT Demo - Build DAB Container Image" -ForegroundColor Cyan
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
$dockerfile = Join-Path $DabConfigDir "Dockerfile"
if (-not (Test-Path $dockerfile)) {
    Write-Host "ERROR: Dockerfile not found at $dockerfile" -ForegroundColor Red
    exit 1
}
Write-Host "  Dockerfile found" -ForegroundColor Green

# Image configuration
$acrLoginServer = "$AcrName.azurecr.io"
$imageName = "dab"
$fullImageName = "$acrLoginServer/${imageName}:${ImageTag}"

Write-Host ""
Write-Host "Build Configuration:" -ForegroundColor White
Write-Host "  ACR: $acrLoginServer" -ForegroundColor Gray
Write-Host "  Image: $imageName" -ForegroundColor Gray
Write-Host "  Tag: $ImageTag" -ForegroundColor Gray
Write-Host "  Full Name: $fullImageName" -ForegroundColor Gray
Write-Host ""

# Build the image
Write-Host "Building Docker image..." -ForegroundColor Cyan
Push-Location $DabConfigDir
try {
    docker build -t $fullImageName -t "${acrLoginServer}/${imageName}:latest" .
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
Write-Host "DAB image build completed!" -ForegroundColor Green
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
