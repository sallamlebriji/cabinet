import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function AccessDenied() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert size={22} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink">Accès refusé</h2>
        <p className="mt-1.5 text-sm text-muted">Votre rôle ou votre abonnement ne permet pas d'ouvrir cette page.</p>
        <Link to="/clients" className="mt-5 inline-flex h-10 items-center rounded-lg border border-hairline bg-white px-4 text-sm font-semibold text-ink shadow-card transition hover:bg-slate-50">
          Retour à l'espace
        </Link>
      </div>
    </div>
  );
}
