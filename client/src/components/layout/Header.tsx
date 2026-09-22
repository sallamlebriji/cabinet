import { useEffect, useState } from "react";
import { CalendarCheck, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ctaClass } from "../ui/cta";
import { usePublicCabinet } from "../../hooks/usePublicCabinet";
import { cn } from "../../utils/cn";

// Ancres de la page d'accueil : de vrais liens `<a href="#...">`, pas des routes — le navigateur
// gère alors nativement le défilement (un <Link> de React Router intercepterait le clic sans
// faire défiler jusqu'à la section).
const links = [
  { to: "#specialites", label: "Spécialités" },
  { to: "#equipe", label: "Équipe" },
  { to: "#avis", label: "Avis patients" },
  { to: "#contact", label: "Rendez-vous" }
];

function Logo({ name }: { name: string }) {
  return (
    <Link to="/" className="group flex min-w-0 items-center gap-3">
      <span className="logo-cube-wrap grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-white/70">
        <span className="logo-cube">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-lg font-extrabold tracking-tight text-ink">{name}</span>
        <span className="hidden text-[10px] font-bold uppercase tracking-[0.28em] text-muted sm:block">Cabinet médical</span>
      </span>
    </Link>
  );
}

export function Header() {
  const cabinet = usePublicCabinet();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={cn("sticky top-0 z-50 border-b transition-colors duration-500", scrolled ? "border-line bg-ivory/85 backdrop-blur-2xl" : "border-transparent bg-transparent")}>
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo name={cabinet.cabinetName} />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a key={link.label} href={link.to} className="rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-sage-50 hover:text-sage-700">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-bold text-muted transition hover:text-ink">
            Connexion
          </Link>
          <a href="#contact" className={ctaClass("primary", "h-10 px-5 text-xs")}>
            <CalendarCheck size={16} /> Prendre rendez-vous
          </a>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-white text-ink shadow-soft lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial="closed" animate="open" exit="closed">
            <motion.button
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="glass-panel absolute right-3 top-3 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col gap-1 rounded-2xl bg-ivory p-3"
              variants={{ open: { opacity: 1, y: 0, scale: 1 }, closed: { opacity: 0, y: -16, scale: 0.97 } }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between px-2 py-1">
                <Logo name={cabinet.cabinetName} />
                <button onClick={() => setOpen(false)} aria-label="Fermer" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-sage-50 hover:text-ink">
                  <X size={20} />
                </button>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {links.map((link) => (
                  <a key={link.label} href={link.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-base font-bold text-ink/80 hover:bg-sage-50 hover:text-sage-700">
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-2 flex flex-col gap-2 border-t border-line p-2 pt-4">
                <Link to="/login" onClick={() => setOpen(false)} className={ctaClass("outline")}>
                  Connexion
                </Link>
                <a href="#contact" onClick={() => setOpen(false)} className={ctaClass("primary")}>
                  <CalendarCheck size={16} /> Prendre rendez-vous
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
