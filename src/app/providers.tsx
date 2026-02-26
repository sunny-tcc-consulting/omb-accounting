/**
 * Providers wrapper - Include all context providers
 * Part of Phase 4: User & Roles module
 * Updated: Phase 5 - Added Customer, Quotation, Invoice providers
 */

"use client";

import { ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { ReportProvider } from "@/contexts/ReportContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { QuotationProvider } from "@/contexts/QuotationContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      <ReportProvider>
        <CustomerProvider>
          <QuotationProvider>
            <InvoiceProvider>{children}</InvoiceProvider>
          </QuotationProvider>
        </CustomerProvider>
      </ReportProvider>
    </UserProvider>
  );
}
