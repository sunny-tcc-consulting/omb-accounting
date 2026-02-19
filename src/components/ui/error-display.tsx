import React from "react";
import { AlertCircle, Copy, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  /** Error message to display */
  message?: string;
  /** Error object for details */
  error?: Error;
  /** Title for the error message */
  title?: string;
  /** Whether to show error details */
  showDetails?: boolean;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Callback when copy error button is clicked */
  onCopy?: () => void;
  /** Custom CSS class name */
  className?: string;
}

/**
 * ErrorDisplay component displays error messages with options for retry and error details
 */
export function ErrorDisplay({
  message,
  error,
  title,
  showDetails = false,
  showRetry = false,
  onRetry,
  onCopy,
  className = "",
}: ErrorDisplayProps) {
  const defaultTitle = title || "Error";
  const defaultMessage =
    message || "An unexpected error occurred. Please try again.";

  const handleCopy = () => {
    if (error) {
      navigator.clipboard.writeText(error.message);
      onCopy?.();
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {defaultTitle}
          </h3>
          <p className="text-red-700 mb-4">{defaultMessage}</p>

          {showDetails && error && (
            <div className="bg-red-100 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {showDetails && onCopy && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy error</span>
              </button>
            )}

            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
