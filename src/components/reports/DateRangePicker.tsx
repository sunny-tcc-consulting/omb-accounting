"use client";

import React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangePickerProps) {
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "選擇日期";
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleQuickSelect = (
    preset:
      | "today"
      | "thisMonth"
      | "thisQuarter"
      | "thisYear"
      | "lastMonth"
      | "lastQuarter"
      | "lastYear",
  ) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
        );
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case "thisQuarter":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case "lastQuarter":
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        start = new Date(now.getFullYear(), lastQuarter * 3, 1);
        end = new Date(now.getFullYear(), lastQuarter * 3 + 3, 0, 23, 59, 59);
        break;
      case "lastYear":
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      default:
        return;
    }

    onStartDateChange(start);
    onEndDateChange(end);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick Select Presets */}
      <div className="flex items-center gap-1">
        {(
          ["today", "thisMonth", "lastMonth", "thisYear", "lastYear"] as const
        ).map((preset) => (
          <Button
            key={preset}
            variant="ghost"
            size="sm"
            onClick={() => handleQuickSelect(preset)}
            className="text-xs px-2 py-1 h-7"
          >
            {preset === "today" && "今天"}
            {preset === "thisMonth" && "本月"}
            {preset === "lastMonth" && "上月"}
            {preset === "thisYear" && "本年"}
            {preset === "lastYear" && "去年"}
          </Button>
        ))}
      </div>

      {/* Start Date */}
      <Popover open={startOpen} onOpenChange={setStartOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground",
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(startDate)}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              onStartDateChange(date);
              if (date && endDate && date > endDate) {
                onEndDateChange(date);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <span className="text-gray-400">至</span>

      {/* End Date */}
      <Popover open={endOpen} onOpenChange={setEndOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground",
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(endDate)}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              onEndDateChange(date);
              if (date && startDate && date < startDate) {
                onStartDateChange(date);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Simple Date Picker for As-Of Date (Trial Balance, Balance Sheet)
interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formatDate = (d: Date | undefined) => {
    if (!d) return "選擇日期";
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[160px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDate(date)}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(d) => {
            onDateChange(d);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
