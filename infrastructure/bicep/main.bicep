// Azure Data API Builder Full-Stack Demo
// Main deployment template - Container Apps Architecture

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

@description('Deploy Azure Front Door for HTTPS support')
param deployFrontDoor bool = true

// Container Apps Scaling Parameters
@description('Minimum number of container replicas (0 enables scale-to-zero)')
@minValue(0)
@maxValue(10)
param minReplicas int = 0

@description('Maximum number of container replicas')
@minValue(1)
@maxValue(10)
param maxReplicas int = 10

@description('Number of concurrent HTTP requests to trigger scaling')
@minValue(1)
param httpScaleThreshold int = 100

// ============================================================================
// Variables
// ============================================================================

var resourcePrefix = '${baseName}-${environment}'
var acrName = replace('acr${baseName}${environment}', '-', '')
var sqlServerName = '${resourcePrefix}-sql'
var sqlDbName = '${resourcePrefix}-db'
var storageAccountName = replace('st${baseName}${environment}', '-', '')
var fileShareName = 'dab-data'
var containerAppEnvName = '${resourcePrefix}-cae'
var dabContainerAppName = '${resourcePrefix}-ca-dab'
var frontendContainerAppName = '${resourcePrefix}-ca-frontend'
var appInsightsName = '${resourcePrefix}-appinsights'
var frontDoorName = '${resourcePrefix}-fd'
var frontDoorEndpointName = '${baseName}${environment}'

// Database connection string
var databaseConnectionString = 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDbName};Persist Security Info=False;User ID=${sqlAdminUsername};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

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
    adminUserEnabled: false // Security: Use managed identity instead of admin credentials
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
// Storage Account (for persistent storage - optional with Container Apps)
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

// NOTE: Public network access is enabled for demo/dev convenience.
// For production, set publicNetworkAccess: 'Disabled' and use Private Endpoints.
// See docs/best-practices-guide.md for production configuration guidance.
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminUsername
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled' // Demo only - use 'Disabled' + Private Endpoint in production
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
// NOTE: This rule allows ANY Azure service (from any subscription) to connect.
// For production, remove this rule and use Private Endpoints instead.
resource sqlFirewallAzure 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0' // Special Azure services rule - demo only
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
// Application Insights
// ============================================================================

resource appInsights 'Microsoft.Insights/components@2020-02-02' = if (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspaceId
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ============================================================================
// Reference Existing Log Analytics Workspace (supports cross-subscription)
// ============================================================================

// Extract subscription, resource group, and workspace name from the resource ID
// Format: /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/{name}
var logAnalyticsSubscriptionId = !empty(logAnalyticsWorkspaceId) ? split(logAnalyticsWorkspaceId, '/')[2] : ''
var logAnalyticsResourceGroup = !empty(logAnalyticsWorkspaceId) ? split(logAnalyticsWorkspaceId, '/')[4] : ''
var logAnalyticsWorkspaceName = !empty(logAnalyticsWorkspaceId) ? split(logAnalyticsWorkspaceId, '/')[8] : ''

resource existingLogAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = if (!empty(logAnalyticsWorkspaceId)) {
  name: logAnalyticsWorkspaceName
  scope: resourceGroup(logAnalyticsSubscriptionId, logAnalyticsResourceGroup)
}

// ============================================================================
// Container Apps Managed Environment
// ============================================================================

resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = if (deployContainers) {
  name: containerAppEnvName
  location: location
  properties: {
    appLogsConfiguration: !empty(logAnalyticsWorkspaceId) ? {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: existingLogAnalytics.properties.customerId
        sharedKey: existingLogAnalytics.listKeys().primarySharedKey
      }
    } : null
    daprAIConnectionString: (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) ? appInsights.properties.ConnectionString : null
    zoneRedundant: false
  }
}

// ============================================================================
// Container App - Data API Builder
// ============================================================================

resource dabContainerApp 'Microsoft.App/containerApps@2024-03-01' = if (deployContainers) {
  name: dabContainerAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 5000
        transport: 'http'
        allowInsecure: false
        // Note: CORS is configured in DAB dab-config.json to avoid conflicts
        // The ALLOWED_ORIGINS env var controls which origins can access the API
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: 'system' // Use managed identity instead of admin credentials
        }
      ]
      secrets: [
        {
          name: 'database-connection-string'
          value: databaseConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'dab'
          image: '${acr.properties.loginServer}/dab:${imageTag}'
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
            {
              name: 'ASPNETCORE_ENVIRONMENT'
              value: 'Production'
            }
            {
              name: 'DATABASE_CONNECTION_STRING'
              secretRef: 'database-connection-string'
            }
            {
              name: 'AZURE_AD_TENANT_ID'
              value: tenantId
            }
            {
              name: 'AZURE_AD_CLIENT_ID'
              value: dabClientId
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) ? appInsights.properties.ConnectionString : ''
            }
            {
              name: 'ALLOWED_ORIGINS'
              value: deployFrontDoor ? 'https://${frontDoorEndpointName}.azurefd.net' : 'https://${frontendContainerAppName}.${location}.azurecontainerapps.io'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/'
                port: 5000
              }
              initialDelaySeconds: 30
              periodSeconds: 30
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/'
                port: 5000
              }
              initialDelaySeconds: 10
              periodSeconds: 10
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: string(httpScaleThreshold)
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    sqlDatabase
  ]
}

