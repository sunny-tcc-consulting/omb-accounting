/**
 * Providers wrapper - Include all context providers
 * Part of Phase 4: User & Roles module
 */

"use client";

import { ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { ReportProvider } from "@/contexts/ReportContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      <ReportProvider>{children}</ReportProvider>
    </UserProvider>
  );
}
