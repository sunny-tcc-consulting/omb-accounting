'use client';

import { DataProvider } from '@/contexts/DataContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { QuotationProvider } from '@/contexts/QuotationContext';
import { InvoiceProvider } from '@/contexts/InvoiceContext';
import { NavigationLayout } from '@/components/layout/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <CustomerProvider>
        <QuotationProvider>
          <InvoiceProvider>
            <NavigationLayout>
              {children}
            </NavigationLayout>
          </InvoiceProvider>
        </QuotationProvider>
      </CustomerProvider>
    </DataProvider>
  );
}
