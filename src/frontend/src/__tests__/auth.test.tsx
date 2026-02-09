/**
 * Auth Components Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from '../components/auth';

describe('LoginPage', () => {
  it('renders DOT logo', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText('DOT')).toBeInTheDocument();
  });

  it('renders department name', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText('U.S. Department of Transportation')).toBeInTheDocument();
  });

  it('renders portal subtitle', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText('Transportation Data Portal')).toBeInTheDocument();
  });

  it('renders category cards', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText('Railroads')).toBeInTheDocument();
    expect(screen.getByText('Bridges')).toBeInTheDocument();
    expect(screen.getByText('Transit')).toBeInTheDocument();
    expect(screen.getByText('Automobiles')).toBeInTheDocument();
  });

  it('renders data source labels', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText('FRA Safety Data')).toBeInTheDocument();
    expect(screen.getByText('National Inventory')).toBeInTheDocument();
    expect(screen.getByText('NTD Metrics')).toBeInTheDocument();
    expect(screen.getByText('FARS Data')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText('Sign in with Microsoft')).toBeInTheDocument();
  });

  it('calls onLogin when sign in button is clicked', () => {
    const onLogin = vi.fn();
    render(<LoginPage onLogin={onLogin} />);

    fireEvent.click(screen.getByText('Sign in with Microsoft'));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('renders authorization notice', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText(/Authorized personnel only/)).toBeInTheDocument();
  });

  it('renders footer with demo disclaimer', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(screen.getByText(/Azure Data API Builder Demo/)).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<LoginPage onLogin={vi.fn()} />);
    expect(
      screen.getByText(/Access comprehensive transportation data/i)
    ).toBeInTheDocument();
  });
});
