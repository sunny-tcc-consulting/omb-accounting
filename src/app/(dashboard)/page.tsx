import { OverviewCard } from '@/components/dashboard/OverviewCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { FinancialHealth } from '@/components/dashboard/FinancialHealth';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! This is your financial overview.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OverviewCard />
        <RecentTransactions />
        <FinancialHealth />
      </div>
    </div>
  );
}
