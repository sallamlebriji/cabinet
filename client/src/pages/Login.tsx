import { useState } from "react";
import { Lock, Mail, Stethoscope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ctaClass } from "../components/ui/cta";
import { useAuth } from "../store/AuthContext";

const demoAccounts = [
  { role: "Super Admin", description: "Gestion de la plateforme", email: "superadmin@cabinetpro.ma" },
  { role: "Admin cabinet", description: "Cabinet Atlas (plan Pro)", email: "admin@cabinetpro.ma" },
  { role: "Manager", description: "Cabinet Atlas", email: "manager@cabinetpro.ma" },
  { role: "Employé", description: "Cabinet Atlas", email: "sara@cabinetpro.ma" }
];
const demoPassword = "password123";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      navigate("/dashboard");
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
    <main className="paper-bg relative grid min-h-[calc(100vh-4.5rem)] place-items-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">
        <div className="glass-panel overflow-hidden">
          <div className="border-b border-line p-7">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 text-ivory">
              <Stethoscope size={23} />
            </div>
            <h1 className="display mt-5 text-3xl text-ink">Connexion cabinet</h1>
            <p className="mt-2 text-muted">Accédez à votre espace cabinet sécurisé.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-7">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-white px-3">
                <Mail size={18} className="text-muted" />
                <input required className="h-12 w-full bg-transparent text-ink outline-none placeholder:text-muted/60" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Mot de passe</span>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-white px-3">
                <Lock size={18} className="text-muted" />
                <input required className="h-12 w-full bg-transparent text-ink outline-none placeholder:text-muted/60" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </label>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
            <button className={ctaClass("primary", "w-full")} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
            <p className="text-center text-sm text-muted">
              Pas encore de compte ?{" "}
              <Link to="/register" className="font-bold text-sage-700">
                Créer un cabinet
              </Link>
            </p>
          </form>
          <div className="border-t border-line bg-sage-50/40 p-7">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Comptes de démonstration</h2>
            <p className="mt-1 text-sm text-muted">Cliquez sur un profil pour vous connecter instantanément.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(demoPassword);
                    void submitLogin(account.email, demoPassword);
                  }}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-left transition hover:border-sage-500 disabled:opacity-60"
                >
                  <span className="block text-sm font-bold text-ink">{account.role}</span>
                  <span className="block text-xs text-muted">{account.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
