/**
 * DOT Transportation Data Portal
 * Main Application Component
 *
 * Features:
 * - Microsoft Entra ID Authentication via MSAL
 * - Category-based navigation (Railroads, Bridges, Transit, Automobiles)
 * - Data tables with pagination and sorting
 * - GraphQL Explorer for API demonstration
 * - Error boundaries for graceful error handling
 * - Responsive DOT-branded design
 */

import { useState, useCallback } from 'react';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { msalConfig, loginRequest } from './config/authConfig';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GraphQLExplorer } from './components/GraphQLExplorer';
import { ApiExplorer } from './components/ApiExplorer';
import { DOTLogo, LoadingSpinner, AppFooter } from './components/layout';
import { GraphQLIcon, CodeIcon } from './components/icons';
import { LoginPage } from './components/auth';
import { CategoryDashboard, DataView } from './components/dashboard';

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// ============================================================================
// Authentication Components
// ============================================================================

function AuthenticatedApp() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showGraphQL, setShowGraphQL] = useState(false);
  const [showApiExplorer, setShowApiExplorer] = useState(false);

  const handleLogin = useCallback(() => {
    instance.loginRedirect(loginRequest).catch(console.error);
  }, [instance]);

  const handleLogout = useCallback(() => {
    instance.logoutRedirect().catch(console.error);
  }, [instance]);

  if (inProgress === InteractionStatus.Login) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          <LoadingSpinner size="lg" />
          <p className="mt-6 text-slate-600 text-lg">Authenticating with Microsoft...</p>
          <p className="mt-2 text-slate-400 text-sm">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <DOTLogo />
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowApiExplorer(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
                  title="Open REST API Explorer"
                >
                  <CodeIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">REST API</span>
                </button>
                <button
                  onClick={() => setShowGraphQL(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
                  title="Open GraphQL Explorer"
                >
                  <GraphQLIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">GraphQL</span>
                </button>
                <div className="hidden md:block text-right">
                  <p className="text-white text-sm font-medium">{accounts[0]?.name || accounts[0]?.username}</p>
                  <p className="text-blue-200 text-xs">{accounts[0]?.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-700/50 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Red accent stripe */}
        <div className="h-1.5 bg-gradient-to-r from-red-700 via-red-600 to-red-700" />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBoundary>
            {!selectedCategory ? (
              <CategoryDashboard onSelectCategory={setSelectedCategory} />
            ) : (
              <DataView
                category={selectedCategory}
                onBack={() => setSelectedCategory(null)}
              />
            )}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <AppFooter />

        {/* API Explorer Modals */}
        {showApiExplorer && <ApiExplorer onClose={() => setShowApiExplorer(false)} />}
        {showGraphQL && <GraphQLExplorer onClose={() => setShowGraphQL(false)} />}
      </div>
    </ErrorBoundary>
  );
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  return (
    <ErrorBoundary>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          <AuthenticatedApp />
        </QueryClientProvider>
      </MsalProvider>
    </ErrorBoundary>
  );
}

export default App;