// ============================================================================
// Container App - Frontend
// ============================================================================

resource frontendContainerApp 'Microsoft.App/containerApps@2024-03-01' = if (deployContainers) {
  name: frontendContainerAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
        allowInsecure: false
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: 'system' // Use managed identity instead of admin credentials
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${acr.properties.loginServer}/frontend:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          // Note: VITE_* variables are baked into the frontend at Docker build time (see Dockerfile).
          // The frontend uses relative URLs (/api, /graphql) by default, which work with Front Door routing.
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/'
                port: 80
              }
              initialDelaySeconds: 10
              periodSeconds: 30
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/'
                port: 80
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: string(httpScaleThreshold)
              }
            }
          }
        ]
      }
    }
  }
}

// Container App Diagnostic Settings - DAB
resource dabContainerAppDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (deployContainers && enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: '${dabContainerAppName}-diagnostics'
  scope: dabContainerApp
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

// Container App Diagnostic Settings - Frontend
resource frontendContainerAppDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (deployContainers && enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: '${frontendContainerAppName}-diagnostics'
  scope: frontendContainerApp
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
// ACR Role Assignments for Container Apps (Managed Identity)
// ============================================================================

// AcrPull role ID: 7f951dda-4ed3-4680-a7ca-43fe172d538d
var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'

// Grant AcrPull role to DAB Container App managed identity
resource dabAcrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (deployContainers) {
  name: guid(acr.id, dabContainerApp.id, acrPullRoleId)
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId: dabContainerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Grant AcrPull role to Frontend Container App managed identity
resource frontendAcrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (deployContainers) {
  name: guid(acr.id, frontendContainerApp.id, acrPullRoleId)
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId: frontendContainerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ============================================================================
// Azure Front Door (HTTPS/SSL Termination)
// ============================================================================

// WAF Policy for Front Door (production security)
resource wafPolicy 'Microsoft.Network/FrontDoorWebApplicationFirewallPolicies@2022-05-01' = if (deployFrontDoor && deployContainers && environment == 'prod') {
  name: '${resourcePrefix}-waf'
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  properties: {
    policySettings: {
      enabledState: 'Enabled'
      mode: 'Prevention'
      requestBodyCheck: 'Enabled'
    }
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'Microsoft_DefaultRuleSet'
          ruleSetVersion: '2.1'
          ruleSetAction: 'Block'
        }
        {
          ruleSetType: 'Microsoft_BotManagerRuleSet'
          ruleSetVersion: '1.0'
          ruleSetAction: 'Block'
        }
      ]
    }
  }
}

resource frontDoorProfile 'Microsoft.Cdn/profiles@2023-05-01' = if (deployFrontDoor && deployContainers) {
  name: frontDoorName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

// WAF Security Policy (links WAF to Front Door endpoint)
resource wafSecurityPolicy 'Microsoft.Cdn/profiles/securityPolicies@2023-05-01' = if (deployFrontDoor && deployContainers && environment == 'prod') {
  parent: frontDoorProfile
  name: '${resourcePrefix}-waf-policy'
  properties: {
    parameters: {
      type: 'WebApplicationFirewall'
      wafPolicy: {
        id: wafPolicy.id
      }
      associations: [
        {
          domains: [
            {
              id: frontDoorEndpoint.id
            }
          ]
          patternsToMatch: [
            '/*'
          ]
        }
      ]
    }
  }
}

// Front Door Endpoint
resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = if (deployFrontDoor && deployContainers) {
  parent: frontDoorProfile
  name: frontDoorEndpointName
  location: 'global'
  properties: {
    enabledState: 'Enabled'
  }
}

// Origin Group - Frontend
resource frontDoorOriginGroupFrontend 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = if (deployFrontDoor && deployContainers) {
  parent: frontDoorProfile
  name: 'frontend-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 100
    }
    sessionAffinityState: 'Disabled'
  }
}

