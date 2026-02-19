"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    trigger,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const handleBlur = (fieldName: keyof CustomerFormData) => {
    clearErrors(fieldName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trigger({ [fieldName]: true } as any);
  };

  const onSubmitHandler = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      const newCustomer: Customer = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
      };

      await addCustomer(newCustomer);
      onSubmit(newCustomer);
      toast.success("Customer created successfully!");
    } catch (error) {
      toast.error("Failed to create customer, please try again");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              placeholder="Enter name or company name"
              {...register("name")}
              className={`pl-10 ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
              onBlur={() => handleBlur("name")}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="font-bold">{errors.name.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              {...register("email")}
              className={`pl-10 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
              onBlur={() => handleBlur("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="font-bold">{errors.email.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              placeholder="13800138000"
              {...register("phone")}
              className={`pl-10 ${errors.phone ? "border-red-500 focus:ring-red-500" : ""}`}
              onBlur={() => handleBlur("phone")}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="font-bold">{errors.phone.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="company"
              placeholder="Enter company name"
              {...register("company")}
              className={`pl-10 ${errors.company ? "border-red-500 focus:ring-red-500" : ""}`}
              onBlur={() => handleBlur("company")}
            />
          </div>
          {errors.company && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="font-bold">{errors.company.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Textarea
              id="address"
              placeholder="Enter address"
              {...register("address")}
              className={`min-h-[100px] pl-10 ${errors.address ? "border-red-500 focus:ring-red-500" : ""}`}
              onBlur={() => handleBlur("address")}
            />
          </div>
          {errors.address && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="font-bold">{errors.address.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="taxId"
              placeholder="Enter tax ID"
              {...register("taxId")}
              className={`pl-10 ${errors.taxId ? "border-red-500 focus:ring-red-500" : ""}`}
              onBlur={() => handleBlur("taxId")}
            />
          </div>
          {errors.taxId && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="font-bold">{errors.taxId.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Enter notes"
            {...register("notes")}
            className="min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Customer"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
