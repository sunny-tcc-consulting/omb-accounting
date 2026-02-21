"use client";

import * as React from "react";
import { Calendar as CalendarComponent } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | [Date | undefined, Date | undefined];
  onDateSelect?: (
    date: Date | Date[] | [Date | undefined, Date | undefined] | undefined,
  ) => void;
}

export function Calendar({
  className,
  mode = "single",
  selected,
  onDateSelect,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const handleDateClick = (date: Date) => {
    if (mode === "single") {
      onDateSelect?.(date);
    } else if (mode === "multiple") {
      const current = selected as Date[] | undefined;
      if (current) {
        const index = current.findIndex((d) => d.getTime() === date.getTime());
        if (index >= 0) {
          const newDates = current.filter((_, i) => i !== index);
          onDateSelect?.(newDates.length ? newDates : undefined);
        } else {
          onDateSelect?.([...current, date]);
        }
      } else {
        onDateSelect?.([date]);
      }
    } else if (mode === "range") {
      const current = selected as
        | [Date | undefined, Date | undefined]
        | undefined;
      if (!current || !current[0]) {
        onDateSelect?.([date, undefined]);
      } else if (!current[1]) {
        onDateSelect?.([current[0], date]);
      } else {
        onDateSelect?.([date, undefined]);
      }
    }
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();
  const today = new Date();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isSelected = (date: Date) => {
    if (mode === "single") {
      return selected instanceof Date && date.getTime() === selected.getTime();
    } else if (mode === "multiple") {
      return (
        Array.isArray(selected) &&
        selected.some((d) => d && d.getTime() === date.getTime())
      );
    } else if (mode === "range") {
      if (!Array.isArray(selected)) return false;
      if (selected[0] && selected[1]) {
        return date >= selected[0] && date <= selected[1];
      }
      return date.getTime() === selected[0]?.getTime();
    }
    return false;
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={cn("p-4", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">
          {currentDate.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
          })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <CalendarComponent className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            今天
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <CalendarComponent className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            i + 1,
          );
          return (
            <button
              key={i}
              onClick={() => handleDateClick(date)}
              className={cn(
                "h-8 w-8 rounded-full text-sm flex items-center justify-center",
                isSelected(date)
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800",
                isToday(date) && !isSelected(date)
                  ? "border border-blue-500 text-blue-500"
                  : "",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
