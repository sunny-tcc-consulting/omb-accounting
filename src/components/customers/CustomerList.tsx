"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useCustomers } from "@/contexts/CustomerContext";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CustomerListSkeleton } from "@/components/skeletons/CustomerListSkeleton";
import {
  DataTable,
  useTableSort,
  TableColumn,
} from "@/components/ui/data-table";
import { Customer } from "@/types";

export function CustomerList() {
  const { getFilteredCustomers, customers, loading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = getFilteredCustomers({
    search: searchTerm,
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
      // Delete logic would go here
      toast.success("Customer deleted");
    }
  };

  // Sorting
  const {
    data: sortedCustomers,
    sortColumn,
    sortDirection,
    handleSort,
  } = useTableSort(filteredCustomers, "name", "asc");

  // Table columns configuration
  const columns: TableColumn<Customer>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        render: (customer) => (
          <div className="flex items-center">
            {customer.company ? (
              <Building2 className="h-5 w-5 text-blue-500 mr-3" />
            ) : (
              <User className="h-5 w-5 text-gray-400 mr-3" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {customer.name}
              </div>
              <div className="text-xs text-gray-500">
                ID: {customer.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        render: (customer) => (
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{customer.email}</span>
          </div>
        ),
      },
      {
        key: "company",
        header: "Company",
        sortable: true,
        render: (customer) => (
          <span className="text-sm text-gray-900">
            {customer.company || "-"}
          </span>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        sortable: true,
        render: (customer) => (
          <span className="text-sm text-gray-900">{customer.phone || "-"}</span>
        ),
      },
      {
        key: "address",
        header: "Address",
        sortable: true,
        render: (customer) => (
          <span className="text-sm text-gray-900">
            {customer.address || "-"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        render: (customer) => (
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
        ),
      },
    ],
    [handleDelete],
  );

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

      {/* Customer List with DataTable */}
      {sortedCustomers.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No customers found</p>
        </div>
      ) : (
        <DataTable
          data={sortedCustomers}
          columns={columns}
          keyExtractor={(customer) => customer.id}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          stickyHeader={true}
          emptyMessage="No customers found"
          rowClassName="cursor-pointer"
        />
      )}

      {/* Stats */}
      <div className="flex gap-6 text-sm text-gray-600">
        <span>
          Total Customers:{" "}
          <strong>{formatNumber(sortedCustomers.length)}</strong>
        </span>
      </div>
    </div>
  );
}
