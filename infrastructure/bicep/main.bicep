// Azure Data API Builder Full-Stack Demo
// Main deployment template

targetScope = 'resourceGroup'

// ============================================================================
// Parameters
// ============================================================================

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Base name for all resources')
@minLength(3)
@maxLength(20)
param baseName string = 'dabdemo'

@description('SQL Server admin username')
param sqlAdminUsername string = 'sqladmin'

@description('SQL Server admin password')
@secure()
param sqlAdminPassword string

@description('Azure AD tenant ID for authentication')
param tenantId string = subscription().tenantId

@description('Azure AD client ID for DAB authentication')
param dabClientId string

@description('Azure AD client ID for frontend authentication')
param frontendClientId string

@description('Container image tag')
param imageTag string = 'latest'

@description('Skip container deployment (use for initial infrastructure setup before images are pushed)')
param deployContainers bool = true

@description('Log Analytics Workspace resource ID for diagnostic settings')
param logAnalyticsWorkspaceId string = ''

@description('Enable diagnostic settings for all resources')
param enableDiagnostics bool = true

// ============================================================================
// Variables
// ============================================================================

var resourcePrefix = '${baseName}-${environment}'
var acrName = replace('acr${baseName}${environment}', '-', '')
var sqlServerName = '${resourcePrefix}-sql'
var sqlDbName = '${resourcePrefix}-db'
var storageAccountName = replace('st${baseName}${environment}', '-', '')
var fileShareName = 'dab-data'
var aciDabName = '${resourcePrefix}-dab'
var aciFrontendName = '${resourcePrefix}-frontend'

// ============================================================================
// Azure Container Registry
// ============================================================================

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

// ACR Diagnostic Settings
resource acrDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: '${acrName}-diagnostics'
  scope: acr
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logs: [
      {
        categoryGroup: 'allLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
  }
}

// ============================================================================
// Storage Account (for persistent storage)
// ============================================================================

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource fileService 'Microsoft.Storage/storageAccounts/fileServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2023-01-01' = {
  parent: fileService
  name: fileShareName
  properties: {
    shareQuota: 5 // 5 GB
  }
}

// Storage Account Diagnostic Settings
resource storageAccountDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: '${storageAccountName}-diagnostics'
  scope: storageAccount
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    metrics: [
      {
        category: 'Transaction'
        enabled: true
      }
    ]
  }
}

// Storage Blob Service Diagnostic Settings
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource blobDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: '${storageAccountName}-blob-diagnostics'
  scope: blobService
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logs: [
      {
        categoryGroup: 'allLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'Transaction'
        enabled: true
      }
    ]
  }
}

// Storage File Service Diagnostic Settings
resource fileDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: '${storageAccountName}-file-diagnostics'
  scope: fileService
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logs: [
      {
        categoryGroup: 'allLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'Transaction'
        enabled: true
      }
    ]
  }
}

// ============================================================================
// Azure SQL Database
// ============================================================================

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminUsername
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: sqlDbName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2 GB
    requestedBackupStorageRedundancy: 'Local' // Use locally redundant backup (required for some subscriptions)
  }
}

// Allow Azure services to access SQL
resource sqlFirewallAzure 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// SQL Database Diagnostic Settings (audit and security logs)
resource sqlDbDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: '${sqlDbName}-diagnostics'
  scope: sqlDatabase
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logs: [
      {
        category: 'SQLInsights'
        enabled: true
      }
      {
        category: 'AutomaticTuning'
        enabled: true
      }
      {
        category: 'QueryStoreRuntimeStatistics'
        enabled: true
      }
      {
        category: 'QueryStoreWaitStatistics'
        enabled: true
      }
      {
        category: 'Errors'
        enabled: true
      }
      {
        category: 'DatabaseWaitStatistics'
        enabled: true
      }
      {
        category: 'Timeouts'
        enabled: true
      }
      {
        category: 'Blocks'
        enabled: true
      }
      {
        category: 'Deadlocks'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'Basic'
        enabled: true
      }
      {
        category: 'InstanceAndAppAdvanced'
        enabled: true
      }
      {
        category: 'WorkloadManagement'
        enabled: true
      }
    ]
  }
}

// SQL Server Auditing to Log Analytics
// Note: When isAzureMonitorTargetEnabled is true, Azure automatically creates a diagnostic setting
// for SQLSecurityAuditEvents on the master database. No separate diagnostic setting needed.
resource sqlServerAudit 'Microsoft.Sql/servers/auditingSettings@2023-05-01-preview' = if (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  parent: sqlServer
  name: 'default'
  properties: {
    state: 'Enabled'
    isAzureMonitorTargetEnabled: true
  }
}

// ============================================================================
// Azure Container Instance - Data API Builder
// ============================================================================

