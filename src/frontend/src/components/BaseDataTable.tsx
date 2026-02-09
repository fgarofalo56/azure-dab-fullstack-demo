/**
 * BaseDataTable - Reusable Data Table Component with CRUD Operations
 *
 * Generic table component that encapsulates:
 * - CRUD state management and handlers
 * - Pagination with client-side slicing
 * - Data fetching with React Query
 * - Modal integration for view/edit/create/delete operations
 *
 * Used by: RailroadAccidentTable, BridgeTable, TransitAgencyTable, VehicleFatalityTable
 */

import { useState, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pagination, usePagination } from './Pagination';
import { CrudModal, CrudMode, type Field } from './CrudModal';
import { createRecord, updateRecord, deleteRecord } from '../utils/api';
import { useApiToken } from '../hooks/useApiToken';
import type { ApiResponse } from '../types';

// ============================================================================
// Shared UI Components
// ============================================================================

function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600" />
      {text && <p className="mt-4 text-slate-600">{text}</p>}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-slate-700">{message}</p>
    </div>
  );
}

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
// Column Definition Types
// ============================================================================

export interface TableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Header text */
  header: string;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Responsive visibility: always visible, hidden on breakpoint, etc. */
  responsive?: 'always' | 'md' | 'lg' | 'xl';
  /** Custom render function for the cell */
  render: (record: T, helpers: TableHelpers) => ReactNode;
}

export interface TableHelpers {
  /** Get state code from state ID */
  getStateCode: (stateId: number) => string;
  /** Format number with locale separators */
  formatNumber: (value: number | null | undefined) => string;
  /** Format currency */
  formatCurrency: (value: number | null | undefined, compact?: boolean) => string;
  /** Format date */
  formatDate: (value: string | null | undefined) => string;
}

// ============================================================================
// BaseDataTable Props
// ============================================================================

export interface BaseDataTableProps<T extends { Id: number }> {
  /** Unique query key for React Query */
  queryKey: string;
  /** API endpoint path (e.g., '/RailroadAccident') */
  endpoint: string;
  /** Table header background color */
  color: string;
  /** Modal title (e.g., 'Railroad Accident') */
  modalTitle: string;
  /** Create button label (e.g., 'Add Accident') */
  createButtonLabel: string;
  /** Empty state message */
  emptyMessage: string;
  /** Loading text */
  loadingText: string;
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Field definitions for CRUD modal */
  fields: Field[];
  /** Helper function to get state code from ID */
  getStateCode: (stateId: number) => string;
  /** OData query options */
  queryOptions?: {
    top?: number;
    orderBy?: string;
    filter?: string;
  };
}

// ============================================================================
// BaseDataTable Component
// ============================================================================

export function BaseDataTable<T extends { Id: number }>({
  queryKey,
  endpoint,
  color,
  modalTitle,
  createButtonLabel,
  emptyMessage,
  loadingText,
  columns,
  fields,
  getStateCode,
  queryOptions = { top: 500 },
}: BaseDataTableProps<T>) {
  const getToken = useApiToken();
  const queryClient = useQueryClient();
  const { page, pageSize, skip, handlePageChange, handlePageSizeChange } = usePagination(25);

  // CRUD state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<CrudMode>('view');
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build OData query string
  const buildQuery = () => {
    const params: string[] = [];
    if (queryOptions.top) params.push(`$top=${queryOptions.top}`);
    if (queryOptions.orderBy) params.push(`$orderby=${queryOptions.orderBy}`);
    if (queryOptions.filter) params.push(`$filter=${queryOptions.filter}`);
    return params.length > 0 ? `?${params.join('&')}` : '';
  };

  // Data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const query = buildQuery();
      const res = await fetch(`${apiUrl}${endpoint}${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch ${queryKey}`);
      return res.json() as Promise<ApiResponse<T>>;
    },
  });

  // Client-side pagination
  const paginatedData = data?.value?.slice(skip, skip + pageSize) || [];
  const totalItems = data?.value?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // CRUD handlers
  const handleCreate = useCallback(() => {
    setSelectedRecord(null);
    setModalMode('create');
    setShowModal(true);
  }, []);

  const handleView = useCallback((record: T) => {
    setSelectedRecord(record);
    setModalMode('view');
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((record: T) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((record: T) => {
    setSelectedRecord(record);
    setModalMode('delete');
    setShowModal(true);
  }, []);

  const handleSave = async (formData: Partial<T>) => {
    setIsSubmitting(true);
    try {
      const accessToken = await getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';

      if (modalMode === 'create') {
        await createRecord(endpoint, formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      } else if (modalMode === 'edit' && selectedRecord) {
        await updateRecord(endpoint, selectedRecord.Id, formData, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      }

      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['categorySummaries'] });
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
      await deleteRecord(endpoint, selectedRecord.Id, accessToken, { baseUrl: apiUrl, graphqlUrl: '' });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['categorySummaries'] });
      setShowModal(false);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers for column render functions
  const helpers: TableHelpers = {
    getStateCode,
    formatNumber: (value) => {
      if (value == null) return '-';
      return new Intl.NumberFormat('en-US').format(value);
    },
    formatCurrency: (value, compact = false) => {
      if (value == null) return '-';
      if (compact) {
        if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    },
    formatDate: (value) => {
      if (!value) return '-';
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  };

  // Get responsive class for column
  const getResponsiveClass = (responsive?: 'always' | 'md' | 'lg' | 'xl') => {
    switch (responsive) {
      case 'md': return 'hidden md:table-cell';
      case 'lg': return 'hidden lg:table-cell';
      case 'xl': return 'hidden xl:table-cell';
      default: return '';
    }
  };

  // Get alignment class
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  if (isLoading) return <LoadingSpinner text={loadingText} />;
  if (error) return <div className="text-red-600">Error: {(error as Error).message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateButton onClick={handleCreate} label={createButtonLabel} />
      </div>

      {!paginatedData.length ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: color }}>
                <tr className="text-white">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-4 font-semibold ${getAlignClass(col.align)} ${getResponsiveClass(col.responsive)}`}
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((record, idx) => (
                  <tr key={record.Id} className={`border-b hover:bg-slate-50 transition-colors ${idx % 2 ? 'bg-slate-25' : ''}`}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${getAlignClass(col.align)} ${getResponsiveClass(col.responsive)}`}
                      >
                        {col.render(record, helpers)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <ActionButtons
                        onView={() => handleView(record)}
                        onEdit={() => handleEdit(record)}
                        onDelete={() => handleDelete(record)}
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
        title={modalTitle}
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

// Re-export helpers for use in column definitions
export { ActionButtons, CreateButton, LoadingSpinner, EmptyState };
