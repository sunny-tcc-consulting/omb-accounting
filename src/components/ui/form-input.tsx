"use client";

import React, { InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";
import { getErrorId, getHelperId, getSuccessId } from "@/lib/a11y";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showSuccess?: boolean;
  showLoading?: boolean;
  onClear?: () => void;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  icon,
  showSuccess = false,
  showLoading = false,
  onClear,
  helperText,
  className,
  ...props
}: FormInputProps) {
  const generatedId = useId();
  const inputId = props.id || `input-${generatedId}`;
  const errorId = getErrorId(inputId);
  const helperId = getHelperId(inputId);
  const successId = getSuccessId(inputId);

  const hasError = !!error;
  const isSuccess = showSuccess && !hasError;
  const describedByIds = [
    error ? errorId : null,
    helperText && !error ? helperId : null,
    isSuccess && !error ? successId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
          {props.required && <span className="sr-only">(required)</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && "pl-10",
            hasError && "border-red-500 focus-visible:ring-red-500",
            isSuccess && "border-green-500 focus-visible:ring-green-500",
            className,
          )}
          aria-invalid={hasError}
          aria-describedby={describedByIds || undefined}
          aria-required={props.required}
          {...props}
        />
        {showLoading && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            role="status"
            aria-label="Loading"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="sr-only">Loading</span>
          </div>
        )}
        {onClear && !props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear input"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-200"
          role="alert"
        >
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {isSuccess && !error && (
        <p
          id={successId}
          className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
          role="status"
        >
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Looks good!
        </p>
      )}
    </div>
  );
}

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showSuccess?: boolean;
  showLoading?: boolean;
  onClear?: () => void;
  helperText?: string;
}

export function FormTextarea({
  label,
  error,
  icon,
  showSuccess = false,
  showLoading = false,
  onClear,
  helperText,
  className,
  ...props
}: FormTextareaProps) {
  const generatedId = useId();
  const inputId = props.id || `textarea-${generatedId}`;
  const errorId = getErrorId(inputId);
  const helperId = getHelperId(inputId);
  const successId = getSuccessId(inputId);

  const hasError = !!error;
  const isSuccess = showSuccess && !hasError;
  const describedByIds = [
    error ? errorId : null,
    helperText && !error ? helperId : null,
    isSuccess && !error ? successId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
          {props.required && <span className="sr-only">(required)</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className="absolute left-3 top-3 text-gray-400"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <textarea
          id={inputId}
          className={cn(
            "flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && "pl-10",
            hasError && "border-red-500 focus-visible:ring-red-500",
            isSuccess && "border-green-500 focus-visible:ring-green-500",
            className,
          )}
          aria-invalid={hasError}
          aria-describedby={describedByIds || undefined}
          aria-required={props.required}
          {...props}
        />
        {showLoading && (
          <div
            className="absolute right-3 bottom-3"
            role="status"
            aria-label="Loading"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="sr-only">Loading</span>
          </div>
        )}
        {onClear && !props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear textarea"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-200"
          role="alert"
        >
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {isSuccess && !error && (
        <p
          id={successId}
          className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
          role="status"
        >
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Looks good!
        </p>
      )}
    </div>
  );
}
