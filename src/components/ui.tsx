import React from 'react';
import { Loader2 } from 'lucide-react';
import { Currency, formatINR } from '../lib/currency';

/* =========================================================
   Shared primitives — restyled to the "Flat Mascot Playful"
   design tokens (primary amber, secondary green, 2D bevels,
   Questrial body + JetBrains-Mono numerals).
   Props/APIs are generic; behavior is unchanged from plain
   HTML semantics so callers can migrate without logic edits.
   ========================================================= */

export type ButtonVariant = 'primary' | 'secondary' | 'blue' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  loading?: boolean;
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-on btn-bevel',
  secondary: 'bg-secondary text-white btn-bevel-green',
  blue: 'bg-ocean text-white btn-bevel-blue',
  danger: 'bg-berry text-white btn-bevel',
  ghost: 'bg-transparent text-ink-muted border-2 border-bevel-neutral hover:bg-surface-high hover:text-ink',
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={[
      'inline-flex items-center justify-center rounded-btn font-ui font-semibold transition-all cursor-pointer',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'select-none',
      buttonVariantClasses[variant],
      buttonSizeClasses[size],
      full ? 'w-full' : '',
      className,
    ].join(' ')}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

export type CardBevel = 'none' | 'neutral' | 'amber' | 'green' | 'blue' | 'berry';

const cardBevelClasses: Record<CardBevel, string> = {
  none: '',
  neutral: 'shadow-[0_4px_0_0_#d8c3ad]',
  amber: 'shadow-[0_5px_0_0_#ad3300]',
  green: 'shadow-[0_5px_0_0_#065f46]',
  blue: 'shadow-[0_5px_0_0_#006686]',
  berry: 'shadow-[0_5px_0_0_#842500]',
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bevel?: CardBevel;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  bevel = 'none',
  padded = true,
  className = '',
  children,
  ...rest
}) => (
  <div
    {...rest}
    className={[
      'bg-surface rounded-card',
      cardBevelClasses[bevel],
      padded ? 'p-5 sm:p-6' : '',
      className,
    ].join(' ')}
  >
    {children}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode | string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block font-ui font-semibold text-ink-muted mb-1.5 text-sm">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint text-lg">
            {typeof icon === 'string' ? <MaterialIcon name={icon} /> : icon}
          </span>
        )}
        <input
          id={inputId}
          {...rest}
          className={[
            'w-full py-2.5 rounded-input bg-surface border-2 border-bevel-neutral font-ui text-ink placeholder:text-ink-faint',
            'focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20',
            'transition-all',
            icon ? 'pl-10 pr-4' : 'px-4',
            error ? 'border-danger focus:border-danger focus:ring-danger/15' : '',
            className,
          ].join(' ')}
        />
      </div>
      {error && <p className="mt-1 text-xs font-ui font-medium text-danger">{error}</p>}
    </div>
  );
};

export type BadgeVariant = 'primary' | 'green' | 'blue' | 'gray' | 'danger' | 'amber';

const badgeVariantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary text-primary-on shadow-[0_2px_0_0_#ad3300]',
  amber: 'bg-primary-fixed text-primary-deep shadow-[0_2px_0_0_#f9a61f]',
  green: 'bg-secondary text-white shadow-[0_2px_0_0_#065f46]',
  blue: 'bg-ocean text-white shadow-[0_2px_0_0_#004d66]',
  gray: 'bg-surface-high text-ink-muted shadow-[0_2px_0_0_#d8c3ad]',
  danger: 'bg-danger-light text-danger-ondeep shadow-[0_2px_0_0_#ba1a1a]',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', className = '', children, ...rest }) => (
  <span
    {...rest}
    className={[
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-ui text-xs font-semibold',
      badgeVariantClasses[variant],
      className,
    ].join(' ')}
  >
    {children}
  </span>
);

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'primary' | 'green' | 'blue' | 'amber';
  className?: string;
}

const progressToneClasses = {
  primary: 'bg-primary',
  amber: 'bg-primary-dim',
  green: 'bg-secondary',
  blue: 'bg-ocean-dim',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, tone = 'primary', className = '' }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`h-2 w-full rounded-full bg-surface-highest overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${progressToneClasses[tone]} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled, className = '', title }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    title={title}
    onClick={() => onChange?.(!checked)}
    className={[
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      checked ? 'bg-primary' : 'bg-surface-highest',
      className,
    ].join(' ')}
  >
    <span
      className={[
        'inline-block h-5 w-5 transform rounded-full bg-surface shadow transition-transform',
        checked ? 'translate-x-[22px]' : 'translate-x-0.5',
      ].join(' ')}
    />
  </button>
);

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange?: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ value, onChange, className = '', ...rest }) => (
  <input
    type="range"
    {...rest}
    value={value}
    onChange={(e) => onChange?.(Number(e.target.value))}
    className={`slider-flat w-full ${className}`}
  />
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, maxWidth = 'max-w-lg', children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/55 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`w-full ${maxWidth} bg-surface rounded-card shadow-[0_8px_0_0_#d8c3ad] max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 pt-5">
        {title ? <h2 className="font-questrial text-xl font-medium text-ink">{title}</h2> : <span />}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-full text-ink-muted hover:bg-surface-high transition-colors cursor-pointer"
            >
              <MaterialIcon name="close" className="text-lg" />
            </button>
          </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export type ToastTone = 'success' | 'info' | 'error' | 'default';

interface ToastProps {
  open?: boolean;
  message: React.ReactNode;
  tone?: ToastTone;
  onClose?: () => void;
}

const toastToneClasses: Record<ToastTone, string> = {
  success: 'bg-secondary text-white',
  info: 'bg-ocean text-white',
  error: 'bg-danger text-white',
  default: 'bg-primary-fixed text-primary-deep',
};

export const Toast: React.FC<ToastProps> = ({ open = true, message, tone = 'default', onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-float">
      <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-ui font-semibold shadow-lg ${toastToneClasses[tone]}`}>
        <span>{message}</span>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Dismiss" className="ml-1 opacity-80 hover:opacity-100 cursor-pointer">
            <MaterialIcon name="close" className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
};

/* Material Symbols icon host (design icon set) */
interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ name, className = '', filled = false, style }) => (
  <span
    className={`material-symbols-outlined leading-none select-none ${className}`}
    style={{ fontVariationSettings: filled ? `'FILL' 1` : `'FILL' 0`, ...style }}
    aria-hidden="true"
  >
    {name}
  </span>
);

export { Currency, formatINR };