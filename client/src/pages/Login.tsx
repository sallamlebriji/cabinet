import { useState } from "react";
import { Lock, Mail, Stethoscope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ctaClass } from "../components/ui/cta";
import { useAuth } from "../store/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Email ou mot de passe incorrect.");
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
        </div>
      </motion.div>
    </main>
  );
}
