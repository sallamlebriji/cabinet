import { Save } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function Settings() {
  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-3xl font-bold text-ink">Paramètres</h2>
      <p className="mt-2 text-muted">Informations du cabinet, logo, horaires, rôles et préférences générales.</p>
      <Card className="mt-6 max-w-3xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {["Nom du cabinet", "Email", "Téléphone", "Adresse"].map((label) => (
            <label key={label} className="block">
              <span className="text-sm font-semibold text-ink">{label}</span>
              <input className="mt-2 h-12 w-full rounded-lg border border-line px-3 outline-none focus:border-brand-500" placeholder={label} />
            </label>
          ))}
        </div>
        <Button className="mt-6"><Save size={18} /> Enregistrer</Button>
      </Card>
    </div>
  );
}
