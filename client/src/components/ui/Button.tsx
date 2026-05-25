import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "gold";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-ink text-white shadow-soft hover:-translate-y-0.5 hover:bg-petrol-900 hover:shadow-glow",
        variant === "secondary" && "border border-line bg-white/90 text-ink shadow-soft hover:-translate-y-0.5 hover:border-gold-200 hover:bg-ivory",
        variant === "ghost" && "text-ink hover:bg-petrol-50",
        variant === "gold" && "bg-gold-500 text-ink shadow-soft hover:-translate-y-0.5 hover:bg-gold-200",
        className
      )}
      {...props}
    />
  );
}
