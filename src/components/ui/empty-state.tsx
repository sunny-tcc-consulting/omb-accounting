"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Empty State illustrations (SVG)
const EmptyStateIllustrations = {
  search: () => (
    <svg
      data-slot="empty-illustration"
      className="w-24 h-24 text-muted-foreground/50"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="45" cy="45" r="20" stroke="currentColor" strokeWidth="3" />
      <path
        d="M60 60L80 80"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
  data: () => (
    <svg
      data-slot="empty-illustration"
      className="w-24 h-24 text-muted-foreground/50"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="20" y="15" width="60" height="10" rx="2" fill="currentColor" />
      <rect
        x="20"
        y="35"
        width="40"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="20"
        y="50"
        width="50"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="20"
        y="65"
        width="30"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="20"
        y="80"
        width="55"
        height="8"
        rx="2"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  ),
  create: () => (
    <svg
      data-slot="empty-illustration"
      className="w-24 h-24 text-muted-foreground/50"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line
        x1="50"
        y1="35"
        x2="50"
        y2="65"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line
        x1="35"
        y1="50"
        x2="65"
        y2="50"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  ),
  error: () => (
    <svg
      data-slot="empty-illustration"
      className="w-24 h-24 text-muted-foreground/50"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="3" />
      <line
        x1="50"
        y1="35"
        x2="50"
        y2="50"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle cx="50" cy="62" r="3" fill="currentColor" />
    </svg>
  ),
  unauthorized: () => (
    <svg
      data-slot="empty-illustration"
      className="w-24 h-24 text-muted-foreground/50"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="25"
        y="15"
        width="50"
        height="70"
        rx="5"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle cx="50" cy="45" r="12" stroke="currentColor" strokeWidth="3" />
      <line
        x1="40"
        y1="70"
        x2="60"
        y2="70"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  ),
};

// Empty State Component
interface EmptyStateProps {
  title?: string;
  description?: string;
  illustration?: "search" | "data" | "create" | "error" | "unauthorized";
  customIllustration?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "secondary"
      | "outline"
      | "ghost"
      | "link"
      | "destructive";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "secondary"
      | "outline"
      | "ghost"
      | "link"
      | "destructive";
  };
  className?: string;
}

function EmptyState({
  title = "Nothing here yet",
  description,
  illustration = "data",
  customIllustration,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const IllustrationComponent: React.ReactNode =
    customIllustration || EmptyStateIllustrations[illustration]();

  return (
    <div
      data-testid="empty-state-container"
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        "animate-in fade-in duration-300",
        className,
      )}
    >
      <div data-testid="empty-state-illustration" className="mb-6">
        {IllustrationComponent}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "secondary"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button
              variant={action.variant || "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Search Empty State (no results)
interface SearchEmptyStateProps {
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}

function SearchEmptyState({
  searchTerm,
  onClearSearch,
  className,
}: SearchEmptyStateProps) {
  return (
    <EmptyState
      illustration="search"
      title="No results found"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try a different search term.`
          : "No results found. Try adjusting your search."
      }
      action={
        searchTerm
          ? {
              label: "Clear search",
              onClick: onClearSearch || (() => {}),
              variant: "outline",
            }
          : undefined
      }
      className={className}
    />
  );
}

// Data Empty State (no data to display)
interface DataEmptyStateProps {
  resourceName?: string;
  onCreateNew?: () => void;
  className?: string;
}

function DataEmptyState({
  resourceName = "items",
  onCreateNew,
  className,
}: DataEmptyStateProps) {
  return (
    <EmptyState
      illustration="data"
      title={`No ${resourceName} yet`}
      description={`Get started by creating your first ${resourceName.toLowerCase()}.`}
      action={
        onCreateNew
          ? {
              label: `Create ${resourceName}`,
              onClick: onCreateNew,
            }
          : undefined
      }
      className={className}
    />
  );
}

// Create Empty State (ready to create)
interface CreateEmptyStateProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onCreate?: () => void;
  className?: string;
}

function CreateEmptyState({
  title = "Ready to get started",
  description = "Create your first item to see it here.",
  buttonLabel = "Create",
  onCreate,
  className,
}: CreateEmptyStateProps) {
  return (
    <EmptyState
      illustration="create"
      title={title}
      description={description}
      action={
        onCreate
          ? {
              label: buttonLabel,
              onClick: onCreate,
            }
          : undefined
      }
      className={className}
    />
  );
}

// Error Empty State
interface ErrorEmptyStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorEmptyState({
  title = "Something went wrong",
  description = "An error occurred while loading this content.",
  onRetry,
  className,
}: ErrorEmptyStateProps) {
  return (
    <EmptyState
      illustration="error"
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: "Try again",
              onClick: onRetry,
              variant: "outline",
            }
          : undefined
      }
      className={className}
    />
  );
}

// Unauthorized Empty State
interface UnauthorizedEmptyStateProps {
  title?: string;
  description?: string;
  onLogin?: () => void;
  className?: string;
}

function UnauthorizedEmptyState({
  title = "Access denied",
  description = "You don't have permission to view this content.",
  onLogin,
  className,
}: UnauthorizedEmptyStateProps) {
  return (
    <EmptyState
      illustration="unauthorized"
      title={title}
      description={description}
      action={
        onLogin
          ? {
              label: "Sign in",
              onClick: onLogin,
            }
          : undefined
      }
      className={className}
    />
  );
}

export {
  EmptyState,
  SearchEmptyState,
  DataEmptyState,
  CreateEmptyState,
  ErrorEmptyState,
  UnauthorizedEmptyState,
  EmptyStateIllustrations,
  type EmptyStateProps,
};
