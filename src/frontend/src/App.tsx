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
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { msalConfig, loginRequest } from './config/authConfig';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Pagination, usePagination } from './components/Pagination';
import { GraphQLExplorer } from './components/GraphQLExplorer';
import { ApiExplorer } from './components/ApiExplorer';
import { CrudModal, CrudMode } from './components/CrudModal';
import { formatNumber, formatCurrency, formatDate, buildODataQuery, createRecord, updateRecord, deleteRecord } from './utils/api';
import { useApiToken } from './hooks/useApiToken';
import type {
  CategorySummary,
  State,
  RailroadAccident,
  Bridge,
  TransitAgency,
  VehicleFatality,
  ApiResponse,
} from './types';

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
// Icon Components
// ============================================================================

const TrainIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 18l4 4 4-4M12 2v16" />
    <rect x="6" y="3" width="12" height="11" rx="2" strokeWidth={1.5} />
    <circle cx="8" cy="17" r="1" fill="currentColor" />
    <circle cx="16" cy="17" r="1" fill="currentColor" />
  </svg>
);

const BridgeIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21v-6a2 2 0 012-2h10a2 2 0 012 2v6M9 13V8M15 13V8M3 8h18M6 8c0-2.5 2.5-5 6-5s6 2.5 6 5" />
  </svg>
);

const BusIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeWidth={1.5} d="M3 10h18M7 18v2M17 18v2M7 14h2M15 14h2" />
  </svg>
);

const CarIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 17h14M6 17l1-5h10l1 5M7 12l1-4h8l1 4" />
    <circle cx="7.5" cy="17" r="1.5" strokeWidth={1.5} />
    <circle cx="16.5" cy="17" r="1.5" strokeWidth={1.5} />
  </svg>
);

const GraphQLIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const getIcon = (iconName: string, className?: string) => {
  switch (iconName) {
    case 'train': return <TrainIcon className={className} />;
    case 'bridge': return <BridgeIcon className={className} />;
    case 'bus': return <BusIcon className={className} />;
    case 'car': return <CarIcon className={className} />;
    default: return <TrainIcon className={className} />;
  }
};

// ============================================================================
// Layout Components
// ============================================================================

function DOTLogo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-red-600">
          <span className="text-blue-900 font-black text-lg tracking-tight">DOT</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold text-white leading-tight">
          U.S. Department of Transportation
        </h1>
        <p className="text-blue-200 text-sm">Transportation Data Portal</p>
      </div>
    </div>
  );
}

