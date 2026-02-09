/**
 * Layout Components
 * Shared layout and UI components for the DOT Transportation Data Portal
 */

import React from 'react';
import { CheckIcon, InboxIcon } from '../icons';

/**
 * DOT Logo Component
 * Official-style DOT logo with verification badge
 */
export function DOTLogo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-red-600">
          <span className="text-blue-900 font-black text-lg tracking-tight">DOT</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
          <CheckIcon className="w-3 h-3 text-white" />
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold text-white leading-tight">
          U.S. Department of Transportation
        </h1>
        <p className="text-blue-100 text-sm">Transportation Data Portal</p>
      </div>
    </div>
  );
}

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({
  size = 'md',
  text
}: {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-blue-200 border-t-blue-600 ${sizeClasses[size]}`}
      />
      {text && <p className="mt-4 text-slate-600">{text}</p>}
    </div>
  );
}

/**
 * Empty State Component
 * Displayed when no data is available
 */
export function EmptyState({
  message,
  icon
}: {
  message: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || <InboxIcon className="w-8 h-8 text-slate-500" />}
      </div>
      <p className="text-slate-700">{message}</p>
    </div>
  );
}

/**
 * Badge Component
 * Status badges with variant styling
 */
export function Badge({
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

/**
 * Page Header Component
 */
export function PageHeader({
  title,
  subtitle,
  color,
}: {
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="mb-8">
      <h2
        className="text-3xl font-bold mb-2"
        style={color ? { color } : undefined}
      >
        {title}
      </h2>
      {subtitle && <p className="text-slate-600">{subtitle}</p>}
    </div>
  );
}

/**
 * Card Component
 * General-purpose card container
 */
export function Card({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const baseClasses = 'bg-white rounded-2xl shadow-lg overflow-hidden';
  const interactiveClasses = onClick
    ? 'hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-slate-100'
    : '';

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

/**
 * App Footer Component
 */
export function AppFooter() {
  return (
    <footer className="bg-slate-800 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold text-white mb-3">About This Demo</h4>
            <p className="text-sm">
              This portal demonstrates Azure Data API Builder capabilities using realistic
              transportation data patterns.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Data Sources</h4>
            <ul className="text-sm space-y-1">
              <li>FRA Safety Data (Railroads)</li>
              <li>National Bridge Inventory</li>
              <li>National Transit Database</li>
              <li>NHTSA FARS (Vehicle Fatalities)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Technologies</h4>
            <ul className="text-sm space-y-1">
              <li>Azure Data API Builder</li>
              <li>Azure SQL Database</li>
              <li>React + TypeScript</li>
              <li>Microsoft Entra ID</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-700 text-center text-sm">
          <p>Azure Data API Builder Demo | Not an official DOT application</p>
        </div>
      </div>
    </footer>
  );
}
