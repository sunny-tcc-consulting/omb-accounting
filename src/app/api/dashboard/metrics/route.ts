/**
 * Dashboard Metrics API
 * Part of Phase 4.5: Dashboard & Analytics
 */

import { NextResponse } from "next/server";
import {
  getDashboardMetrics,
  getRevenueByMonth,
  getExpenseByCategory,
  getTopCustomers,
  getFinancialRatios,
  getCustomerAnalytics,
  DateRange,
} from "@/lib/dashboard-metrics";

// GET /api/dashboard/metrics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "month") as
      | "month"
      | "quarter"
      | "year";
    const type = searchParams.get("type") || "all";

    // Rate limiting could be added here
    // For now, we'll return data directly

    switch (type) {
      case "all":
        const metrics = await getDashboardMetrics(period);
        return NextResponse.json({ success: true, data: metrics });

      case "revenue":
        const revenueByMonth = await getRevenueByMonth(12);
        return NextResponse.json({ success: true, data: revenueByMonth });

      case "expenses":
        const dateRange: DateRange = {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(),
        };
        const expensesByCategory = await getExpenseByCategory(dateRange);
        return NextResponse.json({ success: true, data: expensesByCategory });

      case "topCustomers":
        const limit = parseInt(searchParams.get("limit") || "10");
        const topCustomers = await getTopCustomers(limit);
        return NextResponse.json({ success: true, data: topCustomers });

      case "ratios":
        const ratios = await getFinancialRatios();
        return NextResponse.json({ success: true, data: ratios });

      case "customers":
        const customerAnalytics = await getCustomerAnalytics();
        return NextResponse.json({ success: true, data: customerAnalytics });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid type parameter" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard metrics" },
      { status: 500 },
    );
  }
}
