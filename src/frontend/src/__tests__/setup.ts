/**
 * Vitest Test Setup
 * Configures testing environment for React components
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock MSAL
vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: { children: React.ReactNode }) => children,
  useMsal: () => ({
    instance: {
      acquireTokenSilent: vi.fn().mockResolvedValue({
        accessToken: 'mock-token',
      }),
      loginRedirect: vi.fn(),
      logoutRedirect: vi.fn(),
    },
    accounts: [{ username: 'test@example.com' }],
    inProgress: 'none',
  }),
  useIsAuthenticated: () => true,
}));

// Mock fetch
global.fetch = vi.fn();

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', '/api');
vi.stubEnv('VITE_GRAPHQL_URL', '/graphql');
vi.stubEnv('VITE_AZURE_AD_CLIENT_ID', 'test-client-id');
vi.stubEnv('VITE_AZURE_AD_TENANT_ID', 'test-tenant-id');

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
