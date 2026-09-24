import React from 'react';

/* =========================================================
   Currency formatting — every money/numeric value in the app
   renders through this pair so numerals always use
   JetBrains Mono with tabular figures (design system rules).
   ========================================================= */

export interface FormatINROptions {
  /** Sign symbols: 'auto' shows + for positive, '-' handled by caller; 'none' suppresses prefix signs */
  sign?: 'none' | 'plus';
  decimals?: number;
}

export const formatINR = (value: number, options: FormatINROptions = {}): string => {
  const { sign = 'none', decimals = 0 } = options;
  const formatted = value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  if (sign === 'plus' && value > 0) return `+₹${formatted}`;
  if (value < 0) return `-₹${Math.abs(value).toLocaleString('en-IN')}`;
  return `₹${formatted}`;
};

interface CurrencyProps {
  value: number;
  sign?: 'none' | 'plus';
  decimals?: number;
  className?: string;
  title?: string;
}

/** Renders a rupee amount in JetBrains Mono with tabular numerals. */
export const Currency: React.FC<CurrencyProps> = ({ value, sign = 'none', decimals = 0, className = '', title }) => (
  <span
    className={`font-currency tabular-nums ${className}`}
    title={title}
  >
    {formatINR(value, { sign, decimals })}
  </span>
);