resource aciDab 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = if (deployContainers) {
  name: aciDabName
  location: location
  properties: {
    containers: [
      {
        name: 'dab'
        properties: {
          image: '${acr.properties.loginServer}/dab:${imageTag}'
          ports: [
            {
              port: 5000
              protocol: 'TCP'
            }
          ]
          resources: {
            requests: {
              cpu: 1
              memoryInGB: json('1.5')
            }
          }
          environmentVariables: [
            {
              name: 'ASPNETCORE_ENVIRONMENT'
              value: 'Production'
            }
            {
              name: 'DATABASE_CONNECTION_STRING'
              secureValue: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDbName};Persist Security Info=False;User ID=${sqlAdminUsername};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
            }
            {
              name: 'AZURE_AD_TENANT_ID'
              value: tenantId
            }
            {
              name: 'AZURE_AD_CLIENT_ID'
              value: dabClientId
            }
          ]
          volumeMounts: [
            {
              name: 'config-volume'
              mountPath: '/app/config'
              readOnly: false
            }
          ]
        }
      }
    ]
    osType: 'Linux'
    restartPolicy: 'Always'
    ipAddress: {
      type: 'Public'
      ports: [
        {
          port: 5000
          protocol: 'TCP'
        }
      ]
      dnsNameLabel: aciDabName
    }
    imageRegistryCredentials: [
      {
        server: acr.properties.loginServer
        username: acr.listCredentials().username
        password: acr.listCredentials().passwords[0].value
      }
    ]
    volumes: [
      {
        name: 'config-volume'
        azureFile: {
          shareName: fileShareName
          storageAccountName: storageAccount.name
          storageAccountKey: storageAccount.listKeys().keys[0].value
        }
      }
    ]
    diagnostics: enableDiagnostics && !empty(logAnalyticsWorkspaceId) ? {
      logAnalytics: {
        workspaceId: split(logAnalyticsWorkspaceId, '/')[8]
        workspaceKey: listKeys(logAnalyticsWorkspaceId, '2022-10-01').primarySharedKey
        logType: 'ContainerInstanceLogs'
      }
    } : null
  }
  dependsOn: [
    fileShare
    sqlDatabase
  ]
}

// ============================================================================
// Azure Container Instance - Frontend
// ============================================================================

resource aciFrontend 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = if (deployContainers) {
  name: aciFrontendName
  location: location
  properties: {
    containers: [
      {
        name: 'frontend'
        properties: {
          image: '${acr.properties.loginServer}/frontend:${imageTag}'
          ports: [
            {
              port: 80
              protocol: 'TCP'
            }
          ]
          resources: {
            requests: {
              cpu: json('0.5')
              memoryInGB: json('0.5')
            }
          }
          environmentVariables: [
            {
              name: 'VITE_API_BASE_URL'
              value: 'http://${aciDab.properties.ipAddress.fqdn}:5000/api'
            }
            {
              name: 'VITE_GRAPHQL_URL'
              value: 'http://${aciDab.properties.ipAddress.fqdn}:5000/graphql'
            }
            {
              name: 'VITE_AZURE_AD_CLIENT_ID'
              value: frontendClientId
            }
            {
              name: 'VITE_AZURE_AD_TENANT_ID'
              value: tenantId
            }
          ]
        }
      }
    ]
    osType: 'Linux'
    restartPolicy: 'Always'
    ipAddress: {
      type: 'Public'
      ports: [
        {
          port: 80
          protocol: 'TCP'
        }
      ]
      dnsNameLabel: aciFrontendName
    }
    imageRegistryCredentials: [
      {
        server: acr.properties.loginServer
        username: acr.listCredentials().username
        password: acr.listCredentials().passwords[0].value
      }
    ]
    diagnostics: enableDiagnostics && !empty(logAnalyticsWorkspaceId) ? {
      logAnalytics: {
        workspaceId: split(logAnalyticsWorkspaceId, '/')[8]
        workspaceKey: listKeys(logAnalyticsWorkspaceId, '2022-10-01').primarySharedKey
        logType: 'ContainerInstanceLogs'
      }
    } : null
  }
  // Note: Implicit dependency on aciDab via property reference (aciDab.properties.ipAddress.fqdn)
}

// ============================================================================
// Outputs
// ============================================================================

output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output storageAccountName string = storageAccount.name
output containersDeployed bool = deployContainers
output dabFqdn string = deployContainers ? aciDab.properties.ipAddress.fqdn : ''
output dabUrl string = deployContainers ? 'http://${aciDab.properties.ipAddress.fqdn}:5000' : ''
output frontendFqdn string = deployContainers ? aciFrontend.properties.ipAddress.fqdn : ''
output frontendUrl string = deployContainers ? 'http://${aciFrontend.properties.ipAddress.fqdn}' : ''
