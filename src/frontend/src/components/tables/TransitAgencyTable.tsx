/**
 * TransitAgencyTable - Transit Agency Data Table
 * Uses BaseDataTable for CRUD operations and pagination
 */

import { BaseDataTable, type TableColumn } from '../BaseDataTable';
import type { TransitAgency, State } from '../../types';

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

interface TransitAgencyTableProps {
  getStateCode: (id: number) => string;
  color: string;
  states?: State[];
}

export function TransitAgencyTable({ getStateCode, color, states }: TransitAgencyTableProps) {
  // Column definitions
  const columns: TableColumn<TransitAgency>[] = [
    {
      key: 'ntdId',
      header: 'NTD ID',
      responsive: 'lg',
      render: (record) => <span className="font-mono text-sm">{record.NtdId}</span>,
    },
    {
      key: 'agency',
      header: 'Agency',
      render: (record) => (
        <span className="text-sm font-medium text-slate-800 max-w-[200px] truncate block" title={record.AgencyName}>
          {record.AgencyName}
        </span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      responsive: 'md',
      render: (record) => <span className="text-sm">{record.City}</span>,
    },
    {
      key: 'state',
      header: 'State',
      render: (record, { getStateCode }) => (
        <Badge variant="info">{getStateCode(record.StateId)}</Badge>
      ),
    },
    {
      key: 'year',
      header: 'Year',
      align: 'right',
      responsive: 'xl',
      render: (record) => <span className="text-sm">{record.ReportYear}</span>,
    },
    {
      key: 'ridership',
      header: 'Ridership',
      align: 'right',
      render: (record) => (
        <span className="text-sm font-medium">
          {record.UnlinkedPassengerTrips
            ? `${(record.UnlinkedPassengerTrips / 1000000).toFixed(1)}M`
            : '-'}
        </span>
      ),
    },
    {
      key: 'vehicles',
      header: 'Vehicles',
      align: 'right',
      responsive: 'lg',
      render: (record, { formatNumber }) => (
        <span className="text-sm">{formatNumber(record.VehiclesOperatedMaxService)}</span>
      ),
    },
    {
      key: 'expenses',
      header: 'Expenses',
      align: 'right',
      responsive: 'md',
      render: (record, { formatCurrency }) => (
        <span className="text-sm font-medium">{formatCurrency(record.TotalOperatingExpenses, true)}</span>
      ),
    },
  ];

  // Field definitions for CRUD modal
  const fields = [
    { name: 'NtdId', label: 'NTD ID', type: 'text' as const, required: true, validation: { maxLength: 20 } },
    { name: 'AgencyName', label: 'Agency Name', type: 'text' as const, required: true, validation: { maxLength: 200 } },
    { name: 'City', label: 'City', type: 'text' as const, required: true, validation: { maxLength: 100 } },
    { name: 'StateId', label: 'State', type: 'select' as const, required: true, options: states?.map((s) => ({ value: s.Id, label: s.Name })) || [] },
    { name: 'ReportYear', label: 'Report Year', type: 'number' as const, required: true, validation: { min: 1980, max: new Date().getFullYear() } },
    { name: 'OrganizationType', label: 'Organization Type', type: 'select' as const, options: [
      { value: 'Bus', label: 'Bus' },
      { value: 'Heavy Rail', label: 'Heavy Rail' },
      { value: 'Light Rail', label: 'Light Rail' },
      { value: 'Commuter Rail', label: 'Commuter Rail' },
      { value: 'Demand Response', label: 'Demand Response' },
      { value: 'Ferry', label: 'Ferry' },
      { value: 'Other', label: 'Other' },
    ]},
    { name: 'UnlinkedPassengerTrips', label: 'Annual Ridership', type: 'number' as const, validation: { min: 0 } },
    { name: 'VehicleRevenueMiles', label: 'Vehicle Revenue Miles', type: 'number' as const, validation: { min: 0 } },
    { name: 'VehiclesOperatedMaxService', label: 'Vehicles (Max Service)', type: 'number' as const, validation: { min: 0, max: 50000 } },
    { name: 'TotalOperatingExpenses', label: 'Operating Expenses ($)', type: 'number' as const, validation: { min: 0 } },
    { name: 'FareRevenuesEarned', label: 'Fare Revenue ($)', type: 'number' as const, validation: { min: 0 } },
  ];

  return (
    <BaseDataTable<TransitAgency>
      queryKey="transitAgencies"
      endpoint="/TransitAgency"
      color={color}
      modalTitle="Transit Agency"
      createButtonLabel="Add Agency"
      emptyMessage="No transit agencies found"
      loadingText="Loading transit agencies..."
      columns={columns}
      fields={fields}
      getStateCode={getStateCode}
      queryOptions={{ top: 500, orderBy: 'UnlinkedPassengerTrips desc' }}
    />
  );
}
