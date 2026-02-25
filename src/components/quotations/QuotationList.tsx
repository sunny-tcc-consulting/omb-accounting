'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { useQuotations } from '@/contexts/QuotationContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function QuotationList() {
  const { getFilteredQuotations, quotations, loading } = useQuotations();
  const { getFilteredCustomers } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotations = getFilteredQuotations({
    search: searchTerm,
  });

  const handleDelete = (id: string, quotationNumber: string) => {
    if (confirm(`Are you sure you want to delete quotation "${quotationNumber}"?`)) {
      // Delete logic would go here
      toast.success('Quotation deleted');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      draft: { label: 'Draft', variant: 'secondary' },
      sent: { label: 'Sent', variant: 'default' },
      accepted: { label: 'Accepted', variant: 'outline' },
      rejected: { label: 'Rejected', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Show loading indicator inline if still loading
  if (loading && quotations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer name or quotation number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/quotations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quotation
            </Button>
          </Link>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by customer name or quotation number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/quotations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </Link>
      </div>

      {/* Quotation List */}
      {filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No quotations found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{quotation.quotationNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quotation.customerName}</div>
                        <div className="text-xs text-gray-500">{formatDate(quotation.issuedDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatDate(quotation.issuedDate)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(quotation.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(quotation.subtotal)} + {formatCurrency(quotation.tax || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quotation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/quotations/${quotation.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(quotation.id, quotation.quotationNumber)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-6 text-sm text-gray-600">
        <span>Total Quotations: <strong>{formatNumber(filteredQuotations.length)}</strong></span>
        <span>Sent: <strong>{filteredQuotations.filter(q => q.status === 'sent').length}</strong></span>
        <span>Accepted: <strong>{filteredQuotations.filter(q => q.status === 'accepted').length}</strong></span>
      </div>
    </div>
  );
}
