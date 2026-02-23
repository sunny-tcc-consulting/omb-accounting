/**
 * Reconciliation Service - Reconciliation calculations
 * Part of Phase 4.6: Bank Reconciliation
 */

import { BankStatement, BankTransaction } from "@/types";
import {
  getBankStatementById,
  getBankTransactionsByStatementId,
  getBankAccountById,
  getBankStatementsByAccountId,
} from "./bank-service";

/**
 * Calculate reconciliation difference
 */
export const calculateReconciliationDifference = (
  statement: BankStatement,
  transactions: BankTransaction[],
): number => {
  // Calculate total debits
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate total credits
  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate expected closing balance
  // Opening balance + total credits - total debits
  const expectedBalance = statement.closingBalance + totalCredits - totalDebits;

  // Calculate difference
  const difference = expectedBalance - statement.closingBalance;

  return difference;
};

/**
 * Get reconciliation summary
 */
export const getReconciliationSummary = (
  statementId: string,
): {
  totalTransactions: number;
  totalDebits: number;
  totalCredits: number;
  matchedCount: number;
  unmatchedCount: number;
  difference: number;
  isReconciled: boolean;
} => {
  const statement = getBankStatementById(statementId);
  if (!statement) {
    throw new Error("Bank statement not found");
  }

  const transactions = getBankTransactionsByStatementId(statementId);

  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const matchedCount = transactions.filter(
    (t) => t.status === "matched",
  ).length;
  const unmatchedCount = transactions.filter(
    (t) => t.status === "pending",
  ).length;

  const difference = calculateReconciliationDifference(statement, transactions);

  const isReconciled = Math.abs(difference) < 0.01; // Considered reconciled if difference is less than 1 cent

  return {
    totalTransactions: transactions.length,
    totalDebits,
    totalCredits,
    matchedCount,
    unmatchedCount,
    difference,
    isReconciled,
  };
};

/**
 * Get reconciliation items (matched and unmatched)
 */
export const getReconciliationItems = (
  statementId: string,
): {
  matched: BankTransaction[];
  unmatched: BankTransaction[];
} => {
  const transactions = getBankTransactionsByStatementId(statementId);

  return {
    matched: transactions.filter((t) => t.status === "matched"),
    unmatched: transactions.filter((t) => t.status === "pending"),
  };
};

/**
 * Mark statement as reconciled
 */
export const markStatementReconciled = (statementId: string): boolean => {
  const statement = getBankStatementById(statementId);
  if (!statement) {
    return false;
  }

  const summary = getReconciliationSummary(statementId);

  if (summary.isReconciled) {
    statement.status = "reconciled";
    statement.reconciledAt = new Date();

    return true;
  }

  return false;
};

/**
 * Get reconciliation history
 */
export const getReconciliationHistory = (
  bankAccountId: string,
): {
  statementId: string;
  statementNumber: string;
  importedAt: Date;
  reconciledAt: Date | null;
  status: "imported" | "reconciled";
  matchedCount: number;
  unmatchedCount: number;
  difference: number;
}[] => {
  const statements = getBankStatementsByAccountId(bankAccountId);

  return statements.map((stmt: BankStatement) => {
    getBankTransactionsByStatementId(stmt.id);
    const summary = getReconciliationSummary(stmt.id);

    return {
      statementId: stmt.id,
      statementNumber: stmt.statementNumber,
      importedAt: stmt.importedAt,
      reconciledAt: stmt.reconciledAt,
      status: stmt.status,
      matchedCount: summary.matchedCount,
      unmatchedCount: summary.unmatchedCount,
      difference: summary.difference,
    };
  });
};

/**
 * Get opening and closing balance
 */
export const getBalanceRange = (
  statementId: string,
): {
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalDebits: number;
} => {
  const statement = getBankStatementById(statementId);
  if (!statement) {
    throw new Error("Bank statement not found");
  }

  const transactions = getBankTransactionsByStatementId(statementId);

  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const openingBalance = statement.closingBalance - totalCredits + totalDebits;

  return {
    openingBalance,
    closingBalance: statement.closingBalance,
    totalCredits,
    totalDebits,
  };
};

/**
 * Get reconciliation report
 */
export const generateReconciliationReport = (
  bankAccountId: string,
): {
  summary: {
    totalStatements: number;
    reconciledCount: number;
    unmatchedCount: number;
    totalTransactions: number;
    totalMatched: number;
    totalUnmatched: number;
  };
  statements: ReturnType<typeof getReconciliationHistory>;
  recommendations: string[];
} => {
  const history = getReconciliationHistory(bankAccountId);
  const bankAccount = getBankAccountById(bankAccountId);

  if (!bankAccount) {
    throw new Error("Bank account not found");
  }

  const reconciledCount = history.filter(
    (h) => h.status === "reconciled",
  ).length;
  const unmatchedCount = history.filter((h) => h.status === "imported").length;

  const totalStatements = history.length;
  const totalTransactions = history.reduce(
    (sum, h) => sum + h.matchedCount + h.unmatchedCount,
    0,
  );
  const totalMatched = history.reduce((sum, h) => sum + h.matchedCount, 0);
  const totalUnmatched = history.reduce((sum, h) => sum + h.unmatchedCount, 0);

  // Generate recommendations
  const recommendations: string[] = [];

  if (unmatchedCount > 0) {
    recommendations.push(
      `${unmatchedCount} statements have not been reconciled yet.`,
    );
  }

  const unmatchedTransactions = history
    .filter((h) => h.status === "imported")
    .flatMap((h) => Array(h.unmatchedCount).fill(h.statementNumber));

  if (unmatchedTransactions.length > 0) {
    recommendations.push(
      `Unmatched transactions found in statements: ${unmatchedTransactions.slice(0, 5).join(", ")}${unmatchedTransactions.length > 5 ? "..." : ""}`,
    );
  }

  if (reconciledCount < totalStatements) {
    recommendations.push(
      "Consider reconciling remaining statements to maintain accurate records.",
    );
  }

  if (totalUnmatched > 0) {
    recommendations.push(
      "Review unmatched transactions for potential matching opportunities.",
    );
  }

  return {
    summary: {
      totalStatements,
      reconciledCount,
      unmatchedCount,
      totalTransactions,
      totalMatched,
      totalUnmatched,
    },
    statements: history,
    recommendations,
  };
};
