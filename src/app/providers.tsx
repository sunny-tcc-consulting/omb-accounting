/**
 * Providers wrapper - Include all context providers
 * Part of Phase 4: User & Roles module
 * Updated: Phase 5 - Added Customer, Quotation, Invoice providers
 * Updated: Phase 6 - Added I18nProvider for multi-language support
 */
"use client";

import { ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { ReportProvider } from "@/contexts/ReportContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { QuotationProvider } from "@/contexts/QuotationContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { I18nProvider } from "@/contexts/I18nContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <UserProvider>
        <ReportProvider>
          <CustomerProvider>
            <QuotationProvider>
              <InvoiceProvider>{children}</InvoiceProvider>
            </QuotationProvider>
          </CustomerProvider>
        </ReportProvider>
      </UserProvider>
    </I18nProvider>
  );
}
