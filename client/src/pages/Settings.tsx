import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { api } from "../services/api";

const fields = [
  { key: "cabinetName", label: "Nom du cabinet" },
  { key: "email", label: "Email de contact" },
  { key: "phone", label: "Téléphone" },
  { key: "address", label: "Adresse" }
] as const;

type Form = Record<(typeof fields)[number]["key"], string>;

export function Settings() {
  const [form, setForm] = useState<Form>({ cabinetName: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      const settings = data.settings;
      if (settings) setForm({ cabinetName: settings.cabinetName ?? "", email: settings.email ?? "", phone: settings.phone ?? "", address: settings.address ?? "" });
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await api.put("/settings", form);
      setFeedback({ type: "ok", text: "Paramètres enregistrés." });
    } catch {
      setFeedback({ type: "error", text: "Enregistrement impossible. Réessayez." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <PageHeader title="Paramètres" description="Informations générales de votre cabinet." />
      <Card className="max-w-3xl">
        <CardHeader title="Profil du cabinet" description="Ces informations apparaissent sur le site public et vos documents." />
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ key, label }) => (
              <label key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                <span className="app-label">{label}</span>
                <input className="app-input" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
              </label>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              <Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {feedback && <p className={`text-sm font-medium ${feedback.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{feedback.text}</p>}
          </div>
        </form>
      </Card>
    </div>
  );
}
