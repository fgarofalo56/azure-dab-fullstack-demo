/**
 * Environment Variable Validation
 *
 * Validates that required environment variables are set at app startup.
 * This provides clear error messages instead of cryptic MSAL failures.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Required environment variables for the application to function
 */
const REQUIRED_ENV_VARS = [
  {
    name: 'VITE_AZURE_AD_CLIENT_ID',
    description: 'Azure AD Client ID for frontend authentication',
  },
  {
    name: 'VITE_AZURE_AD_TENANT_ID',
    description: 'Azure AD Tenant ID',
  },
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = [
  {
    name: 'VITE_API_BASE_URL',
    description: 'Base URL for DAB REST API',
    default: '/api',
  },
  {
    name: 'VITE_GRAPHQL_URL',
    description: 'URL for GraphQL endpoint',
    default: '/graphql',
  },
  {
    name: 'VITE_DAB_CLIENT_ID',
    description: 'Azure AD Client ID for DAB API (if different from tenant default)',
    default: undefined,
  },
];

/**
 * Validate environment variables at startup
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = import.meta.env[envVar.name];
    if (!value || value === '' || value === 'undefined') {
      errors.push(`Missing required environment variable: ${envVar.name}\n  → ${envVar.description}`);
    }
  }

  // Check optional variables and warn if missing
  for (const envVar of OPTIONAL_ENV_VARS) {
    const value = import.meta.env[envVar.name];
    if (!value && envVar.default === undefined) {
      warnings.push(`Optional environment variable not set: ${envVar.name}\n  → ${envVar.description}`);
    }
  }

  // Additional validation for specific formats
  const clientId = import.meta.env.VITE_AZURE_AD_CLIENT_ID;
  if (clientId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId)) {
    errors.push(`Invalid VITE_AZURE_AD_CLIENT_ID format. Expected UUID format (e.g., 00000000-0000-0000-0000-000000000000)`);
  }

  const tenantId = import.meta.env.VITE_AZURE_AD_TENANT_ID;
  if (tenantId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
    errors.push(`Invalid VITE_AZURE_AD_TENANT_ID format. Expected UUID format (e.g., 00000000-0000-0000-0000-000000000000)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log validation results and throw if invalid
 */
export function assertValidEnv(): void {
  const result = validateEnv();

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('Environment variable warnings:');
    result.warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`));
  }

  // Throw on errors
  if (!result.valid) {
    const errorMessage = [
      '❌ Environment validation failed!',
      '',
      'Missing or invalid environment variables:',
      ...result.errors.map((e) => `  • ${e}`),
      '',
      'Please check your .env file or build configuration.',
      'See .env.example for required variables.',
    ].join('\n');

    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Get environment info for debugging
 */
export function getEnvInfo(): Record<string, string | undefined> {
  return {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api (default)',
    VITE_GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_URL || '/graphql (default)',
    VITE_AZURE_AD_CLIENT_ID: import.meta.env.VITE_AZURE_AD_CLIENT_ID ? '****' + import.meta.env.VITE_AZURE_AD_CLIENT_ID.slice(-4) : 'not set',
    VITE_AZURE_AD_TENANT_ID: import.meta.env.VITE_AZURE_AD_TENANT_ID ? '****' + import.meta.env.VITE_AZURE_AD_TENANT_ID.slice(-4) : 'not set',
    NODE_ENV: import.meta.env.MODE,
  };
}
