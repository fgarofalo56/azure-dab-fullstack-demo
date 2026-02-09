<#
.SYNOPSIS
    Cleans up (deletes) Azure resources for the DAB Full-Stack Demo.

.DESCRIPTION
    This script deletes the resource group and all resources within it.
    Use this for cleanup after testing or failed deployments.

    WARNING: This action is irreversible. All data will be lost.

.PARAMETER ResourceGroupName
    Name of the Azure resource group to delete.

.PARAMETER Force
    Skip confirmation prompt and delete immediately.

.PARAMETER WaitForCompletion
    Wait for deletion to complete (default: true).

.EXAMPLE
    # Interactive deletion with confirmation
    ./cleanup.ps1 -ResourceGroupName "rg-dab-demo"

.EXAMPLE
    # Force deletion without confirmation
    ./cleanup.ps1 -ResourceGroupName "rg-dab-demo" -Force

.EXAMPLE
    # Delete without waiting for completion
    ./cleanup.ps1 -ResourceGroupName "rg-dab-demo" -Force -WaitForCompletion:$false
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory = $false)]
    [switch]$Force,

    [Parameter(Mandatory = $false)]
    [bool]$WaitForCompletion = $true
)

$ErrorActionPreference = "Stop"

# =============================================================================
# Helper Functions
# =============================================================================

function Write-Step { param($Message) Write-Host "`n>> $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "   $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "   $Message" -ForegroundColor Gray }
function Write-Warn { param($Message) Write-Host "   $Message" -ForegroundColor Yellow }

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

# =============================================================================
# Check Resource Group Exists
# =============================================================================

Write-Step "Checking if resource group exists..."
$rgExists = az group exists --name $ResourceGroupName
if ($rgExists -eq "false") {
    Write-Host "   Resource group '$ResourceGroupName' does not exist." -ForegroundColor Yellow
    exit 0
}

# Get resources in the group
$resources = az resource list --resource-group $ResourceGroupName --output json | ConvertFrom-Json
$resourceCount = $resources.Count

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "  WARNING: DESTRUCTIVE OPERATION" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Red

Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Yellow
Write-Host "Resources to be deleted: $resourceCount" -ForegroundColor Yellow
Write-Host ""

if ($resourceCount -gt 0) {
    Write-Host "Resources:" -ForegroundColor Gray
    foreach ($resource in $resources) {
        Write-Host "   - $($resource.type): $($resource.name)" -ForegroundColor Gray
    }
    Write-Host ""
}

# =============================================================================
# Confirmation
# =============================================================================

if (-not $Force) {
    Write-Host "This action is IRREVERSIBLE. All data will be permanently lost." -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Type 'DELETE' to confirm deletion"
    if ($confirm -ne 'DELETE') {
        Write-Host "`nOperation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# =============================================================================
# Delete Resource Group
# =============================================================================

Write-Step "Deleting resource group '$ResourceGroupName'..."

if ($WaitForCompletion) {
    az group delete --name $ResourceGroupName --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Resource group '$ResourceGroupName' deleted successfully."
    } else {
        Write-Host "   Failed to delete resource group." -ForegroundColor Red
        exit 1
    }
} else {
    az group delete --name $ResourceGroupName --yes --no-wait
    Write-Success "Resource group deletion initiated (running in background)."
    Write-Info "Use 'az group show -n $ResourceGroupName' to check status."
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  CLEANUP COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
