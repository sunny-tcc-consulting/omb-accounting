/**
 * PDF Generator for Audit Reports
 * Generates professional PDF documents for Trial Balance, Balance Sheet, P&L, and General Ledger
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TrialBalance,
  BalanceSheet,
  ProfitAndLoss,
  GeneralLedger,
  ReportConfig,
} from "@/types/report";
import { format } from "date-fns";

// =============================================================================
// CHINESE FONT SUPPORT
// =============================================================================

// Load Noto Sans TC font for Chinese character support
let chineseFontData: string | null = null;

async function loadChineseFont(): Promise<string> {
  if (chineseFontData) return chineseFontData;

  try {
    const response = await fetch("/fonts/noto-sans-tc-regular.woff");
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    chineseFontData = `data:font/woff2;base64,${base64}`;
    return chineseFontData!;
  } catch (error) {
    console.error("Failed to load Chinese font:", error);
    return "";
  }
}

// Register font with jsPDF
async function registerChineseFont(doc: jsPDF): Promise<void> {
  try {
    const fontData = await loadChineseFont();
    if (fontData) {
      doc.addFileToVFS("NotoSansTC-Regular.ttf", fontData.split(",")[1]);
      doc.addFont("NotoSansTC-Regular.ttf", "NotoSansTC", "normal");
      doc.setFont("NotoSansTC");
    }
  } catch (error) {
    console.error("Failed to register Chinese font:", error);
  }
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  primary: [51, 51, 51], // Dark gray for headings
  secondary: [128, 128, 128], // Medium gray for subheadings
  text: [0, 0, 0], // Black for body text
  border: [200, 200, 200], // Light gray for borders
  headerBg: [245, 245, 245], // Very light gray for table headers
  totalRowBg: [250, 250, 250], // Background for total rows
};

// =============================================================================
// BASE PDF CLASS
// =============================================================================

abstract class ReportPDF {
  protected doc: jsPDF;
  protected config: ReportConfig;
  protected yPosition: number = 0;
  protected pageNumber: number = 1;
  protected totalPages: number = 1;

  constructor(config: ReportConfig) {
    this.config = config;
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Register Chinese font for CJK support
    registerChineseFont(this.doc);

    this.addFooter();
  }

  /**
   * Add footer with page number and company info
   */
  protected addFooter(): void {
    const pageCount = this.doc.internal.pages.length - 1;
    this.totalPages = pageCount;

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(9);
      this.doc.setTextColor(128, 128, 128);

      // Page number
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        PAGE_WIDTH / 2,
        PAGE_HEIGHT - 10,
        { align: "center" },
      );

      // Company name and print date
      this.doc.text(
        `Prepared by ${this.config.preparedBy} | ${format(this.config.printDate, "yyyy-MM-dd")}`,
        PAGE_WIDTH / 2,
        PAGE_HEIGHT - 5,
        { align: "center" },
      );
    }
  }

  /**
   * Add company header
   */
  protected addHeader(title: string, subtitle: string = ""): void {
    // Company name (bold)
    this.doc.setFontSize(16);
    this.doc.setTextColor(
      COLORS.primary[0],
      COLORS.primary[1],
      COLORS.primary[2],
    );
    this.doc.setFont("helvetica", "bold");
    this.doc.text(this.config.companyName, MARGIN, 25);

    // Report title
    this.doc.setFontSize(14);
    this.doc.setTextColor(
      COLORS.primary[0],
      COLORS.primary[1],
      COLORS.primary[2],
    );
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, MARGIN, 35);

    // Subtitle (if provided)
    if (subtitle) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(
        COLORS.secondary[0],
        COLORS.secondary[1],
        COLORS.secondary[2],
      );
      this.doc.setFont("helvetica", "normal");
      this.doc.text(subtitle, MARGIN, 42);
    }

    // Tax ID and prepared info
    this.doc.setFontSize(9);
    this.doc.setTextColor(
      COLORS.secondary[0],
      COLORS.secondary[1],
      COLORS.secondary[2],
    );
    this.doc.setFont("helvetica", "normal");

    if (this.config.taxId) {
      this.doc.text(`Tax ID: ${this.config.taxId}`, MARGIN, 52);
    }

    // Prepared by and date
    this.doc.text(
      `Prepared by: ${this.config.preparedBy} ${this.config.approvedBy ? `| Approved by: ${this.config.approvedBy}` : ""}`,
      MARGIN,
      58,
    );
    this.doc.text(
      `Print Date: ${format(this.config.printDate, "MMMM dd, yyyy")}`,
      MARGIN,
      64,
    );

    // Horizontal line
    this.doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    this.doc.line(MARGIN, 70, PAGE_WIDTH - MARGIN, 70);

    this.yPosition = 80;
  }

  /**
   * Check if we need a new page
   */
  protected checkNewPage(neededSpace: number = 20): void {
    if (this.yPosition + neededSpace > PAGE_HEIGHT - 20) {
      this.doc.addPage();
      this.pageNumber++;
      this.yPosition = 20;
    }
  }

  /**
   * Add section title
   */
  protected addSectionTitle(title: string): void {
    this.checkNewPage(15);
    this.doc.setFontSize(12);
    this.doc.setTextColor(
      COLORS.primary[0],
      COLORS.primary[1],
      COLORS.primary[2],
    );
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, MARGIN, this.yPosition);
    this.yPosition += 8;
  }

  /**
   * Format currency
   */
  protected formatCurrency(amount: number): string {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absAmount);

    return amount < 0 ? `(${formatted})` : formatted.toString();
  }

  /**
   * Add total line
   */
  protected addTotalLine(
    label: string,
    amount: number,
    isBold: boolean = true,
  ): void {
    this.doc.setFontSize(10);
    this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    this.doc.setFont("helvetica", isBold ? "bold" : "normal");
    this.doc.text(label, MARGIN + CONTENT_WIDTH - 50, this.yPosition);
    this.doc.text(
      this.formatCurrency(amount),
      PAGE_WIDTH - MARGIN,
      this.yPosition,
      {
        align: "right",
      },
    );
    this.yPosition += 7;
  }

  /**
   * Add horizontal line
   */
  protected addLine(): void {
    this.doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    this.doc.line(MARGIN, this.yPosition, PAGE_WIDTH - MARGIN, this.yPosition);
    this.yPosition += 5;
  }

  /**
   * Save the PDF
   */
  public save(filename: string): void {
    this.doc.save(filename);
  }

  /**
   * Get the PDF as blob
   */
  public getBlob(): Blob {
    return this.doc.output("blob");
  }

  /**
   * Abstract method to generate the report
   */
  abstract generate(): void;
}

