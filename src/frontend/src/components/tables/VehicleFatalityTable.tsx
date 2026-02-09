/**
 * VehicleFatalityTable - Vehicle Fatality Data Table
 * Uses BaseDataTable for CRUD operations and pagination
 */

import { BaseDataTable, type TableColumn } from '../BaseDataTable';
import type { VehicleFatality, State } from '../../types';

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

interface VehicleFatalityTableProps {
  getStateCode: (id: number) => string;
  color: string;
  states?: State[];
}

export function VehicleFatalityTable({ getStateCode, color, states }: VehicleFatalityTableProps) {
  // Column definitions
  const columns: TableColumn<VehicleFatality>[] = [
    {
      key: 'caseNumber',
      header: 'Case #',
      responsive: 'lg',
      render: (record) => <span className="font-mono text-sm">{record.CaseNumber}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (record, { formatDate }) => <span className="text-sm">{formatDate(record.CrashDate)}</span>,
    },
    {
      key: 'state',
      header: 'State',
      render: (record, { getStateCode }) => (
        <Badge variant="info">{getStateCode(record.StateId)}</Badge>
      ),
    },
    {
      key: 'collisionType',
      header: 'Collision Type',
      responsive: 'md',
      render: (record) => <span className="text-sm">{record.MannerOfCollision || '-'}</span>,
    },
    {
      key: 'area',
      header: 'Area',
      align: 'center',
      responsive: 'xl',
      render: (record) => (
        <Badge variant={record.LandUse === 'Urban' ? 'info' : 'warning'}>
          {record.LandUse || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'vehicles',
      header: 'Vehicles',
      align: 'right',
      responsive: 'lg',
      render: (record) => <span className="text-sm">{record.NumberOfVehicles}</span>,
    },
    {
      key: 'fatalities',
      header: 'Fatalities',
      align: 'right',
      render: (record) => <Badge variant="danger">{record.NumberOfFatalities}</Badge>,
    },
    {
      key: 'speedRelated',
      header: 'Speed Related',
      align: 'center',
      responsive: 'md',
      render: (record) =>
        record.InvolvesSpeedRelated ? (
          <span className="text-red-600 font-medium">Yes</span>
        ) : (
          <span className="text-slate-400">No</span>
        ),
    },
  ];

  // Field definitions for CRUD modal
  const fields = [
    { name: 'CaseNumber', label: 'Case Number', type: 'text' as const, required: true, validation: { maxLength: 50 } },
    { name: 'CrashDate', label: 'Crash Date', type: 'date' as const, required: true, validation: { maxDate: new Date().toISOString().split('T')[0] } },
    { name: 'StateId', label: 'State', type: 'select' as const, required: true, options: states?.map((s) => ({ value: s.Id, label: s.Name })) || [] },
    { name: 'NumberOfFatalities', label: 'Number of Fatalities', type: 'number' as const, required: true, validation: { min: 1, max: 500 } },
    { name: 'NumberOfVehicles', label: 'Number of Vehicles', type: 'number' as const, validation: { min: 1, max: 100 } },
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
    { name: 'NumberOfDrunkDrivers', label: 'Drunk Drivers', type: 'number' as const, validation: { min: 0, max: 50 } },
    { name: 'WeatherCondition', label: 'Weather Condition', type: 'select' as const, options: [
      { value: 'Clear', label: 'Clear' },
      { value: 'Rain', label: 'Rain' },
      { value: 'Snow', label: 'Snow' },
      { value: 'Fog', label: 'Fog' },
      { value: 'Cloudy', label: 'Cloudy' },
      { value: 'Other', label: 'Other' },
    ]},
  ];

  return (
    <BaseDataTable<VehicleFatality>
      queryKey="vehicleFatalities"
      endpoint="/VehicleFatality"
      color={color}
      modalTitle="Vehicle Fatality"
      createButtonLabel="Add Record"
      emptyMessage="No vehicle fatalities found"
      loadingText="Loading vehicle fatalities..."
      columns={columns}
      fields={fields}
      getStateCode={getStateCode}
      queryOptions={{ top: 500, orderBy: 'CrashDate desc' }}
    />
  );
}
