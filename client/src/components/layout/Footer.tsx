import { Building2, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-gold-200">
              <Building2 size={19} />
            </span>
            <p className="text-lg font-extrabold">Cabinet Pro</p>
          </div>
          <p className="mt-4 max-w-md leading-7 text-white/64">
            Une presence digitale sobre, fiable et rassurante pour organiser les rendez-vous, les dossiers et la relation avec vos clients ou patients.
          </p>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-gold-200">Navigation</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <a href="#services" className="transition hover:text-white">Prestations</a>
            <a href="#about" className="transition hover:text-white">A propos</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
            <a href="/login" className="transition hover:text-white">Espace cabinet</a>
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-gold-200">Coordonnees</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <span className="flex items-center gap-3"><Mail size={16} /> contact@cabinet-atlas.ma</span>
            <span className="flex items-center gap-3"><Phone size={16} /> +212 522 00 00 00</span>
            <span className="flex items-center gap-3"><MapPin size={16} /> Casablanca, Maroc</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs font-semibold text-white/45">
        © {new Date().getFullYear()} Cabinet Pro. Tous droits reserves.
      </div>
    </footer>
  );
}
