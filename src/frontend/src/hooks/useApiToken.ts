/**
 * Custom hook for API token acquisition with proper error handling
 *
 * This hook provides a simple way for components to get access tokens
 * with automatic fallback from silent to interactive authentication.
 */

import { useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { loginRequest } from '../config/authConfig';

interface TokenResult {
  accessToken: string;
}

/**
 * Hook that returns a function to acquire an access token.
 *
 * The returned function handles:
 * - Silent token acquisition (from cache)
 * - Fallback to popup login if silent fails
 * - Fallback to redirect login if popup fails
 *
 * @example
 * const getToken = useApiToken();
 *
 * async function fetchData() {
 *   const token = await getToken();
 *   const response = await fetch('/api/data', {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 * }
 */
export function useApiToken() {
  const { instance, accounts } = useMsal();

  const getToken = useCallback(async (): Promise<string> => {
    if (!accounts.length) {
      throw new Error('No authenticated account found. Please sign in.');
    }

    const account = accounts[0];
    const request = {
      ...loginRequest,
      account,
    };

    try {
      // First, try silent token acquisition from cache
      const response = await instance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (silentError) {
      // Check if interaction is required (token expired, consent needed, etc.)
      if (silentError instanceof InteractionRequiredAuthError) {
        console.warn(
          'Silent token acquisition failed, attempting interactive login...',
          silentError.errorCode
        );

        try {
          // Try popup first - better UX as it doesn't navigate away
          const response = await instance.acquireTokenPopup(request);
          return response.accessToken;
        } catch (popupError) {
          // Popup might be blocked by browser or fail for other reasons
          console.warn('Popup login failed, attempting redirect...', popupError);

          // Redirect is the fallback - will navigate away from current page
          // After redirect completes, MSAL will restore the app state
          await instance.acquireTokenRedirect(request);

          // This code won't execute as redirect navigates away
          throw new Error('Redirecting to login...');
        }
      }

      // For other errors (network issues, configuration problems, etc.)
      console.error('Token acquisition failed:', silentError);

      // Provide actionable error message
      const errorMessage =
        silentError instanceof Error ? silentError.message : 'Unknown authentication error';

      throw new Error(
        `Authentication failed: ${errorMessage}. ` +
          'Please try refreshing the page or signing out and back in.'
      );
    }
  }, [instance, accounts]);

  return getToken;
}

/**
 * Hook that provides both the token getter and a wrapped fetch function
 * that automatically includes the Authorization header.
 */
export function useAuthenticatedFetch() {
  const getToken = useApiToken();

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = await getToken();

      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [getToken]
  );

  return { getToken, authFetch };
}

export default useApiToken;
