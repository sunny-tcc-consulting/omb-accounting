/**
 * Bank Matcher - Auto-matching algorithm
 * Part of Phase 4.6: Bank Reconciliation
 */

import { BankTransaction, JournalEntry, Invoice } from "@/types";
import {
  getUnmatchedBankTransactions,
  getBankTransactionById,
  matchBankTransaction,
} from "./bank-service";
import { getAllJournalEntries } from "@/lib/journal-entries";
import { getAllInvoices } from "@/lib/invoices";

/**
 * Confidence score for matching (0-100)
 */
type ConfidenceScore = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Match result
 */
interface MatchResult {
  bankTransactionId: string;
  bookTransactionId: string | null;
  confidence: ConfidenceScore;
  reason: string;
}

/**
 * Calculate confidence score based on matching criteria
 */
const calculateConfidence = (
  amountMatch: boolean,
  dateMatch: boolean,
  descriptionMatch: boolean,
): ConfidenceScore => {
  let score = 0;

  if (amountMatch) score++;
  if (dateMatch) score++;
  if (descriptionMatch) score++;

  // Return score based on combination
  if (score === 0) return 0;
  if (score === 1) return 1;
  if (score === 2) return 3;
  if (score === 3) return 5;

  return 0; // Should not reach here
};

/**
 * Check if amounts match (with tolerance)
 */
const amountMatches = (bankAmount: number, bookAmount: number): boolean => {
  const tolerance = 0.01; // 1 cent tolerance
  return Math.abs(bankAmount - bookAmount) <= tolerance;
};

/**
 * Check if dates match (within 2 days)
 */
const dateMatches = (bankDate: Date, bookDate: Date): boolean => {
  const diffTime = Math.abs(bookDate.getTime() - bankDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 2;
};

/**
 * Check if descriptions match (fuzzy match)
 */
const descriptionMatches = (
  bankDescription: string,
  bookDescription: string,
): boolean => {
  if (!bankDescription || !bookDescription) return false;

  const bankLower = bankDescription.toLowerCase();
  const bookLower = bookDescription.toLowerCase();

  // Check for direct match
  if (bankLower === bookLower) return true;

  // Check for common variations
  const variations = [
    bankLower.replace(/\s+/g, ""),
    bookLower.replace(/\s+/g, ""),
    bankLower.replace(/[^a-z0-9]/g, ""),
    bookLower.replace(/[^a-z0-9]/g, ""),
  ];

  return variations.some((v) => v === bankLower || v === bookLower);
};

/**
 * Find matching book transaction
 */
const findMatch = (
  bankTxn: BankTransaction,
  bookEntries: JournalEntry[],
  invoices: Invoice[],
): MatchResult => {
  let bestMatch: MatchResult = {
    bankTransactionId: bankTxn.id,
    bookTransactionId: null,
    confidence: 0,
    reason: "No match found",
  };

  // Check against journal entries
  for (const entry of bookEntries) {
    const amountMatch = amountMatches(bankTxn.amount, entry.amount);
    const dateMatch = dateMatches(bankTxn.transactionDate, entry.date);
    const descriptionMatch = descriptionMatches(
      bankTxn.description,
      entry.description || "",
    );

    const confidence = calculateConfidence(
      amountMatch,
      dateMatch,
      descriptionMatch,
    );

    if (confidence > bestMatch.confidence) {
      bestMatch = {
        bankTransactionId: bankTxn.id,
        bookTransactionId: entry.id,
        confidence: confidence as ConfidenceScore,
        reason: `Journal entry match: ${descriptionMatch ? "description" : ""}${amountMatch ? ", amount" : ""}${dateMatch ? ", date" : ""}`,
      };
    }
  }

  // Check against invoices (for income transactions)
  if (bankTxn.type === "credit") {
    for (const invoice of invoices) {
      const amountMatch = amountMatches(bankTxn.amount, invoice.total);
      const dateMatch = dateMatches(
        bankTxn.transactionDate,
        invoice.dueDate || invoice.issuedDate,
      );
      const descriptionMatch = descriptionMatches(
        bankTxn.description,
        invoice.invoiceNumber || "",
      );

      const confidence = calculateConfidence(
        amountMatch,
        dateMatch,
        descriptionMatch,
      );

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          bankTransactionId: bankTxn.id,
          bookTransactionId: invoice.id,
          confidence: confidence as ConfidenceScore,
          reason: `Invoice match: ${descriptionMatch ? "invoice number" : ""}${amountMatch ? ", amount" : ""}${dateMatch ? ", date" : ""}`,
        };
      }
    }
  }

  return bestMatch;
};

