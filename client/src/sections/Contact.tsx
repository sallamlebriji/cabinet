import { CalendarCheck, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "../components/ui/Button";
import { SectionReveal } from "../components/ui/SectionReveal";
import type { PublicCabinet } from "../hooks/usePublicCabinet";

export function Contact({ cabinet }: { cabinet: PublicCabinet }) {
  const mail = cabinet.email || "contact@cabinet-atlas.ma";
  const details = [
    { icon: Mail, value: mail },
    { icon: Phone, value: cabinet.phone || "+212 522 00 00 00" },
    { icon: MapPin, value: cabinet.address || "Casablanca, Maroc" }
  ];

  return (
    <section id="contact" className="bg-ink px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
        <SectionReveal>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold-200">Contact et rendez-vous</p>
          <h2 className="mt-4 font-serif text-4xl font-bold tracking-normal md:text-5xl">Prendre rendez-vous avec {cabinet.cabinetName}.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-white/70">
            Envoyez votre demande ou contactez l'accueil. L'equipe vous oriente vers le bon service et confirme le creneau disponible.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {details.map(({ icon: Icon, value }) => (
              <div key={value} className="rounded-lg border border-white/10 bg-white/6 p-4">
                <Icon size={19} className="text-gold-200" />
                <p className="mt-3 text-sm font-bold text-white/82">{value}</p>
              </div>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal className="rounded-lg border border-white/10 bg-white/[0.07] p-6 shadow-premium backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-gold-500 text-ink">
              <CalendarCheck size={22} />
            </span>
            <div>
              <p className="font-extrabold">Demande rapide</p>
              <p className="text-sm text-white/58">Formulaire simple et rassurant</p>
            </div>
          </div>
          <form className="mt-6 space-y-4">
            <input className="h-12 w-full rounded-lg border border-white/10 bg-white/92 px-3 text-ink outline-none" placeholder="Nom complet" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="h-12 rounded-lg border border-white/10 bg-white/92 px-3 text-ink outline-none" placeholder="Telephone" />
              <input className="h-12 rounded-lg border border-white/10 bg-white/92 px-3 text-ink outline-none" placeholder="Email" />
            </div>
            <textarea className="min-h-28 w-full rounded-lg border border-white/10 bg-white/92 p-3 text-ink outline-none" placeholder="Votre demande" />
            <a href={`mailto:${mail}`}>
              <Button type="button" variant="gold" className="w-full">
                <Send size={18} /> Envoyer une demande
              </Button>
            </a>
          </form>
          <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-white/8">
            <iframe
              title="Localisation du cabinet"
              src={`https://www.google.com/maps?q=${encodeURIComponent(cabinet.address || "Casablanca, Maroc")}&output=embed`}
              className="h-56 w-full border-0 opacity-90"
              loading="lazy"
            />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
