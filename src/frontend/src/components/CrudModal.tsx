/**
 * CRUD Modal Component
 * Modal dialog for Create, Read, Update, Delete operations
 *
 * Accessibility features:
 * - role="dialog" with aria-modal="true"
 * - aria-labelledby for dialog title
 * - Focus trap within modal
 * - Escape key to close
 * - Auto-focus on first input
 * - Return focus on close
 * - aria-live for loading states
 */

import React, { useState, useEffect, useRef, useCallback, useId } from 'react';

export type CrudMode = 'create' | 'view' | 'edit' | 'delete';

// Validation rule types
interface ValidationRules {
  min?: number;            // Minimum value for numbers, minimum length for strings
  max?: number;            // Maximum value for numbers, maximum length for strings
  minLength?: number;      // Minimum string length
  maxLength?: number;      // Maximum string length
  pattern?: RegExp;        // Regex pattern to match
  patternMessage?: string; // Custom message for pattern validation
  minDate?: string;        // Minimum date (ISO string)
  maxDate?: string;        // Maximum date (ISO string)
  custom?: (value: unknown, formData: Record<string, unknown>) => string | null; // Custom validation function
}

export interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
  required?: boolean;
  readOnly?: boolean;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  validation?: ValidationRules; // Field-level validation rules
}

interface CrudModalProps<T> {
  isOpen: boolean;
  mode: CrudMode;
  title: string;
  fields: Field[];
  data: T | null;
  onClose: () => void;
  onSave: (data: Partial<T>) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

export function CrudModal<T extends object>({
  isOpen,
  mode,
  title,
  fields,
  data,
  onClose,
  onSave,
  onDelete,
  isLoading = false,
}: CrudModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Accessibility refs and IDs
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Return focus when modal closes
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Focus trap: keep focus within modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !modalRef.current) return;

