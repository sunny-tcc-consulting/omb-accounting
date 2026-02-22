"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
        Report Error
      </h3>
      <p className="text-sm text-red-600 dark:text-red-300 mb-4 max-w-md">
        {message || "An unexpected error occurred while generating the report."}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
