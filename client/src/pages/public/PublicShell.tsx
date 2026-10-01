import type { ReactNode } from "react";
import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export const DEFAULT_CABINET = "cabinet-atlas";

export function cabinetSlug() {
  return new URLSearchParams(window.location.search).get("cabinet") || DEFAULT_CABINET;
}

export function PublicShell({ cabinetName, aside, children }: { cabinetName?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-navy to-sage-600 text-white">
              <Stethoscope size={16} />
            </span>
            <span className="font-heading text-lg font-medium text-navy">{cabinetName ?? "Cabinet Pro"}</span>
          </Link>
          <nav className="flex items-center gap-1 text-[13px] font-medium">{aside}</nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
