"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";

// Notification priority levels
export type NotificationPriority = "low" | "default" | "high" | "urgent";

// Notification options
interface NotificationOptions {
  priority?: NotificationPriority;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast function with enhanced options
function enhancedToast(
  message: string | React.ReactNode,
  options?: NotificationOptions,
) {
  const duration = options?.duration ?? getDefaultDuration(options?.priority);

  return toast(message, {
    duration,
    dismissible: options?.dismissible ?? true,
    action: options?.action,
    ...getToastStyle(options?.priority ?? "default"),
  });
}

// Helper to get default duration based on priority
function getDefaultDuration(priority?: NotificationPriority): number {
  switch (priority) {
    case "urgent":
      return 8000;
    case "high":
      return 5000;
    case "low":
      return 4000;
    default:
      return 3000;
  }
}

// Get toast style based on priority
function getToastStyle(priority: NotificationPriority) {
  switch (priority) {
    case "urgent":
      return {
        style: {
          background: "hsl(0 72% 51%)",
          color: "white",
          border: "hsl(0 72% 41%)",
        },
      };
    case "high":
      return {
        style: {
          background: "hsl(38 92% 50%)",
          color: "black",
          border: "hsl(38 92% 40%)",
        },
      };
    case "low":
      return {
        style: {
          background: "hsl(210 40% 96%)",
          color: "hsl(215 16% 47%)",
          border: "hsl(215 16% 90%)",
        },
      };
    default:
      return {};
  }
}

// Toast variants
const toastVariants = {
  success: (message: string | React.ReactNode, options?: NotificationOptions) =>
    enhancedToast(message, {
      ...options,
      priority: options?.priority ?? "default",
    }),
  info: (message: string | React.ReactNode, options?: NotificationOptions) =>
    enhancedToast(message, { ...options, priority: "default" }),
  warning: (message: string | React.ReactNode, options?: NotificationOptions) =>
    enhancedToast(message, { ...options, priority: "high" }),
  error: (message: string | React.ReactNode, options?: NotificationOptions) =>
    enhancedToast(message, { ...options, priority: "urgent" }),
  loading: (message: string | React.ReactNode, options?: NotificationOptions) =>
    toast.loading(message as string, { duration: Infinity, ...options }),
};

// Promise toast
const toastPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
  options?: NotificationOptions,
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    duration: getDefaultDuration(options?.priority),
  });
};

// Custom toast component with dismiss button
interface CustomToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  priority?: NotificationPriority;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function CustomToast({
  title,
  description,
  variant = "default",
  action,
}: CustomToastProps) {
  const icons = {
    success: <CircleCheckIcon className="size-4" />,
    info: <InfoIcon className="size-4" />,
    warning: <TriangleAlertIcon className="size-4" />,
    error: <OctagonXIcon className="size-4" />,
    default: <InfoIcon className="size-4" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-lg",
        "data-[type=success]:border-l-green-500",
        "data-[type=warning]:border-l-yellow-500",
        "data-[type=error]:border-l-red-500",
        "data-[type=info]:border-l-blue-500",
        "bg-background text-foreground",
        variant === "success"
          ? "border-l-4 border-l-green-500"
          : variant === "warning"
            ? "border-l-4 border-l-yellow-500"
            : variant === "error"
              ? "border-l-4 border-l-red-500"
              : variant === "info"
                ? "border-l-4 border-l-blue-500"
                : "border-l-4 border-l-gray-500",
      )}
    >
      <span className="shrink-0 mt-0.5">{icons[variant]}</span>
      <div className="flex-1 min-w-0">
        {title && <div className="font-medium">{title}</div>}
        {description && (
          <div className="text-sm text-muted-foreground mt-1">
            {description}
          </div>
        )}
        {action && (
          <button
            className="text-sm underline mt-2 hover:no-underline"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

// Enhanced Toaster component
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      expand
      gap={8}
      {...props}
    />
  );
};

// Notification container for in-app notifications
interface NotificationCenterProps {
  notifications: Array<{
    id: string;
    title?: string;
    description?: string;
    variant?: "default" | "success" | "warning" | "error" | "info";
    priority?: NotificationPriority;
    timestamp?: Date;
    onDismiss?: (id: string) => void;
  }>;
}

function NotificationCenter({ notifications }: NotificationCenterProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="animate-in slide-in-from-right-4 fade-in duration-200"
        >
          <CustomToast
            title={notification.title}
            description={notification.description}
            variant={notification.variant}
            priority={notification.priority}
            dismissible={true}
          />
        </div>
      ))}
    </div>
  );
}

export {
  Toaster,
  toast,
  toastVariants,
  toastPromise,
  CustomToast,
  NotificationCenter,
  type NotificationOptions,
};
