"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { FormSuccessIndicator } from "@/components/ui/form-status";
import { FormErrorIndicator } from "@/components/ui/form-status";
import { FormResetButton } from "@/components/ui/form-reset";
import { FormFieldWrapper } from "@/components/ui/advanced-form";
import { toast } from "sonner";
import { User, Mail, Phone, Building, MapPin, FileText } from "lucide-react";
import { Customer } from "@/types";

const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (customer: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({ onSubmit, onCancel }: CustomerFormProps) {
  const { addCustomer } = useCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const handleBlur = async (fieldName: keyof CustomerFormData) => {
    clearErrors(fieldName);
    try {
      await trigger(fieldName as unknown as never);
    } catch {
      // Validation error will be shown by react-hook-form
    }
  };

  const onSubmitHandler = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newCustomer: Customer = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
      };

      await addCustomer(newCustomer);
      onSubmit(newCustomer);
      toast.success("Customer created successfully!");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create customer");
      setError(error);
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Form reset will be handled by the form component
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <FormSuccessIndicator message="Customer created successfully!" />

      <div className="grid gap-6 md:grid-cols-2">
        <FormFieldWrapper
          label="Name"
          required
          error={errors.name?.message}
          icon={<User className="h-4 w-4" />}
          placeholder="Enter name or company name"
          {...register("name")}
          onBlur={() => handleBlur("name")}
        />

        <FormFieldWrapper
          label="Email"
          required
          error={errors.email?.message}
          icon={<Mail className="h-4 w-4" />}
          type="email"
          placeholder="customer@example.com"
          {...register("email")}
          onBlur={() => handleBlur("email")}
        />

        <FormFieldWrapper
          label="Phone"
          error={errors.phone?.message}
          icon={<Phone className="h-4 w-4" />}
          placeholder="13800138000"
          {...register("phone")}
          onBlur={() => handleBlur("phone")}
        />

        <FormFieldWrapper
          label="Company Name"
          error={errors.company?.message}
          icon={<Building className="h-4 w-4" />}
          placeholder="Enter company name"
          {...register("company")}
          onBlur={() => handleBlur("company")}
        />

        <div className="md:col-span-2">
          <FormFieldWrapper
            label="Address"
            error={errors.address?.message}
            icon={<MapPin className="h-4 w-4" />}
            placeholder="Enter address"
            {...register("address")}
            onBlur={() => handleBlur("address")}
          />
        </div>

        <FormFieldWrapper
          label="Tax ID"
          error={errors.taxId?.message}
          icon={<FileText className="h-4 w-4" />}
          placeholder="Enter tax ID"
          {...register("taxId")}
          onBlur={() => handleBlur("taxId")}
        />

        <div className="md:col-span-2">
          <FormTextarea
            label="Notes"
            placeholder="Enter notes"
            {...register("notes")}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <FormResetButton onClick={handleReset} variant="outline" size="sm" />
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </span>
          ) : (
            "Create Customer"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>

      <FormErrorIndicator error={error || new Error("Unknown error")} />
    </form>
  );
}
