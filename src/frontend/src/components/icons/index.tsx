/**
 * Icon Components
 * SVG icon components for the DOT Transportation Data Portal
 */

import React from 'react';

export const TrainIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 18l4 4 4-4M12 2v16" />
    <rect x="6" y="3" width="12" height="11" rx="2" strokeWidth={1.5} />
    <circle cx="8" cy="17" r="1" fill="currentColor" />
    <circle cx="16" cy="17" r="1" fill="currentColor" />
  </svg>
);

export const BridgeIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21v-6a2 2 0 012-2h10a2 2 0 012 2v6M9 13V8M15 13V8M3 8h18M6 8c0-2.5 2.5-5 6-5s6 2.5 6 5" />
  </svg>
);

export const BusIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeWidth={1.5} d="M3 10h18M7 18v2M17 18v2M7 14h2M15 14h2" />
  </svg>
);

export const CarIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 17h14M6 17l1-5h10l1 5M7 12l1-4h8l1 4" />
    <circle cx="7.5" cy="17" r="1.5" strokeWidth={1.5} />
    <circle cx="16.5" cy="17" r="1.5" strokeWidth={1.5} />
  </svg>
);

export const GraphQLIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export const CodeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export const ChevronRightIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export const ChevronLeftIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export const CheckIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
  </svg>
);

export const MicrosoftIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.5 3v8.5H3V3h8.5zm0 18H3v-8.5h8.5V21zm1-18H21v8.5h-8.5V3zm8.5 9.5V21h-8.5v-8.5H21z" />
  </svg>
);

export const InboxIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

/**
 * Get icon component by name
 */
export const getIcon = (iconName: string, className?: string): React.ReactElement => {
  switch (iconName) {
    case 'train': return <TrainIcon className={className} />;
    case 'bridge': return <BridgeIcon className={className} />;
    case 'bus': return <BusIcon className={className} />;
    case 'car': return <CarIcon className={className} />;
    case 'graphql': return <GraphQLIcon className={className} />;
    case 'code': return <CodeIcon className={className} />;
    default: return <TrainIcon className={className} />;
  }
};