      // Handle Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Handle Tab for focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [isOpen, onClose]
  );

  // Add/remove keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        const firstInput = modalRef.current?.querySelector<HTMLElement>(
          'input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        if (firstInput) {
          firstInput.focus();
          firstFocusableRef.current = firstInput;
        } else {
          // Fallback to close button if no inputs
          const closeButton = modalRef.current?.querySelector<HTMLElement>('button');
          closeButton?.focus();
        }
      });
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (data && (mode === 'edit' || mode === 'view')) {
      setFormData(data as Record<string, unknown>);
    } else if (mode === 'create') {
      setFormData({});
    }
    setErrors({});
  }, [data, mode, isOpen]);

  if (!isOpen) return null;

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name];
      const rules = field.validation;

      // Required validation
      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return; // Skip other validations if required fails
      }

      // Skip further validation if value is empty and not required
      if (value === undefined || value === null || value === '') {
        return;
      }

      // Type-specific validation
      if (field.type === 'number') {
        const numValue = typeof value === 'number' ? value : Number(value);

        if (isNaN(numValue)) {
          newErrors[field.name] = `${field.label} must be a valid number`;
          return;
        }

        // Min/max value for numbers
        if (rules?.min !== undefined && numValue < rules.min) {
          newErrors[field.name] = `${field.label} must be at least ${rules.min}`;
          return;
        }
        if (rules?.max !== undefined && numValue > rules.max) {
          newErrors[field.name] = `${field.label} must be at most ${rules.max}`;
          return;
        }
      }

      if (field.type === 'text' || field.type === 'textarea') {
        const strValue = String(value);

        // String length validation
        if (rules?.minLength !== undefined && strValue.length < rules.minLength) {
          newErrors[field.name] = `${field.label} must be at least ${rules.minLength} characters`;
          return;
        }
        if (rules?.maxLength !== undefined && strValue.length > rules.maxLength) {
          newErrors[field.name] = `${field.label} must be at most ${rules.maxLength} characters`;
          return;
        }

        // Legacy min/max for string length
        if (rules?.min !== undefined && strValue.length < rules.min) {
          newErrors[field.name] = `${field.label} must be at least ${rules.min} characters`;
          return;
        }
        if (rules?.max !== undefined && strValue.length > rules.max) {
          newErrors[field.name] = `${field.label} must be at most ${rules.max} characters`;
          return;
        }

        // Pattern validation
        if (rules?.pattern && !rules.pattern.test(strValue)) {
          newErrors[field.name] = rules.patternMessage || `${field.label} has an invalid format`;
          return;
        }
      }

      if (field.type === 'date') {
        const dateValue = new Date(String(value));

        if (isNaN(dateValue.getTime())) {
          newErrors[field.name] = `${field.label} must be a valid date`;
          return;
        }

        // Date range validation
        if (rules?.minDate) {
          const minDate = new Date(rules.minDate);
          if (dateValue < minDate) {
            newErrors[field.name] = `${field.label} must be on or after ${minDate.toLocaleDateString()}`;
            return;
          }
        }
        if (rules?.maxDate) {
          const maxDate = new Date(rules.maxDate);
          if (dateValue > maxDate) {
            newErrors[field.name] = `${field.label} must be on or before ${maxDate.toLocaleDateString()}`;
            return;
          }
        }
      }

      // Custom validation (runs last, can access all form data)
      if (rules?.custom) {
        const customError = rules.custom(value, formData);
        if (customError) {
          newErrors[field.name] = customError;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'delete') {
      if (onDelete) {
        await onDelete();
      }
      return;
    }

    if (validate()) {
      await onSave(formData as Partial<T>);
    }
  };

  const isReadOnly = mode === 'view' || mode === 'delete';

  const getModeColors = () => {
    switch (mode) {
      case 'create':
        return 'from-emerald-600 to-emerald-500';
      case 'edit':
        return 'from-blue-600 to-blue-500';
      case 'delete':
        return 'from-red-600 to-red-500';
      default:
        return 'from-slate-600 to-slate-500';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'create':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        );
      case 'edit':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        );
      case 'delete':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="presentation"
      onClick={(e) => {
        // Close when clicking backdrop (outside modal)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 bg-gradient-to-r ${getModeColors()} rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center" aria-hidden="true">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getModeIcon()}
              </svg>
            </div>
            <h2 id={titleId} className="text-xl font-bold text-white capitalize">
              {mode} {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {mode === 'delete' ? (
            <div className="text-center py-8" role="alert" aria-live="assertive">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Are you sure you want to delete this record?
              </h3>
              <p className="text-slate-600">
                This action cannot be undone. The record will be permanently removed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      value={(formData[field.name] as string) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      disabled={isReadOnly || field.readOnly}
                      placeholder={field.placeholder}
                      rows={3}
                      aria-invalid={!!errors[field.name]}
                      aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                      aria-required={field.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[field.name] ? 'border-red-500' : 'border-slate-300'
                      } ${isReadOnly || field.readOnly ? 'bg-slate-100' : ''}`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      value={(formData[field.name] as string) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      disabled={isReadOnly || field.readOnly}
                      aria-invalid={!!errors[field.name]}
                      aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                      aria-required={field.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[field.name] ? 'border-red-500' : 'border-slate-300'
                      } ${isReadOnly || field.readOnly ? 'bg-slate-100' : ''}`}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'boolean' ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={field.name}
                        checked={(formData[field.name] as boolean) || false}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        disabled={isReadOnly || field.readOnly}
                        aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">Yes</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      value={(formData[field.name] as string | number) || ''}
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          field.type === 'number' ? Number(e.target.value) : e.target.value
                        )
                      }
                      disabled={isReadOnly || field.readOnly}
                      placeholder={field.placeholder}
                      aria-invalid={!!errors[field.name]}
                      aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                      aria-required={field.required}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[field.name] ? 'border-red-500' : 'border-slate-300'
                      } ${isReadOnly || field.readOnly ? 'bg-slate-100' : ''}`}
                    />
                  )}

                  {errors[field.name] && (
                    <p id={`${field.name}-error`} className="mt-1 text-sm text-red-500" role="alert">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {mode === 'view' ? 'Close' : 'Cancel'}
          </button>

          {mode !== 'view' && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              aria-busy={isLoading}
              className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                mode === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {isLoading && (
                <div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
              <span aria-live="polite">
                {isLoading
                  ? 'Processing...'
                  : mode === 'delete'
                    ? 'Delete'
                    : mode === 'create'
                      ? 'Create'
                      : 'Save'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrudModal;
