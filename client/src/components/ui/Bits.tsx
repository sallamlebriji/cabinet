import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { initials } from "../../lib/format";

const avatarTones = ["bg-sage-600", "bg-teal-600", "bg-indigo-500", "bg-amber-600", "bg-rose-500", "bg-slate-600"];

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const tone = avatarTones[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-white",
        size === "sm" && "h-7 w-7 text-[10px]",
        size === "md" && "h-9 w-9 text-xs",
        size === "lg" && "h-16 w-16 text-xl",
        tone,
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-hairline [scrollbar-width:none]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative flex items-center gap-2 whitespace-nowrap px-3.5 py-3 text-sm font-medium transition",
            value === tab.value ? "text-navy" : "text-muted hover:text-ink"
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="rounded-full bg-slate-100 px-1.5 text-[11px] text-muted">{tab.count}</span>}
          {value === tab.value && <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-sage-600" />}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="inline-flex gap-0.5 rounded-[10px] border border-hairline bg-white p-[3px]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn("h-[30px] rounded-[7px] px-3 text-[13px] font-medium transition", value === option.value ? "bg-navy text-white shadow-card" : "text-muted hover:text-ink")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="app-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function IconButton({ label, tone = "default", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition disabled:opacity-50",
        tone === "default" ? "border-hairline text-slate-600 hover:bg-slate-50" : "border-red-200 text-red-600 hover:bg-red-50",
        className
      )}
      {...props}
    />
  );
}

export function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-white px-5 py-4 shadow-card">
      <p className="text-[12.5px] font-medium text-muted">{label}</p>
      <p className="app-num mt-2 text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="skeleton h-9 w-full" />
      ))}
    </div>
  );
}
