"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormResetButtonProps extends React.ComponentProps<typeof Button> {
  label?: string;
}

export function FormResetButton({
  label = "Reset",
  variant = "outline",
  size = "sm",
  className,
  onClick,
  ...props
}: FormResetButtonProps) {
  const context = useFormContext();

  // Safe check - only use reset if context exists and has reset function
  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Call onClick if provided, then try to reset form if context exists
    onClick?.(e);
    if (context?.reset) {
      context.reset();
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleReset}
      className={cn("gap-2", className)}
      disabled={!context}
      {...props}
    >
      <RotateCcw className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}

export function FormResetAllButton({
  label = "Reset All",
  variant = "outline",
  size = "default",
  className,
  onClick,
  ...props
}: FormResetButtonProps) {
  const context = useFormContext();

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick?.(e);
    if (context?.reset) {
      context.reset();
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleReset}
      className={cn("gap-2", className)}
      disabled={!context}
      {...props}
    >
      <RotateCcw className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
