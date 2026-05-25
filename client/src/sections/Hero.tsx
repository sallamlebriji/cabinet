import { useRef } from "react";
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useGsapHero } from "../hooks/useGsapHero";
import type { PublicCabinet } from "../hooks/usePublicCabinet";

const proof = [
  ["12+", "ans d'experience"],
  ["98%", "demandes suivies"],
  ["24h", "delai de reponse"]
];

export function Hero({ cabinet }: { cabinet: PublicCabinet }) {
  const ref = useRef<HTMLElement>(null);
  useGsapHero(ref);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ivory">
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream to-transparent" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <div className="max-w-3xl">
          <Badge data-hero-reveal>Cabinet professionnel a Casablanca</Badge>
          <h1 data-hero-reveal className="mt-6 font-serif text-5xl font-bold leading-[1.02] tracking-normal text-ink sm:text-6xl lg:text-7xl">
            {cabinet.cabinetName}
          </h1>
          <p data-hero-reveal className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Un cabinet organise, confidentiel et attentif. Nous vous accueillons avec une methode claire, des rendez-vous fiables et un suivi precis de chaque dossier.
          </p>
          <div data-hero-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#contact">
              <Button>
                Prendre rendez-vous <ArrowRight size={18} />
              </Button>
            </a>
            <Link to="/login">
              <Button variant="secondary">Acceder a l'espace cabinet</Button>
            </Link>
          </div>
          <div data-hero-reveal className="mt-8 grid gap-3 text-sm font-bold text-ink sm:grid-cols-3">
            <span className="flex items-center gap-2"><MapPin size={17} className="text-petrol-600" /> {cabinet.address}</span>
            <span className="flex items-center gap-2"><Phone size={17} className="text-petrol-600" /> {cabinet.phone}</span>
            <span className="flex items-center gap-2"><Clock size={17} className="text-petrol-600" /> Lun-Ven</span>
          </div>
        </div>

        <motion.div
          data-parallax
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-lg border border-gold-200/70" />
          <div className="relative overflow-hidden rounded-lg border border-line bg-white shadow-premium">
            <div className="relative h-80 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center">
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/15 bg-white/12 p-4 text-white backdrop-blur-xl">
                <p className="text-sm text-white/70">Accueil et suivi</p>
                <p className="mt-1 text-2xl font-extrabold">Rendez-vous organises, dossiers maitrises</p>
              </div>
            </div>
            <div className="p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                {proof.map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-line bg-ivory p-4">
                    <p className="font-serif text-3xl font-bold text-ink">{value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-line p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-petrol-50 text-petrol-600">
                  <ShieldCheck />
                </div>
                <div>
                  <p className="font-bold text-ink">Cadre confidentiel et rassurant</p>
                  <p className="mt-1 text-sm leading-6 text-muted">Chaque demande est qualifiee, planifiee et suivie dans un espace cabinet securise.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-petrol-600">
                <CheckCircle2 size={17} /> Confirmation rapide des demandes importantes
                <CalendarCheck size={17} className="ml-auto hidden sm:block" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
