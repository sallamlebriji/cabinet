import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { useAuth } from "../store/AuthContext";

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    cabinetName: "",
    email: "",
    password: "",
    role: "ADMIN_TENANT" as "ADMIN_TENANT" | "SUPER_ADMIN"
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(form.role === "SUPER_ADMIN" ? { ...form, cabinetName: undefined, tenantName: undefined } : { ...form, tenantName: form.cabinetName });
      navigate("/app");
    } catch {
      setError("Inscription impossible. Vérifiez les informations saisies.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Créer votre espace</h1>
      <p className="mt-1.5 text-sm text-muted">Votre cabinet et votre compte administrateur, en une minute.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Nom complet" autoComplete="name" value={form.name} onChange={(value) => update("name", value)} />
        <label className="block">
          <span className="app-label">Type de compte</span>
          <select className="app-input h-11" value={form.role} onChange={(event) => update("role", event.target.value)}>
            <option value="ADMIN_TENANT">Administrateur de cabinet</option>
            <option value="SUPER_ADMIN">Super admin plateforme</option>
          </select>
        </label>
        {form.role === "ADMIN_TENANT" && <Field label="Nom du cabinet" autoComplete="organization" value={form.cabinetName} onChange={(value) => update("cabinetName", value)} />}
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={(value) => update("email", value)} />
        <Field label="Mot de passe" type="password" autoComplete="new-password" hint="8 caractères minimum." value={form.password} onChange={(value) => update("password", value)} />
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        <Button className="h-11 w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création…" : "Créer mon cabinet"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link to="/login" className="font-semibold text-sage-600 hover:text-sage-700">
          Se connecter
        </Link>
      </p>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  hint
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="app-label">{label}</span>
      <input required minLength={type === "password" ? 8 : 2} autoComplete={autoComplete} className="app-input h-11" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
