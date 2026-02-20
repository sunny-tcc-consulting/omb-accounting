"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { announceError, announceSuccess, announceLoading } from "@/lib/a11y";

export interface FormStatusOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  resetAfter?: number;
}

export function useFormStatus<T = unknown>(options: FormStatusOptions<T> = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async <TData,>(
    submitFn: () => Promise<TData>,
    onSuccess?: (data: TData) => void,
  ): Promise<TData | null> => {
    setIsSubmitting(true);
    setIsSuccess(false);
    setError(null);
    announceLoading("Form is submitting");

    try {
      const data = await submitFn();
      setIsSuccess(true);
      if (options.successMessage) {
        toast.success(options.successMessage);
        announceSuccess(options.successMessage);
      }
      if (onSuccess) {
        onSuccess(data);
      }
      if (options.onSuccess) {
        options.onSuccess(data as T);
      }
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (options.errorMessage) {
        toast.error(options.errorMessage);
        announceError(options.errorMessage);
      }
      if (options.onError) {
        options.onError(error);
      }
      console.error("Form submission error:", error);
      return null;
    } finally {
      setIsSubmitting(false);
      if (options.resetAfter) {
        setTimeout(() => {
          setIsSuccess(false);
          setError(null);
        }, options.resetAfter);
      }
    }
  };

  const reset = () => {
    setIsSuccess(false);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isSubmitting,
    isSuccess,
    error,
    submit,
    reset,
    clearError,
  };
}

export function FormSuccessIndicator({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      className="animate-in fade-in slide-in-from-top-2 duration-200"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
        <svg
          className="h-5 w-5 flex-shrink-0"
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
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

export function FormErrorIndicator({
  error,
  onDismiss,
}: {
  error: Error;
  onDismiss?: () => void;
}) {
  if (!error) return null;

  return (
    <div
      className="animate-in fade-in slide-in-from-top-2 duration-200"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800">
        <svg
          className="h-5 w-5 flex-shrink-0 mt-0.5"
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
        <div className="flex-1">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 dark:hover:text-red-300"
            aria-label="Dismiss error"
          >
            <svg
              className="h-5 w-5"
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
    </div>
  );
}

export function FormLoadingIndicator({ message }: { message?: string }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-top-2 duration-200"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
          aria-hidden="true"
        />
        <span className="font-medium">{message || "Processing..."}</span>
        <span className="sr-only">Loading, please wait</span>
      </div>
    </div>
  );
}