// =============================================================================
// TRIAL BALANCE PDF
// =============================================================================

export class TrialBalancePDF extends ReportPDF {
  private trialBalance: TrialBalance;

  constructor(trialBalance: TrialBalance, config: ReportConfig) {
    super(config);
    this.trialBalance = trialBalance;
  }

  generate(): void {
    this.addHeader(
      "Trial Balance",
      `As of ${format(this.trialBalance.reportDate, "MMMM dd, yyyy")}`,
    );

    // Table
    autoTable(this.doc, {
      startY: this.yPosition,
      head: [["Account Code", "Account Name", "Debit", "Credit"]],
      body: this.trialBalance.accounts.map((item) => [
        item.account.code,
        item.account.name,
        item.debitBalance > 0 ? this.formatCurrency(item.debitBalance) : "",
        item.creditBalance > 0 ? this.formatCurrency(item.creditBalance) : "",
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        font: "NotoSansTC",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        font: "NotoSansTC",
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 35, halign: "right" },
        3: { cellWidth: 35, halign: "right" },
      },
      foot: [
        [
          "",
          "TOTAL",
          this.formatCurrency(this.trialBalance.totals.totalDebit),
          this.formatCurrency(this.trialBalance.totals.totalCredit),
        ],
      ],
      footStyles: {
        fillColor: [
          COLORS.totalRowBg[0],
          COLORS.totalRowBg[1],
          COLORS.totalRowBg[2],
        ],
        fontStyle: "bold",
        font: "NotoSansTC",
      },
    });

    this.yPosition =
      (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;

    // Balance status
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    if (this.trialBalance.totals.isBalanced) {
      this.doc.setTextColor(34, 139, 34); // Green for balanced
      this.doc.text("✓ BALANCED", MARGIN, this.yPosition);
    } else {
      this.doc.setTextColor(220, 53, 69); // Red for unbalanced
      this.doc.text("✗ UNBALANCED", MARGIN, this.yPosition);
    }
  }
}

// =============================================================================
// BALANCE SHEET PDF
// =============================================================================

export class BalanceSheetPDF extends ReportPDF {
  private balanceSheet: BalanceSheet;

