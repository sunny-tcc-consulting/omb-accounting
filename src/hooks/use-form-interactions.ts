"use client";

import { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export interface UseFormInteractionsOptions<T extends z.ZodType<any, any, any>> {
  schema: T;
  autoValidate?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export function useFormInteractions<T extends z.ZodType<any, any, any>>({
  schema,
  autoValidate = false,
  validateOnBlur = true,
  validateOnChange = false,
}: UseFormInteractionsOptions<T>) {
  const {
    trigger,
    clearErrors,
    getValues,
    setValue,
  } = useFormContext();

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [isValidatedFields, setIsValidatedFields] = useState<Record<string, boolean>>({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = useCallback(async (fieldName: string): Promise<boolean> => {
    setIsValidating((prev) => ({ ...prev, [fieldName]: true }));
    try {
      await trigger(fieldName as any);
      setIsValidatedFields((prev) => ({ ...prev, [fieldName]: true }));
      return true;
    } catch {
      setIsValidatedFields((prev) => ({ ...prev, [fieldName]: false }));
      return false;
    } finally {
      setIsValidating((prev) => ({ ...prev, [fieldName]: false }));
    }
  }, [trigger]);

  const validateAll = useCallback(async (): Promise<boolean> => {
    try {
      await trigger();
      setIsValidatedFields((prev) => {
        const allFields = Object.keys(getValues());
        return allFields.reduce(
          (acc, field) => ({ ...acc, [field]: true }),
          {} as Record<string, boolean>
        );
      });
      return true;
    } catch {
      return false;
    }
  }, [trigger, getValues]);

  const handleBlur = useCallback(
    async (fieldName: string): Promise<boolean> => {
      setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

      if (autoValidate || validateOnBlur) {
        return await validateField(fieldName);
      }

      clearErrors(fieldName);
      return true;
    },
    [autoValidate, validateOnBlur, validateField, clearErrors]
  );

  const handleChange = useCallback(
    async (fieldName: string): Promise<boolean> => {
      if (validateOnChange) {
        return await validateField(fieldName);
      }

      // Clear error when user starts typing
      clearErrors(fieldName);
      return true;
    },
    [validateOnChange, validateField, clearErrors]
  );

  const clearField = useCallback((fieldName: string) => {
    setValue(fieldName, "");
    clearErrors(fieldName);
    setTouchedFields((prev) => ({ ...prev, [fieldName]: false }));
    setIsValidatedFields((prev) => ({ ...prev, [fieldName]: false }));
  }, [setValue, clearErrors]);

  const resetFormWithDefaults = useCallback(() => {
    // Reset to default values from schema
    const defaultValues = schema.safeParse({}).data;
    if (defaultValues) {
      Object.keys(defaultValues).forEach((key) => {
        setValue(key as any, defaultValues[key as any]);
      });
    }
    clearErrors();
    setTouchedFields({});
    setIsValidatedFields({});
  }, [schema, setValue, clearErrors]);

  const getValidationStatus = useCallback(
    (fieldName: string) => {
      if (!touchedFields[fieldName]) return "untouched";
      if (isValidating[fieldName]) return "validating";
      return isValidatedFields[fieldName] ? "valid" : "invalid";
    },
    [touchedFields, isValidating, isValidatedFields]
  );

  return {
    touchedFields,
    isValidating,
    isValidatedFields,
    getValidationStatus,
    handleBlur,
    handleChange,
    validateField,
    validateAll,
    clearField,
    resetFormWithDefaults,
  };
}

export function useFieldValidation<T extends z.ZodType<any, any, any>>(
  schema: T,
  fieldName: string
) {
  const { trigger, clearErrors } = useFormContext();
  const [isTouched, setIsTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    try {
      await trigger(fieldName as any);
      setIsValid(true);
      return true;
    } catch {
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
      setIsTouched(true);
    }
  }, [trigger, fieldName]);

  const handleBlur = useCallback(async () => {
    setIsTouched(true);
    return await validate();
  }, [validate]);

  const handleChange = useCallback(() => {
    clearErrors(fieldName);
    setIsValid(false);
  }, [clearErrors, fieldName]);

  const clear = useCallback(() => {
    clearErrors(fieldName);
    setIsTouched(false);
    setIsValid(false);
  }, [clearErrors, fieldName]);

  return {
    isTouched,
    isValidating,
    isValid,
    validate,
    handleBlur,
    handleChange,
    clear,
  };
}
