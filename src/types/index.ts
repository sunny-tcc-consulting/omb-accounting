// Transaction types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  date: Date;
  amount: number;
  category: string;
  description: string;
  reference?: string;
  status: 'completed' | 'pending' | 'cancelled';
  attachments?: string[];
}

// Category types
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  isDefault: boolean;
}

// Transaction filters
export interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  status?: string;
}

// Financial summary
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  cashFlow: number;
  last30DaysIncome: number;
  last30DaysExpenses: number;
}

// Report data
export interface ReportData {
  period: {
    startDate: Date;
    endDate: Date;
  };
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  incomeByMonth: Array<{ month: string; amount: number }>;
  expensesByMonth: Array<{ month: string; amount: number }>;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
}

// Customer filters
export interface CustomerFilters {
  search?: string;
  company?: string;
}

// Quotation types
export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: QuotationItem[];
  currency: string;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  validityPeriod: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  issuedDate: Date;
  notes?: string;
  termsAndConditions?: string;
}

// Quotation items
export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  total: number;
}

// Quotation filters
export interface QuotationFilters {
  status?: string;
  customerId?: string;
  search?: string;
}

// Invoice types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: InvoiceItem[];
  quotationId?: string;
  currency: string;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentTerms: string;
  dueDate: Date;
  status: 'draft' | 'pending' | 'partial' | 'paid' | 'overdue';
  issuedDate: Date;
  paidDate?: Date;
  amountPaid?: number;
  amountRemaining?: number;
  notes?: string;
}

// Invoice items
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  total: number;
}

// Invoice filters
export interface InvoiceFilters {
  status?: string;
  customerId?: string;
  search?: string;
}

// Invoice form data (for creating/editing invoices)
export interface InvoiceFormData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: InvoiceItem[];
  currency?: string;
  taxRate?: number;
  paymentTerms?: string;
  dueDate: Date;
  issuedDate: Date;
  notes?: string;
}