// Origin Group - DAB API
resource frontDoorOriginGroupDab 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = if (deployFrontDoor && deployContainers) {
  parent: frontDoorProfile
  name: 'dab-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 100
    }
    sessionAffinityState: 'Disabled'
  }
}

// Origin - Frontend Container App
resource frontDoorOriginFrontend 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = if (deployFrontDoor && deployContainers) {
  parent: frontDoorOriginGroupFrontend
  name: 'frontend-origin'
  properties: {
    hostName: frontendContainerApp.properties.configuration.ingress.fqdn
    httpPort: 80
    httpsPort: 443
    originHostHeader: frontendContainerApp.properties.configuration.ingress.fqdn
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

// Origin - DAB Container App
resource frontDoorOriginDab 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = if (deployFrontDoor && deployContainers) {
  parent: frontDoorOriginGroupDab
  name: 'dab-origin'
  properties: {
    hostName: dabContainerApp.properties.configuration.ingress.fqdn
    httpPort: 80
    httpsPort: 443
    originHostHeader: dabContainerApp.properties.configuration.ingress.fqdn
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
  }
}

// Route - Frontend (default route)
resource frontDoorRouteFrontend 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = if (deployFrontDoor && deployContainers) {
  parent: frontDoorEndpoint
  name: 'frontend-route'
  properties: {
    originGroup: {
      id: frontDoorOriginGroupFrontend.id
    }
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
  }
  dependsOn: [
    frontDoorOriginFrontend
  ]
}

// Route - DAB API
resource frontDoorRouteApi 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = if (deployFrontDoor && deployContainers) {
  parent: frontDoorEndpoint
  name: 'api-route'
  properties: {
    originGroup: {
      id: frontDoorOriginGroupDab.id
    }
    supportedProtocols: [
      'Http'
      'Https'
    ]
    patternsToMatch: [
      '/api/*'
      '/graphql'
      '/graphql/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
  }
  dependsOn: [
    frontDoorOriginDab
    frontDoorRouteFrontend // API route must be created after frontend route
  ]
}

// Front Door Diagnostic Settings
resource frontDoorDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (deployFrontDoor && deployContainers && enableDiagnostics && !empty(logAnalyticsWorkspaceId)) {
  name: '${frontDoorName}-diagnostics'
  scope: frontDoorProfile
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
// Outputs
// ============================================================================

// Core Infrastructure
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output storageAccountName string = storageAccount.name
output containersDeployed bool = deployContainers

// Container Apps Environment
output containerAppEnvironmentName string = deployContainers ? containerAppEnv.name : ''
output containerAppEnvironmentId string = deployContainers ? containerAppEnv.id : ''

// DAB Container App
output dabContainerAppName string = deployContainers ? dabContainerApp.name : ''
output dabContainerAppFqdn string = deployContainers ? dabContainerApp.properties.configuration.ingress.fqdn : ''
output dabContainerAppUrl string = deployContainers ? 'https://${dabContainerApp.properties.configuration.ingress.fqdn}' : ''

// Frontend Container App
output frontendContainerAppName string = deployContainers ? frontendContainerApp.name : ''
output frontendContainerAppFqdn string = deployContainers ? frontendContainerApp.properties.configuration.ingress.fqdn : ''
output frontendContainerAppUrl string = deployContainers ? 'https://${frontendContainerApp.properties.configuration.ingress.fqdn}' : ''

// Application Insights
output appInsightsName string = (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) ? appInsights.name : ''
output appInsightsConnectionString string = (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) ? appInsights.properties.ConnectionString : ''
output appInsightsInstrumentationKey string = (enableDiagnostics && !empty(logAnalyticsWorkspaceId)) ? appInsights.properties.InstrumentationKey : ''

// Auto-scaling Configuration
output scalingMinReplicas int = minReplicas
output scalingMaxReplicas int = maxReplicas
output scalingHttpThreshold int = httpScaleThreshold

// Front Door URLs (HTTPS) - use these for production access
output frontDoorDeployed bool = deployFrontDoor && deployContainers
output frontDoorHostname string = (deployFrontDoor && deployContainers) ? frontDoorEndpoint.properties.hostName : ''
output frontDoorUrl string = (deployFrontDoor && deployContainers) ? 'https://${frontDoorEndpoint.properties.hostName}' : ''
output frontDoorApiUrl string = (deployFrontDoor && deployContainers) ? 'https://${frontDoorEndpoint.properties.hostName}/api' : ''
output frontDoorGraphqlUrl string = (deployFrontDoor && deployContainers) ? 'https://${frontDoorEndpoint.properties.hostName}/graphql' : ''