/**
 * Run auto-matching for all unmatched transactions
 */
export const runAutoMatching = (): {
  matchedCount: number;
  totalProcessed: number;
  matches: MatchResult[];
} => {
  const unmatchedTxns = getUnmatchedBankTransactions();
  const bookEntries = getAllJournalEntries();
  const invoices = getAllInvoices();

  const matches: MatchResult[] = [];
  let matchedCount = 0;

  for (const bankTxn of unmatchedTxns) {
    const match = findMatch(bankTxn, bookEntries, invoices);

    if (match.bookTransactionId && match.confidence >= 3) {
      // Auto-match with high confidence
      matchBankTransaction(bankTxn.id, match.bookTransactionId);
      matchedCount++;
      matches.push(match);
    }
  }

  return {
    matchedCount,
    totalProcessed: unmatchedTxns.length,
    matches,
  };
};

/**
 * Get matching recommendations for a specific transaction
 */
export const getMatchingRecommendations = (
  bankTransactionId: string,
): MatchResult[] => {
  const bankTxn = getBankTransactionById(bankTransactionId);
  if (!bankTxn) {
    return [];
  }

  const bookEntries = getAllJournalEntries();
  const invoices = getAllInvoices();
  const recommendations: MatchResult[] = [];

  // Check against journal entries
  for (const entry of bookEntries) {
    const amountMatch = amountMatches(bankTxn.amount, entry.amount);
    const dateMatch = dateMatches(bankTxn.transactionDate, entry.date);
    const descriptionMatch = descriptionMatches(
      bankTxn.description,
      entry.description || "",
    );

    const confidence = calculateConfidence(
      amountMatch,
      dateMatch,
      descriptionMatch,
    );

    if (confidence >= 1) {
      recommendations.push({
        bankTransactionId: bankTxn.id,
        bookTransactionId: entry.id,
        confidence: confidence as ConfidenceScore,
        reason: `Journal entry match: ${descriptionMatch ? "description" : ""}${amountMatch ? ", amount" : ""}${dateMatch ? ", date" : ""}`,
      });
    }
  }

  // Check against invoices (for income transactions)
  if (bankTxn.type === "credit") {
    for (const invoice of invoices) {
      const amountMatch = amountMatches(bankTxn.amount, invoice.total);
      const dateMatch = dateMatches(
        bankTxn.transactionDate,
        invoice.dueDate || invoice.issuedDate,
      );
      const descriptionMatch = descriptionMatches(
        bankTxn.description,
        invoice.invoiceNumber || "",
      );

      const confidence = calculateConfidence(
        amountMatch,
        dateMatch,
        descriptionMatch,
      );

      if (confidence >= 1) {
        recommendations.push({
          bankTransactionId: bankTxn.id,
          bookTransactionId: invoice.id,
          confidence: confidence as ConfidenceScore,
          reason: `Invoice match: ${descriptionMatch ? "invoice number" : ""}${amountMatch ? ", amount" : ""}${dateMatch ? ", date" : ""}`,
        });
      }
    }
  }

  // Sort by confidence
  recommendations.sort((a, b) => b.confidence - a.confidence);

  return recommendations;
};
