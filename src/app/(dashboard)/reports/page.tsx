"use client";

import React, { useState, useMemo } from "react";
import { ReportProvider, useReport } from "@/contexts/ReportContext";
import {
  generateTrialBalance,
  generateBalanceSheet,
  generateProfitAndLoss,
  generateAllGeneralLedgers,
  formatCurrency,
  formatNumber,
} from "@/lib/report-generator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DollarSign,
  PieChart,
  TrendingUp,
  Printer,
} from "lucide-react";

// =============================================================================
// REPORT PAGE COMPONENT
// =============================================================================

function ReportPageContent() {
  const { accounts, journalEntries, transactions } = useReport();
  const [selectedReport, setSelectedReport] = useState<string>("trial-balance");
  const [asOfDate, setAsOfDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 12))
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

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
    () => generateAllGeneralLedgers(accounts, journalEntries),
    [accounts, journalEntries],
  );

  const handlePrint = (reportId: string) => {
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
            variant="outline"
            onClick={() => handleExportCSV(selectedReport)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handlePrint(selectedReport)}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs
        value={selectedReport}
        onValueChange={setSelectedReport}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 gap-4 bg-gray-100 dark:bg-gray-800 p-1">
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
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle>Balance Sheet</CardTitle>
                  <CardDescription>
                    As of{" "}
                    {new Date(balanceSheet.reportDate).toLocaleDateString(
                      "zh-CN",
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm text-gray-500">As of:</label>
                  <input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
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
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="profit-loss">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle>Profit and Loss Statement</CardTitle>
                  <CardDescription>
                    {new Date(startDate).toLocaleDateString("zh-CN")} to{" "}
                    {new Date(endDate).toLocaleDateString("zh-CN")}
                  </CardDescription>
                </div>
                <div className="flex gap-2 ml-auto">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded px-2 py-1"
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
        </TabsContent>

        {/* General Ledger */}
        <TabsContent value="general-ledger">
          <Card>
            <CardHeader>
              <CardTitle>General Ledger</CardTitle>
              <CardDescription>All account transactions</CardDescription>
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
