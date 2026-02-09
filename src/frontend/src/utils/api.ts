/**
 * API Utilities for DOT Transportation Data Portal
 * Handles REST and GraphQL communication with Data API Builder
 */

import { IPublicClientApplication, AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';

// Types
export interface ApiConfig {
  baseUrl: string;
  graphqlUrl: string;
}

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export interface PaginationParams {
  top?: number;
  skip?: number;
  orderBy?: string;
  filter?: string;
}

export interface ApiResponse<T> {
  value: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

// Default configuration
export const defaultConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  graphqlUrl: import.meta.env.VITE_GRAPHQL_URL || '/graphql',
};

/**
 * Get access token from MSAL with proper error handling and fallback to interactive login.
 *
 * This function:
 * 1. First tries silent token acquisition from cache
 * 2. If silent fails with InteractionRequiredAuthError, falls back to popup
 * 3. If popup fails or is blocked, falls back to redirect
 * 4. Throws an error with a user-friendly message if all methods fail
 */
export async function getAccessToken(
  msalInstance: IPublicClientApplication,
  account: AccountInfo,
  scopes: string[]
): Promise<string> {
  try {
    // First, try silent token acquisition
    const response = await msalInstance.acquireTokenSilent({
      scopes,
      account,
    });
    return response.accessToken;
  } catch (silentError) {
    // If silent acquisition fails, check if interaction is required
    if (silentError instanceof InteractionRequiredAuthError) {
      console.warn('Silent token acquisition failed, attempting popup login...');

      try {
        // Try popup first (better UX than redirect)
        const response = await msalInstance.acquireTokenPopup({
          scopes,
          account,
        });
        return response.accessToken;
      } catch (popupError) {
        console.warn('Popup login failed, attempting redirect login...');

        // Popup might be blocked or fail, try redirect as last resort
        // This will navigate away from the current page
        await msalInstance.acquireTokenRedirect({
          scopes,
          account,
        });

        // This line won't be reached as redirect navigates away
        throw new Error('Redirecting to login...');
      }
    }

    // For other errors (network, etc.), rethrow with context
    console.error('Token acquisition failed:', silentError);
    throw new Error(
      `Authentication failed: ${silentError instanceof Error ? silentError.message : 'Unknown error'}. Please try signing out and signing back in.`
    );
  }
}

/**
 * Build DAB REST API query string from pagination params
 *
 * IMPORTANT: DAB has different pagination behavior than standard OData:
 * - Uses `$first` instead of `$top` for limiting results
 * - Uses cursor-based pagination with `$after` instead of `$skip`
 * - Does NOT support `$count=true` in REST API
 *
 * Pagination Strategy for this Demo:
 * - Client-side pagination is used for demo purposes (fetch all, paginate locally)
 * - For production with large datasets, implement cursor-based pagination using
 *   the `$after` parameter with the cursor returned from previous responses
 *
 * @see https://learn.microsoft.com/azure/data-api-builder/rest#pagination
 */
export function buildODataQuery(params: PaginationParams): string {
  const queryParts: string[] = [];

  // DAB uses $first instead of $top for limiting results
  if (params.top !== undefined) {
    queryParts.push(`$first=${params.top}`);
  }

  // Note: DAB doesn't support $skip - it uses cursor-based pagination with $after
  // The skip parameter is intentionally ignored here
  // For server-side pagination, use the cursor from previous response's nextLink

  if (params.orderBy) {
    queryParts.push(`$orderby=${encodeURIComponent(params.orderBy)}`);
  }
  if (params.filter) {
    queryParts.push(`$filter=${encodeURIComponent(params.filter)}`);
  }

  // Note: DAB doesn't support $count=true in REST API
  // Count is returned in GraphQL responses only

  return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
}

/**
 * Fetch data from REST API
 */
export async function fetchFromApi<T>(
  endpoint: string,
  token: string,
  options: FetchOptions = {},
  config: ApiConfig = defaultConfig
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;

  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Execute GraphQL query
 */
export async function executeGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token: string,
  config: ApiConfig = defaultConfig
): Promise<T> {
  const response = await fetch(config.graphqlUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GraphQL Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL Error: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return result.data;
}

/**
 * Create a new record
 */
export async function createRecord<T>(
  endpoint: string,
  data: Partial<T>,
  token: string,
  config: ApiConfig = defaultConfig
): Promise<T> {
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Create Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Update a record
 */
export async function updateRecord<T>(
  endpoint: string,
  id: number | string,
  data: Partial<T>,
  token: string,
  config: ApiConfig = defaultConfig
): Promise<T> {
  const response = await fetch(`${config.baseUrl}${endpoint}/Id/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Update Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Delete a record
 */
export async function deleteRecord(
  endpoint: string,
  id: number | string,
  token: string,
  config: ApiConfig = defaultConfig
): Promise<void> {
  const response = await fetch(`${config.baseUrl}${endpoint}/Id/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete Error (${response.status}): ${errorText}`);
  }
}

/**
 * Format number for display
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString();
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | null | undefined, compact = false): string {
  if (amount === null || amount === undefined) return '-';

  if (compact) {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
