/**
 * CategoryDashboard Component
 * Main dashboard showing category cards and API info
 */

import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner, Card } from '../layout';
import { getIcon, CodeIcon, ChevronRightIcon } from '../icons';
import { formatNumber } from '../../utils/api';
import { useApiToken } from '../../hooks/useApiToken';
import type { CategorySummary, ApiResponse } from '../../types';

interface CategoryDashboardProps {
  onSelectCategory: (category: string) => void;
}

const categoryEndpoints: Record<string, string> = {
  'Railroads': 'RailroadAccident',
  'Bridges': 'Bridge',
  'Public Transit': 'TransitAgency',
  'Automobiles': 'VehicleFatality',
};

export function CategoryDashboard({ onSelectCategory }: CategoryDashboardProps) {
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
          <Card
            key={cat.CategoryId}
            onClick={() => onSelectCategory(categoryEndpoints[cat.CategoryName] || '')}
            className="group text-left"
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
                <ChevronRightIcon className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
              </div>
            </div>
            <div
              className="px-6 py-4 border-t"
              style={{ backgroundColor: cat.Color + '08', borderColor: cat.Color + '20' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-sm">Total Records</span>
                <span className="text-2xl font-bold" style={{ color: cat.Color }}>
                  {formatNumber(cat.RecordCount)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* API Info Panel */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <CodeIcon className="w-6 h-6 text-blue-400" />
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
