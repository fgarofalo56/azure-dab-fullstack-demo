/**
 * API Explorer Component
 * Interactive REST API documentation and testing interface
 */

import { useState } from 'react';
import { useApiToken } from '../hooks/useApiToken';

// API endpoint definitions
const API_ENDPOINTS = {
  Category: {
    description: 'Transportation data categories (Railroads, Bridges, Transit, Automobiles)',
    methods: ['GET'],
    fields: ['Id', 'Name', 'Description', 'Icon', 'Color', 'SortOrder', 'IsActive'],
    example: {
      Id: 1,
      Name: 'Railroads',
      Description: 'FRA railroad accident and incident data',
      Icon: 'train',
      Color: '#1E40AF',
      SortOrder: 1,
      IsActive: true,
    },
  },
  CategorySummary: {
    description: 'Category summary view with record counts',
    methods: ['GET'],
    fields: ['CategoryId', 'CategoryName', 'Description', 'Icon', 'Color', 'RecordCount'],
    example: {
      CategoryId: 1,
      CategoryName: 'Railroads',
      Description: 'FRA railroad accident and incident data',
      Icon: 'train',
      Color: '#1E40AF',
      RecordCount: 300,
    },
  },
  State: {
    description: 'US states and territories with region information',
    methods: ['GET'],
    fields: ['Id', 'Code', 'Name', 'Region'],
    example: {
      Id: 1,
      Code: 'AL',
      Name: 'Alabama',
      Region: 'South',
    },
  },
  RailroadAccident: {
    description: 'FRA Form 54 railroad accident data',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    fields: [
      'Id', 'CategoryId', 'ReportingRailroadCode', 'ReportingRailroadName',
      'AccidentDate', 'AccidentTime', 'AccidentYear', 'AccidentMonth',
      'StateId', 'CountyName', 'AccidentType', 'TrainSpeed',
      'TotalKilled', 'TotalInjured', 'TotalDamage', 'HazmatCars',
    ],
    example: {
      Id: 1,
      ReportingRailroadName: 'BNSF Railway',
      AccidentDate: '2023-06-15',
      AccidentType: 'Derailment',
      StateId: 48,
      TrainSpeed: 35,
      TotalKilled: 0,
      TotalInjured: 2,
      TotalDamage: 150000,
    },
  },
  Bridge: {
    description: 'National Bridge Inventory data',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    fields: [
      'Id', 'CategoryId', 'StructureNumber', 'StateId', 'CountyName',
      'Latitude', 'Longitude', 'FacilityCarried', 'YearBuilt',
      'MainStructureType', 'OverallCondition', 'StructurallyDeficient',
      'AverageDailyTraffic', 'DeckCondition', 'SuperstructureCondition',
    ],
    example: {
      Id: 1,
      StructureNumber: 'NBI-12345',
      FacilityCarried: 'Interstate 95',
      YearBuilt: 1965,
      MainStructureType: 'Steel',
      OverallCondition: 'Fair',
      StructurallyDeficient: false,
      AverageDailyTraffic: 45000,
    },
  },
  TransitAgency: {
    description: 'National Transit Database agency metrics',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    fields: [
      'Id', 'CategoryId', 'NtdId', 'AgencyName', 'City', 'StateId',
      'UzaName', 'ReportYear', 'VehiclesOperatedMaxService',
      'UnlinkedPassengerTrips', 'VehicleRevenueMiles', 'TotalOperatingExpenses',
    ],
    example: {
      Id: 1,
      NtdId: '20008',
      AgencyName: 'Metropolitan Transportation Authority',
      City: 'New York',
      StateId: 36,
      ReportYear: 2023,
      UnlinkedPassengerTrips: 1500000000,
      TotalOperatingExpenses: 8500000000,
    },
  },
  VehicleFatality: {
    description: 'FARS vehicle crash fatality data',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    fields: [
      'Id', 'CategoryId', 'CaseNumber', 'StateId', 'CrashDate',
      'CrashYear', 'NumberOfVehicles', 'NumberOfFatalities',
      'MannerOfCollision', 'LandUse', 'InvolvesSpeedRelated',
      'WeatherCondition', 'LightCondition',
    ],
    example: {
      Id: 1,
      CaseNumber: 'FARS-2023-TX-001',
      CrashDate: '2023-07-20',
      StateId: 48,
      NumberOfVehicles: 2,
      NumberOfFatalities: 1,
      MannerOfCollision: 'Front-to-Rear',
      LandUse: 'Urban',
      InvolvesSpeedRelated: true,
    },
  },
};

// DAB query parameter documentation
const QUERY_PARAMS = [
  { param: '$first', description: 'Limit number of results (replaces $top)', example: '$first=10' },
  { param: '$after', description: 'Cursor for pagination (base64 encoded)', example: '$after=eyJJZCI6MTB9' },
  { param: '$filter', description: 'OData filter expression', example: "$filter=StateId eq 48" },
  { param: '$orderby', description: 'Sort order (field ASC/DESC)', example: '$orderby=AccidentDate desc' },
  { param: '$select', description: 'Select specific fields', example: '$select=Id,Name,Description' },
];

interface ApiExplorerProps {
  onClose: () => void;
}

