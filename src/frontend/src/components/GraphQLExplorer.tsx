/**
 * GraphQL Explorer Component
 * Interactive GraphQL query interface for demonstrating DAB GraphQL capabilities
 */

import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';

const SAMPLE_QUERIES = {
  categories: `# Get all categories with record counts
{
  categories {
    items {
      id
      name
      description
      icon
      color
    }
  }
}`,
  bridges: `# Get bridges in poor condition
{
  bridges(
    filter: { overallCondition: { eq: "Poor" } }
    first: 10
    orderBy: { yearBuilt: ASC }
  ) {
    items {
      id
      structureNumber
      yearBuilt
      overallCondition
      averageDailyTraffic
      state {
        name
        code
      }
    }
  }
}`,
  railroadAccidents: `# Get recent railroad accidents with fatalities
{
  railroadAccidents(
    filter: { totalKilled: { gt: 0 } }
    first: 10
    orderBy: { accidentDate: DESC }
  ) {
    items {
      id
      reportingRailroadName
      accidentDate
      accidentType
      totalKilled
      totalInjured
      state {
        name
      }
    }
  }
}`,
  transitAgencies: `# Get top transit agencies by ridership
{
  transitAgencies(
    first: 10
    orderBy: { unlinkedPassengerTrips: DESC }
  ) {
    items {
      ntdId
      agencyName
      city
      unlinkedPassengerTrips
      totalOperatingExpenses
      state {
        name
        code
      }
    }
  }
}`,
  vehicleFatalities: `# Get vehicle fatalities with filters
{
  vehicleFatalities(
    filter: { involvesSpeedRelated: { eq: true } }
    first: 10
    orderBy: { crashDate: DESC }
  ) {
    items {
      caseNumber
      crashDate
      numberOfFatalities
      mannerOfCollision
      landUse
      state {
        name
      }
    }
  }
}`,
  statesWithData: `# Get states with transportation data summary
{
  states(first: 10) {
    items {
      id
      code
      name
      region
      bridges {
        items {
          id
        }
      }
      railroadAccidents {
        items {
          id
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
  const { instance, accounts } = useMsal();
  const [query, setQuery] = useState(SAMPLE_QUERIES.categories);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof typeof SAMPLE_QUERIES>('categories');

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || '/graphql';

      const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${response.accessToken}`,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-800 to-purple-600 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">GraphQL Explorer</h2>
              <p className="text-purple-200 text-sm">Query DOT data with GraphQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sample query tabs */}
        <div className="flex gap-2 px-6 py-3 bg-slate-50 border-b overflow-x-auto">
          {Object.keys(SAMPLE_QUERIES).map((key) => (
            <button
              key={key}
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
        <div className="flex-1 grid grid-cols-2 gap-4 p-6 min-h-0">
          {/* Query editor */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Query</label>
              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="flex-1 p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your GraphQL query..."
            />
          </div>

          {/* Result viewer */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-2">Result</label>
            <div className="flex-1 relative">
              {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-50 border border-red-200 rounded-t-lg p-3 text-red-700 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}
              <pre
                className={`h-full p-4 font-mono text-sm bg-slate-100 rounded-lg overflow-auto ${
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
                {import.meta.env.VITE_GRAPHQL_URL || '/graphql'}
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
