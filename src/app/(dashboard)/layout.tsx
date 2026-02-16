'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Receipt, BarChart, Tag, Users, FileText, FileText as FileText2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataProvider } from '@/contexts/DataContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { QuotationProvider } from '@/contexts/QuotationContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/reports', label: 'Reports', icon: BarChart },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/quotations', label: 'Quotations', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: FileText2 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <DataProvider>
      <CustomerProvider>
        <QuotationProvider>
          <InvoiceProvider>
            <div className="min-h-screen bg-gray-50">
              {/* Sidebar */}
              <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">omb-accounting</h1>
                  <p className="text-sm text-gray-500 mt-1">Accounting System</p>
                </div>

                <nav className="px-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-100">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Button>
                </div>
              </aside>

              {/* Main content */}
              <main className="ml-64 p-8">
                {children}
              </main>
            </div>
          </InvoiceProvider>
        </QuotationProvider>
      </CustomerProvider>
    </DataProvider>
  );
}
