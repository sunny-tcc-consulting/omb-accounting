import { faker } from '@faker-js/faker';
import { Transaction, Category, FinancialSummary, Customer, TransactionFilters, Quotation, QuotationItem, Invoice, InvoiceItem } from '@/types';

// Pre-defined income categories
export const INCOME_CATEGORIES: Category[] = [
  {
    id: '1',
    name: '销售',
    type: 'income' as const,
    color: '#22c55e',
    icon: 'ShoppingCart',
    isDefault: true,
  },
  {
    id: '2',
    name: '服务',
    type: 'income' as const,
    color: '#3b82f6',
    icon: 'Briefcase',
    isDefault: true,
  },
  {
    id: '3',
    name: '咨询',
    type: 'income' as const,
    color: '#8b5cf6',
    icon: 'Lightbulb',
    isDefault: true,
  },
  {
    id: '4',
    name: '投资',
    type: 'income' as const,
    color: '#f59e0b',
    icon: 'TrendingUp',
    isDefault: true,
  },
  {
    id: '5',
    name: '版权',
    type: 'income' as const,
    color: '#ec4899',
    icon: 'Copyright',
    isDefault: true,
  },
  {
    id: '6',
    name: '其他收入',
    type: 'income' as const,
    color: '#6b7280',
    icon: 'MoreHorizontal',
    isDefault: true,
  },
];

// Pre-defined expense categories
export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: '1',
    name: '租金',
    type: 'expense' as const,
    color: '#ef4444',
    icon: 'Home',
    isDefault: true,
  },
  {
    id: '2',
    name: '薪资',
    type: 'expense' as const,
    color: '#f59e0b',
    icon: 'Users',
    isDefault: true,
  },
  {
    id: '3',
    name: '营销',
    type: 'expense' as const,
    color: '#ec4899',
    icon: 'Megaphone',
    isDefault: true,
  },
  {
    id: '4',
    name: '软件',
    type: 'expense' as const,
    color: '#3b82f6',
    icon: 'Code',
    isDefault: true,
  },
  {
    id: '5',
    name: '差旅',
    type: 'expense' as const,
    color: '#8b5cf6',
    icon: 'Plane',
    isDefault: true,
  },
  {
    id: '6',
    name: '办公用品',
    type: 'expense' as const,
    color: '#10b981',
    icon: 'Printer',
    isDefault: true,
  },
  {
    id: '7',
    name: '保险',
    type: 'expense' as const,
    color: '#6b7280',
    icon: 'Shield',
    isDefault: true,
  },
  {
    id: '8',
    name: '法律',
    type: 'expense' as const,
    color: '#f97316',
    icon: 'Scale',
    isDefault: true,
  },
  {
    id: '9',
    name: '其他支出',
    type: 'expense' as const,
    color: '#6b7280',
    icon: 'MoreHorizontal',
    isDefault: true,
  },
];

// Generate mock transactions
export function generateTransactions(count: number = 100): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() > 0.5;
    const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = categories[Math.floor(Math.random() * categories.length)];

    transactions.push({
      id: faker.string.uuid(),
      type: isIncome ? 'income' : 'expense',
      date: faker.date.recent({ days: 365 }),
      amount: Math.abs(faker.number.float({ min: 100, max: 100000, multipleOf: 0.01 })),
      category: category.name,
      description: faker.commerce.productDescription(),
      reference: faker.finance.accountNumber(),
      status: 'completed' as const,
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Pre-populate with mock data
export const mockTransactions = generateTransactions(100);

// Get all categories
export function getCategories(type?: 'income' | 'expense'): Category[] {
  if (type) {
    return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }
  return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
}

// Get category by name
export function getCategoryByName(name: string, type: 'income' | 'expense'): Category | undefined {
  return getCategories(type).find((c) => c.name === name);
}

// Filter transactions
export function getFilteredTransactions(
  transactions: Transaction[],
  filters?: TransactionFilters
): Transaction[] {
  let filtered = [...transactions];

  if (filters?.type && filters.type !== 'all') {
    filtered = filtered.filter((t) => t.type === filters.type);
  }

  if (filters?.category) {
    filtered = filtered.filter((t) => t.category === filters.category);
  }

  if (filters?.dateRange) {
    filtered = filtered.filter((t) => {
      const date = new Date(t.date);
      return date >= (filters.dateRange as any).start && date <= (filters.dateRange as any).end;
    });
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search) ||
        (t.reference && t.reference.toLowerCase().includes(search))
    );
  }

  if (filters?.status) {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  return filtered;
}

// Calculate financial summary
export function calculateFinancialSummary(
  transactions: Transaction[],
  days: number = 30
): FinancialSummary {
  const now = new Date();
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const recentTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= daysAgo;
  });

  const totalIncome = recentTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = recentTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
  const cashFlow = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netIncome,
    profitMargin,
    cashFlow,
    last30DaysIncome: totalIncome,
    last30DaysExpenses: totalExpenses,
  };
}

// Get transactions by category
export function getTransactionsByCategory(
  transactions: Transaction[],
  category: string,
  type: 'income' | 'expense'
): Transaction[] {
  return transactions.filter((t) => t.category === category && t.type === type);
}

// Get transactions by date range
export function getTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= startDate && date <= endDate;
  });
}

