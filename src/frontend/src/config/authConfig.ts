import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * MSAL configuration for Azure AD authentication
 *
 * Configuration values come from environment variables:
 * - VITE_AZURE_AD_CLIENT_ID: Frontend app registration client ID
 * - VITE_AZURE_AD_TENANT_ID: Azure AD tenant ID
 */

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_AD_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
};

/**
 * Scopes for login and API access
 *
 * The DAB API scope should match the scope exposed by the DAB backend app registration
 */
export const loginRequest = {
  scopes: [
    `api://${import.meta.env.VITE_DAB_CLIENT_ID || import.meta.env.VITE_AZURE_AD_CLIENT_ID}/access_as_user`,
  ],
};

/**
 * Token request for silent token acquisition
 */
export const tokenRequest = {
  scopes: loginRequest.scopes,
  forceRefresh: false,
};
