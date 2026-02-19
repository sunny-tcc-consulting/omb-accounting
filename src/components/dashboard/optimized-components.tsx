/**
 * Performance optimized components with React.memo, useCallback, and useMemo
 */

import { memo, useCallback, useMemo } from "react";

/**
 * Memoized OverviewCard component for dashboard performance
 */
export const OverviewCard = memo(function OverviewCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  loading = false,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  const changeColors = useMemo(() => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }, [changeType]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && <p className={`text-sm mt-2 ${changeColors}`}>{change}</p>}
        </div>
        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
});

/**
 * Memoized RecentTransactions component
 */
export const RecentTransactions = memo(function RecentTransactions({
  transactions,
  loading = false,
}: {
  transactions: Array<{
    id: string;
    customer: string;
    amount: number;
    date: string;
    status: string;
  }>;
  loading?: boolean;
}) {
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-HK", {
      style: "currency",
      currency: "HKD",
    }).format(amount);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Transactions
      </h3>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {transaction.customer.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {transaction.customer}
                </p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-900">
                {formatCurrency(transaction.amount)}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}
              >
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Memoized FinancialHealth component
 */
export const FinancialHealth = memo(function FinancialHealth({
  revenue,
  expenses,
  profit,
  loading = false,
}: {
  revenue: number;
  expenses: number;
  profit: number;
  loading?: boolean;
}) {
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-HK", {
      style: "currency",
      currency: "HKD",
    }).format(amount);
  }, []);

  const profitMargin = useMemo(() => {
    if (revenue === 0) return 0;
    return ((profit / revenue) * 100).toFixed(1);
  }, [profit, revenue]);

  const healthScore = useMemo(() => {
    if (profitMargin > 20) return "Excellent";
    if (profitMargin > 10) return "Good";
    if (profitMargin > 0) return "Fair";
    return "Poor";
  }, [profitMargin]);

  const healthColor = useMemo(() => {
    switch (healthScore) {
      case "Excellent":
        return "bg-green-500";
      case "Good":
        return "bg-blue-500";
      case "Fair":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  }, [healthScore]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Financial Health
        </h3>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${healthColor} text-white`}
        >
          {healthScore}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm text-gray-600">Profit Margin</span>
          <span className="text-2xl font-bold text-gray-900">
            {profitMargin}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${healthColor} transition-all duration-500`}
            style={{
              width: `${Math.min(Math.abs(Number(profitMargin)), 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(revenue)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Expenses</p>
          <p className="text-lg font-semibold text-red-600">
            {formatCurrency(expenses)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Profit</p>
          <p
            className={`text-lg font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(profit)}
          </p>
        </div>
      </div>
    </div>
  );
});

/**
 * Memoized form input component
 */
export const OptimizedFormInput = memo(function OptimizedFormInput({
  label,
  error,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const hasError = Boolean(error);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          {...props}
          className={`
            w-full rounded-lg border px-4 py-2.5 text-sm
            transition-all duration-200
            ${Icon ? "pl-10" : ""}
            ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
        />
      </div>
      {error && <p className="text-sm text-red-600 animate-fade-in">{error}</p>}
    </div>
  );
});

/**
 * Memoized button component
 */
export const OptimizedButton = memo(function OptimizedButton({
  children,
  variant = "primary",
  loading = false,
  icon: Icon,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const baseStyles = useMemo(
    () =>
      "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    [],
    [],
  );

  const variantStyles = useMemo(() => {
    switch (variant) {
      case "secondary":
        return "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500";
      case "outline":
        return "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500";
      case "ghost":
        return "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
    }
  }, [variant]);

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles} ${className}`}
      disabled={loading || props.disabled}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon className="-ml-1 mr-2 h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  );
});

/**
 * Memoized skeleton loader
 */
export const OptimizedSkeleton = memo(function OptimizedSkeleton({
  className = "",
  variant = "text",
}: {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}) {
  const baseStyles = useMemo(() => "animate-pulse bg-gray-200", [], []);

  const variantStyles = useMemo(() => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded-lg";
      default:
        return "rounded";
    }
  }, [variant]);

  return <div className={`${baseStyles} ${variantStyles} ${className}`} />;
});
