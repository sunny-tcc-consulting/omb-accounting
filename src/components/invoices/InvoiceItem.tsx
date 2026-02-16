'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Invoice as InvoiceType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, FileText, Printer, Send, CheckCircle2, DollarSign, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { getStatusInfo } from '@/lib/invoice-utils';
import { toast } from 'sonner';

interface InvoiceItemProps {
  invoice: InvoiceType;
  statusInfo: {
    icon: React.ElementType;
    color: string;
    label: string;
  };
  getPaymentStatus: (invoice: InvoiceType) => React.ReactNode;
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({ invoice, statusInfo, getPaymentStatus }) => {
  const router = useRouter();
  const statusIcon = React.createElement(statusInfo.icon, { className: 'w-4 h-4' });

  // Check if invoice is overdue
  const isOverdue = invoice.status === 'overdue' || (invoice.status === 'pending' && new Date(invoice.dueDate) < new Date());

  // Handle View
  const handleView = () => {
    router.push(`/invoices/${invoice.id}`);
  };

  // Handle Print
  const handlePrint = () => {
    router.push(`/invoices/${invoice.id}`);
    setTimeout(() => {
      window.print();
      toast.success('Invoice is being printed!');
    }, 100);
  };

  // Handle Send
  const handleSend = () => {
    toast.info('Email functionality coming soon!');
  };

  // Handle Mark as Paid
  const handleMarkAsPaid = () => {
    router.push(`/invoices/${invoice.id}`);
    setTimeout(() => {
      const amountInput = document.getElementById('payment-amount') as HTMLInputElement;
      if (amountInput) {
        amountInput.value = formatCurrency(invoice.total, invoice.currency).replace(/[^0-9.]/g, '');
        toast.success(`Marking invoice ${invoice.invoiceNumber} as paid...`);
      }
    }, 200);
  };

  // Handle Edit
  const handleEdit = () => {
    router.push(`/invoices/${invoice.id}/edit`);
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        {/* Invoice Number */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{invoice.invoiceNumber}</h3>
            <Badge variant="outline" className={statusInfo.color}>
              {statusIcon}
              <span className="ml-1">{statusInfo.label}</span>
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">{invoice.customerName}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Issued: {formatDate(invoice.issuedDate)}</span>
            <span>Due: {formatDate(invoice.dueDate)}</span>
            {isOverdue && <span className="text-red-600 font-medium">Overdue</span>}
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col items-end min-w-[150px]">
          <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</p>
          {getPaymentStatus(invoice)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSend}>
                <Send className="w-4 h-4 mr-2" />
                Send
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMarkAsPaid}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <FileText className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
