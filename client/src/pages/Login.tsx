import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { useAuth } from "../store/AuthContext";

const demoAccounts = [
  { role: "Super Admin", description: "Gestion de la plateforme", email: "superadmin@cabinetpro.ma" },
  { role: "Admin cabinet", description: "Cabinet Atlas · plan Pro", email: "admin@cabinetpro.ma" },
  { role: "Manager", description: "Cabinet Atlas", email: "manager@cabinetpro.ma" },
  { role: "Employé", description: "Cabinet Atlas", email: "sara@cabinetpro.ma" }
];
const demoPassword = "password123";

function initials(label: string) {
  return label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await submitLogin(email, password);
  }

  async function submitLogin(loginEmail: string, loginPassword: string) {
    setError("");
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      navigate("/app");
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (!status) setError("Serveur injoignable. Vérifiez que l'API est démarrée et que CLIENT_URL autorise cette adresse.");
      else if (status === 401 || status === 400) setError("Email ou mot de passe incorrect.");
      else if (status === 403) setError("Compte ou abonnement inactif.");
      else setError("Erreur serveur. Réessayez dans un instant.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Bon retour</h1>
      <p className="mt-1.5 text-sm text-muted">Connectez-vous à votre espace cabinet.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="app-label">Email</span>
          <input required autoComplete="email" className="app-input h-11" type="email" placeholder="vous@cabinet.ma" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block">
          <span className="app-label">Mot de passe</span>
          <div className="relative">
            <input
              required
              autoComplete="current-password"
              className="app-input h-11 pr-11"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted transition hover:text-ink"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        <Button className="h-11 w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link to="/register" className="font-semibold text-sage-600 hover:text-sage-700">
          Créer un cabinet
        </Link>
      </p>

      <div className="mt-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Comptes de démonstration</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <ul className="mt-4 overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
        {demoAccounts.map((account) => (
          <li key={account.email} className="border-b border-hairline last:border-b-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setEmail(account.email);
                setPassword(demoPassword);
                void submitLogin(account.email, demoPassword);
              }}
              className="group flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-slate-50 disabled:opacity-60"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage-50 text-[11px] font-semibold text-sage-700">{initials(account.role)}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink">{account.role}</span>
                <span className="block truncate text-xs text-muted">{account.description}</span>
              </span>
              <ArrowRight size={15} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-sage-600" />
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
