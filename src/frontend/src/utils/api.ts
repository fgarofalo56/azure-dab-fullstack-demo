/**
 * API Utilities for DOT Transportation Data Portal
 * Handles REST and GraphQL communication with Data API Builder
 */

import { IPublicClientApplication, AccountInfo } from '@azure/msal-browser';

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
 * Get access token from MSAL
 */
export async function getAccessToken(
  msalInstance: IPublicClientApplication,
  account: AccountInfo,
  scopes: string[]
): Promise<string> {
  const response = await msalInstance.acquireTokenSilent({
    scopes,
    account,
  });
  return response.accessToken;
}

/**
 * Build OData query string from pagination params
 */
export function buildODataQuery(params: PaginationParams): string {
  const queryParts: string[] = [];

  if (params.top !== undefined) {
    queryParts.push(`$top=${params.top}`);
  }
  if (params.skip !== undefined) {
    queryParts.push(`$skip=${params.skip}`);
  }
  if (params.orderBy) {
    queryParts.push(`$orderby=${encodeURIComponent(params.orderBy)}`);
  }
  if (params.filter) {
    queryParts.push(`$filter=${encodeURIComponent(params.filter)}`);
  }
  // Always request count for pagination
  queryParts.push('$count=true');

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
