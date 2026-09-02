import * as React from "react";
import { cn } from "@/lib/utils";

export const inputStyles =
  "w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn(inputStyles, className)} {...props} />;
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={cn(inputStyles, "resize-none", className)} {...props} />;
});
Textarea.displayName = "Textarea";
