"use client";

import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

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
  const hasError = !!error;
  const isSuccess = showSuccess && !hasError;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && "pl-10",
            hasError && "border-red-500 focus-visible:ring-red-500",
            isSuccess && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          {...props}
        />
        {showLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        )}
        {onClear && !props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {isSuccess && !error && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
  const hasError = !!error;
  const isSuccess = showSuccess && !hasError;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            {icon}
          </div>
        )}
        <textarea
          className={cn(
            "flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && "pl-10",
            hasError && "border-red-500 focus-visible:ring-red-500",
            isSuccess && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          {...props}
        />
        {showLoading && (
          <div className="absolute right-3 bottom-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        )}
        {onClear && !props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {isSuccess && !error && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
