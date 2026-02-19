"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InvoiceFormData, InvoiceItem } from "@/types";
import { useInvoices } from "@/contexts/InvoiceContext";
import { useCustomers } from "@/contexts/CustomerContext";
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
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// Form validation schema
const invoiceFormSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z
    .string()
    .min(1, "Customer email is required")
    .email("Invalid email address"),
  customerPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Unit price must be non-negative"),
        taxRate: z.number().min(0).max(1).optional(),
        discount: z.number().min(0).optional(),
      }),
    )
    .min(1, "At least one item is required"),
  currency: z.string().default("HKD"),
  taxRate: z.number().min(0).max(1).optional(),
  paymentTerms: z.string().default("Due within 30 days"),
  dueDate: z.date(),
  issuedDate: z.date(),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSuccess?: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  onSuccess,
}) => {
  const { addInvoice } = useInvoices();
  const { customers } = useCustomers();

  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items || [
      {
        id: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discount: 0,
        total: 0,
      },
    ],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    clearErrors,
    trigger,
  } = useForm<InvoiceFormValues>(
    {
      resolver: zodResolver(invoiceFormSchema),
      defaultValues: {
        customerId: initialData?.customerId || "",
        customerName: initialData?.customerName || "",
        customerEmail: initialData?.customerEmail || "",
        customerPhone: initialData?.customerPhone || "",
        items: initialData?.items || [
          {
            id: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: 0,
            discount: 0,
            total: 0,
          },
        ],
        currency: initialData?.currency || "HKD",
        taxRate: initialData?.taxRate || 0,
        paymentTerms: initialData?.paymentTerms || "Due within 30 days",
        issuedDate: initialData?.issuedDate || new Date(),
        dueDate:
          initialData?.dueDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: initialData?.notes || "",
      },
    } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
  );

  // Debounce validation
  const debouncedValidate = debounce((fieldName: string) => {
    trigger(
      fieldName as unknown as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
    );
  }, 300);

  const handleBlur = (fieldName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearErrors(fieldName as unknown as any);
    debouncedValidate(fieldName);
  };

  // Watch for changes to recalculate totals
  watch("currency");
  watch("taxRate");

  // Calculate line item totals
  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const tax = subtotal * (item.taxRate || 0);
    const discount = item.discount || 0;
    return subtotal + tax - discount;
  };

  // Add new item
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item
  const handleUpdateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total
    if (
      field === "quantity" ||
      field === "unitPrice" ||
      field === "taxRate" ||
      field === "discount"
    ) {
      newItems[index].total = calculateItemTotal(newItems[index]);
    }

    setItems(newItems);
  };

  // Calculate invoice totals
  const calculateTotal = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0,
    );
    const totalTax = items.reduce(
      (sum, item) =>
        sum + (item.taxRate || 0) * (item.quantity * item.unitPrice),
      0,
    );
    const totalDiscount = items.reduce(
      (sum, item) => sum + (item.discount || 0),
      0,
    );
    return subtotal + totalTax - totalDiscount;
  };

  const total = calculateTotal();

  // Handle form submission
  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const invoiceData: InvoiceFormData = {
        ...data,
        items,
      };

      await addInvoice(invoiceData);
      toast.success("Invoice created successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create invoice");
      console.error("Error creating invoice:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold">Customer Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              {...register("customerName")}
              placeholder="Enter customer name"
              disabled={isSubmitting}
              className={
                errors.customerName ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.customerName && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span className="font-bold">{errors.customerName.message}</span>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              {...register("customerEmail")}
              placeholder="customer@example.com"
              disabled={isSubmitting}
              className={
                errors.customerEmail ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.customerEmail && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span className="font-bold">
                  {errors.customerEmail.message}
                </span>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              id="customerPhone"
              {...register("customerPhone")}
              placeholder="+852-XXXXXXXX"
              disabled={isSubmitting}
              className={
                errors.customerPhone ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.customerPhone && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span className="font-bold">
                  {errors.customerPhone.message}
                </span>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customerId">Select Customer *</Label>
            <Select
              onValueChange={(value) => {
                const customer = customers.find((c) => c.id === value);
                if (customer) {
                  register("customerId").onChange({
                    target: { value: customer.id },
                  });
                  register("customerName").onChange({
                    target: { value: customer.name },
                  });
                  register("customerEmail").onChange({
                    target: { value: customer.email },
                  });
                  register("customerPhone").onChange({
                    target: { value: customer.phone || "" },
                  });
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="customerId"
                className={
                  errors.customerId ? "border-red-500 focus:ring-red-500" : ""
                }
                onBlur={() => handleBlur("customerId")}
              >
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span className="font-bold">{errors.customerId.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Line Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid gap-4 grid-cols-12 p-4 border rounded-lg bg-white"
            >
              <div className="col-span-5 space-y-2">
                <Label htmlFor={`description-${index}`}>Description *</Label>
                <Input
                  id={`description-${index}`}
                  value={item.description}
                  onChange={(e) =>
                    handleUpdateItem(
                      index,
                      "description",
                      e.target.value as unknown as number,
                    )
                  }
                  placeholder="Enter item description"
                  disabled={isSubmitting}
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

              <div className="col-span-2 space-y-2">
                <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateItem(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  disabled={isSubmitting}
                  onBlur={() => handleBlur(`items.${index}.quantity`)}
                  className={
                    errors.items && errors.items[index]?.quantity
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
              </div>

              <div className="col-span-3 space-y-2">
                <Label htmlFor={`unitPrice-${index}`}>Unit Price *</Label>
                <Input
                  id={`unitPrice-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleUpdateItem(
                      index,
                      "unitPrice",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  disabled={isSubmitting}
                  onBlur={() => handleBlur(`items.${index}.unitPrice`)}
                  className={
                    errors.items && errors.items[index]?.unitPrice
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor={`taxRate-${index}`}>Tax %</Label>
                <Input
                  id={`taxRate-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={(item.taxRate || 0) * 100}
                  onChange={(e) =>
                    handleUpdateItem(
                      index,
                      "taxRate",
                      parseFloat(e.target.value) / 100 || 0,
                    )
                  }
                  disabled={isSubmitting}
                  onBlur={() => handleBlur(`items.${index}.taxRate`)}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor={`discount-${index}`}>Discount</Label>
                <Input
                  id={`discount-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.discount || 0}
                  onChange={(e) =>
                    handleUpdateItem(
                      index,
                      "discount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  disabled={isSubmitting}
                  onBlur={() => handleBlur(`items.${index}.discount`)}
                  className={
                    errors.items && errors.items[index]?.discount
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
              </div>

              <div className="col-span-2 flex items-end">
                <div className="w-full text-right">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(calculateItemTotal(item), currency)}
                  </p>
                </div>
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1 || isSubmitting}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold">Invoice Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="issuedDate">Issued Date *</Label>
            <Input
              id="issuedDate"
              type="date"
              {...register("issuedDate")}
              disabled={isSubmitting}
              onBlur={() => handleBlur("issuedDate")}
              className={
                errors.issuedDate ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.issuedDate && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span className="font-bold">{errors.issuedDate.message}</span>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate")}
              disabled={isSubmitting}
              onBlur={() => handleBlur("dueDate")}
              className={
                errors.dueDate ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.dueDate && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span className="font-bold">{errors.dueDate.message}</span>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Select
              onValueChange={(value) =>
                register("paymentTerms").onChange({ target: { value } })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="paymentTerms"
                onBlur={() => handleBlur("paymentTerms")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Due within 30 days">
                  Due within 30 days
                </SelectItem>
                <SelectItem value="Due within 15 days">
                  Due within 15 days
                </SelectItem>
                <SelectItem value="Due within 7 days">
                  Due within 7 days
                </SelectItem>
                <SelectItem value="Net 60">Net 60</SelectItem>
                <SelectItem value="Due on receipt">Due on receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              onValueChange={(value) =>
                register("currency").onChange({ target: { value } })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="currency"
                onBlur={() => handleBlur("currency")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HKD">HKD (Hong Kong Dollar)</SelectItem>
                <SelectItem value="CNY">CNY (Chinese Yuan)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="taxRate">Tax Rate %</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              {...register("taxRate")}
              disabled={isSubmitting}
              onBlur={() => handleBlur("taxRate")}
              className={
                errors.taxRate ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            {errors.taxRate && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span className="font-bold">{errors.taxRate.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes..."
          rows={3}
          disabled={isSubmitting}
          onBlur={() => handleBlur("notes")}
        />
      </div>

      {/* Summary */}
      <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold">Invoice Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">
              {formatCurrency(
                items.reduce((sum, item) => sum + calculateItemTotal(item), 0),
                currency,
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              Tax ({(taxRate * 100).toFixed(1)}%):
            </span>
            <span className="font-medium">
              {formatCurrency(
                items.reduce(
                  (sum, item) =>
                    sum +
                    (item.taxRate || 0) * (item.quantity * item.unitPrice),
                  0,
                ),
                currency,
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discount:</span>
            <span className="font-medium text-green-600">
              -
              {formatCurrency(
                items.reduce((sum, item) => sum + (item.discount || 0), 0),
                currency,
              )}
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
      </Button>
    </form>
  );
};

// Debounce utility function
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
