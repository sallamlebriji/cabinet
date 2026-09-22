import { ArrowUpRight, Mail, MapPin, Phone, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { ctaClass } from "../ui/cta";
import { Ticker } from "../ui/Ticker";
import { SplitWords } from "../ui/SplitWords";
import { usePublicCabinet } from "../../hooks/usePublicCabinet";

export function Footer() {
  const cabinet = usePublicCabinet();

  return (
    <footer className="relative border-t border-line">
      <div className="border-b border-line py-8">
        <Ticker items={["CNOPS", "CNSS", "Mutuelles privées", "Ordre des Médecins", "Tiers payant"]} variant="outline" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SplitWords as="h2" text="Besoin d'un rendez-vous ? *Appelez-nous.*" className="display max-w-3xl text-4xl text-ink sm:text-5xl md:text-6xl" />
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href="#contact" className={ctaClass("primary")}>
            Prendre rendez-vous <ArrowUpRight size={16} />
          </a>
          <a href={`tel:${(cabinet.phone || "+212522000000").replace(/\s/g, "")}`} className={ctaClass("outline")}>
            <Phone size={16} /> {cabinet.phone || "+212 522 00 00 00"}
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 border-t border-line px-4 py-14 sm:px-6 md:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-sage-50 text-sage-700">
              <Stethoscope size={19} />
            </span>
            <p className="text-lg font-extrabold text-ink">{cabinet.cabinetName}</p>
          </div>
          <p className="mt-4 max-w-md leading-7 text-muted">
            Un cabinet médical pluridisciplinaire à taille humaine : consultations, suivi coordonné et dossiers
            confidentiels, pour toute la famille.
          </p>
        </div>
        <div>
          <p className="eyebrow">Navigation</p>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <a href="#specialites" className="w-fit transition hover:text-sage-700">Spécialités</a>
            <a href="#equipe" className="w-fit transition hover:text-sage-700">Notre équipe</a>
            <a href="#contact" className="w-fit transition hover:text-sage-700">Rendez-vous</a>
            <Link to="/login" className="w-fit transition hover:text-sage-700">Espace cabinet</Link>
          </div>
        </div>
        <div>
          <p className="eyebrow">Coordonnées</p>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <span className="flex items-center gap-3"><Mail size={16} className="text-sage-600" /> {cabinet.email || "contact@cabinet-atlas.ma"}</span>
            <span className="flex items-center gap-3"><Phone size={16} className="text-sage-600" /> {cabinet.phone || "+212 522 00 00 00"}</span>
            <span className="flex items-center gap-3"><MapPin size={16} className="text-sage-600" /> {cabinet.address || "Casablanca, Maroc"}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-4 py-5 text-center text-xs font-semibold text-muted">
        © {new Date().getFullYear()} {cabinet.cabinetName}. Tous droits réservés.
      </div>
    </footer>
  );
}
