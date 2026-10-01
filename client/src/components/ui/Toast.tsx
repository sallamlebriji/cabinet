import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type Toast = { id: number; text: string; type: "ok" | "error" };
type ToastApi = { ok: (text: string) => void; error: (text: string) => void };

const ToastContext = createContext<ToastApi>({ ok: () => undefined, error: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, type: Toast["type"]) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, text, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), type === "ok" ? 3200 : 5500);
  }, []);

  const [value] = useState<ToastApi>(() => ({ ok: (text) => push(text, "ok"), error: (text) => push(text, "error") }));

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-xl bg-navy px-4 py-3 text-sm font-medium text-white shadow-pop">
            {toast.type === "ok" ? <CheckCircle2 size={17} className="shrink-0 text-emerald-400" /> : <AlertCircle size={17} className="shrink-0 text-red-400" />}
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
