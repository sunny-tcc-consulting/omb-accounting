"use client";

import React, { useState, useMemo } from "react";
import { ReportProvider, useReport } from "@/contexts/ReportContext";
import {
  generateTrialBalance,
  generateBalanceSheet,
  generateProfitAndLoss,
  generateAllGeneralLedgers,
  generateCashFlowStatement,
  formatCurrency,
} from "@/lib/report-generator";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TrialBalanceComparisonView,
  BalanceSheetComparisonView,
  ProfitAndLossComparisonView,
} from "@/components/reports/ComparativeReport";
import type {
  TrialBalanceComparison,
  BalanceSheetComparison,
  ProfitAndLossComparison,
  ComparisonPeriod,
} from "@/types/comparative-report";
import {
  generateTrialBalanceComparison,
  generateBalanceSheetComparison,
  generateProfitAndLossComparison,
} from "@/lib/comparative-report";
import {
  DateRangePicker,
  DatePicker,
} from "@/components/reports/DateRangePicker";
import { ErrorDisplay } from "@/components/reports/ErrorDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  FileText,
  Calendar,
  PieChart,
  TrendingUp,
  Printer,
  RefreshCw,
} from "lucide-react";

// =============================================================================
// REPORT PAGE COMPONENT
// =============================================================================

export function ReportPageContent() {
  const { accounts, journalEntries } = useReport();
  const [selectedReport, setSelectedReport] = useState<string>("trial-balance");
  const [asOfDate, setAsOfDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Comparison state
  const [isComparisonEnabled, setIsComparisonEnabled] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] =
    useState<ComparisonPeriod>("previous_month");

  // General Ledger date range state
  const [glStartDate, setGlStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 12))
      .toISOString()
      .split("T")[0],
  );
  const [glEndDate, setGlEndDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Error handling state
  const [error, setError] = useState<string | null>(null);

  // Error handler wrapper for report generation
  const handleError = (err: unknown, context: string) => {
    const message =
      err instanceof Error ? err.message : `Error generating ${context}`;
    setError(message);
    console.error(`Error in ${context}:`, err);
  };

  // Retry handler
  const handleRetry = () => {
    setError(null);
  };

  // Generate reports
  const trialBalance = useMemo(
    () => generateTrialBalance(accounts, journalEntries),
    [accounts, journalEntries],
  );

  const balanceSheet = useMemo(
    () => generateBalanceSheet(accounts, journalEntries, new Date(asOfDate)),
    [accounts, journalEntries, asOfDate],
  );

  const profitAndLoss = useMemo(
    () =>
      generateProfitAndLoss(
        accounts,
        journalEntries,
        new Date(startDate),
        new Date(endDate),
      ),
    [accounts, journalEntries, startDate, endDate],
  );

  const generalLedgers = useMemo(
    () =>
      generateAllGeneralLedgers(accounts, journalEntries, {
        startDate: new Date(glStartDate),
        endDate: new Date(glEndDate),
      }),
    [accounts, journalEntries, glStartDate, glEndDate],
  );

  const cashFlowStatement = useMemo(
    () =>
      generateCashFlowStatement(
        accounts,
        journalEntries,
        new Date(startDate),
        new Date(endDate),
      ),
    [accounts, journalEntries, startDate, endDate],
  );

  // Generate comparison data
  const comparisonData = useMemo(() => {
    if (!isComparisonEnabled) return null;

    switch (selectedReport) {
      case "trial-balance":
        return generateTrialBalanceComparison(
          trialBalance,
          accounts,
          comparisonPeriod,
          new Date(asOfDate),
        );
      case "balance-sheet":
        return generateBalanceSheetComparison(
          balanceSheet,
          accounts,
          comparisonPeriod,
          new Date(asOfDate),
        );
      case "profit-loss":
        return generateProfitAndLossComparison(
          profitAndLoss,
          accounts,
          comparisonPeriod,
          new Date(endDate),
        );
      default:
        return null;
    }
  }, [
    isComparisonEnabled,
    selectedReport,
    trialBalance,
    balanceSheet,
    profitAndLoss,
    accounts,
    comparisonPeriod,
    asOfDate,
    endDate,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = (reportId: string) => {
    let csvContent = "";
    let filename = "";

    if (reportId === "trial-balance") {
      csvContent = "Account Code,Account Name,Debit,Credit\n";
      trialBalance.accounts.forEach(
        (item: {
          account: { code: string; name: string };
          debitBalance: number;
          creditBalance: number;
        }) => {
          csvContent += `${item.account.code},${item.account.name},${item.debitBalance.toFixed(2)},${item.creditBalance.toFixed(2)}\n`;
        },
      );
      filename = "trial-balance.csv";
    } else if (reportId === "balance-sheet") {
      csvContent = "Section,Account Code,Account Name,Balance\n";
      balanceSheet.assets.currentAssets.forEach(
        (a: { code: string; name: string; balance: number }) => {
          csvContent += `Assets - Current,${a.code},${a.name},${a.balance.toFixed(2)}\n`;
        },
      );
      balanceSheet.liabilities.currentLiabilities.forEach(
        (a: { code: string; name: string; balance: number }) => {
          csvContent += `Liabilities - Current,${a.code},${a.name},${Math.abs(a.balance).toFixed(2)}\n`;
        },
      );
      balanceSheet.equity.items.forEach(
        (a: { code: string; name: string; balance: number }) => {
          csvContent += `Equity,${a.code},${a.name},${a.balance.toFixed(2)}\n`;
        },
      );
      filename = "balance-sheet.csv";
    } else if (reportId === "profit-loss") {
      csvContent = "Category,Account,Amount\n";
      profitAndLoss.revenue.items.forEach(
        (item: { name: string; balance: number }) => {
          csvContent += `Revenue,${item.name},${item.balance.toFixed(2)}\n`;
        },
      );
      profitAndLoss.costOfGoodsSold.items.forEach(
        (item: { name: string; balance: number }) => {
          csvContent += `COGS,${item.name},${item.balance.toFixed(2)}\n`;
        },
      );
      profitAndLoss.operatingExpenses.items.forEach(
        (item: { name: string; balance: number }) => {
          csvContent += `Operating Expenses,${item.name},${item.balance.toFixed(2)}\n`;
        },
      );
      csvContent += `Gross Profit,,${profitAndLoss.grossProfit.toFixed(2)}\n`;
      csvContent += `Operating Income,,${profitAndLoss.operatingIncome.toFixed(2)}\n`;
      csvContent += `Net Income,,${profitAndLoss.netIncome.toFixed(2)}\n`;
      filename = "profit-and-loss.csv";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleExportPDF = (reportId: string) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add company header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("OMB Accounting", 20, 25);

    // Add report title
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    const reportTitle =
      reportId === "trial-balance"
        ? "Trial Balance"
        : reportId === "balance-sheet"
          ? "Balance Sheet"
          : reportId === "profit-loss"
            ? "Profit and Loss Statement"
            : "General Ledger";

    const dateLabel =
      reportId === "trial-balance"
        ? "As of"
        : reportId === "balance-sheet"
          ? "As of"
          : reportId === "profit-loss"
            ? ""
            : "Date Range";

    const dateValue =
      reportId === "trial-balance"
        ? new Date(asOfDate).toLocaleDateString("zh-CN")
        : reportId === "balance-sheet"
          ? new Date(asOfDate).toLocaleDateString("zh-CN")
          : reportId === "profit-loss"
            ? `${new Date(startDate).toLocaleDateString("zh-CN")} to ${new Date(endDate).toLocaleDateString("zh-CN")}`
            : "";

    pdf.text(
      `${reportTitle}${dateLabel ? " " + dateLabel : ""}${dateValue ? " " + dateValue : ""}`,
      20,
      35,
    );

    // Add prepared info
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Prepared by: Admin | Print Date: ${new Date().toLocaleDateString("zh-CN")}`,
      20,
      50,
    );
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 55, 190, 55);

    let yPosition = 65;

    // Add content based on report type
    if (reportId === "trial-balance") {
      const tableData = trialBalance.accounts.map(
        (item: {
          account: { code: string; name: string };
          debitBalance: number;
          creditBalance: number;
        }) => [
          item.account.code,
          item.account.name,
          item.debitBalance > 0 ? item.debitBalance.toFixed(2) : "",
          item.creditBalance > 0 ? item.creditBalance.toFixed(2) : "",
        ],
      );

      tableData.push([
        "",
        "Totals",
        trialBalance.totals.totalDebit.toFixed(2),
        trialBalance.totals.totalCredit.toFixed(2),
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Code", "Account Name", "Debit", "Credit"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [51, 51, 51],
          lineWidth: 0.1,
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 80 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
        },
      });

      yPosition =
        (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;

      // Add balance status
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        trialBalance.totals.isBalanced ? "✓ Balanced" : "✗ Unbalanced",
        20,
        yPosition,
      );
    } else if (reportId === "balance-sheet") {
      const assetsData = balanceSheet.assets.currentAssets.map(
        (a: { code: string; name: string; balance: number }) => [
          a.name,
          formatCurrency(a.balance),
        ],
      );
      assetsData.push([
        "Total Assets",
        formatCurrency(balanceSheet.assets.totalAssets),
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Asset", "Amount"]],
        body: assetsData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [51, 51, 51],
          lineWidth: 0.1,
        },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      yPosition =
        (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;

      const liabilitiesData = balanceSheet.liabilities.currentLiabilities.map(
        (a: { code: string; name: string; balance: number }) => [
          a.name,
          formatCurrency(Math.abs(a.balance)),
        ],
      );
      liabilitiesData.push([
        "Total Liabilities",
        formatCurrency(balanceSheet.liabilities.totalLiabilities),
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Liability", "Amount"]],
        body: liabilitiesData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [51, 51, 51],
          lineWidth: 0.1,
        },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      yPosition =
        (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;

      const equityData = balanceSheet.equity.items.map(
        (a: { code: string; name: string; balance: number }) => [
          a.name,
          formatCurrency(a.balance),
        ],
      );
      equityData.push([
        "Total Equity",
        formatCurrency(balanceSheet.equity.totalEquity),
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Equity", "Amount"]],
        body: equityData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [51, 51, 51],
          lineWidth: 0.1,
        },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      yPosition =
        (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;

      // Add summary
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `Total Assets: ${formatCurrency(balanceSheet.assets.totalAssets)}`,
        20,
        yPosition,
      );
      pdf.text(
        `Total Liabilities & Equity: ${formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}`,
        20,
        yPosition + 7,
      );
      pdf.text(
        balanceSheet.isBalanced ? "✓ Balanced" : "✗ Unbalanced",
        20,
        yPosition + 14,
      );
    } else if (reportId === "profit-loss") {
      const revenueData = profitAndLoss.revenue.items.map(
        (item: { name: string; balance: number }) => [
          item.name,
          formatCurrency(item.balance),
        ],
      );
      revenueData.push([
        "Total Revenue",
        formatCurrency(profitAndLoss.revenue.total),
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Revenue", "Amount"]],
        body: revenueData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [51, 51, 51],
          lineWidth: 0.1,
        },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      yPosition =
        (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;

      const cogsData = profitAndLoss.costOfGoodsSold.items.map(
        (item: { name: string; balance: number }) => [
          item.name,
          `(${formatCurrency(item.balance)})`,
        ],
      );
      cogsData.push([
        "Total COGS",
        `(${formatCurrency(profitAndLoss.costOfGoodsSold.total)})`,
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Cost of Goods Sold", "Amount"]],
        body: cogsData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [51, 51, 51],
          lineWidth: 0.1,
        },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      yPosition =
        (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;

      const expensesData = profitAndLoss.operatingExpenses.items.map(
        (item: { name: string; balance: number }) => [
          item.name,
          `(${formatCurrency(item.balance)})`,
        ],
      );
      expensesData.push([
        "Total Operating Expenses",
        `(${formatCurrency(profitAndLoss.operatingExpenses.total)})`,
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [["Operating Expenses", "Amount"]],
        body: expensesData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [51, 51, 51],
          lineWidth: 0.1,
        },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      yPosition =
        (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;

      // Add profit and loss summary
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `Gross Profit: ${formatCurrency(profitAndLoss.grossProfit)}`,
        20,
        yPosition,
      );
      pdf.text(
        `Operating Income: ${formatCurrency(profitAndLoss.operatingIncome)}`,
        20,
        yPosition + 7,
      );
      pdf.text(
        `Net Income: ${formatCurrency(profitAndLoss.netIncome)}`,
        20,
        yPosition + 14,
      );
    } else if (reportId === "general-ledger") {
      const tableData: string[][] = [];

      generalLedgers.slice(0, 50).forEach((gl) => {
        if ("transactions" in gl) {
          (
            gl as {
              transactions: Array<{
                date: string | Date;
                entryNumber: string;
                description: string;
                debit: number;
                credit: number;
                balance: number;
              }>;
            }
          ).transactions
            .slice(0, 10)
            .forEach((txn) => {
              tableData.push([
                new Date(txn.date).toLocaleDateString(),
                txn.entryNumber,
                txn.description,
                txn.debit > 0 ? txn.debit.toFixed(2) : "",
                txn.credit > 0 ? txn.credit.toFixed(2) : "",
                txn.balance.toFixed(2),
              ]);
            });
        }
      });

      autoTable(pdf, {
        startY: yPosition,
        head: [["Date", "Entry", "Description", "Debit", "Credit", "Balance"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [51, 51, 51],
          lineWidth: 0.1,
        },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 50 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
        },
      });
    }

    // Add page numbers
    const pageCount = (
      pdf as unknown as { internal: { getNumberOfPages: () => number } }
    ).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} of ${pageCount}`, 105, 287, { align: "center" });
    }

    // Download the PDF
    const pdfBytes = pdf.output("arraybuffer");
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportTitle.replace(/\s+/g, "_").toLowerCase()}.pdf`;
    link.click();
  };

  const handleExportCashFlow = () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add company header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("OMB Accounting", 20, 25);

    // Add report title
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Cash Flow Statement", 20, 35);

    // Add date range
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `${new Date(startDate).toLocaleDateString("zh-CN")} to ${new Date(endDate).toLocaleDateString("zh-CN")}`,
      20,
      50,
    );
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 55, 190, 55);

    let yPosition = 65;

    // Operating Activities
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(34, 197, 94); // Green
    pdf.text("Operating Activities", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 51, 51);

    const operatingData = cashFlowStatement.operatingActivities.items.map(
      (item) => [item.description, formatCurrency(item.amount)],
    );
    operatingData.push([
      "Net Cash from Operating Activities",
      formatCurrency(cashFlowStatement.operatingActivities.netCash),
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [["Description", "Amount"]],
      body: operatingData,
      theme: "grid",
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        lineWidth: 0.1,
      },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    yPosition =
      (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;

    // Investing Activities
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(59, 130, 246); // Blue
    pdf.text("Investing Activities", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 51, 51);

    const investingData = cashFlowStatement.investingActivities.items.map(
      (item) => [item.description, formatCurrency(item.amount)],
    );
    investingData.push([
      "Net Cash from Investing Activities",
      formatCurrency(cashFlowStatement.investingActivities.netCash),
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [["Description", "Amount"]],
      body: investingData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        lineWidth: 0.1,
      },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    yPosition =
      (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;

    // Financing Activities
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(168, 85, 247); // Purple
    pdf.text("Financing Activities", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 51, 51);

    const financingData = cashFlowStatement.financingActivities.items.map(
      (item) => [item.description, formatCurrency(item.amount)],
    );
    financingData.push([
      "Net Cash from Financing Activities",
      formatCurrency(cashFlowStatement.financingActivities.netCash),
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [["Description", "Amount"]],
      body: financingData,
      theme: "grid",
      headStyles: {
        fillColor: [168, 85, 247],
        textColor: [255, 255, 255],
        lineWidth: 0.1,
      },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    yPosition =
      (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;

    // Net Change in Cash
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Net Change in Cash", 20, yPosition);
    yPosition += 10;

    const netChangeData = [
      [
        "Beginning Cash Balance",
        formatCurrency(cashFlowStatement.beginningCashBalance),
      ],
      ["Net Change in Cash", formatCurrency(cashFlowStatement.netChangeInCash)],
      [
        "Ending Cash Balance",
        formatCurrency(cashFlowStatement.endingCashBalance),
      ],
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [["Description", "Amount"]],
      body: netChangeData,
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [51, 51, 51],
        lineWidth: 0.1,
      },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Save PDF
    const pdfBytes = pdf.output("arraybuffer");
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cash_flow_statement_${new Date(startDate).toISOString().split("T")[0]}_${new Date(endDate).toISOString().split("T")[0]}.pdf`;
    link.click();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Financial Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Generate reports for annual audit - Balance Sheet, General Ledger,
            P&L, Trial Balance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isComparisonEnabled ? "default" : "outline"}
            onClick={() => setIsComparisonEnabled(!isComparisonEnabled)}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isComparisonEnabled ? "animate-spin" : ""}`}
            />
            {isComparisonEnabled ? "Hide Comparison" : "Compare Periods"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportCSV(selectedReport)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExportPDF(selectedReport)}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => handlePrint()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Date Range Selector Panel */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              日期範圍
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              自定義報告的日期範圍
            </p>
          </div>
          <DateRangePicker
            startDate={startDate ? new Date(startDate) : undefined}
            endDate={endDate ? new Date(endDate) : undefined}
            onStartDateChange={(date) =>
              setStartDate(date?.toISOString().split("T")[0] || "")
            }
            onEndDateChange={(date) =>
              setEndDate(date?.toISOString().split("T")[0] || "")
            }
          />
        </div>
      </div>

      {/* Comparison Period Selector (visible when comparison is enabled) */}
      {isComparisonEnabled && selectedReport !== "general-ledger" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Comparative Report
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Comparing current period with previous period data
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Compare with:
              </span>
              <div className="flex gap-2">
                {(
                  [
                    "previous_month",
                    "previous_quarter",
                    "previous_year",
                  ] as const
                ).map((period) => (
                  <button
                    key={period}
                    onClick={() => setComparisonPeriod(period)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${
                      comparisonPeriod === period
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {period === "previous_month"
                      ? "Last Month"
                      : period === "previous_quarter"
                        ? "Last Quarter"
                        : "Last Year"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Tabs */}
      <Tabs
        value={selectedReport}
        onValueChange={setSelectedReport}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-5 gap-4 bg-gray-100 dark:bg-gray-800 p-1">
          <TabsTrigger
            value="trial-balance"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Trial Balance
          </TabsTrigger>
          <TabsTrigger
            value="balance-sheet"
            className="flex items-center gap-2"
          >
            <PieChart className="w-4 h-4" />
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="profit-loss" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger
            value="general-ledger"
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            General Ledger
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Cash Flow
          </TabsTrigger>
        </TabsList>

        {/* Trial Balance */}
        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trial Balance</CardTitle>
                  <CardDescription>
                    As of{" "}
                    {new Date(trialBalance.reportDate).toLocaleDateString(
                      "zh-CN",
                    )}
                  </CardDescription>
                </div>
                <DatePicker
                  date={asOfDate ? new Date(asOfDate) : undefined}
                  onDateChange={(date) =>
                    setAsOfDate(date?.toISOString().split("T")[0] || "")
                  }
                />
                <div className="text-sm">
                  <span
                    className={
                      trialBalance.totals.isBalanced
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {trialBalance.totals.isBalanced
                      ? "✅ Balanced"
                      : "❌ Unbalanced"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance.accounts.map(
                    (
                      item: {
                        account: { code: string; name: string };
                        debitBalance: number;
                        creditBalance: number;
                      },
                      index: number,
                    ) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">
                          {item.account.code}
                        </TableCell>
                        <TableCell>{item.account.name}</TableCell>
                        <TableCell className="text-right">
                          {item.debitBalance > 0
                            ? formatCurrency(item.debitBalance)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.creditBalance > 0
                            ? formatCurrency(item.creditBalance)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  <TableRow className="font-bold bg-gray-50 dark:bg-gray-800">
                    <TableCell colSpan={2}>Totals</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trialBalance.totals.totalDebit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trialBalance.totals.totalCredit)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="mt-6">
              <ErrorDisplay message={error} onRetry={handleRetry} />
            </div>
          )}

          {/* Trial Balance Comparison View */}
          {isComparisonEnabled &&
            selectedReport === "trial-balance" &&
            comparisonData && (
              <div className="mt-6">
                <TrialBalanceComparisonView
                  comparison={comparisonData as TrialBalanceComparison}
                />
              </div>
            )}
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Balance Sheet</CardTitle>
                  <CardDescription>
                    As of{" "}
                    {new Date(balanceSheet.reportDate).toLocaleDateString(
                      "zh-CN",
                    )}
                  </CardDescription>
                </div>
                <DatePicker
                  date={asOfDate ? new Date(asOfDate) : undefined}
                  onDateChange={(date) =>
                    setAsOfDate(date?.toISOString().split("T")[0] || "")
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Assets */}
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-4">
                    Assets
                  </h3>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-600 mb-2">
                      Current Assets
                    </h4>
                    {balanceSheet.assets.currentAssets.map(
                      (
                        account: { name: string; balance: number },
                        index: number,
                      ) => (
                        <div
                          key={index}
                          className="flex justify-between py-1 text-sm"
                        >
                          <span>{account.name}</span>
                          <span>{formatCurrency(account.balance)}</span>
                        </div>
                      ),
                    )}
                    <div className="flex justify-between py-2 font-semibold border-t mt-2">
                      <span>Total Current Assets</span>
                      <span>
                        {formatCurrency(balanceSheet.assets.totalAssets)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liabilities */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-4">
                    Liabilities
                  </h3>
                  {balanceSheet.liabilities.currentLiabilities.map(
                    (
                      account: { name: string; balance: number },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between py-1 text-sm"
                      >
                        <span>{account.name}</span>
                        <span>{formatCurrency(Math.abs(account.balance))}</span>
                      </div>
                    ),
                  )}
                  <div className="flex justify-between py-2 font-semibold border-t mt-2">
                    <span>Total Liabilities</span>
                    <span>
                      {formatCurrency(
                        balanceSheet.liabilities.totalLiabilities,
                      )}
                    </span>
                  </div>
                </div>

                {/* Equity */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">
                    Equity
                  </h3>
                  {balanceSheet.equity.items.map(
                    (
                      account: { name: string; balance: number },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between py-1 text-sm"
                      >
                        <span>{account.name}</span>
                        <span>{formatCurrency(account.balance)}</span>
                      </div>
                    ),
                  )}
                  <div className="flex justify-between py-2 font-semibold border-t mt-2">
                    <span>Total Equity</span>
                    <span>
                      {formatCurrency(balanceSheet.equity.totalEquity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Assets</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(balanceSheet.assets.totalAssets)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Liabilities & Equity
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`text-xl font-bold ${balanceSheet.isBalanced ? "text-green-600" : "text-red-600"}`}
                    >
                      {balanceSheet.isBalanced
                        ? "✅ Balanced"
                        : "❌ Unbalanced"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Sheet Comparison View */}
          {isComparisonEnabled &&
            selectedReport === "balance-sheet" &&
            comparisonData && (
              <div className="mt-6">
                <BalanceSheetComparisonView
                  comparison={comparisonData as BalanceSheetComparison}
                />
              </div>
            )}
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="profit-loss">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle>Profit and Loss Statement</CardTitle>
                  <CardDescription suppressHydrationWarning>
                    <span suppressHydrationWarning>
                      {new Date(startDate).toLocaleDateString("zh-CN")}
                    </span>{" "}
                    to{" "}
                    <span suppressHydrationWarning>
                      {new Date(endDate).toLocaleDateString("zh-CN")}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2 ml-auto">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded px-2 py-1"
                    suppressHydrationWarning
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded px-2 py-1"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue */}
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-3">
                    Revenue
                  </h3>
                  {profitAndLoss.revenue.items.map(
                    (
                      item: { name: string; balance: number },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between py-1 text-sm"
                      >
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.balance)}</span>
                      </div>
                    ),
                  )}
                  <div className="flex justify-between py-2 font-bold border-t">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(profitAndLoss.revenue.total)}</span>
                  </div>
                </div>

                {/* COGS */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">
                    Cost of Goods Sold
                  </h3>
                  {profitAndLoss.costOfGoodsSold.items.map(
                    (
                      item: { name: string; balance: number },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between py-1 text-sm"
                      >
                        <span>{item.name}</span>
                        <span>({formatCurrency(item.balance)})</span>
                      </div>
                    ),
                  )}
                  <div className="flex justify-between py-2 font-bold border-t">
                    <span>Total COGS</span>
                    <span>
                      ({formatCurrency(profitAndLoss.costOfGoodsSold.total)})
                    </span>
                  </div>
                </div>

                {/* Gross Profit */}
                <div className="flex justify-between py-3 bg-green-50 dark:bg-green-900/20 px-4 rounded-lg font-semibold">
                  <span>Gross Profit</span>
                  <span>{formatCurrency(profitAndLoss.grossProfit)}</span>
                </div>

                {/* Operating Expenses */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 mb-3">
                    Operating Expenses
                  </h3>
                  {profitAndLoss.operatingExpenses.items.map(
                    (
                      item: { name: string; balance: number },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="flex justify-between py-1 text-sm"
                      >
                        <span>{item.name}</span>
                        <span>({formatCurrency(item.balance)})</span>
                      </div>
                    ),
                  )}
                  <div className="flex justify-between py-2 font-bold border-t">
                    <span>Total Operating Expenses</span>
                    <span>
                      ({formatCurrency(profitAndLoss.operatingExpenses.total)})
                    </span>
                  </div>
                </div>

                {/* Operating Income */}
                <div className="flex justify-between py-3 bg-blue-50 dark:bg-blue-900/20 px-4 rounded-lg font-semibold">
                  <span>Operating Income</span>
                  <span>{formatCurrency(profitAndLoss.operatingIncome)}</span>
                </div>

                {/* Other Income/Expenses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-600 mb-3">
                      Other Income
                    </h3>
                    {profitAndLoss.otherIncome.items.map(
                      (
                        item: { name: string; balance: number },
                        index: number,
                      ) => (
                        <div
                          key={index}
                          className="flex justify-between py-1 text-sm"
                        >
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.balance)}</span>
                        </div>
                      ),
                    )}
                    <div className="flex justify-between py-2 font-bold border-t">
                      <span>Total Other Income</span>
                      <span>
                        {formatCurrency(profitAndLoss.otherIncome.total)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-3">
                      Other Expenses
                    </h3>
                    {profitAndLoss.otherExpenses.items.map(
                      (
                        item: { name: string; balance: number },
                        index: number,
                      ) => (
                        <div
                          key={index}
                          className="flex justify-between py-1 text-sm"
                        >
                          <span>{item.name}</span>
                          <span>({formatCurrency(item.balance)})</span>
                        </div>
                      ),
                    )}
                    <div className="flex justify-between py-2 font-bold border-t">
                      <span>Total Other Expenses</span>
                      <span>
                        ({formatCurrency(profitAndLoss.otherExpenses.total)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Income */}
                <div className="flex justify-between py-4 bg-yellow-50 dark:bg-yellow-900/20 px-4 rounded-lg text-lg font-bold">
                  <span>Net Income</span>
                  <span
                    className={
                      profitAndLoss.netIncome >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatCurrency(profitAndLoss.netIncome)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit & Loss Comparison View */}
          {isComparisonEnabled &&
            selectedReport === "profit-loss" &&
            comparisonData && (
              <div className="mt-6">
                <ProfitAndLossComparisonView
                  comparison={comparisonData as ProfitAndLossComparison}
                />
              </div>
            )}
        </TabsContent>

        {/* General Ledger */}
        <TabsContent value="general-ledger">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>General Ledger</CardTitle>
                  <CardDescription>
                    {new Date(glStartDate).toLocaleDateString("zh-CN")} to{" "}
                    {new Date(glEndDate).toLocaleDateString("zh-CN")}
                  </CardDescription>
                </div>
                <DateRangePicker
                  startDate={new Date(glStartDate)}
                  endDate={new Date(glEndDate)}
                  onStartDateChange={(date) =>
                    setGlStartDate(date?.toISOString().split("T")[0] || "")
                  }
                  onEndDateChange={(date) =>
                    setGlEndDate(date?.toISOString().split("T")[0] || "")
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {generalLedgers.slice(0, 5).map(
                  (
                    gl: {
                      account: { code: string; name: string; type: string };
                      transactions: Array<{
                        date: Date;
                        entryNumber: string;
                        description: string;
                        debit: number;
                        credit: number;
                        balance: number;
                      }>;
                      closingBalance: number;
                    },
                    index: number,
                  ) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">
                        {gl.account.code} - {gl.account.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-3">
                        Type: {gl.account.type} | Balance:{" "}
                        {formatCurrency(gl.closingBalance)}
                      </p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Entry</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="text-right">
                              Balance
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gl.transactions.slice(0, 5).map(
                            (
                              txn: {
                                date: Date;
                                entryNumber: string;
                                description: string;
                                debit: number;
                                credit: number;
                                balance: number;
                              },
                              txnIndex: number,
                            ) => (
                              <TableRow key={txnIndex}>
                                <TableCell>
                                  {new Date(txn.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {txn.entryNumber}
                                </TableCell>
                                <TableCell>{txn.description}</TableCell>
                                <TableCell className="text-right">
                                  {txn.debit > 0
                                    ? formatCurrency(txn.debit)
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {txn.credit > 0
                                    ? formatCurrency(txn.credit)
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(txn.balance)}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ),
                )}
                <p className="text-sm text-gray-500 text-center">
                  Showing 5 of {generalLedgers.length} accounts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Statement */}
        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cash Flow Statement</CardTitle>
                  <CardDescription>
                    {new Date(startDate).toLocaleDateString("zh-CN")} to{" "}
                    {new Date(endDate).toLocaleDateString("zh-CN")}
                  </CardDescription>
                </div>
                <Button onClick={handleExportCashFlow}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Operating Activities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">
                  Operating Activities
                </h3>
                <div className="border rounded-lg p-4">
                  {cashFlowStatement.operatingActivities.items.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b last:border-0"
                      >
                        <span>{item.description}</span>
                        <span
                          className={
                            item.amount > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {item.amount > 0 ? "+" : ""}
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ),
                  )}
                  <div className="flex justify-between py-3 mt-3 font-semibold border-t-2">
                    <span>Net Cash from Operating Activities</span>
                    <span className="text-green-600">
                      {formatCurrency(
                        cashFlowStatement.operatingActivities.netCash,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investing Activities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  Investing Activities
                </h3>
                <div className="border rounded-lg p-4">
                  {cashFlowStatement.investingActivities.items.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b last:border-0"
                      >
                        <span>{item.description}</span>
                        <span
                          className={
                            item.amount > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {item.amount > 0 ? "+" : ""}
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ),
                  )}
                  <div className="flex justify-between py-3 mt-3 font-semibold border-t-2">
                    <span>Net Cash from Investing Activities</span>
                    <span className="text-blue-600">
                      {formatCurrency(
                        cashFlowStatement.investingActivities.netCash,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financing Activities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-600">
                  Financing Activities
                </h3>
                <div className="border rounded-lg p-4">
                  {cashFlowStatement.financingActivities.items.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b last:border-0"
                      >
                        <span>{item.description}</span>
                        <span
                          className={
                            item.amount > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {item.amount > 0 ? "+" : ""}
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ),
                  )}
                  <div className="flex justify-between py-3 mt-3 font-semibold border-t-2">
                    <span>Net Cash from Financing Activities</span>
                    <span className="text-purple-600">
                      {formatCurrency(
                        cashFlowStatement.financingActivities.netCash,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Change in Cash */}
              <div className="border-t-2 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Net Change in Cash
                  </span>
                  <span
                    className={
                      cashFlowStatement.netChangeInCash > 0
                        ? "text-green-600 text-xl font-bold"
                        : "text-red-600 text-xl font-bold"
                    }
                  >
                    {cashFlowStatement.netChangeInCash > 0 ? "+" : ""}
                    {formatCurrency(cashFlowStatement.netChangeInCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Beginning Cash Balance</span>
                  <span>
                    {formatCurrency(cashFlowStatement.beginningCashBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Ending Cash Balance</span>
                  <span className="text-green-600">
                    {formatCurrency(cashFlowStatement.endingCashBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// MAIN PAGE EXPORT
// =============================================================================

export default function ReportsPage() {
  return (
    <ReportProvider>
      <ReportPageContent />
    </ReportProvider>
  );
}
