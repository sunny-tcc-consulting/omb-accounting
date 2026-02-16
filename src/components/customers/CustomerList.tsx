'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Building2, User, Mail, Phone, MapPin } from 'lucide-react';
import { useCustomers } from '@/contexts/CustomerContext';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CustomerListSkeleton } from '@/components/skeletons/CustomerListSkeleton';

export function CustomerList() {
  const { getFilteredCustomers, customers, loading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = getFilteredCustomers({
    search: searchTerm,
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
      // Delete logic would go here
      toast.success('Customer deleted');
    }
  };

  if (loading) {
    return <CustomerListSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No customers found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {customer.company ? (
                          <Building2 className="h-5 w-5 text-blue-500 mr-3" />
                        ) : (
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">ID: {customer.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{customer.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.company ? (
                        <span className="text-sm text-gray-900">{customer.company}</span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.phone ? (
                        <span className="text-sm text-gray-900">{customer.phone}</span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.address ? (
                        <span className="text-sm text-gray-900">{customer.address}</span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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
        <span>Total Customers: <strong>{formatNumber(filteredCustomers.length)}</strong></span>
      </div>
    </div>
  );
}
