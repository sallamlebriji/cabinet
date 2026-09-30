import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" && "bg-sage-600 text-white shadow-card hover:bg-sage-700 active:scale-[0.98]",
        variant === "secondary" && "border border-hairline bg-white text-ink shadow-card hover:border-slate-300 hover:bg-slate-50",
        variant === "ghost" && "text-ink hover:bg-slate-100",
        variant === "danger" && "border border-red-200 bg-white text-red-600 hover:bg-red-50",
        className
      )}
      {...props}
    />
  );
}
