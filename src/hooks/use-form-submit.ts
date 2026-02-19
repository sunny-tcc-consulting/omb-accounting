"use client";

import { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useFormStatus } from "@/components/ui/form-status";

export interface UseFormSubmitOptions<T extends z.ZodType<any, any, any>> {
  schema: T;
  onSuccess?: (data: z.infer<T>) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  resetAfter?: number;
  showSuccessIndicator?: boolean;
  showLoadingIndicator?: boolean;
}

export function useFormSubmit<T extends z.ZodType<any, any, any>>({
  schema,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  resetAfter,
  showSuccessIndicator = true,
  showLoadingIndicator = true,
}: UseFormSubmitOptions<T>) {
  const { trigger, reset } = useFormContext();
  const formStatus = useFormStatus({
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    resetAfter,
  });

  const handleSubmit = useCallback(
    async (data: z.infer<T>) => {
      try {
        // Validate the data with the schema
        await trigger(data);

        // If validation passes, proceed with submission
        return await formStatus.submit(
          async () => {
            return data;
          },
          (submittedData) => {
            if (onSuccess) {
              onSuccess(submittedData);
            }
            if (showSuccessIndicator) {
              toast.success(successMessage || "Operation successful!");
            }
            return submittedData;
          }
        );
      } catch (error) {
        if (error instanceof Error) {
          if (onError) {
            onError(error);
          }
        }
        throw error;
      }
    },
    [trigger, formStatus, onSuccess, onError, successMessage, showSuccessIndicator]
  );

  const resetForm = useCallback(() => {
    reset();
    formStatus.reset();
  }, [reset, formStatus]);

  return {
    ...formStatus,
    handleSubmit,
    resetForm,
  };
}

export function useFormWithValidation<T extends z.ZodType<any, any, any>>({
  schema,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  resetAfter,
}: UseFormSubmitOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { trigger, clearErrors, reset } = useFormContext();

  const validateForm = useCallback(
    async (data: z.infer<T>) => {
      setIsValidating(true);
      try {
        await trigger(data);
        setIsValid(true);
        return true;
      } catch {
        setIsValid(false);
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [trigger]
  );

  const handleBlur = useCallback(
    async (fieldName: string) => {
      try {
        await trigger(fieldName as any);
      } catch {
        // Error will be caught by react-hook-form's formState.errors
      }
    },
    [trigger]
  );

  const handleChange = useCallback(
    async (fieldName: string) => {
      // Clear error when user starts typing
      clearErrors(fieldName);
    },
    [clearErrors]
  );

  const submitForm = useCallback(
    async (data: z.infer<T>) => {
      setIsSubmitting(true);
      setIsSuccess(false);
      setError(null);

      try {
        // Validate first
        const validationPassed = await validateForm(data);

        if (!validationPassed) {
          throw new Error("Please fix the validation errors");
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsSuccess(true);
        if (successMessage) {
          toast.success(successMessage);
        }
        if (onSuccess) {
          onSuccess(data);
        }

        // Reset after delay
        if (resetAfter) {
          setTimeout(() => {
            setIsSuccess(false);
          }, resetAfter);
        }

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (errorMessage) {
          toast.error(errorMessage);
        }
        if (onError) {
          onError(error);
        }
        console.error("Form submission error:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, successMessage, errorMessage, onSuccess, onError, resetAfter]
  );

  const resetForm = useCallback(() => {
    reset();
    setIsSuccess(false);
    setError(null);
  }, [reset]);

  return {
    isSubmitting,
    isValidating,
    isValid,
    isSuccess,
    error,
    validateForm,
    handleBlur,
    handleChange,
    submitForm,
    resetForm,
  };
}
