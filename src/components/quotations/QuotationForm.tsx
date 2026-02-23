"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Quotation, QuotationItem } from "@/types";
import { useQuotations } from "@/contexts/QuotationContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Plus, Trash2 } from "lucide-react";

const quotationSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  items: z
    .array(
      z.object({
        description: z
          .string()
          .min(1, "Please enter description")
          .max(200, "Description cannot exceed 200 characters"),
        quantity: z
          .number()
          .min(1, "Quantity must be greater than 0")
          .default(1),
        unitPrice: z
          .number()
          .min(0.01, "Unit price must be greater than 0")
          .default(0),
        taxRate: z.number().optional(),
        discount: z.number().min(0).default(0),
      }),
    )
    .min(1, "At least one item is required"),
  validityPeriod: z.date(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuotationFormProps {
  onSubmit: (quotation: Quotation) => void;
  onCancel: () => void;
}

export function QuotationForm({ onSubmit, onCancel }: QuotationFormProps) {
  const { addQuotation, generateQuotationNumber } = useQuotations();
  const { getFilteredCustomers } = useCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: undefined,
      discount: 0,
      total: 0,
    },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm<QuotationFormData>(
    {
      resolver: zodResolver(quotationSchema),
      defaultValues: {
        items: [
          {
            id: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: 0,
            discount: 0,
          },
        ],
      },
    } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
  );

  const customerId = watch("customerId");

  const handleBlur = (fieldName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearErrors(fieldName as unknown as any);
  };

  const onSubmitHandler = async (data: QuotationFormData) => {
    setIsSubmitting(true);
    try {
      const customers = getFilteredCustomers();
      const customer = customers.find((c) => c.id === data.customerId);

      if (!customer) {
        toast.error("Customer does not exist");
        return;
      }

      // Calculate totals
      const subtotal = items.reduce((sum, item) => {
        const total =
          item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
        return sum + total;
      }, 0);

      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      const newQuotation: Quotation = {
        id: crypto.randomUUID(),
        quotationNumber: generateQuotationNumber(),
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items,
        currency: "CNY",
        subtotal,
        tax,
        total,
        validityPeriod: data.validityPeriod,
        status: "draft",
        issuedDate: new Date(),
        termsAndConditions:
          data.termsAndConditions ||
          "Payment due within 30 days. All prices are in CNY.",
      };

      await addQuotation(newQuotation);
      onSubmit(newQuotation);
      toast.success("Quotation created successfully!");
    } catch (error) {
      toast.error("Failed to create quotation, please try again");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: undefined,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: QuotationItem) => {
    return item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0,
    );
    const tax = subtotal * 0.1;
    return subtotal + tax;
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      {/* Customer Selection */}
      <div className="space-y-2">
        <Label htmlFor="customerId">
          Customer <span className="text-red-500">*</span>
        </Label>
        <Select
          value={customerId || ""}
          onValueChange={(value) => {
            setValue("customerId", value, { shouldValidate: true });
          }}
        >
          <SelectTrigger
            onBlur={() => handleBlur("customerId")}
            className={
              errors.customerId ? "border-red-500 focus:ring-red-500" : ""
            }
          >
            <SelectValue placeholder="Please select a customer" />
          </SelectTrigger>
          <SelectContent>
            {getFilteredCustomers().map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
                {customer.company && ` - ${customer.company}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span className="font-bold">{errors.customerId.message}</span>
          </p>
        )}
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor={`description-${index}`}>
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`description-${index}`}
                    placeholder="Enter item description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    onBlur={() => handleBlur(`items.${index}.description`)}
                    className={
                      errors.items && errors.items[index]?.description
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {errors.items && errors.items[index]?.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="font-bold">
                        {errors.items[index].description.message}
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onBlur={() => handleBlur(`items.${index}.quantity`)}
                      className={
                        errors.items && errors.items[index]?.quantity
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onBlur={() => handleBlur(`items.${index}.unitPrice`)}
                      className={
                        errors.items && errors.items[index]?.unitPrice
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`discount-${index}`}>Discount (%)</Label>
                    <Input
                      id={`discount-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "discount",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onBlur={() => handleBlur(`items.${index}.discount`)}
                      className={
                        errors.items && errors.items[index]?.discount
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <div className="text-right">
                  <Label>Subtotal</Label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(calculateItemTotal(item))}
                  </div>
                </div>

                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>
            {formatCurrency(calculateTotal() - calculateTotal() * 0.1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax (10%):</span>
          <span>{formatCurrency(calculateTotal() * 0.1)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span className="text-green-600">
            {formatCurrency(calculateTotal())}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validityPeriod">
            Validity Period <span className="text-red-500">*</span>
          </Label>
          <Input
            id="validityPeriod"
            type="date"
            {...register("validityPeriod", { valueAsDate: true })}
            onBlur={() => handleBlur("validityPeriod")}
            className={
              errors.validityPeriod ? "border-red-500 focus:ring-red-500" : ""
            }
          />
          {errors.validityPeriod && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="font-bold">{errors.validityPeriod.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Quotation Number</Label>
          <div className="flex items-center gap-2 p-2 border rounded">
            <FileText className="h-4 w-4 text-gray-400" />
            <Input value="QT-000001" disabled className="border-0 p-0" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter notes"
          {...register("notes")}
          className="min-h-[80px]"
          onBlur={() => handleBlur("notes")}
        />
      </div>

      {/* Terms */}
      <div className="space-y-2">
        <Label htmlFor="termsAndConditions">Payment Terms</Label>
        <Textarea
          id="termsAndConditions"
          placeholder="Enter payment terms and conditions"
          {...register("termsAndConditions")}
          className="min-h-[80px]"
          onBlur={() => handleBlur("termsAndConditions")}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Quotation"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Debounce utility function (kept for future use)
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