  constructor(balanceSheet: BalanceSheet, config: ReportConfig) {
    super(config);
    this.balanceSheet = balanceSheet;
  }

  generate(): void {
    this.addHeader(
      "Balance Sheet",
      `As of ${format(this.balanceSheet.reportDate, "MMMM dd, yyyy")}`,
    );

    // ASSETS SECTION
    this.addSectionTitle("ASSETS");

    // Current Assets
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Current Assets", MARGIN, this.yPosition);
    this.yPosition += 5;

    this.balanceSheet.assets.currentAssets.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        this.formatCurrency(account.balance),
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine(
      "Total Current Assets",
      this.balanceSheet.assets.totalAssets,
    );

    // Non-Current Assets
    this.checkNewPage(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Non-Current Assets", MARGIN, this.yPosition);
    this.yPosition += 5;

    this.balanceSheet.assets.nonCurrentAssets.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        this.formatCurrency(account.balance),
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine(
      "Total Non-Current Assets",
      this.balanceSheet.assets.totalAssets -
        this.balanceSheet.assets.currentAssets.reduce(
          (sum, a) => sum + a.balance,
          0,
        ),
    );
    this.addLine();
    this.addTotalLine(
      "TOTAL ASSETS",
      this.balanceSheet.assets.totalAssets,
      true,
    );

    this.yPosition += 10;

    // LIABILITIES SECTION
    this.checkNewPage(30);
    this.addSectionTitle("LIABILITIES");

    // Current Liabilities
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Current Liabilities", MARGIN, this.yPosition);
    this.yPosition += 5;

    this.balanceSheet.liabilities.currentLiabilities.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        this.formatCurrency(Math.abs(account.balance)),
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine(
      "Total Current Liabilities",
      this.balanceSheet.liabilities.totalLiabilities,
    );

    // Non-Current Liabilities
    this.checkNewPage(15);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Long-Term Liabilities", MARGIN, this.yPosition);
    this.yPosition += 5;

    this.balanceSheet.liabilities.nonCurrentLiabilities.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        this.formatCurrency(Math.abs(account.balance)),
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine(
      "Total Liabilities",
      this.balanceSheet.liabilities.totalLiabilities,
    );
    this.yPosition += 10;

    // EQUITY SECTION
    this.checkNewPage(25);
    this.addSectionTitle("EQUITY");

    this.balanceSheet.equity.items.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        this.formatCurrency(account.balance),
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine("Total Equity", this.balanceSheet.equity.totalEquity);
    this.addLine();

    // TOTAL LIABILITIES AND EQUITY
    this.addTotalLine(
      "TOTAL LIABILITIES AND EQUITY",
      this.balanceSheet.totalLiabilitiesAndEquity,
      true,
    );
    this.yPosition += 10;

    // BALANCE VERIFICATION
    this.checkNewPage(10);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    if (this.balanceSheet.isBalanced) {
      this.doc.setTextColor(34, 139, 34);
      this.doc.text(
        "✓ BALANCED: Assets = Liabilities + Equity",
        MARGIN,
        this.yPosition,
      );
    } else {
      this.doc.setTextColor(220, 53, 69);
      this.doc.text(
        `✗ UNBALANCED: Difference = ${this.formatCurrency(this.balanceSheet.assets.totalAssets - this.balanceSheet.totalLiabilitiesAndEquity)}`,
        MARGIN,
        this.yPosition,
      );
    }
  }
}

// =============================================================================
// PROFIT AND LOSS PDF
// =============================================================================

export class ProfitAndLossPDF extends ReportPDF {
  private profitAndLoss: ProfitAndLoss;

