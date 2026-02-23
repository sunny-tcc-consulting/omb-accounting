"use client";

/**
 * Bank Reconciliation Page
 * Part of Phase 4.6: Bank Reconciliation
 * Uses API routes for data fetching
 */

import { useState, useEffect } from "react";
import { usePermission } from "@/hooks/usePermission";
import { useRouter } from "next/navigation";

// Type for bank account
interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

// Type for transactions
interface BankTransaction {
  id: string;
  bank_account_id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category?: string;
  is_reconciled: number;
  created_at: number;
}

export default function BankPage() {
  const { can } = usePermission();

  const [activeTab, setActiveTab] = useState<
    "accounts" | "statements" | "transactions" | "reconciliation"
  >("accounts");
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/bank/accounts");
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const data = await response.json();
        if (data.success) {
          setAccounts(data.data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load accounts",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Load transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (activeTab !== "transactions") return;

      try {
        const response = await fetch("/api/bank/transactions");
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();
        if (data.success) {
          setTransactions(data.data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load transactions",
        );
      }
    };

    fetchTransactions();
  }, [activeTab]);

  // Check permissions
  const canCreate = can("bank", "create");
  const canView = can("bank", "read");

  if (!canView) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">
            You don&apos;t have permission to view bank reconciliation
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { value: "accounts", label: "Accounts" },
    { value: "statements", label: "Statements" },
    { value: "transactions", label: "Transactions" },
    { value: "reconciliation", label: "Reconciliation" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bank Reconciliation
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your bank accounts, statements, and reconcile transactions
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as typeof activeTab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.value
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "accounts" && (
          <AccountsTab accounts={accounts} canCreate={canCreate} />
        )}
        {activeTab === "statements" && (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-gray-600">Statements feature coming soon...</p>
          </div>
        )}
        {activeTab === "transactions" && (
          <TransactionsTab transactions={transactions} />
        )}
        {activeTab === "reconciliation" && (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-gray-600">
              Reconciliation feature coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Accounts Tab Component
function AccountsTab({
  accounts,
  canCreate,
}: {
  accounts: BankAccount[];
  canCreate: boolean;
}) {
  return (
    <div className="space-y-4">
      {canCreate && (
        <button
          onClick={() => alert("Create account feature coming soon...")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          + Add Bank Account
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {account.name}
                </h3>
                <p className="text-sm text-gray-500">{account.type}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                Active
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {account.currency === "HKD" ? "HK$" : account.currency}{" "}
                {account.balance.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No bank accounts found</p>
        </div>
      )}
    </div>
  );
}

// Transactions Tab Component
function TransactionsTab({
  transactions,
}: {
  transactions: BankTransaction[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reconciled
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {transaction.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.type === "credit"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    transaction.is_reconciled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {transaction.is_reconciled ? "Yes" : "No"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No transactions found</p>
        </div>
      )}
    </div>
  );
}
