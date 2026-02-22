/**
 * Bank Import Service - CSV/QIF/OFX Import
 * Part of Phase 4.6: Bank Reconciliation
 */

import { BankStatement, BankTransaction } from "@/types";
import {
  createBankStatement,
  createBankTransaction,
  getBankAccountById,
} from "./bank-service";

/**
 * Parse CSV file
 */
export const parseCSV = (
  content: string,
): Array<{
  date: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
}> => {
  const lines = content.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  // Find column indices
  const dateIdx = headers.findIndex((h) => h.includes("date"));
  const descIdx = headers.findIndex(
    (h) => h.includes("description") || h.includes("description"),
  );
  const amountIdx = headers.findIndex((h) => h.includes("amount"));

  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
    throw new Error("CSV must have date, description, and amount columns");
  }

  const transactions: Array<{
    date: Date;
    description: string;
    amount: number;
    type: "debit" | "credit";
  }> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const dateStr = values[dateIdx];
    const desc = values[descIdx];
    const amount = parseFloat(values[amountIdx]) || 0;

    // Parse date (try multiple formats)
    let date: Date;
    try {
      date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch {
      date = new Date(); // Fallback to today
    }

    // Determine type (negative = debit, positive = credit)
    const type = amount < 0 ? "debit" : "credit";

    transactions.push({
      date,
      description: desc || "Unknown",
      amount: Math.abs(amount),
      type,
    });
  }

  return transactions;
};

/**
 * Parse QIF file
 */
export const parseQIF = (
  content: string,
): Array<{
  date: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
}> => {
  const transactions: Array<{
    date: Date;
    description: string;
    amount: number;
    type: "debit" | "credit";
  }> = [];

  const lines = content.split("\n");
  let currentTransaction: {
    date: Date;
    description: string;
    amount: number;
    type: "debit" | "credit";
  } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("D")) {
      // Date line
      const dateStr = trimmed.substring(1).trim();
      currentTransaction = {
        date: new Date(dateStr),
        description: "",
        amount: 0,
        type: "credit", // QIF default
      };
    } else if (trimmed.startsWith("T")) {
      // Amount line
      if (currentTransaction) {
        const amount = parseFloat(trimmed.substring(1)) || 0;
        currentTransaction.amount = Math.abs(amount);
        currentTransaction.type = amount < 0 ? "debit" : "credit";
      }
    } else if (trimmed.startsWith("N")) {
      // Transaction number (ignored)
    } else if (trimmed.startsWith("^")) {
      // End of transaction
      if (currentTransaction && currentTransaction.amount > 0) {
        transactions.push(currentTransaction);
      }
      currentTransaction = null;
    } else if (trimmed.startsWith("P")) {
      // Payee/Description line
      if (currentTransaction) {
        currentTransaction.description = trimmed.substring(1).trim();
      }
    }
  }

  return transactions;
};

/**
 * Parse OFX file
 */
export const parseOFX = (
  content: string,
): Array<{
  date: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
}> => {
  const transactions: Array<{
    date: Date;
    description: string;
    amount: number;
    type: "debit" | "credit";
  }> = [];

  // Extract transaction data (simplified OFX parsing)
  const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  let match;

  while ((match = transactionRegex.exec(content)) !== null) {
    const txnData = match[1];

    // Extract date
    const dateMatch = txnData.match(/DTPOSTED:([^<]+)/);
    const dateStr = dateMatch ? dateMatch[1].trim() : "";

    // Extract amount
    const amountMatch = txnData.match(/TRNAMT:([^<]+)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    // Extract description
    const descMatch = txnData.match(/MEMO:([^<]*)/);
    const description = descMatch ? descMatch[1].trim() : "";

    if (dateStr && amount !== 0) {
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const type = amount < 0 ? "debit" : "credit";
          transactions.push({
            date,
            description: description || "Unknown",
            amount: Math.abs(amount),
            type,
          });
        }
      } catch (error) {
        console.error("Error parsing OFX date:", error);
      }
    }
  }

  return transactions;
};

/**
 * Import bank statement from file
 */
export const importBankStatement = async (
  bankAccountId: string,
  file: File,
  fileType: "csv" | "qif" | "ofx",
): Promise<{
  statement: BankStatement;
  transactions: BankTransaction[];
  importedCount: number;
}> => {
  try {
    const bankAccount = getBankAccountById(bankAccountId);
    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    // Read file content
    const content = await file.text();

    // Parse file based on type
    let transactions: Array<{
      date: Date;
      description: string;
      amount: number;
      type: "debit" | "credit";
    }>;

    switch (fileType) {
      case "csv":
        transactions = parseCSV(content);
        break;
      case "qif":
        transactions = parseQIF(content);
        break;
      case "ofx":
        transactions = parseOFX(content);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (transactions.length === 0) {
      throw new Error("No transactions found in file");
    }

    // Generate statement number
    const statementNumber = `STMT-${bankAccountId.slice(-6)}-${Date.now().toString().slice(-4)}`;

    // Create statement
    const startDate = new Date(
      Math.min(...transactions.map((t) => t.date.getTime())),
    );
    const endDate = new Date(
      Math.max(...transactions.map((t) => t.date.getTime())),
    );
    const closingBalance = bankAccount.balance;

    const statement = createBankStatement({
      bankAccountId,
      statementNumber,
      startDate,
      endDate,
      closingBalance,
      currency: bankAccount.currency,
    });

    // Create transactions
    const createdTransactions: BankTransaction[] = [];

    for (const txn of transactions) {
      const bankTxn = createBankTransaction({
        statementId: statement.id,
        transactionDate: txn.date,
        description: txn.description,
        amount: txn.amount,
        type: txn.type,
      });
      createdTransactions.push(bankTxn);
    }

    return {
      statement,
      transactions: createdTransactions,
      importedCount: createdTransactions.length,
    };
  } catch (error) {
    console.error("Error importing bank statement:", error);
    throw error;
  }
};

/**
 * Validate bank statement import
 */
export const validateBankStatement = (
  file: File,
  fileType: "csv" | "qif" | "ofx",
): {
  isValid: boolean;
  transactionCount: number;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check file type
  if (!fileType) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      fileType = "csv";
    } else if (ext === "qif") {
      fileType = "qif";
    } else if (ext === "ofx") {
      fileType = "ofx";
    } else {
      errors.push(
        "Unsupported file format. Please upload CSV, QIF, or OFX file.",
      );
      return { isValid: false, transactionCount: 0, errors };
    }
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    errors.push("File size exceeds 10MB limit.");
    return { isValid: false, transactionCount: 0, errors };
  }

  return { isValid: true, transactionCount: 0, errors };
};