function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-blue-200 border-t-blue-600 ${sizeClasses[size]}`}
      />
      {text && <p className="mt-4 text-slate-600">{text}</p>}
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || (
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <p className="text-slate-600">{message}</p>
    </div>
  );
}

function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ============================================================================
// CRUD Action Components
// ============================================================================

interface ActionButtonsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ActionButtons({ onView, onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onView}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="View details"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
        title="Edit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

function CreateButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  );
}

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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
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
                  <p className="text-blue-300 text-xs">{accounts[0]?.username}</p>
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
        <footer className="bg-slate-800 text-slate-400 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-3">About This Demo</h4>
                <p className="text-sm">
                  This portal demonstrates Azure Data API Builder capabilities using realistic
                  transportation data patterns.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Data Sources</h4>
                <ul className="text-sm space-y-1">
                  <li>FRA Safety Data (Railroads)</li>
                  <li>National Bridge Inventory</li>
                  <li>National Transit Database</li>
                  <li>NHTSA FARS (Vehicle Fatalities)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Technologies</h4>
                <ul className="text-sm space-y-1">
                  <li>Azure Data API Builder</li>
                  <li>Azure SQL Database</li>
                  <li>React + TypeScript</li>
                  <li>Microsoft Entra ID</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-700 text-center text-sm">
              <p>Azure Data API Builder Demo | Not an official DOT application</p>
            </div>
          </div>
        </footer>

        {/* API Explorer Modals */}
        {showApiExplorer && <ApiExplorer onClose={() => setShowApiExplorer(false)} />}
        {showGraphQL && <GraphQLExplorer onClose={() => setShowGraphQL(false)} />}
      </div>
    </ErrorBoundary>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-full shadow-2xl mb-8 border-4 border-red-600">
              <span className="text-blue-900 font-black text-3xl">DOT</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              U.S. Department of Transportation
            </h1>
            <p className="text-xl text-blue-200 mb-2">Transportation Data Portal</p>
            <p className="text-blue-300 max-w-2xl mx-auto">
              Access comprehensive transportation data across Railroads, Bridges, Public Transit,
              and Highway Safety. Powered by Azure Data API Builder.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: 'train', name: 'Railroads', source: 'FRA Safety Data', color: 'blue' },
              { icon: 'bridge', name: 'Bridges', source: 'National Inventory', color: 'emerald' },
              { icon: 'bus', name: 'Transit', source: 'NTD Metrics', color: 'purple' },
              { icon: 'car', name: 'Automobiles', source: 'FARS Data', color: 'red' },
            ].map((cat) => (
              <div
                key={cat.name}
                className={`bg-${cat.color}-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-${cat.color}-500/30 transition-transform hover:scale-105`}
              >
                <div className={`text-${cat.color}-300 flex justify-center mb-3`}>
                  {getIcon(cat.icon, 'w-10 h-10')}
                </div>
                <p className="text-white font-semibold">{cat.name}</p>
                <p className={`text-${cat.color}-300 text-sm`}>{cat.source}</p>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <div className="text-center">
            <button
              onClick={onLogin}
              className="group inline-flex items-center gap-3 bg-red-600 text-white py-4 px-10 rounded-xl hover:bg-red-500 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 3v8.5H3V3h8.5zm0 18H3v-8.5h8.5V21zm1-18H21v8.5h-8.5V3zm8.5 9.5V21h-8.5v-8.5H21z" />
              </svg>
              Sign in with Microsoft
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-blue-300 text-sm mt-4">
              Authorized personnel only. Use your organization credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-blue-400 text-sm">
        <p>Azure Data API Builder Demo | Sample data based on DOT open datasets</p>
      </footer>
    </div>
  );
}

// ============================================================================
// Data Components
// ============================================================================

function CategoryDashboard({ onSelectCategory }: { onSelectCategory: (cat: string) => void }) {
  const getToken = useApiToken();

  const { data: summaries, isLoading, error } = useQuery({
    queryKey: ['categorySummaries'],
    queryFn: async (): Promise<CategorySummary[]> => {
      const accessToken = await getToken();

      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${apiUrl}/CategorySummary`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to fetch category summaries');
      const data: ApiResponse<CategorySummary> = await res.json();
      return data.value;
    },
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium mb-2">Failed to load dashboard</p>
        <p className="text-red-600 text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  const categoryEndpoints: Record<string, string> = {
    'Railroads': 'RailroadAccident',
    'Bridges': 'Bridge',
    'Public Transit': 'TransitAgency',
    'Automobiles': 'VehicleFatality',
  };

  const totalRecords = summaries?.reduce((sum, cat) => sum + cat.RecordCount, 0) || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Transportation Data Dashboard</h2>
        <p className="text-slate-600">
          Explore {formatNumber(totalRecords)} records across {summaries?.length || 0} data categories
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {summaries?.sort((a, b) => a.CategoryId - b.CategoryId).map((cat) => (
          <button
            key={cat.CategoryId}
            onClick={() => onSelectCategory(categoryEndpoints[cat.CategoryName] || '')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden text-left border border-slate-100 hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="p-4 rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: cat.Color + '15', color: cat.Color }}
                >
                  {getIcon(cat.Icon, 'w-10 h-10')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {cat.CategoryName}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2">{cat.Description}</p>
                </div>
                <svg
                  className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div
              className="px-6 py-4 border-t"
              style={{ backgroundColor: cat.Color + '08', borderColor: cat.Color + '20' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Total Records</span>
                <span className="text-2xl font-bold" style={{ color: cat.Color }}>
                  {formatNumber(cat.RecordCount)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* API Info Panel */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          API Endpoints
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-700/50 rounded-xl p-5">
            <p className="text-slate-300 text-sm mb-2 font-medium">REST API</p>
            <code className="text-emerald-400 text-sm block bg-slate-900/50 rounded-lg p-3 overflow-x-auto">
              GET /api/Bridge?$filter=overallCondition eq 'Poor'&$top=10
            </code>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-5">
            <p className="text-slate-300 text-sm mb-2 font-medium">GraphQL</p>
            <code className="text-purple-400 text-sm block bg-slate-900/50 rounded-lg p-3 overflow-x-auto">
              {`{ bridges(first: 10) { items { id name } } }`}
            </code>
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-4">
          Click the <span className="text-purple-400 font-medium">GraphQL</span> button in the header
          to explore the interactive query editor.
        </p>
      </div>
    </div>
  );
}

function DataView({ category, onBack }: { category: string; onBack: () => void }) {
  const getToken = useApiToken();

  const { data: states } = useQuery({
    queryKey: ['states'],
    queryFn: async (): Promise<State[]> => {
      const accessToken = await getToken();

      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${apiUrl}/State?$orderby=Name`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to fetch states');
      const data: ApiResponse<State> = await res.json();
      return data.value;
    },
  });

  // DAB returns PascalCase field names
  const stateMap = new Map(states?.map((s: any) => [s.Id, s]) || []);
  const getStateCode = (stateId: number) => stateMap.get(stateId)?.Code || '??';

  const categoryConfig: Record<string, { title: string; color: string; description: string }> = {
    'RailroadAccident': {
      title: 'Railroad Accidents',
      color: '#1E40AF',
      description: 'FRA Form 54 incident data including derailments, collisions, and hazmat releases',
    },
    'Bridge': {
      title: 'National Bridge Inventory',
      color: '#047857',
      description: 'Structural conditions, traffic volumes, and inspection records for US bridges',
    },
    'TransitAgency': {
      title: 'Transit Agencies',
      color: '#7C3AED',
      description: 'NTD metrics including ridership, operating expenses, and service data',
    },
    'VehicleFatality': {
      title: 'Vehicle Fatalities',
      color: '#DC2626',
      description: 'FARS crash data including fatality counts, contributing factors, and locations',
    },
  };

  const config = categoryConfig[category] || { title: category, color: '#1E40AF', description: '' };

  return (
    <div>
      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors group"
      >
        <svg
          className="w-5 h-5 transition-transform group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      {/* Category Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: config.color }}>
          {config.title}
        </h2>
        <p className="text-slate-600">{config.description}</p>
      </div>

      {/* Data Tables */}
      <ErrorBoundary>
        {category === 'RailroadAccident' && <RailroadAccidentTable getStateCode={getStateCode} color={config.color} states={states} />}
        {category === 'Bridge' && <BridgeTable getStateCode={getStateCode} color={config.color} states={states} />}
        {category === 'TransitAgency' && <TransitAgencyTable getStateCode={getStateCode} color={config.color} states={states} />}
        {category === 'VehicleFatality' && <VehicleFatalityTable getStateCode={getStateCode} color={config.color} states={states} />}
      </ErrorBoundary>
    </div>
  );
}

// ============================================================================
// Data Table Components with Pagination
// ============================================================================

function RailroadAccidentTable({ getStateCode, color, states }: { getStateCode: (id: number) => string; color: string; states?: State[] }) {
  const getToken = useApiToken();
  const queryClient = useQueryClient();
  const { page, pageSize, skip, handlePageChange, handlePageSizeChange } = usePagination(25);

  // CRUD state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<CrudMode>('view');
  const [selectedRecord, setSelectedRecord] = useState<RailroadAccident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['railroadAccidents'],
    queryFn: async () => {
      const accessToken = await getToken();

      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      // DAB uses $first instead of $top, fetch all for client-side pagination
      const query = buildODataQuery({ top: 500, orderBy: 'AccidentDate desc' });
      const res = await fetch(`${apiUrl}/RailroadAccident${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to fetch railroad accidents');
      return res.json() as Promise<ApiResponse<RailroadAccident>>;
    },
  });

  // Client-side pagination
  const paginatedData = data?.value?.slice(skip, skip + pageSize) || [];

  // CRUD handlers
  const handleCreate = () => {
    setSelectedRecord(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleView = (record: RailroadAccident) => {
    setSelectedRecord(record);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (record: RailroadAccident) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = (record: RailroadAccident) => {
    setSelectedRecord(record);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleSave = async (formData: Partial<RailroadAccident>) => {
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';

      if (modalMode === 'create') {
        await createRecord('/RailroadAccident', formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      } else if (modalMode === 'edit' && selectedRecord) {
        await updateRecord('/RailroadAccident', (selectedRecord as any).Id, formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      }

      queryClient.invalidateQueries({ queryKey: ['railroadAccidents'] });
      setShowModal(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      await deleteRecord('/RailroadAccident', (selectedRecord as any).Id, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      queryClient.invalidateQueries({ queryKey: ['railroadAccidents'] });
      setShowModal(false);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field definitions for CrudModal - use PascalCase to match DAB response
  const fields = [
    { name: 'ReportingRailroadName', label: 'Railroad Name', type: 'text' as const, required: true },
    { name: 'AccidentDate', label: 'Accident Date', type: 'date' as const, required: true },
    { name: 'StateId', label: 'State', type: 'select' as const, required: true, options: states?.map((s: any) => ({ value: s.Id, label: s.Name })) || [] },
    { name: 'AccidentType', label: 'Accident Type', type: 'select' as const, required: true, options: [
      { value: 'Derailment', label: 'Derailment' },
      { value: 'Collision', label: 'Collision' },
      { value: 'Crossing Incident', label: 'Crossing Incident' },
      { value: 'Fire/Explosion', label: 'Fire/Explosion' },
      { value: 'Other', label: 'Other' },
    ]},
    { name: 'TrainSpeed', label: 'Train Speed (mph)', type: 'number' as const },
    { name: 'TotalKilled', label: 'Total Killed', type: 'number' as const },
    { name: 'TotalInjured', label: 'Total Injured', type: 'number' as const },
    { name: 'TotalDamage', label: 'Total Damage ($)', type: 'number' as const },
    { name: 'HazmatCars', label: 'Hazmat Cars', type: 'number' as const },
  ];

  if (isLoading) return <LoadingSpinner text="Loading railroad accidents..." />;
  if (error) return <div className="text-red-600">Error: {(error as Error).message}</div>;

  const totalItems = data?.value?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateButton onClick={handleCreate} label="Add Accident" />
      </div>

      {!paginatedData.length ? (
        <EmptyState message="No railroad accidents found" />
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: color }}>
                <tr className="text-white">
                  <th className="px-4 py-4 text-left font-semibold">Date</th>
                  <th className="px-4 py-4 text-left font-semibold">Railroad</th>
                  <th className="px-4 py-4 text-left font-semibold">State</th>
                  <th className="px-4 py-4 text-left font-semibold">Type</th>
                  <th className="px-4 py-4 text-right font-semibold">Speed</th>
                  <th className="px-4 py-4 text-right font-semibold">Killed</th>
                  <th className="px-4 py-4 text-right font-semibold">Injured</th>
                  <th className="px-4 py-4 text-right font-semibold">Damage</th>
                  <th className="px-4 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((accident: any, idx: number) => (
                  <tr key={accident.Id} className={`border-b hover:bg-slate-50 transition-colors ${idx % 2 ? 'bg-slate-25' : ''}`}>
                    <td className="px-4 py-3 text-sm">{formatDate(accident.AccidentDate)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{accident.ReportingRailroadName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{getStateCode(accident.StateId)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{accident.AccidentType}</td>
                    <td className="px-4 py-3 text-sm text-right">{accident.TrainSpeed ?? '-'} mph</td>
                    <td className="px-4 py-3 text-right">
                      {accident.TotalKilled > 0 ? (
                        <Badge variant="danger">{accident.TotalKilled}</Badge>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {accident.TotalInjured > 0 ? (
                        <Badge variant="warning">{accident.TotalInjured}</Badge>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(accident.TotalDamage, true)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onView={() => handleView(accident)}
                        onEdit={() => handleEdit(accident)}
                        onDelete={() => handleDelete(accident)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="px-4 border-t"
          />
        </div>
      )}

      <CrudModal
        isOpen={showModal}
        mode={modalMode}
        title="Railroad Accident"
        fields={fields}
        data={selectedRecord}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleConfirmDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}

function BridgeTable({ getStateCode, color, states }: { getStateCode: (id: number) => string; color: string; states?: State[] }) {
  const getToken = useApiToken();
  const queryClient = useQueryClient();
  const { page, pageSize, skip, handlePageChange, handlePageSizeChange } = usePagination(25);

  // CRUD state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<CrudMode>('view');
  const [selectedRecord, setSelectedRecord] = useState<Bridge | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bridges'],
    queryFn: async () => {
      const accessToken = await getToken();

      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      // DAB uses $first instead of $top, fetch all for client-side pagination
      const query = buildODataQuery({ top: 500, orderBy: 'AverageDailyTraffic desc' });
      const res = await fetch(`${apiUrl}/Bridge${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to fetch bridges');
      return res.json() as Promise<ApiResponse<Bridge>>;
    },
  });

  // Client-side pagination
  const paginatedData = data?.value?.slice(skip, skip + pageSize) || [];

  // CRUD handlers
  const handleCreate = () => {
    setSelectedRecord(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleView = (record: Bridge) => {
    setSelectedRecord(record);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (record: Bridge) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = (record: Bridge) => {
    setSelectedRecord(record);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleSave = async (formData: Partial<Bridge>) => {
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';

      if (modalMode === 'create') {
        await createRecord('/Bridge', formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      } else if (modalMode === 'edit' && selectedRecord) {
        await updateRecord('/Bridge', (selectedRecord as any).Id, formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      }

      queryClient.invalidateQueries({ queryKey: ['bridges'] });
      setShowModal(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      await deleteRecord('/Bridge', (selectedRecord as any).Id, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
      setShowModal(false);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field definitions for CrudModal - use PascalCase to match DAB response
  const fields = [
    { name: 'StructureNumber', label: 'Structure Number', type: 'text' as const, required: true },
    { name: 'StateId', label: 'State', type: 'select' as const, required: true, options: states?.map((s: any) => ({ value: s.Id, label: s.Name })) || [] },
    { name: 'FacilityCarried', label: 'Facility Carried', type: 'text' as const },
    { name: 'FeaturesIntersected', label: 'Features Intersected', type: 'text' as const },
    { name: 'YearBuilt', label: 'Year Built', type: 'number' as const },
    { name: 'MainStructureType', label: 'Structure Type', type: 'select' as const, options: [
      { value: 'Steel', label: 'Steel' },
      { value: 'Concrete', label: 'Concrete' },
      { value: 'Prestressed Concrete', label: 'Prestressed Concrete' },
      { value: 'Wood', label: 'Wood' },
      { value: 'Masonry', label: 'Masonry' },
      { value: 'Other', label: 'Other' },
    ]},
    { name: 'OverallCondition', label: 'Overall Condition', type: 'select' as const, options: [
      { value: 'Good', label: 'Good' },
      { value: 'Fair', label: 'Fair' },
      { value: 'Poor', label: 'Poor' },
    ]},
    { name: 'StructurallyDeficient', label: 'Structurally Deficient', type: 'boolean' as const },
    { name: 'AverageDailyTraffic', label: 'Average Daily Traffic', type: 'number' as const },
    { name: 'AverageDailyTruckTraffic', label: 'Daily Truck Traffic', type: 'number' as const },
  ];

  const getConditionBadge = (condition: string | null, isDeficient: boolean) => {
    if (isDeficient) return <Badge variant="danger">Deficient</Badge>;
    if (condition === 'Good') return <Badge variant="success">Good</Badge>;
    if (condition === 'Fair') return <Badge variant="warning">Fair</Badge>;
    if (condition === 'Poor') return <Badge variant="danger">Poor</Badge>;
    return <Badge>Unknown</Badge>;
  };

  if (isLoading) return <LoadingSpinner text="Loading bridges..." />;
  if (error) return <div className="text-red-600">Error: {(error as Error).message}</div>;

  const totalItems = data?.value?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateButton onClick={handleCreate} label="Add Bridge" />
      </div>

      {!paginatedData.length ? (
        <EmptyState message="No bridges found" />
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: color }}>
                <tr className="text-white">
                  <th className="px-4 py-4 text-left font-semibold">Structure #</th>
                  <th className="px-4 py-4 text-left font-semibold">State</th>
                  <th className="px-4 py-4 text-left font-semibold">Facility</th>
                  <th className="px-4 py-4 text-left font-semibold">Type</th>
                  <th className="px-4 py-4 text-right font-semibold">Year Built</th>
                  <th className="px-4 py-4 text-right font-semibold">Daily Traffic</th>
                  <th className="px-4 py-4 text-center font-semibold">Condition</th>
                  <th className="px-4 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((bridge: any, idx: number) => (
                  <tr key={bridge.Id} className={`border-b hover:bg-slate-50 transition-colors ${idx % 2 ? 'bg-slate-25' : ''}`}>
                    <td className="px-4 py-3 font-mono text-sm">{bridge.StructureNumber}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{getStateCode(bridge.StateId)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{bridge.FacilityCarried || '-'}</td>
                    <td className="px-4 py-3 text-sm">{bridge.MainStructureType || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">{bridge.YearBuilt || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatNumber(bridge.AverageDailyTraffic)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getConditionBadge(bridge.OverallCondition, bridge.StructurallyDeficient)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onView={() => handleView(bridge)}
                        onEdit={() => handleEdit(bridge)}
                        onDelete={() => handleDelete(bridge)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="px-4 border-t"
          />
        </div>
      )}

      <CrudModal
        isOpen={showModal}
        mode={modalMode}
        title="Bridge"
        fields={fields}
        data={selectedRecord}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleConfirmDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}

function TransitAgencyTable({ getStateCode, color, states }: { getStateCode: (id: number) => string; color: string; states?: State[] }) {
  const getToken = useApiToken();
  const queryClient = useQueryClient();
  const { page, pageSize, skip, handlePageChange, handlePageSizeChange } = usePagination(25);

  // CRUD state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<CrudMode>('view');
  const [selectedRecord, setSelectedRecord] = useState<TransitAgency | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['transitAgencies'],
    queryFn: async () => {
      const accessToken = await getToken();

      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      // DAB uses $first instead of $top, fetch all for client-side pagination
      const query = buildODataQuery({ top: 500, orderBy: 'UnlinkedPassengerTrips desc' });
      const res = await fetch(`${apiUrl}/TransitAgency${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to fetch transit agencies');
      return res.json() as Promise<ApiResponse<TransitAgency>>;
    },
  });

  // Client-side pagination
  const paginatedData = data?.value?.slice(skip, skip + pageSize) || [];

  // CRUD handlers
  const handleCreate = () => {
    setSelectedRecord(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleView = (record: TransitAgency) => {
    setSelectedRecord(record);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (record: TransitAgency) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = (record: TransitAgency) => {
    setSelectedRecord(record);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleSave = async (formData: Partial<TransitAgency>) => {
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';

      if (modalMode === 'create') {
        await createRecord('/TransitAgency', formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      } else if (modalMode === 'edit' && selectedRecord) {
        await updateRecord('/TransitAgency', (selectedRecord as any).Id, formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      }

      queryClient.invalidateQueries({ queryKey: ['transitAgencies'] });
      setShowModal(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      await deleteRecord('/TransitAgency', (selectedRecord as any).Id, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      queryClient.invalidateQueries({ queryKey: ['transitAgencies'] });
      setShowModal(false);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field definitions for CrudModal - use PascalCase to match DAB response
  const fields = [
    { name: 'NtdId', label: 'NTD ID', type: 'text' as const, required: true },
    { name: 'AgencyName', label: 'Agency Name', type: 'text' as const, required: true },
    { name: 'City', label: 'City', type: 'text' as const, required: true },
    { name: 'StateId', label: 'State', type: 'select' as const, required: true, options: states?.map((s: any) => ({ value: s.Id, label: s.Name })) || [] },
    { name: 'ReportYear', label: 'Report Year', type: 'number' as const, required: true },
    { name: 'OrganizationType', label: 'Organization Type', type: 'select' as const, options: [
      { value: 'Bus', label: 'Bus' },
      { value: 'Heavy Rail', label: 'Heavy Rail' },
      { value: 'Light Rail', label: 'Light Rail' },
      { value: 'Commuter Rail', label: 'Commuter Rail' },
      { value: 'Demand Response', label: 'Demand Response' },
      { value: 'Ferry', label: 'Ferry' },
      { value: 'Other', label: 'Other' },
    ]},
    { name: 'UnlinkedPassengerTrips', label: 'Annual Ridership', type: 'number' as const },
    { name: 'VehicleRevenueMiles', label: 'Vehicle Revenue Miles', type: 'number' as const },
    { name: 'VehiclesOperatedMaxService', label: 'Vehicles (Max Service)', type: 'number' as const },
    { name: 'TotalOperatingExpenses', label: 'Operating Expenses ($)', type: 'number' as const },
    { name: 'FareRevenuesEarned', label: 'Fare Revenue ($)', type: 'number' as const },
  ];

  if (isLoading) return <LoadingSpinner text="Loading transit agencies..." />;
  if (error) return <div className="text-red-600">Error: {(error as Error).message}</div>;

  const totalItems = data?.value?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateButton onClick={handleCreate} label="Add Agency" />
      </div>

      {!paginatedData.length ? (
        <EmptyState message="No transit agencies found" />
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: color }}>
                <tr className="text-white">
                  <th className="px-4 py-4 text-left font-semibold">NTD ID</th>
                  <th className="px-4 py-4 text-left font-semibold">Agency</th>
                  <th className="px-4 py-4 text-left font-semibold">City</th>
                  <th className="px-4 py-4 text-left font-semibold">State</th>
                  <th className="px-4 py-4 text-right font-semibold">Year</th>
                  <th className="px-4 py-4 text-right font-semibold">Ridership</th>
                  <th className="px-4 py-4 text-right font-semibold">Vehicles</th>
                  <th className="px-4 py-4 text-right font-semibold">Expenses</th>
                  <th className="px-4 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((agency: any, idx: number) => (
                  <tr key={agency.Id} className={`border-b hover:bg-slate-50 transition-colors ${idx % 2 ? 'bg-slate-25' : ''}`}>
                    <td className="px-4 py-3 font-mono text-sm">{agency.NtdId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{agency.AgencyName}</td>
                    <td className="px-4 py-3 text-sm">{agency.City}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{getStateCode(agency.StateId)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{agency.ReportYear}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {agency.UnlinkedPassengerTrips
                        ? `${(agency.UnlinkedPassengerTrips / 1000000).toFixed(1)}M`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatNumber(agency.VehiclesOperatedMaxService)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(agency.TotalOperatingExpenses, true)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onView={() => handleView(agency)}
                        onEdit={() => handleEdit(agency)}
                        onDelete={() => handleDelete(agency)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="px-4 border-t"
          />
        </div>
      )}

      <CrudModal
        isOpen={showModal}
        mode={modalMode}
        title="Transit Agency"
        fields={fields}
        data={selectedRecord}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleConfirmDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}

function VehicleFatalityTable({ getStateCode, color, states }: { getStateCode: (id: number) => string; color: string; states?: State[] }) {
  const getToken = useApiToken();
  const queryClient = useQueryClient();
  const { page, pageSize, skip, handlePageChange, handlePageSizeChange } = usePagination(25);

  // CRUD state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<CrudMode>('view');
  const [selectedRecord, setSelectedRecord] = useState<VehicleFatality | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicleFatalities'],
    queryFn: async () => {
      const accessToken = await getToken();

      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      // DAB uses $first instead of $top, fetch all for client-side pagination
      const query = buildODataQuery({ top: 500, orderBy: 'CrashDate desc' });
      const res = await fetch(`${apiUrl}/VehicleFatality${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to fetch vehicle fatalities');
      return res.json() as Promise<ApiResponse<VehicleFatality>>;
    },
  });

  // Client-side pagination
  const paginatedData = data?.value?.slice(skip, skip + pageSize) || [];

  // CRUD handlers
  const handleCreate = () => {
    setSelectedRecord(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleView = (record: VehicleFatality) => {
    setSelectedRecord(record);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (record: VehicleFatality) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = (record: VehicleFatality) => {
    setSelectedRecord(record);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleSave = async (formData: Partial<VehicleFatality>) => {
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';

      if (modalMode === 'create') {
        await createRecord('/VehicleFatality', formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      } else if (modalMode === 'edit' && selectedRecord) {
        await updateRecord('/VehicleFatality', (selectedRecord as any).Id, formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      }

      queryClient.invalidateQueries({ queryKey: ['vehicleFatalities'] });
      setShowModal(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      await deleteRecord('/VehicleFatality', (selectedRecord as any).Id, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      queryClient.invalidateQueries({ queryKey: ['vehicleFatalities'] });
      setShowModal(false);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field definitions for CrudModal - use PascalCase to match DAB response
  const fields = [
    { name: 'CaseNumber', label: 'Case Number', type: 'text' as const, required: true },
    { name: 'CrashDate', label: 'Crash Date', type: 'date' as const, required: true },
    { name: 'StateId', label: 'State', type: 'select' as const, required: true, options: states?.map((s: any) => ({ value: s.Id, label: s.Name })) || [] },
    { name: 'NumberOfFatalities', label: 'Number of Fatalities', type: 'number' as const, required: true },
    { name: 'NumberOfVehicles', label: 'Number of Vehicles', type: 'number' as const },
    { name: 'MannerOfCollision', label: 'Manner of Collision', type: 'select' as const, options: [
      { value: 'Front-to-Front', label: 'Front-to-Front' },
      { value: 'Front-to-Rear', label: 'Front-to-Rear' },
      { value: 'Angle', label: 'Angle' },
      { value: 'Sideswipe', label: 'Sideswipe' },
      { value: 'Rear-to-Side', label: 'Rear-to-Side' },
      { value: 'Rear-to-Rear', label: 'Rear-to-Rear' },
      { value: 'Single Vehicle', label: 'Single Vehicle' },
      { value: 'Unknown', label: 'Unknown' },
    ]},
    { name: 'LandUse', label: 'Land Use', type: 'select' as const, options: [
      { value: 'Urban', label: 'Urban' },
      { value: 'Rural', label: 'Rural' },
    ]},
    { name: 'RoadwayFunctionClass', label: 'Roadway Class', type: 'select' as const, options: [
      { value: 'Interstate', label: 'Interstate' },
      { value: 'Principal Arterial', label: 'Principal Arterial' },
      { value: 'Minor Arterial', label: 'Minor Arterial' },
      { value: 'Collector', label: 'Collector' },
      { value: 'Local', label: 'Local' },
    ]},
    { name: 'InvolvesSpeedRelated', label: 'Speed Related', type: 'boolean' as const },
    { name: 'NumberOfDrunkDrivers', label: 'Drunk Drivers', type: 'number' as const },
    { name: 'WeatherCondition', label: 'Weather Condition', type: 'select' as const, options: [
      { value: 'Clear', label: 'Clear' },
      { value: 'Rain', label: 'Rain' },
      { value: 'Snow', label: 'Snow' },
      { value: 'Fog', label: 'Fog' },
      { value: 'Cloudy', label: 'Cloudy' },
      { value: 'Other', label: 'Other' },
    ]},
  ];

  if (isLoading) return <LoadingSpinner text="Loading vehicle fatalities..." />;
  if (error) return <div className="text-red-600">Error: {(error as Error).message}</div>;

  const totalItems = data?.value?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateButton onClick={handleCreate} label="Add Record" />
      </div>

      {!paginatedData.length ? (
        <EmptyState message="No vehicle fatalities found" />
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: color }}>
                <tr className="text-white">
                  <th className="px-4 py-4 text-left font-semibold">Case #</th>
                  <th className="px-4 py-4 text-left font-semibold">Date</th>
                  <th className="px-4 py-4 text-left font-semibold">State</th>
                  <th className="px-4 py-4 text-left font-semibold">Collision Type</th>
                  <th className="px-4 py-4 text-center font-semibold">Area</th>
                  <th className="px-4 py-4 text-right font-semibold">Vehicles</th>
                  <th className="px-4 py-4 text-right font-semibold">Fatalities</th>
                  <th className="px-4 py-4 text-center font-semibold">Speed Related</th>
                  <th className="px-4 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((fatality: any, idx: number) => (
                  <tr key={fatality.Id} className={`border-b hover:bg-slate-50 transition-colors ${idx % 2 ? 'bg-slate-25' : ''}`}>
                    <td className="px-4 py-3 font-mono text-sm">{fatality.CaseNumber}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(fatality.CrashDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{getStateCode(fatality.StateId)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{fatality.MannerOfCollision || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={fatality.LandUse === 'Urban' ? 'info' : 'warning'}>
                        {fatality.LandUse || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{fatality.NumberOfVehicles}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="danger">{fatality.NumberOfFatalities}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {fatality.InvolvesSpeedRelated ? (
                        <span className="text-red-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons
                        onView={() => handleView(fatality)}
                        onEdit={() => handleEdit(fatality)}
                        onDelete={() => handleDelete(fatality)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="px-4 border-t"
          />
        </div>
      )}

      <CrudModal
        isOpen={showModal}
        mode={modalMode}
        title="Vehicle Fatality"
        fields={fields}
        data={selectedRecord}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleConfirmDelete}
        isLoading={isSubmitting}
      />
    </div>
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