  constructor(profitAndLoss: ProfitAndLoss, config: ReportConfig) {
    super(config);
    this.profitAndLoss = profitAndLoss;
  }

  generate(): void {
    const startDate = format(this.profitAndLoss.startDate, "MMMM dd, yyyy");
    const endDate = format(this.profitAndLoss.endDate, "MMMM dd, yyyy");

    this.addHeader(
      "Statement of Profit and Loss",
      `${startDate} to ${endDate}`,
    );

    // REVENUE SECTION
    this.addSectionTitle("REVENUE");

    this.profitAndLoss.revenue.items.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        this.formatCurrency(account.balance),
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine("Total Revenue", this.profitAndLoss.revenue.total);
    this.yPosition += 5;

    // COST OF GOODS SOLD
    this.checkNewPage(15);
    this.addSectionTitle("Cost of Goods Sold");

    this.profitAndLoss.costOfGoodsSold.items.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        this.formatCurrency(account.balance),
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine(
      "Total Cost of Goods Sold",
      this.profitAndLoss.costOfGoodsSold.total,
    );
    this.addLine();
    this.addTotalLine("GROSS PROFIT", this.profitAndLoss.grossProfit, true);
    this.yPosition += 10;

    // OPERATING EXPENSES
    this.checkNewPage(25);
    this.addSectionTitle("Operating Expenses");

    this.profitAndLoss.operatingExpenses.items.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        this.formatCurrency(account.balance),
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine(
      "Total Operating Expenses",
      this.profitAndLoss.operatingExpenses.total,
    );
    this.addLine();
    this.addTotalLine(
      "OPERATING INCOME",
      this.profitAndLoss.operatingIncome,
      true,
    );
    this.yPosition += 10;

    // OTHER INCOME AND EXPENSES
    this.checkNewPage(20);
    this.addSectionTitle("Other Income and Expenses");

    this.profitAndLoss.otherIncome.items.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        `+${this.formatCurrency(account.balance)}`,
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.profitAndLoss.otherExpenses.items.forEach((account) => {
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `  ${account.code}  ${account.name}`,
        MARGIN,
        this.yPosition,
      );
      this.doc.text(
        `-${this.formatCurrency(account.balance)}`,
        PAGE_WIDTH - MARGIN,
        this.yPosition,
        { align: "right" },
      );
      this.yPosition += 5;
    });

    this.addTotalLine("Income Before Tax", this.profitAndLoss.incomeBeforeTax);
    this.addLine();

    // TAX AND NET INCOME
    this.addTotalLine("Income Tax (25%)", this.profitAndLoss.incomeTax);
    this.addLine();
    this.addTotalLine("NET INCOME", this.profitAndLoss.netIncome, true);
  }
}

// =============================================================================
// GENERAL LEDGER PDF
// =============================================================================

export class GeneralLedgerPDF extends ReportPDF {
  private generalLedger: GeneralLedger;

  constructor(generalLedger: GeneralLedger, config: ReportConfig) {
    super(config);
    this.generalLedger = generalLedger;
  }

