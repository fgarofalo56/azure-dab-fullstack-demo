/**
 * RailroadAccidentTable - Railroad Accident Data Table
 * Uses BaseDataTable for CRUD operations and pagination
 */

import { BaseDataTable, type TableColumn } from '../BaseDataTable';
import type { RailroadAccident, State } from '../../types';

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

interface RailroadAccidentTableProps {
  getStateCode: (id: number) => string;
  color: string;
  states?: State[];
}

export function RailroadAccidentTable({ getStateCode, color, states }: RailroadAccidentTableProps) {
  // Column definitions
  const columns: TableColumn<RailroadAccident>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (record, { formatDate }) => (
        <span className="text-sm">{formatDate(record.AccidentDate)}</span>
      ),
    },
    {
      key: 'railroad',
      header: 'Railroad',
      render: (record) => (
        <span className="text-sm font-medium text-slate-800 max-w-[150px] truncate block" title={record.ReportingRailroadName}>
          {record.ReportingRailroadName}
        </span>
      ),
    },
    {
      key: 'state',
      header: 'State',
      render: (record, { getStateCode }) => (
        <Badge variant="info">{getStateCode(record.StateId)}</Badge>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      responsive: 'lg',
      render: (record) => <span className="text-sm">{record.AccidentType}</span>,
    },
    {
      key: 'speed',
      header: 'Speed',
      align: 'right',
      responsive: 'xl',
      render: (record) => <span className="text-sm">{record.TrainSpeed ?? '-'} mph</span>,
    },
    {
      key: 'killed',
      header: 'Killed',
      align: 'right',
      render: (record) =>
        record.TotalKilled > 0 ? (
          <Badge variant="danger">{record.TotalKilled}</Badge>
        ) : (
          <span className="text-slate-400">0</span>
        ),
    },
    {
      key: 'injured',
      header: 'Injured',
      align: 'right',
      render: (record) =>
        record.TotalInjured > 0 ? (
          <Badge variant="warning">{record.TotalInjured}</Badge>
        ) : (
          <span className="text-slate-400">0</span>
        ),
    },
    {
      key: 'damage',
      header: 'Damage',
      align: 'right',
      responsive: 'md',
      render: (record, { formatCurrency }) => (
        <span className="text-sm font-medium">{formatCurrency(record.TotalDamage, true)}</span>
      ),
    },
  ];

  // Field definitions for CRUD modal
  const fields = [
    { name: 'ReportingRailroadName', label: 'Railroad Name', type: 'text' as const, required: true, validation: { maxLength: 200 } },
    { name: 'AccidentDate', label: 'Accident Date', type: 'date' as const, required: true, validation: { maxDate: new Date().toISOString().split('T')[0] } },
    { name: 'StateId', label: 'State', type: 'select' as const, required: true, options: states?.map((s) => ({ value: s.Id, label: s.Name })) || [] },
    { name: 'AccidentType', label: 'Accident Type', type: 'select' as const, required: true, options: [
      { value: 'Derailment', label: 'Derailment' },
      { value: 'Collision', label: 'Collision' },
      { value: 'Crossing Incident', label: 'Crossing Incident' },
      { value: 'Fire/Explosion', label: 'Fire/Explosion' },
      { value: 'Other', label: 'Other' },
    ]},
    { name: 'TrainSpeed', label: 'Train Speed (mph)', type: 'number' as const, validation: { min: 0, max: 300 } },
    { name: 'TotalKilled', label: 'Total Killed', type: 'number' as const, validation: { min: 0, max: 10000 } },
    { name: 'TotalInjured', label: 'Total Injured', type: 'number' as const, validation: { min: 0, max: 10000 } },
    { name: 'TotalDamage', label: 'Total Damage ($)', type: 'number' as const, validation: { min: 0 } },
    { name: 'HazmatCars', label: 'Hazmat Cars', type: 'number' as const, validation: { min: 0, max: 1000 } },
  ];

  return (
    <BaseDataTable<RailroadAccident>
      queryKey="railroadAccidents"
      endpoint="/RailroadAccident"
      color={color}
      modalTitle="Railroad Accident"
      createButtonLabel="Add Accident"
      emptyMessage="No railroad accidents found"
      loadingText="Loading railroad accidents..."
      columns={columns}
      fields={fields}
      getStateCode={getStateCode}
      queryOptions={{ top: 500, orderBy: 'AccidentDate desc' }}
    />
  );
}
