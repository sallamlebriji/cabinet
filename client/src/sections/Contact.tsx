import { CalendarCheck, Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";
import { SectionReveal } from "../components/ui/SectionReveal";
import { SplitWords } from "../components/ui/SplitWords";
import { AssistantChat } from "../components/ui/AssistantChat";
import { ctaClass } from "../components/ui/cta";
import type { PublicCabinet } from "../hooks/usePublicCabinet";

export function Contact({ cabinet }: { cabinet: PublicCabinet }) {
  const mail = cabinet.email || "contact@cabinet-atlas.ma";
  const details = [
    { icon: Mail, value: mail },
    { icon: Phone, value: cabinet.phone || "+212 522 00 00 00" },
    { icon: MapPin, value: cabinet.address || "Casablanca, Maroc" }
  ];

  return (
    <section id="contact" className="relative px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
      <span aria-hidden className="chapter-num pointer-events-none absolute -top-10 right-0 select-none text-[24vw] sm:text-[16vw] lg:text-[11vw]">
        04
      </span>
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
        <SectionReveal>
          <p className="eyebrow">Contact et rendez-vous</p>
          <SplitWords as="h2" text={`Prendre rendez-vous avec *${cabinet.cabinetName}*.`} className="display mt-5 text-4xl text-ink md:text-6xl" />
          <p className="mt-6 max-w-xl leading-8 text-muted">
            Envoyez votre demande ou contactez l'accueil. L'équipe vous oriente vers le bon spécialiste et confirme
            le créneau disponible.
          </p>
          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {details.map(({ icon: Icon, value }) => (
              <div key={value} className="glass-panel p-4">
                <Icon size={19} className="text-sage-600" />
                <p className="mt-3 text-sm font-bold text-ink/80">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-sage-200 bg-sage-50 p-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-sage-700" />
            <p className="text-sm leading-6 text-sage-900">
              Cabinet conventionné : CNOPS, CNSS et principales mutuelles privées acceptées. Tiers payant possible
              selon votre couverture.
            </p>
          </div>
          <div className="mt-8">
            <AssistantChat />
          </div>
        </SectionReveal>

        <SectionReveal className="glass-panel p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 text-ivory">
              <CalendarCheck size={22} />
            </span>
            <div>
              <p className="font-extrabold text-ink">Demande rapide</p>
              <p className="text-sm text-muted">Formulaire simple et rassurant</p>
            </div>
          </div>
          <form className="mt-6 space-y-4">
            <input className="field" placeholder="Nom complet" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="field" placeholder="Téléphone" />
              <input className="field" placeholder="Email" />
            </div>
            <textarea className="field" placeholder="Motif de consultation" />
            <a href={`mailto:${mail}`} className={ctaClass("primary", "w-full")}>
              <Send size={18} /> Envoyer une demande
            </a>
          </form>
          <div className="mt-6 overflow-hidden rounded-xl border border-line">
            <iframe
              title="Localisation du cabinet"
              src={`https://www.google.com/maps?q=${encodeURIComponent(cabinet.address || "Casablanca, Maroc")}&output=embed`}
              className="h-56 w-full border-0"
              loading="lazy"
            />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
