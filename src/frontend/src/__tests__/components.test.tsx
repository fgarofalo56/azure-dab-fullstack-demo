/**
 * Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Pagination, usePagination } from '../components/Pagination';
import { CrudModal, CrudMode } from '../components/CrudModal';
import { renderHook, act } from '@testing-library/react';

describe('ErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders fallback when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('calls onError when error occurs', () => {
    const onError = vi.fn();
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('shows default error UI when no fallback provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('renders pagination info correctly', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        totalItems={100}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    // Use getAllByText since numbers appear multiple times (in info text and page buttons)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking next', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        totalItems={100}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when clicking previous', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        totalItems={100}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        totalItems={100}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        currentPage={10}
        totalPages={10}
        totalItems={100}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('returns null when only one page and no size selector', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={5}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});

describe('usePagination hook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.skip).toBe(0);
  });

  it('initializes with custom page size', () => {
    const { result } = renderHook(() => usePagination(50));

    expect(result.current.pageSize).toBe(50);
  });

  it('calculates skip correctly', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.handlePageChange(3);
    });

    expect(result.current.skip).toBe(20);
  });

  it('resets page when changing page size', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.handlePageChange(5);
    });

    expect(result.current.page).toBe(5);

    act(() => {
      result.current.handlePageSizeChange(25);
    });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(25);
  });

  it('reset function works correctly', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(10);
    });

    expect(result.current.page).toBe(10);

    act(() => {
      result.current.reset();
    });

    expect(result.current.page).toBe(1);
  });
});

describe('CrudModal', () => {
  const defaultFields = [
    { name: 'name', label: 'Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'text' as const },
    { name: 'active', label: 'Active', type: 'boolean' as const },
    { name: 'category', label: 'Category', type: 'select' as const, options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]},
  ];

  const defaultProps = {
    isOpen: true,
    mode: 'view' as CrudMode,
    title: 'Test Item',
    fields: defaultFields,
    data: { name: 'Test', email: 'test@test.com', active: true, category: '1' },
    onClose: vi.fn(),
    onSave: vi.fn(),
    onDelete: vi.fn(),
    isLoading: false,
  };

  it('does not render when isOpen is false', () => {
    render(<CrudModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('view Test Item')).not.toBeInTheDocument();
  });

  it('renders view mode correctly', () => {
    render(<CrudModal {...defaultProps} mode="view" />);

    expect(screen.getByText('view Test Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('renders create mode correctly', () => {
    render(<CrudModal {...defaultProps} mode="create" data={null} />);

    expect(screen.getByText('create Test Item')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders edit mode correctly', () => {
    render(<CrudModal {...defaultProps} mode="edit" />);

    expect(screen.getByText('edit Test Item')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders delete confirmation correctly', () => {
    render(<CrudModal {...defaultProps} mode="delete" />);

    expect(screen.getByText('delete Test Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this record?')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<CrudModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', () => {
    const onClose = vi.fn();
    render(<CrudModal {...defaultProps} onClose={onClose} />);

    // Find the X button by its position in the header
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(btn => btn.querySelector('svg path[d*="M6 18L18 6"]'));
    if (xButton) {
      fireEvent.click(xButton);
    }
    expect(onClose).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const onSave = vi.fn();
    render(<CrudModal {...defaultProps} mode="create" data={null} onSave={onSave} />);

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<CrudModal {...defaultProps} mode="edit" isLoading={true} />);

    // When loading, the button shows "Processing..." instead of "Save"
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    // The button should be disabled
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Processing'));
    expect(submitButton).toBeDisabled();
  });

  it('handles form input changes', () => {
    render(<CrudModal {...defaultProps} mode="edit" />);

    const nameInput = screen.getByDisplayValue('Test');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    expect(screen.getByDisplayValue('Updated Name')).toBeInTheDocument();
  });

  it('handles checkbox changes', () => {
    render(<CrudModal {...defaultProps} mode="edit" data={{ ...defaultProps.data, active: false }} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('handles select changes', () => {
    render(<CrudModal {...defaultProps} mode="edit" />);

    const select = screen.getByDisplayValue('Option 1');
    fireEvent.change(select, { target: { value: '2' } });

    expect(screen.getByDisplayValue('Option 2')).toBeInTheDocument();
  });
});
