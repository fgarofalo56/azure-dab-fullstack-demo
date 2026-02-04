<#
.SYNOPSIS
    Initializes the DOT Transportation Demo database with schema and seed data.

.DESCRIPTION
    This script creates the database schema and populates it with sample DOT
    transportation data including:
    - Railroads (FRA accident data)
    - Bridges (National Bridge Inventory)
    - Public Transit (NTD agency metrics)
    - Automobiles (FARS fatality data)

.PARAMETER ServerName
    The SQL Server hostname or IP address.

.PARAMETER DatabaseName
    The name of the database to initialize.

.PARAMETER Username
    SQL authentication username (optional, uses Windows auth if not specified).

.PARAMETER Password
    SQL authentication password (required if Username is specified).

.PARAMETER ConnectionString
    Full connection string (alternative to individual parameters).

.EXAMPLE
    # Using Windows Authentication
    .\Initialize-Database.ps1 -ServerName "localhost" -DatabaseName "DOTDemo"

.EXAMPLE
    # Using SQL Authentication
    .\Initialize-Database.ps1 -ServerName "myserver.database.windows.net" -DatabaseName "dotdemo" -Username "admin" -Password "MyP@ssw0rd"

.EXAMPLE
    # Using connection string
    .\Initialize-Database.ps1 -ConnectionString "Server=myserver;Database=dotdemo;User Id=admin;Password=MyP@ss;"

.NOTES
    Requires: sqlcmd utility or SqlServer PowerShell module
    Author: DOT Demo Project
#>

[CmdletBinding()]
param(
    [Parameter(ParameterSetName = "Individual")]
    [string]$ServerName = "localhost",

    [Parameter(ParameterSetName = "Individual")]
    [string]$DatabaseName = "DOTTransportDemo",

    [Parameter(ParameterSetName = "Individual")]
    [string]$Username,

    [Parameter(ParameterSetName = "Individual")]
    [string]$Password,

    [Parameter(ParameterSetName = "ConnectionString")]
    [string]$ConnectionString,

    [switch]$SkipSchema,
    [switch]$SkipSeedData,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DOT Transportation Demo - Database Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Build connection string if not provided
if (-not $ConnectionString) {
    if ($Username -and $Password) {
        $ConnectionString = "Server=$ServerName;Database=$DatabaseName;User Id=$Username;Password=$Password;TrustServerCertificate=True;Encrypt=True;"
    } else {
        $ConnectionString = "Server=$ServerName;Database=$DatabaseName;Integrated Security=True;TrustServerCertificate=True;"
    }
}

# Check for sqlcmd
$sqlcmdPath = Get-Command sqlcmd -ErrorAction SilentlyContinue

function Invoke-SqlScript {
    param(
        [string]$ScriptPath,
        [string]$Description
    )

    Write-Host "  Running: $Description..." -ForegroundColor Gray

    if (-not (Test-Path $ScriptPath)) {
        Write-Host "  ERROR: Script not found: $ScriptPath" -ForegroundColor Red
        return $false
    }

    try {
        if ($sqlcmdPath) {
            # Use sqlcmd
            if ($Username -and $Password) {
                $result = sqlcmd -S $ServerName -d $DatabaseName -U $Username -P $Password -i $ScriptPath -b 2>&1
            } else {
                $result = sqlcmd -S $ServerName -d $DatabaseName -E -i $ScriptPath -b 2>&1
            }

            if ($LASTEXITCODE -ne 0) {
                Write-Host "  ERROR: $result" -ForegroundColor Red
                return $false
            }
        } else {
            # Try using Invoke-Sqlcmd from SqlServer module
            Import-Module SqlServer -ErrorAction Stop
            $script = Get-Content $ScriptPath -Raw
            Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $script -QueryTimeout 300
        }

        Write-Host "  SUCCESS: $Description completed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
        return $false
    }
}

# Confirm if not forced
if (-not $Force) {
    Write-Host "This will initialize the database with DOT demo data." -ForegroundColor Yellow
    Write-Host "Server: $ServerName" -ForegroundColor Gray
    Write-Host "Database: $DatabaseName" -ForegroundColor Gray
    Write-Host ""

    $confirm = Read-Host "Continue? (Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Initializing database..." -ForegroundColor Cyan
Write-Host ""

$success = $true

# Step 1: Create schema
if (-not $SkipSchema) {
    Write-Host "[1/2] Creating database schema..." -ForegroundColor White
    $schemaScript = Join-Path $ScriptDir "001-schema.sql"

    if (-not (Invoke-SqlScript -ScriptPath $schemaScript -Description "Schema creation")) {
        $success = $false
    }
} else {
    Write-Host "[1/2] Skipping schema creation (--SkipSchema)" -ForegroundColor Yellow
}

# Step 2: Seed data
if (-not $SkipSeedData -and $success) {
    Write-Host ""
    Write-Host "[2/2] Seeding sample data..." -ForegroundColor White
    $seedScript = Join-Path $ScriptDir "002-seed-data.sql"

    if (-not (Invoke-SqlScript -ScriptPath $seedScript -Description "Data seeding")) {
        $success = $false
    }
} else {
    Write-Host "[2/2] Skipping seed data (--SkipSeedData or previous step failed)" -ForegroundColor Yellow
}

Write-Host ""

if ($success) {
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "Database initialization completed!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tables created:" -ForegroundColor White
    Write-Host "  - Categories (4 DOT data categories)" -ForegroundColor Gray
    Write-Host "  - States (51 US states + DC)" -ForegroundColor Gray
    Write-Host "  - RailroadAccidents (FRA Form 54 data)" -ForegroundColor Gray
    Write-Host "  - Bridges (National Bridge Inventory)" -ForegroundColor Gray
    Write-Host "  - TransitAgencies (NTD metrics)" -ForegroundColor Gray
    Write-Host "  - VehicleFatalities (FARS data)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Views created:" -ForegroundColor White
    Write-Host "  - vw_CategorySummary" -ForegroundColor Gray
    Write-Host "  - vw_RailroadAccidentsByState" -ForegroundColor Gray
    Write-Host "  - vw_BridgeConditionByState" -ForegroundColor Gray
    Write-Host "  - vw_TransitSummaryByState" -ForegroundColor Gray
    Write-Host "  - vw_VehicleFatalitiesByState" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "Database initialization failed!" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above and ensure:" -ForegroundColor Yellow
    Write-Host "  1. SQL Server is accessible" -ForegroundColor Gray
    Write-Host "  2. Database exists and you have permissions" -ForegroundColor Gray
    Write-Host "  3. sqlcmd or SqlServer module is installed" -ForegroundColor Gray
    exit 1
}
