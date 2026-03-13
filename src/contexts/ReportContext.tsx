"use client";

import React, { createContext, useContext, useState } from "react";
import {
  Account,
  JournalEntry,
  BalanceSheet,
  ProfitAndLoss,
  TrialBalance,
  GeneralLedger,
  CashFlowStatement,
  ReportFilters,
} from "@/types/report";
import {
  generateTrialBalance,
  generateBalanceSheet,
  generateProfitAndLoss,
  generateAllGeneralLedgers,
  generateCashFlowStatement,
} from "@/lib/report-generator";
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
  generateGeneralLedgers: (startDate?: Date, endDate?: Date) => GeneralLedger[];
  generateCashFlowStatement: (
    startDate: Date,
    endDate: Date,
  ) => CashFlowStatement;

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data from API on mount
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch accounts from API
      const accountsRes = await fetch("/api/bank/accounts");
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        // Convert API accounts to Report Accounts format
        const reportAccounts: Account[] = (accountsData.accounts || []).map(
          (acc: any) => ({
            id: acc.id,
            code: acc.account_number || `ACC-${acc.id}`,
            name: acc.name,
            type: "asset",
            category: "bank",
            isSubAccount: false,
            balance: acc.balance || 0,
            currency: acc.currency || "CNY",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
        setAccounts(reportAccounts);
      } else {
        setAccounts([]);
      }

      // Fetch journal entries from API (if available)
      // For now, initialize as empty array
      setJournalEntries([]);
      setTransactions([]);
    } catch (error) {
      console.error("Failed to load report data:", error);
      setAccounts([]);
      setJournalEntries([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

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

  const generateGeneralLedgersFn = (
    startDate?: Date,
    endDate?: Date,
  ): GeneralLedger[] => {
    setLoading(true);
    try {
      return generateAllGeneralLedgers(accounts, journalEntries, {
        startDate,
        endDate,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCashFlowStatementFn = (
    startDate: Date,
    endDate: Date,
  ): CashFlowStatement => {
    setLoading(true);
    try {
      return generateCashFlowStatement(
        accounts,
        journalEntries,
        startDate,
        endDate,
      );
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
        generateCashFlowStatement: generateCashFlowStatementFn,
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