export function ApiExplorer({ onClose }: ApiExplorerProps) {
  const getToken = useApiToken();
  const [selectedEndpoint, setSelectedEndpoint] = useState<keyof typeof API_ENDPOINTS>('Category');
  const [activeTab, setActiveTab] = useState<'docs' | 'try'>('docs');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  const [queryParams, setQueryParams] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = API_ENDPOINTS[selectedEndpoint];
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  const handleTryApi = async () => {
    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const accessToken = await getToken();
      const url = `${apiBaseUrl}/${selectedEndpoint}${queryParams ? `?${queryParams}` : ''}`;

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      if ((method === 'POST' || method === 'PATCH') && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) {
        setError(`${res.status} ${res.statusText}`);
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-800 to-blue-600 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">REST API Explorer</h2>
              <p className="text-blue-200 text-sm">Explore and test DAB REST endpoints</p>
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

        <div className="flex flex-1 min-h-0">
          {/* Sidebar - Endpoints */}
          <div className="w-64 border-r bg-slate-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Endpoints</h3>
              <div className="space-y-1">
                {Object.keys(API_ENDPOINTS).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedEndpoint(key as keyof typeof API_ENDPOINTS);
                      setResponse('');
                      setError(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedEndpoint === key
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="font-mono">/api/{key}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Query Params</h3>
              <div className="space-y-2 text-xs">
                {QUERY_PARAMS.map((p) => (
                  <div key={p.param} className="bg-white rounded p-2">
                    <code className="text-blue-600 font-semibold">{p.param}</code>
                    <p className="text-slate-600 mt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs */}
            <div className="flex gap-2 px-6 py-3 bg-slate-100 border-b">
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'docs'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                Documentation
              </button>
              <button
                onClick={() => setActiveTab('try')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'try'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                Try It
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'docs' ? (
                <div className="space-y-6">
                  {/* Endpoint Header */}
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 font-mono">
                      /api/{selectedEndpoint}
                    </h3>
                    <p className="text-slate-600 mt-2">{endpoint.description}</p>
                  </div>

                  {/* Methods */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Supported Methods
                    </h4>
                    <div className="flex gap-2">
                      {endpoint.methods.map((m) => (
                        <span
                          key={m}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            m === 'GET' ? 'bg-green-100 text-green-700' :
                            m === 'POST' ? 'bg-blue-100 text-blue-700' :
                            m === 'PATCH' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fields */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Fields
                    </h4>
                    <div className="bg-slate-100 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {endpoint.fields.map((field) => (
                          <code
                            key={field}
                            className="px-2 py-1 bg-white rounded text-sm text-slate-700 border"
                          >
                            {field}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Example Response */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Example Response
                    </h4>
                    <pre className="bg-slate-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm">
{`{
  "value": [
    ${JSON.stringify(endpoint.example, null, 4).split('\n').join('\n    ')}
  ]
}`}
                    </pre>
                  </div>

                  {/* Example Queries */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Example Queries
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-slate-100 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Get first 10 records</p>
                        <code className="text-sm text-slate-800">
                          GET /api/{selectedEndpoint}?$first=10
                        </code>
                      </div>
                      <div className="bg-slate-100 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Filter and order</p>
                        <code className="text-sm text-slate-800">
                          GET /api/{selectedEndpoint}?$filter=StateId eq 48&$orderby=Id desc
                        </code>
                      </div>
                      <div className="bg-slate-100 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">Select specific fields</p>
                        <code className="text-sm text-slate-800">
                          GET /api/{selectedEndpoint}?$select=Id,{endpoint.fields.slice(1, 3).join(',')}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Method and URL */}
                  <div className="flex gap-4">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value as typeof method)}
                      className="px-4 py-2 border rounded-lg font-medium bg-white"
                    >
                      {endpoint.methods.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-lg px-4">
                      <span className="text-slate-500">{apiBaseUrl}/</span>
                      <span className="font-mono font-medium text-slate-800">{selectedEndpoint}</span>
                    </div>
                  </div>

                  {/* Query Parameters */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Query Parameters
                    </label>
                    <input
                      type="text"
                      value={queryParams}
                      onChange={(e) => setQueryParams(e.target.value)}
                      placeholder="$first=10&$orderby=Id desc"
                      className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                    />
                  </div>

                  {/* Request Body (for POST/PATCH) */}
                  {(method === 'POST' || method === 'PATCH') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Request Body (JSON)
                      </label>
                      <textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder={JSON.stringify(endpoint.example, null, 2)}
                        className="w-full h-32 px-4 py-2 border rounded-lg font-mono text-sm resize-none"
                      />
                    </div>
                  )}

                  {/* Execute Button */}
                  <button
                    onClick={handleTryApi}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Send Request
                      </>
                    )}
                  </button>

                  {/* Response */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Response
                    </label>
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2 text-red-700 text-sm">
                        <strong>Error:</strong> {error}
                      </div>
                    )}
                    <pre className="bg-slate-900 text-green-400 rounded-lg p-4 overflow-auto max-h-80 text-sm">
                      {response || (
                        <span className="text-slate-500">Response will appear here...</span>
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t rounded-b-xl">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-600">
              <span className="font-medium">Base URL:</span>{' '}
              <code className="px-2 py-1 bg-slate-200 rounded">{apiBaseUrl}</code>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Authentication: Bearer Token (Azure AD)</span>
              <span>|</span>
              <span>Powered by Azure Data API Builder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiExplorer;
