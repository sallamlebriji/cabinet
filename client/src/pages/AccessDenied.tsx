import { ShieldAlert } from "lucide-react";
import { Card } from "../components/ui/Card";

export function AccessDenied() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-[#f7f9fc] p-4">
      <Card className="flex max-w-md items-center gap-4 p-6 text-muted">
        <ShieldAlert size={28} className="text-red-600" />
        <div>
          <h1 className="text-xl font-bold text-ink">Acces refuse</h1>
          <p className="mt-1">Votre role ou votre abonnement ne permet pas d'ouvrir cette page.</p>
        </div>
      </Card>
    </div>
  );
}
