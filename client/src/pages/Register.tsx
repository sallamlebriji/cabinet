import { useState } from "react";
import { Building2, Lock, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ctaClass } from "../components/ui/cta";
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
      navigate("/dashboard");
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
    <main className="paper-bg relative grid min-h-[calc(100vh-4.5rem)] place-items-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-xl">
        <div className="glass-panel p-8">
          <p className="eyebrow">Création d'espace</p>
          <h1 className="display mt-4 text-4xl text-ink">Créer votre espace cabinet</h1>
          <p className="mt-2 text-muted">L'inscription crée un cabinet SaaS et votre compte administrateur.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field icon={User} label="Nom complet" value={form.name} onChange={(value) => update("name", value)} />
            <label className="block">
              <span className="text-sm font-semibold text-ink">Type de compte</span>
              <select className="field mt-2" value={form.role} onChange={(event) => update("role", event.target.value)}>
                <option value="ADMIN_TENANT">Admin tenant</option>
                <option value="SUPER_ADMIN">Super admin plateforme</option>
              </select>
            </label>
            {form.role === "ADMIN_TENANT" && <Field icon={Building2} label="Nom du cabinet" value={form.cabinetName} onChange={(value) => update("cabinetName", value)} />}
            <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} />
            <Field icon={Lock} label="Mot de passe" type="password" value={form.password} onChange={(value) => update("password", value)} />
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
            <button className={ctaClass("primary", "w-full")} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer mon cabinet"}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-bold text-sage-700">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text"
}: {
  icon: typeof User;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-white px-3">
        <Icon size={18} className="text-muted" />
        <input
          required
          minLength={type === "password" ? 8 : 2}
          className="h-12 w-full bg-transparent text-ink outline-none placeholder:text-muted/60"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}
