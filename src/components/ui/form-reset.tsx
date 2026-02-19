"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

export function FormResetButton({
  label = "Reset",
  variant = "outline",
  size = "sm",
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label?: string }) {
  const context = useFormContext();
  const { reset } = context || {};

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (reset) {
      reset();
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleReset}
      className={cn("gap-2", className)}
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
  ...props
}: React.ComponentProps<typeof Button> & { label?: string }) {
  const context = useFormContext();
  const { reset } = context || {};

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (reset) {
      reset();
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleReset}
      className={cn("gap-2", className)}
      {...props}
    >
      <RotateCcw className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