// Export transactions to CSV
export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['ID', 'Type', 'Date', 'Category', 'Amount', 'Description', 'Reference', 'Status'];
  const rows = transactions.map((t) => [
    t.id,
    t.type,
    t.date.toISOString(),
    t.category,
    t.amount.toFixed(2),
    t.description,
    t.reference || '',
    t.status,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}

// Export transactions to Excel
export function exportToExcel(transactions: Transaction[]): string {
  const headers = ['ID', 'Type', 'Date', 'Category', 'Amount', 'Description', 'Reference', 'Status'];
  const rows = transactions.map((t) => [
    t.id,
    t.type,
    t.date.toISOString(),
    t.category,
    t.amount.toFixed(2),
    t.description,
    t.reference || '',
    t.status,
  ]);

  // Simple CSV-based Excel export (Excel can open CSV files)
  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}

// Generate mock customers
export function generateCustomers(count: number = 15): Customer[] {
  const customers: Customer[] = [];
  const companyNames = [
    'ABC 科技有限公司',
    'XYZ 贸易有限公司',
    '123 咨询服务',
    '456 创意工作室',
    '789 软件解决方案',
    'ABC 装饰工程',
    'XYZ 建筑公司',
    '123 招商代理',
    '456 电商平台',
    '789 物流运输',
  ];

  for (let i = 0; i < count; i++) {
    const isCompany = Math.random() > 0.5;
    const company = isCompany
      ? companyNames[Math.floor(Math.random() * companyNames.length)]
      : undefined;

    customers.push({
      id: faker.string.uuid(),
      name: isCompany
        ? `${faker.company.name()} Ltd.`
        : faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      company: company,
      taxId: isCompany ? faker.string.numeric(10) : undefined,
      notes: faker.lorem.sentence(),
      createdAt: faker.date.recent({ days: 365 }),
    });
  }

  return customers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Generate mock quotations
export function generateQuotations(count: number = 20): Quotation[] {
  const quotations: Quotation[] = [];
  const customers = generateCustomers(15);
  const statuses: Quotation['status'][] = ['draft', 'sent', 'accepted', 'rejected'];

  for (let i = 0; i < count; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items: QuotationItem[] = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const item: QuotationItem = {
        id: faker.string.uuid(),
        description: faker.commerce.productDescription(),
        quantity: Math.floor(Math.random() * 10) + 1,
        unitPrice: Math.abs(faker.number.float({ min: 100, max: 10000, multipleOf: 0.01 })),
        taxRate: Math.random() > 0.5 ? 10 : undefined,
        discount: Math.random() > 0.7 ? faker.number.float({ min: 100, max: 1000, multipleOf: 0.01 }) : undefined,
        total: 0,
      };

      item.total = (item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100);

      items.push(item);
      subtotal += item.total;
    }

    const tax = subtotal * 0.1;
    const discount = subtotal * 0.05;
    const total = subtotal + tax - discount;

    quotations.push({
      id: faker.string.uuid(),
      quotationNumber: `QT-${faker.string.numeric(6)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      items,
      currency: 'CNY',
      subtotal,
      tax,
      discount,
      total,
      validityPeriod: faker.date.future({ years: 1 }),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      issuedDate: faker.date.recent({ days: 30 }),
      termsAndConditions: 'Payment due within 30 days. All prices are in CNY.',
    });
  }

  return quotations.sort((a, b) => b.issuedDate.getTime() - a.issuedDate.getTime());
}

// Generate mock invoices
export function generateInvoices(count: number = 30): Invoice[] {
  const invoices: Invoice[] = [];
  const customers = generateCustomers(15);
  const statuses: Invoice['status'][] = ['draft', 'pending', 'partial', 'paid', 'overdue'];

  for (let i = 0; i < count; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items: InvoiceItem[] = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const item: InvoiceItem = {
        id: faker.string.uuid(),
        description: faker.commerce.productDescription(),
        quantity: Math.floor(Math.random() * 10) + 1,
        unitPrice: Math.abs(faker.number.float({ min: 100, max: 10000, multipleOf: 0.01 })),
        taxRate: Math.random() > 0.5 ? 10 : undefined,
        discount: Math.random() > 0.7 ? faker.number.float({ min: 100, max: 1000, multipleOf: 0.01 }) : undefined,
        total: 0,
      };

      item.total = (item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100);

      items.push(item);
      subtotal += item.total;
    }

    const tax = subtotal * 0.1;
    const discount = subtotal * 0.05;
    const total = subtotal + tax - discount;

    const paidAmount = Math.random() > 0.5 ? total : 0;
    const remainingAmount = total - paidAmount;

    const status = paidAmount > 0 ? 'paid' : 'pending';
    if (paidAmount > 0 && paidAmount < total) {
      statuses[Math.floor(Math.random() * statuses.length)];
    }

    invoices.push({
      id: faker.string.uuid(),
      invoiceNumber: `INV-${faker.string.numeric(6)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      items,
      currency: 'CNY',
      subtotal,
      tax,
      discount,
      total,
      paymentTerms: 'Payment due within 30 days',
      dueDate: faker.date.future({ refDate: new Date(), days: 30 } as any),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      issuedDate: faker.date.recent({ refDate: new Date(), days: 30 } as any),
      amountPaid: paidAmount,
      amountRemaining: remainingAmount,
    });
  }

  return invoices.sort((a, b) => b.issuedDate.getTime() - a.issuedDate.getTime());
}
