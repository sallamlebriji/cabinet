import { useState } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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
    <main className="grid min-h-[calc(100vh-8rem)] place-items-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="overflow-hidden">
          <div className="bg-ink p-7 text-white">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-gold-200">
              <ShieldCheck size={23} />
            </div>
            <h1 className="mt-5 font-serif text-3xl font-bold text-white">Connexion cabinet</h1>
            <p className="mt-2 text-white/64">Accedez a votre espace cabinet securise.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-7">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-line bg-white px-3">
                <Mail size={18} className="text-muted" />
                <input required className="h-12 w-full outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Mot de passe</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-line bg-white px-3">
                <Lock size={18} className="text-muted" />
                <input required className="h-12 w-full outline-none" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </label>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
            <p className="text-center text-sm text-muted">
              Pas encore de compte ?{" "}
              <Link to="/register" className="font-bold text-petrol-600">
                Creer un cabinet
              </Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </main>
  );
}
