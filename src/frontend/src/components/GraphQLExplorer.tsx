/**
 * GraphQL Explorer Component
 * Interactive GraphQL query interface for demonstrating DAB GraphQL capabilities
 *
 * Accessibility features:
 * - role="dialog" with aria-modal="true"
 * - aria-labelledby for dialog title
 * - Focus trap within modal
 * - Escape key to close
 * - Return focus on close
 * - Proper form labeling
 */

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useApiToken } from '../hooks/useApiToken';

// Derive GraphQL URL from API base URL
// API is at /api, GraphQL is at /graphql on the same host
function getGraphQLUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  // If API URL is relative, just use /graphql
  if (apiUrl.startsWith('/')) {
    return '/graphql';
  }
  // If API URL is absolute, replace /api with /graphql
  return apiUrl.replace(/\/api\/?$/, '/graphql');
}

const SAMPLE_QUERIES = {
  categories: `# Get all categories with record counts
{
  categories {
    items {
      Id
      Name
      Description
      Icon
      Color
    }
  }
}`,
  bridges: `# Get bridges in poor condition
{
  bridges(
    filter: { OverallCondition: { eq: "Poor" } }
    first: 10
    orderBy: { YearBuilt: ASC }
  ) {
    items {
      Id
      StructureNumber
      YearBuilt
      OverallCondition
      AverageDailyTraffic
      state {
        Name
        Code
      }
    }
  }
}`,
  railroadAccidents: `# Get recent railroad accidents with fatalities
{
  railroadAccidents(
    filter: { TotalKilled: { gt: 0 } }
    first: 10
    orderBy: { AccidentDate: DESC }
  ) {
    items {
      Id
      ReportingRailroadName
      AccidentDate
      AccidentType
      TotalKilled
      TotalInjured
      state {
        Name
      }
    }
  }
}`,
  transitAgencies: `# Get top transit agencies by ridership
{
  transitAgencies(
    first: 10
    orderBy: { UnlinkedPassengerTrips: DESC }
  ) {
    items {
      NtdId
      AgencyName
      City
      UnlinkedPassengerTrips
      TotalOperatingExpenses
      state {
        Name
        Code
      }
    }
  }
}`,
  vehicleFatalities: `# Get vehicle fatalities with filters
{
  vehicleFatalities(
    filter: { InvolvesSpeedRelated: { eq: true } }
    first: 10
    orderBy: { CrashDate: DESC }
  ) {
    items {
      CaseNumber
      CrashDate
      NumberOfFatalities
      MannerOfCollision
      LandUse
      state {
        Name
      }
    }
  }
}`,
  statesWithData: `# Get states with transportation data summary
{
  states(first: 10) {
    items {
      Id
      Code
      Name
      Region
      bridges {
        items {
          Id
        }
      }
      railroadAccidents {
        items {
          Id
        }
      }
    }
  }
}`,
};

interface GraphQLExplorerProps {
  onClose: () => void;
}

export function GraphQLExplorer({ onClose }: GraphQLExplorerProps) {
  const getToken = useApiToken();
  const [query, setQuery] = useState(SAMPLE_QUERIES.categories);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof typeof SAMPLE_QUERIES>('categories');

  // Accessibility
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const queryLabelId = useId();
  const resultLabelId = useId();

  // Store previously focused element
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    return () => {
      previousActiveElement.current?.focus();
    };
  }, []);

  // Escape key handler and focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-focus first interactive element
  useEffect(() => {
    requestAnimationFrame(() => {
      const firstButton = modalRef.current?.querySelector<HTMLElement>('button');
      firstButton?.focus();
    });
  }, []);

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await getToken();
      const graphqlUrl = getGraphQLUrl();

      const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));

      if (data.errors) {
        setError(data.errors.map((e: { message: string }) => e.message).join('\n'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (key: keyof typeof SAMPLE_QUERIES) => {
    setActiveTab(key);
    setQuery(SAMPLE_QUERIES[key]);
    setResult('');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-800 to-purple-600 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center" aria-hidden="true">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 id={titleId} className="text-xl font-bold text-white">GraphQL Explorer</h2>
              <p className="text-purple-200 text-sm">Query DOT data with GraphQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close GraphQL Explorer"
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sample query tabs */}
        <div className="flex gap-2 px-6 py-3 bg-slate-50 border-b overflow-x-auto" role="tablist" aria-label="Sample GraphQL queries">
          {Object.keys(SAMPLE_QUERIES).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => handleSelectSample(key as keyof typeof SAMPLE_QUERIES)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-2 gap-6 p-6 min-h-0 overflow-hidden">
          {/* Query editor */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <label id={queryLabelId} className="text-base font-medium text-slate-700">Query</label>
              <button
                onClick={handleExecute}
                disabled={isLoading}
                aria-busy={isLoading}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    <span aria-live="polite">Executing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Execute
                  </>
                )}
              </button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-labelledby={queryLabelId}
              className="flex-1 p-4 font-mono text-base bg-slate-900 text-green-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              placeholder="Enter your GraphQL query..."
            />
          </div>

          {/* Result viewer */}
          <div className="flex flex-col min-h-0">
            <span id={resultLabelId} className="text-base font-medium text-slate-700 mb-3">Result</span>
            <div className="flex-1 relative min-h-0">
              {error && (
                <div role="alert" className="absolute top-0 left-0 right-0 bg-red-50 border border-red-200 rounded-t-lg p-3 text-red-700 text-sm z-10">
                  <strong>Error:</strong> {error}
                </div>
              )}
              <pre
                aria-labelledby={resultLabelId}
                aria-live="polite"
                className={`h-full p-4 font-mono text-base bg-slate-100 rounded-lg overflow-auto leading-relaxed ${
                  error ? 'pt-16' : ''
                }`}
              >
                {result || (
                  <span className="text-slate-400">
                    Click "Execute" to run the query and see results here...
                  </span>
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer with API info */}
        <div className="px-6 py-4 bg-slate-50 border-t rounded-b-xl">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-600">
              <span className="font-medium">Endpoint:</span>{' '}
              <code className="px-2 py-1 bg-slate-200 rounded">
                {getGraphQLUrl()}
              </code>
            </div>
            <div className="text-slate-500">
              Powered by Azure Data API Builder
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraphQLExplorer;
