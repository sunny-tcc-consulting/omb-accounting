"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import { formatCurrency, formatDate, getRelativeDateString } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentTransactions() {
  const { getFilteredTransactions, loading } = useData();
  const recentTransactions = getFilteredTransactions({ type: "all", limit: 5 });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Recent Transactions
          </CardTitle>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <ArrowRight className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No transactions yet</p>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow ${
                      transaction.type === "income"
                        ? "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                    }`}
                  >
                    <span className="font-semibold">
                      {transaction.type === "income" ? "+" : "-"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.category} ·{" "}
                      {getRelativeDateString(new Date(transaction.date))}
                    </p>
                  </div>
                </div>
                <div
                  className={`font-semibold text-sm ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
