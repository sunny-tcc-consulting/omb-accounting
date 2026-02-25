'use client';

import { useState } from 'react';

/**
 * Bank Reconciliation Page
 * Simplified self-contained version for video testing
 */
export default function BankPage() {
  const [activeTab, setActiveTab] = useState<
    "accounts" | "statements" | "transactions" | "reconciliation"
  >("accounts");
  const [accounts] = useState([
    { id: '1', name: 'Business Account', type: 'Checking', balance: 125000, currency: 'HKD' },
    { id: '2', name: 'Savings Account', type: 'Savings', balance: 50000, currency: 'HKD' },
  ]);
  const [transactions] = useState([
    { id: '1', date: '2026-02-20', description: 'Payment from Customer ABC', amount: 15000, type: 'credit' as const, is_reconciled: 1 },
    { id: '2', date: '2026-02-19', description: 'Office Supplies', amount: -2500, type: 'debit' as const, is_reconciled: 1 },
    { id: '3', date: '2026-02-18', description: 'Consulting Service', amount: 35000, type: 'credit' as const, is_reconciled: 0 },
    { id: '4', date: '2026-02-17', description: 'Software Subscription', amount: -1200, type: 'debit' as const, is_reconciled: 1 },
  ]);

  const tabs = [
    { value: "accounts", label: "Accounts" },
    { value: "statements", label: "Statements" },
    { value: "transactions", label: "Transactions" },
    { value: "reconciliation", label: "Reconciliation" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bank Reconciliation</h1>
        <p className="text-gray-600 mt-2">
          Manage your bank accounts, statements, and reconcile transactions
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as typeof activeTab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.value
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
          <AccountsTab accounts={accounts} />
        )}
        {activeTab === "statements" && (
          <div className="p-8 bg-white rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600">Statements feature - Upload and view bank statements</p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Upload Statement
            </button>
          </div>
        )}
        {activeTab === "transactions" && (
          <TransactionsTab transactions={transactions} />
        )}
        {activeTab === "reconciliation" && (
          <div className="p-8 bg-white rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600">Reconciliation feature - Match bank transactions with your records</p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Start Reconciliation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Accounts Tab Component
function AccountsTab({ accounts }: { accounts: { id: string; name: string; type: string; balance: number; currency: string }[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          + Add Bank Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
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
    </div>
  );
}

// Transactions Tab Component
function TransactionsTab({ transactions }: { transactions: { id: string; date: string; description: string; amount: number; type: "credit" | "debit"; is_reconciled: number }[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reconciled</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  transaction.type === "credit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {transaction.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  transaction.is_reconciled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {transaction.is_reconciled ? "Yes" : "No"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
