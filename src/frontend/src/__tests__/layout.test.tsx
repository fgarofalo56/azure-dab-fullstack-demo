/**
 * Layout Components Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  DOTLogo,
  LoadingSpinner,
  EmptyState,
  Badge,
  PageHeader,
  Card,
  AppFooter,
} from '../components/layout';

describe('DOTLogo', () => {
  it('renders DOT text', () => {
    render(<DOTLogo />);
    expect(screen.getByText('DOT')).toBeInTheDocument();
  });

  it('renders department name', () => {
    render(<DOTLogo />);
    expect(screen.getByText('U.S. Department of Transportation')).toBeInTheDocument();
  });

  it('renders portal subtitle', () => {
    render(<DOTLogo />);
    expect(screen.getByText('Transportation Data Portal')).toBeInTheDocument();
  });
});

describe('LoadingSpinner', () => {
  it('renders spinner without text', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders spinner with text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    expect(container.querySelector('.h-5.w-5')).toBeInTheDocument();
  });

  it('applies medium size class', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    expect(container.querySelector('.h-8.w-8')).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.querySelector('.h-12.w-12')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders default icon when none provided', () => {
    const { container } = render(<EmptyState message="No data" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(
      <EmptyState
        message="No data"
        icon={<div data-testid="custom-icon">Custom Icon</div>}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-slate-100', 'text-slate-700');
  });

  it('applies success variant classes', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toHaveClass('bg-emerald-100', 'text-emerald-800');
  });

  it('applies warning variant classes', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toHaveClass('bg-amber-100', 'text-amber-800');
  });

  it('applies danger variant classes', () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText('Danger');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('applies info variant classes', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });
});

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Title" subtitle="Test subtitle" />);
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Title" />);
    const subtitle = screen.queryByText('Test subtitle');
    expect(subtitle).not.toBeInTheDocument();
  });

  it('applies color to title when provided', () => {
    render(<PageHeader title="Colored Title" color="#FF0000" />);
    const title = screen.getByText('Colored Title');
    expect(title).toHaveStyle({ color: '#FF0000' });
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('is not interactive without onClick', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).not.toHaveAttribute('role');
    expect(container.firstChild).not.toHaveAttribute('tabIndex');
  });

  it('is interactive with onClick', () => {
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick}>Content</Card>);
    expect(container.firstChild).toHaveAttribute('role', 'button');
    expect(container.firstChild).toHaveAttribute('tabIndex', '0');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Clickable Content</Card>);
    fireEvent.click(screen.getByText('Clickable Content'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('AppFooter', () => {
  it('renders about section', () => {
    render(<AppFooter />);
    expect(screen.getByText('About This Demo')).toBeInTheDocument();
  });

  it('renders data sources section', () => {
    render(<AppFooter />);
    expect(screen.getByText('Data Sources')).toBeInTheDocument();
    expect(screen.getByText('FRA Safety Data (Railroads)')).toBeInTheDocument();
    expect(screen.getByText('National Bridge Inventory')).toBeInTheDocument();
  });

  it('renders technologies section', () => {
    render(<AppFooter />);
    expect(screen.getByText('Technologies')).toBeInTheDocument();
    expect(screen.getByText('Azure Data API Builder')).toBeInTheDocument();
    expect(screen.getByText('React + TypeScript')).toBeInTheDocument();
  });

  it('renders disclaimer text', () => {
    render(<AppFooter />);
    expect(screen.getByText(/Not an official DOT application/)).toBeInTheDocument();
  });
});