  generate(): void {
    const account = this.generalLedger.account;
    const startDate = format(
      this.generalLedger.transactions[0]?.date || new Date(),
      "MMMM dd, yyyy",
    );
    const endDate = format(
      this.generalLedger.transactions[
        this.generalLedger.transactions.length - 1
      ]?.date || new Date(),
      "MMMM dd, yyyy",
    );

    this.addHeader(
      `General Ledger - ${account.code}: ${account.name}`,
      `${startDate} to ${endDate}`,
    );

    // Account summary
    this.doc.setFontSize(10);
    this.doc.setTextColor(
      COLORS.secondary[0],
      COLORS.secondary[1],
      COLORS.secondary[2],
    );
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `Account Type: ${account.type.toUpperCase()}`,
      MARGIN,
      this.yPosition,
    );
    this.yPosition += 5;
    this.doc.text(`Category: ${account.category}`, MARGIN, this.yPosition);
    this.yPosition += 10;

    // Opening balance
    this.doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Opening Balance:", MARGIN, this.yPosition);
    this.doc.text(
      this.formatCurrency(this.generalLedger.openingBalance),
      PAGE_WIDTH - MARGIN,
      this.yPosition,
      { align: "right" },
    );
    this.yPosition += 10;

    // Transactions table
    autoTable(this.doc, {
      startY: this.yPosition,
      head: [["Date", "Description", "Debit", "Credit", "Balance"]],
      body: this.generalLedger.transactions.map((t) => [
        format(t.date, "yyyy-MM-dd"),
        t.description.substring(0, 40),
        t.debit > 0 ? this.formatCurrency(t.debit) : "",
        t.credit > 0 ? this.formatCurrency(t.credit) : "",
        this.formatCurrency(t.balance),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        font: "NotoSansTC",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        font: "NotoSansTC",
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
    });

    this.yPosition =
      (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;

    // Closing balance
    this.addLine();
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Closing Balance:", MARGIN, this.yPosition);
    this.doc.text(
      this.formatCurrency(this.generalLedger.closingBalance),
      PAGE_WIDTH - MARGIN,
      this.yPosition,
      { align: "right" },
    );
  }
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Generate PDF configuration
 */
export function getReportConfig(): ReportConfig {
  return {
    companyName: "OMB Accounting",
    companyAddress: "",
    taxId: "",
    reportTitle: "Financial Statement",
    preparedBy: "OMB Accounting System",
    approvedBy: "",
    printDate: new Date(),
  };
}

/**
 * Export Trial Balance to PDF
 */
export function exportTrialBalanceToPDF(
  trialBalance: TrialBalance,
  filename: string = `trial-balance-${format(new Date(), "yyyy-MM-dd")}.pdf`,
): void {
  const config = getReportConfig();
  const pdf = new TrialBalancePDF(trialBalance, config);
  pdf.generate();
  pdf.save(filename);
}

/**
 * Export Balance Sheet to PDF
 */
export function exportBalanceSheetToPDF(
  balanceSheet: BalanceSheet,
  filename: string = `balance-sheet-${format(new Date(), "yyyy-MM-dd")}.pdf`,
): void {
  const config = getReportConfig();
  const pdf = new BalanceSheetPDF(balanceSheet, config);
  pdf.generate();
  pdf.save(filename);
}

/**
 * Export Profit and Loss to PDF
 */
export function exportProfitAndLossToPDF(
  profitAndLoss: ProfitAndLoss,
  filename: string = `profit-and-loss-${format(new Date(), "yyyy-MM-dd")}.pdf`,
): void {
  const config = getReportConfig();
  const pdf = new ProfitAndLossPDF(profitAndLoss, config);
  pdf.generate();
  pdf.save(filename);
}

/**
 * Export General Ledger to PDF
 */
export function exportGeneralLedgerToPDF(
  generalLedger: GeneralLedger,
  filename: string = `general-ledger-${format(new Date(), "yyyy-MM-dd")}.pdf`,
): void {
  const config = getReportConfig();
  const pdf = new GeneralLedgerPDF(generalLedger, config);
  pdf.generate();
  pdf.save(filename);
}
