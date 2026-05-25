import { CalendarCheck, Menu, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui/Button";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/#services", label: "Prestations" },
  { to: "/#about", label: "Cabinet" },
  { to: "/#contact", label: "Contact" },
  { to: "/dashboard", label: "Espace admin" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ivory/82 backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-gold-200 shadow-soft">
            <Sparkles size={19} />
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight text-ink">Cabinet Pro</span>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-muted sm:block">Gestion premium</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-bold transition ${
                  isActive && link.to !== "/#services" && link.to !== "/#about" && link.to !== "/#contact"
                    ? "bg-petrol-50 text-petrol-600"
                    : "text-muted hover:bg-white hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-bold text-muted transition hover:text-ink">
            Connexion
          </Link>
          <a href="#contact">
            <Button>
              <CalendarCheck size={18} /> Prendre rendez-vous
            </Button>
          </a>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-ink shadow-soft md:hidden" aria-label="Ouvrir le menu">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
