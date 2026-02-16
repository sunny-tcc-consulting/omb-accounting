'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCustomers } from '@/contexts/CustomerContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Building2, FileText, Edit, Trash2, Plus } from 'lucide-react';

export function CustomerDetail() {
  const { getCustomerById, deleteCustomer } = useCustomers();
  const params = useParams();
  const customerId = params.id as string;
  const customer = getCustomerById(customerId);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Customer not found</p>
        <Link href="/customers">
          <Button variant="outline" className="mt-4">
            Back to List
          </Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this customer?`)) {
      deleteCustomer(customer.id);
      // Would redirect to customer list
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600 mt-1">
            {customer.company ? (
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {customer.company}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Individual Customer
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Email</div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{customer.email}</span>
              </div>
            </div>
            {customer.phone && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Phone</div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{customer.phone}</span>
                </div>
              </div>
            )}
            {customer.address && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Address</div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{customer.address}</span>
                </div>
              </div>
            )}
            {customer.taxId && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Tax ID</div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{customer.taxId}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information */}
        {customer.company && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Company Name</div>
                <span className="text-gray-900">{customer.company}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {customer.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{customer.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">Customer ID</div>
                <div className="text-gray-900 font-mono">{customer.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Created Date</div>
                <div className="text-gray-900">{formatDate(customer.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className="text-green-600 font-medium">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href={`/quotations/new?customer=${customer.id}`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quotation
              </Button>
            </Link>
            <Link href={`/invoices/new?customer=${customer.id}`}>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
