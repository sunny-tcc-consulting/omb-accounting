'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoices } from '@/contexts/InvoiceContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { Invoice, InvoiceItem as InvoiceItemType } from '@/types';
import { InvoiceItem } from './InvoiceItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, FileText, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { InvoiceListSkeleton } from '@/components/skeletons/InvoiceListSkeleton';
import { getStatusInfo } from '@/lib/invoice-utils';

export const InvoiceList: React.FC = () => {
  const { invoices, loading, error } = useInvoices();
  const { customers } = useCustomers();
  const router = useRouter();

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  // Get unique customers
  const uniqueCustomers = Array.from(new Set(invoices.map((inv) => inv.customerName)));

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        invoice.customerName.toLowerCase().includes(searchLower) ||
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.customerEmail.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filter by status
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }

    // Filter by customer
    if (customerFilter !== 'all' && invoice.customerId !== customerFilter) {
      return false;
    }

    return true;
  });

  // Get payment status
  const getPaymentStatus = (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      return (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{formatCurrency(invoice.amountPaid || 0, invoice.currency)}</span>
        </div>
      );
    } else if (invoice.status === 'partial') {
      return (
        <div className="flex items-center gap-1 text-yellow-600 text-sm">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(invoice.amountPaid || 0, invoice.currency)} / {formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>{formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      );
    }
  };

  // Calculate statistics
  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === 'paid').length,
    pending: invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidAmount: invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amountPaid || 0), 0),
  };

  if (loading) {
    return <InvoiceListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalAmount, 'HKD')}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount, 'HKD')}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by customer name, email, or invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          {/* Customer Filter */}
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {uniqueCustomers.map((customer) => (
                <SelectItem key={customer} value={customer}>
                  {customer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Create Button */}
        <Button onClick={() => router.push('/invoices/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Invoice List */}
      <div className="border rounded-lg bg-white">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
            <p className="text-gray-500 mt-1">
              {search || statusFilter !== 'all' || customerFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first invoice'}
            </p>
            {search || statusFilter !== 'all' || customerFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setCustomerFilter('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y">
            {filteredInvoices.map((invoice) => {
              const statusInfo = getStatusInfo(invoice.status);

              return (
                <InvoiceItem
                  key={invoice.id}
                  invoice={invoice}
                  statusInfo={statusInfo}
                  getPaymentStatus={getPaymentStatus}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredInvoices.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
