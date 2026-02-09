/**
 * DataView Component
 * Container for category-specific data tables
 */

import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from '../ErrorBoundary';
import { PageHeader } from '../layout';
import { ChevronLeftIcon } from '../icons';
import { useApiToken } from '../../hooks/useApiToken';
import {
  RailroadAccidentTable,
  BridgeTable,
  TransitAgencyTable,
  VehicleFatalityTable,
} from '../tables';
import type { State, ApiResponse } from '../../types';

interface DataViewProps {
  category: string;
  onBack: () => void;
}

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

export function DataView({ category, onBack }: DataViewProps) {
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
  const stateMap = new Map(states?.map((s) => [s.Id, s]) || []);
  const getStateCode = (stateId: number) => stateMap.get(stateId)?.Code || '??';

  const config = categoryConfig[category] || { title: category, color: '#1E40AF', description: '' };

  return (
    <div>
      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors group"
      >
        <ChevronLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </button>

      {/* Category Header */}
      <PageHeader
        title={config.title}
        subtitle={config.description}
        color={config.color}
      />

      {/* Data Tables */}
      <ErrorBoundary>
        {category === 'RailroadAccident' && (
          <RailroadAccidentTable getStateCode={getStateCode} color={config.color} states={states} />
        )}
        {category === 'Bridge' && (
          <BridgeTable getStateCode={getStateCode} color={config.color} states={states} />
        )}
        {category === 'TransitAgency' && (
          <TransitAgencyTable getStateCode={getStateCode} color={config.color} states={states} />
        )}
        {category === 'VehicleFatality' && (
          <VehicleFatalityTable getStateCode={getStateCode} color={config.color} states={states} />
        )}
      </ErrorBoundary>
    </div>
  );
}
