"use client";

import React, { forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { FormInput, FormTextarea } from "./form-input";
import { FormSuccessIndicator } from "./form-status";
import { FormErrorIndicator } from "./form-status";
import { FormLoadingIndicator } from "./form-status";
import { FormResetButton } from "./form-reset";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface AdvancedFormProps<T extends z.ZodType<any, any, any>, V extends z.infer<T>>
  extends React.HTMLAttributes<HTMLFormElement> {
  schema: T;
  onSubmit: (data: V) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  showReset?: boolean;
  showSuccessIndicator?: boolean;
  showLoadingIndicator?: boolean;
  successMessage?: string;
  errorMessage?: string;
  resetAfter?: number;
  children: React.ReactNode;
}

export const AdvancedForm = forwardRef<HTMLFormElement, AdvancedFormProps<z.ZodType<any, any, any>, z.infer<z.ZodType<any, any, any>>>>(
  (
    {
      schema,
      onSubmit,
      submitLabel = "Submit",
      cancelLabel = "Cancel",
      showReset = false,
      showSuccessIndicator = true,
      showLoadingIndicator = true,
      successMessage = "Form submitted successfully!",
      errorMessage = "An error occurred. Please try again.",
      resetAfter,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const context = useFormContext();
    const { reset, formState } = context || { reset: () => {}, formState: { isSubmitting: false } };
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setIsSuccess(false);
      setError(null);

      try {
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as Record<string, unknown>;

        // Validate with schema
        const validatedData = schema.parse(data);

        await onSubmit(validatedData);
        setIsSuccess(true);

        if (resetAfter) {
          setTimeout(() => {
            setIsSuccess(false);
            reset?.();
          }, resetAfter);
        }
      } catch (err) {
        const errObj = err instanceof Error ? err : new Error(String(err));
        setError(errObj);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCancel = () => {
      reset?.();
      setIsSuccess(false);
      setError(null);
    };

    const handleReset = () => {
      reset?.();
      setIsSuccess(false);
      setError(null);
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn("space-y-6", className)}
        {...props}
      >
        {children}

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          {showReset && (
            <FormResetButton onClick={handleReset} variant="outline" size="sm" />
          )}

          <Button
            type="submit"
            disabled={isSubmitting || formState.isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </span>
            ) : (
              submitLabel
            )}
          </Button>

          {!isSubmitting && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={formState.isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
        </div>

        {showLoadingIndicator && isSubmitting && (
          <FormLoadingIndicator message="Processing your request..." />
        )}

        {showSuccessIndicator && isSuccess && (
          <FormSuccessIndicator message={successMessage} />
        )}

        {error && <FormErrorIndicator error={error} />}
      </form>
    );
  }
);

AdvancedForm.displayName = "AdvancedForm";

// Export individual form field components with better defaults
export const FormFieldWrapper = ({
  label,
  helperText,
  error,
  ...props
}: React.ComponentProps<typeof FormInput> & {
  label?: string;
  helperText?: string;
  error?: string;
}) => {
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
      <FormInput {...props} />
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
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
    </div>
  );
};

export const FormTextareaWrapper = ({
  label,
  helperText,
  error,
  ...props
}: React.ComponentProps<typeof FormTextarea> & {
  label?: string;
  helperText?: string;
  error?: string;
}) => {
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
      <FormTextarea {...props} />
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
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
    </div>
  );
};
