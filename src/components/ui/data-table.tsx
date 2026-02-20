"use client";

import React, { useState, useCallback, useMemo, CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Sortable Header Component
interface SortableHeaderProps {
  children: React.ReactNode;
  column: string;
  currentSort: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  className?: string;
  style?: CSSProperties;
}

function SortableHeader({
  children,
  column,
  currentSort,
  sortDirection,
  onSort,
  className,
  style,
}: SortableHeaderProps) {
  const isActive = currentSort === column;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSort(column);
    }
  };

  return (
    <th
      className={cn(
        "px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive && "bg-gray-100 text-blue-600",
        className,
      )}
      style={style}
      onClick={() => onSort(column)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="columnheader"
      aria-sort={
        isActive
          ? sortDirection === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
      aria-controls={`data-table`}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive && (
          <span className="text-blue-600" aria-hidden="true">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );
}

// Column Resizer Component
interface ColumnResizerProps {
  minWidth?: number;
  maxWidth?: number;
  onResize?: (width: number) => void;
}

function ColumnResizer({
  minWidth = 50,
  maxWidth = 400,
  onResize,
}: ColumnResizerProps) {
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = e.currentTarget.parentElement?.offsetWidth || 100;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizing) return;

        const diff = moveEvent.clientX - startX;
        const newWidth = Math.min(
          maxWidth,
          Math.max(minWidth, startWidth + diff),
        );

        if (onResize) {
          onResize(newWidth);
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [isResizing, minWidth, maxWidth, onResize],
  );

  return (
    <div
      className="w-1 cursor-col-resize hover:bg-blue-500 bg-gray-300 focus:bg-blue-500 focus:outline-none"
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      role="separator"
      aria-orientation="vertical"
      aria-label="Column resizer"
      tabIndex={0}
    />
  );
}

// Row Hover Effects
interface DataTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
}

function DataTableRow({
  children,
  onClick,
  className,
  isSelected,
}: DataTableRowProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <tr
      className={cn(
        "transition-colors duration-150",
        onClick && "cursor-pointer",
        isSelected ? "bg-blue-50" : "hover:bg-gray-50",
        onClick &&
          "focus-within:bg-gray-50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {children}
    </tr>
  );
}

// Column Configuration
export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  cellClassName?: string;
}

// Main Enhanced DataTable Component
interface DataTableProps<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string;
  containerClassName?: string;
  stickyHeader?: boolean;
  virtualScroll?: boolean;
  itemHeight?: number;
  maxHeight?: number;
  onSelectionChange?: (selectedKeys: string[]) => void;
  selectable?: boolean;
  /** Accessible label for the table */
  ariaLabel?: string;
}

export function DataTable<T = unknown>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  onSort,
  sortColumn = "",
  sortDirection = "asc",
  loading = false,
  emptyMessage = "No data available",
  className,
  rowClassName,
  containerClassName,
  stickyHeader = true,
  virtualScroll = false,
  maxHeight = 400,
  onSelectionChange,
  selectable = false,
  ariaLabel = "Data table",
}: DataTableProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Handle column resize
  const handleResize = useCallback((key: string, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [key]: width }));
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback(
    (key: string) => {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }

        if (onSelectionChange) {
          onSelectionChange(Array.from(newSet));
        }

        return newSet;
      });
    },
    [onSelectionChange],
  );

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    } else {
      const allKeys = data.map(keyExtractor);
      setSelectedRows(new Set(allKeys));
      if (onSelectionChange) {
        onSelectionChange(allKeys);
      }
    }
  }, [data, keyExtractor, onSelectionChange, selectedRows.size]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortColumn];
      const bVal = (b as Record<string, unknown>)[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  // Handle sort click
  const handleSort = useCallback(
    (column: string) => {
      if (!onSort) return;

      if (sortColumn === column) {
        onSort(column, sortDirection === "asc" ? "desc" : "asc");
      } else {
        onSort(column, "asc");
      }
    },
    [onSort, sortColumn, sortDirection],
  );

  // Render loading state
  if (loading) {
    return (
      <div
        className="border rounded-lg overflow-hidden"
        role="status"
        aria-live="polite"
      >
        <table
          className={cn("w-full", className)}
          aria-label={`${ariaLabel} - Loading`}
        >
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: columnWidths[col.key] || col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 sm:px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg" role="status">
        <p className="text-gray-500">{emptyMessage}</p>
        <p className="sr-only">No data available in table</p>
      </div>
    );
  }

  return (
    <div
      className={cn("border rounded-lg overflow-hidden", containerClassName)}
      role="region"
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      <div
        className={cn("overflow-x-auto", virtualScroll && `overflow-y-auto`)}
        style={virtualScroll ? { maxHeight } : undefined}
        id="data-table"
      >
        <table className={cn("w-full", className)} aria-label={ariaLabel}>
          <thead
            className={cn("bg-gray-50", stickyHeader && "sticky top-0 z-10")}
          >
            <tr>
              {selectable && (
                <th className="px-4 sm:px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <React.Fragment key={col.key}>
                  {col.sortable !== false ? (
                    <SortableHeader
                      column={col.key}
                      currentSort={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      className={col.className}
                      style={{ width: columnWidths[col.key] || col.width }}
                    >
                      {col.header}
                    </SortableHeader>
                  ) : (
                    <th
                      className={cn(
                        "px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                        col.className,
                      )}
                      style={{ width: columnWidths[col.key] || col.width }}
                      scope="col"
                    >
                      {col.header}
                      {col.width !== undefined && (
                        <ColumnResizer
                          minWidth={col.minWidth}
                          maxWidth={col.maxWidth}
                          onResize={(width) => handleResize(col.key, width)}
                        />
                      )}
                    </th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody
            className="bg-white divide-y divide-gray-200"
            aria-live="polite"
          >
            {sortedData.map((item, index) => (
              <DataTableRow
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                isSelected={selectedRows.has(keyExtractor(item))}
                className={rowClassName}
              >
                {selectable && (
                  <td className="px-4 sm:px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(keyExtractor(item))}
                      onChange={() => handleRowSelect(keyExtractor(item))}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                      aria-label={`Select row ${index + 1}`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 sm:px-6 py-4 whitespace-nowrap text-sm",
                      col.cellClassName,
                    )}
                    style={{ width: columnWidths[col.key] || col.width }}
                  >
                    {col.render
                      ? col.render(item, index)
                      : String(
                          (item as Record<string, unknown>)[col.key] ?? "",
                        )}
                  </td>
                ))}
              </DataTableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// QuickSort Hook for tables
export function useTableSort<T>(
  data: T[],
  initialSortColumn = "",
  initialSortDirection: "asc" | "desc" = "asc",
) {
  const [sortColumn, setSortColumn] = useState(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection,
  );

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortColumn];
      const bVal = (b as Record<string, unknown>)[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = useCallback(
    (column: string) => {
      if (sortColumn === column) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    },
    [sortColumn],
  );

  return {
    data: sortedData,
    sortColumn,
    sortDirection,
    handleSort,
  };
}

export type {
  SortableHeaderProps,
  ColumnResizerProps,
  DataTableRowProps,
  DataTableProps,
};
