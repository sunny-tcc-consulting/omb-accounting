"use client";

import * as React from "react";
import { XIcon, GripVerticalIcon } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogPortal } from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent as OriginalDialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  openProp?: boolean;
  onOpenChangeProp?: (open: boolean) => void;
}

// Backdrop with blur effect
function DialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-backdrop"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

// Enhanced dialog content with slide and scale animations
function DialogContent({
  className,
  children,
  showCloseButton = true,
  draggable = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  draggable?: boolean;
}) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);
  const startPos = React.useRef({ x: 0, y: 0 });

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    isDragging.current = true;
    startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !draggable) return;
      const newX = e.clientX - startPos.current.x;
      const newY = e.clientY - startPos.current.y;
      setPosition({ x: newX, y: newY });
    },
    [draggable],
  );

  const handleMouseUp = React.useCallback(() => {
    isDragging.current = false;
  }, []);

  React.useEffect(() => {
    if (draggable) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggable, handleMouseMove, handleMouseUp]);

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogBackdrop />
      <DialogPrimitive.Content
        ref={contentRef}
        data-slot="dialog-content"
        data-draggable={draggable}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)]",
          "translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg",
          "duration-200 outline-none sm:max-w-lg",
          "transition-transform",
          className,
        )}
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
        {...props}
      >
        {/* Drag handle */}
        {draggable && (
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 p-1 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

// Confirmation Dialog
interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogBackdrop,
  ConfirmDialog,
};
