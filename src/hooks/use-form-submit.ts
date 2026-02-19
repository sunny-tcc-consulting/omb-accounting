"use client";

import { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

interface UseFormSubmitOptions<T extends z.ZodType<any, any, any>> {
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
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  resetAfter,
  showSuccessIndicator = true,
  showLoadingIndicator = true,
}: UseFormSubmitOptions<T>) {
  const { trigger, reset } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = useCallback(
    async (data: z.infer<T>) => {
      try {
        // Validate the data with the schema
        await trigger(data);

        // If validation passes, proceed with submission
        setIsSubmitting(true);
        setIsSuccess(false);
        setError(null);

        try {
          // Simulate or perform the actual submission
          if (onSuccess) {
            await onSuccess(data);
          }
          if (showSuccessIndicator) {
            toast.success(successMessage || "Operation successful!");
          }
          setIsSuccess(true);

          // Reset after delay if specified
          if (resetAfter) {
            setTimeout(() => {
              setIsSuccess(false);
            }, resetAfter);
          }

          return data;
        } catch (submitError) {
          const err = submitError instanceof Error ? submitError : new Error(String(submitError));
          setError(err);
          if (onError) {
            onError(err);
          }
          throw err;
        }
      } catch (validationError) {
        if (validationError instanceof Error) {
          if (onError) {
            onError(validationError);
          }
        }
        throw validationError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [trigger, onSuccess, onError, successMessage, showSuccessIndicator, resetAfter]
  );

  const resetForm = useCallback(() => {
    reset();
    setIsSuccess(false);
    setError(null);
  }, [reset]);

  return {
    isSubmitting,
    isSuccess,
    error,
    handleSubmit,
    resetForm,
    submit: handleSubmit,
  };
}

export function useFormWithValidation<T extends z.ZodType<any, any, any>>({
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  resetAfter,
}: UseFormSubmitOptions<T>) {
  const { trigger, clearErrors, reset } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateForm = useCallback(async (data: z.infer<T>): Promise<boolean> => {
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
  }, [trigger]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBlur = useCallback(async (fieldName: string) => {
    try {
      await trigger(fieldName as any);
    } catch {
      // Error will be caught by react-hook-form's formState.errors
    }
  }, [trigger]);

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
          await onSuccess(data);
        }

        // Reset after delay
        if (resetAfter) {
          setTimeout(() => {
            setIsSuccess(false);
          }, resetAfter);
        }

        return data;
      } catch (err) {
        const errObj = err instanceof Error ? err : new Error(String(err));
        setError(errObj);
        if (errorMessage) {
          toast.error(errorMessage);
        }
        if (onError) {
          onError(errObj);
        }
        console.error("Form submission error:", errObj);
        throw errObj;
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
