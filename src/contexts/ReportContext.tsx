"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import {
  Account,
  JournalEntry,
  BalanceSheet,
  ProfitAndLoss,
  TrialBalance,
  GeneralLedger,
  ReportFilters,
} from "@/types/report";
import {
  DEFAULT_CHART_OF_ACCOUNTS,
  generateJournalEntries,
  generateTrialBalance,
  generateBalanceSheet,
  generateProfitAndLoss,
  generateAllGeneralLedgers,
} from "@/lib/report-generator";
import { generateTransactions } from "@/lib/mock-data";
import { Transaction } from "@/types";

interface ReportContextType {
  // Data
  accounts: Account[];
  journalEntries: JournalEntry[];
  transactions: Transaction[];

  // Report Generation
  generateTrialBalance: () => TrialBalance;
  generateBalanceSheet: (asOfDate?: Date) => BalanceSheet;
  generateProfitAndLoss: (startDate: Date, endDate: Date) => ProfitAndLoss;
  generateGeneralLedgers: () => GeneralLedger[];

  // Report Filters
  filters: ReportFilters;
  setFilters: (filters: ReportFilters) => void;

  // Loading State
  loading: boolean;
}

export const ReportContext = createContext<ReportContextType | undefined>(
  undefined,
);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});

  // Initialize accounts from default chart
  const accounts: Account[] = useMemo(() => {
    return DEFAULT_CHART_OF_ACCOUNTS.map((acc, index) => ({
      code: acc.code,
      name: acc.name,
      type: acc.type,
      category: acc.category,
      isSubAccount: acc.isSubAccount,
      parentAccountId: acc.parentAccountId,
      id: `acc-${acc.code}`,
      balance: Math.abs(Math.random() * 100000), // Mock balance
      currency: "CNY",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }, []);

  // Initialize transactions and generate journal entries
  const transactions = useMemo(() => {
    return generateTransactions(100);
  }, []);

  const journalEntries = useMemo(() => {
    return generateJournalEntries(transactions);
  }, [transactions]);

  // Report generation functions
  const generateTrialBalanceFn = (): TrialBalance => {
    setLoading(true);
    try {
      return generateTrialBalance(accounts, journalEntries);
    } finally {
      setLoading(false);
    }
  };

  const generateBalanceSheetFn = (asOfDate?: Date): BalanceSheet => {
    setLoading(true);
    try {
      return generateBalanceSheet(accounts, journalEntries, asOfDate);
    } finally {
      setLoading(false);
    }
  };

  const generateProfitAndLossFn = (
    startDate: Date,
    endDate: Date,
  ): ProfitAndLoss => {
    setLoading(true);
    try {
      return generateProfitAndLoss(
        accounts,
        journalEntries,
        startDate,
        endDate,
      );
    } finally {
      setLoading(false);
    }
  };

  const generateGeneralLedgersFn = (): GeneralLedger[] => {
    setLoading(true);
    try {
      return generateAllGeneralLedgers(accounts, journalEntries);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportContext.Provider
      value={{
        accounts,
        journalEntries,
        transactions,
        generateTrialBalance: generateTrialBalanceFn,
        generateBalanceSheet: generateBalanceSheetFn,
        generateProfitAndLoss: generateProfitAndLossFn,
        generateGeneralLedgers: generateGeneralLedgersFn,
        filters,
        setFilters,
        loading,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
}
