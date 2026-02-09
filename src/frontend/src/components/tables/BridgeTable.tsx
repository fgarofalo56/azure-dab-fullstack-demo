/**
 * BridgeTable - National Bridge Inventory Data Table
 * Uses BaseDataTable for CRUD operations and pagination
 */

import { BaseDataTable, type TableColumn } from '../BaseDataTable';
import type { Bridge, State } from '../../types';

// Badge component for consistent styling
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

// Condition badge helper
function getConditionBadge(condition: string | null, isDeficient: boolean) {
  if (isDeficient) return <Badge variant="danger">Deficient</Badge>;
  if (condition === 'Good') return <Badge variant="success">Good</Badge>;
  if (condition === 'Fair') return <Badge variant="warning">Fair</Badge>;
  if (condition === 'Poor') return <Badge variant="danger">Poor</Badge>;
  return <Badge>Unknown</Badge>;
}

interface BridgeTableProps {
  getStateCode: (id: number) => string;
  color: string;
  states?: State[];
}

export function BridgeTable({ getStateCode, color, states }: BridgeTableProps) {
  // Column definitions
  const columns: TableColumn<Bridge>[] = [
    {
      key: 'structureNumber',
      header: 'Structure #',
      render: (record) => <span className="font-mono text-sm">{record.StructureNumber}</span>,
    },
    {
      key: 'state',
      header: 'State',
      render: (record, { getStateCode }) => (
        <Badge variant="info">{getStateCode(record.StateId)}</Badge>
      ),
    },
    {
      key: 'facility',
      header: 'Facility',
      responsive: 'md',
      render: (record) => (
        <span className="text-sm max-w-[150px] truncate block" title={record.FacilityCarried || undefined}>
          {record.FacilityCarried || '-'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      responsive: 'lg',
      render: (record) => <span className="text-sm">{record.MainStructureType || '-'}</span>,
    },
    {
      key: 'yearBuilt',
      header: 'Year Built',
      align: 'right',
      responsive: 'xl',
      render: (record) => <span className="text-sm">{record.YearBuilt || '-'}</span>,
    },
    {
      key: 'dailyTraffic',
      header: 'Daily Traffic',
      align: 'right',
      responsive: 'md',
      render: (record, { formatNumber }) => (
        <span className="text-sm font-medium">{formatNumber(record.AverageDailyTraffic)}</span>
      ),
    },
    {
      key: 'condition',
      header: 'Condition',
      align: 'center',
      render: (record) => getConditionBadge(record.OverallCondition, record.StructurallyDeficient),
    },
  ];

  // Field definitions for CRUD modal
  const fields = [
    { name: 'StructureNumber', label: 'Structure Number', type: 'text' as const, required: true, validation: { maxLength: 50 } },
    { name: 'StateId', label: 'State', type: 'select' as const, required: true, options: states?.map((s) => ({ value: s.Id, label: s.Name })) || [] },
    { name: 'FacilityCarried', label: 'Facility Carried', type: 'text' as const, validation: { maxLength: 200 } },
    { name: 'FeaturesIntersected', label: 'Features Intersected', type: 'text' as const, validation: { maxLength: 200 } },
    { name: 'YearBuilt', label: 'Year Built', type: 'number' as const, validation: { min: 1800, max: new Date().getFullYear() } },
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
    { name: 'AverageDailyTraffic', label: 'Average Daily Traffic', type: 'number' as const, validation: { min: 0, max: 1000000 } },
    { name: 'AverageDailyTruckTraffic', label: 'Daily Truck Traffic', type: 'number' as const, validation: { min: 0, max: 500000 } },
  ];

  return (
    <BaseDataTable<Bridge>
      queryKey="bridges"
      endpoint="/Bridge"
      color={color}
      modalTitle="Bridge"
      createButtonLabel="Add Bridge"
      emptyMessage="No bridges found"
      loadingText="Loading bridges..."
      columns={columns}
      fields={fields}
      getStateCode={getStateCode}
      queryOptions={{ top: 500, orderBy: 'AverageDailyTraffic desc' }}
    />
  );
}
