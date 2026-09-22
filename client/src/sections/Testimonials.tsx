import { Quote, Star } from "lucide-react";
import { SectionReveal } from "../components/ui/SectionReveal";
import { SplitWords } from "../components/ui/SplitWords";
import { Tilt } from "../components/three/Tilt";

const testimonials = [
  { name: "Amina E.", role: "Patiente", quote: "J'ai rapidement compris les examens à prévoir et le rendez-vous a été confirmé sans aller-retour inutile." },
  { name: "Karim B.", role: "Suivi cardiologie", quote: "Le cabinet suit mon dossier avec une vraie méthode. Chaque médecin consulté avait déjà mes derniers résultats." },
  { name: "Salma I.", role: "Maman de deux enfants", quote: "Accueil rassurant pour les enfants, explications claires et suivi de croissance bien organisé." }
];

export function Testimonials() {
  return (
    <section id="avis" className="relative px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
      <span aria-hidden className="chapter-num pointer-events-none absolute -top-8 left-0 select-none text-[24vw] sm:text-[16vw] lg:text-[11vw]">
        03
      </span>
      <div className="relative mx-auto max-w-7xl">
        <SectionReveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Avis patients</p>
            <SplitWords as="h2" text="Une relation de *confiance*, du premier contact au suivi." className="display mt-4 text-4xl text-ink md:text-6xl" />
          </div>
          <div className="flex gap-1 text-sage-600" aria-label="Note 5 sur 5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={20} fill="currentColor" />
            ))}
          </div>
        </SectionReveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <SectionReveal key={item.name} transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Tilt max={7} className="h-full" innerClassName="glass-panel relative h-full p-6">
                <Quote style={{ transform: "translateZ(30px)" }} className="text-sage-600" size={26} />
                <p style={{ transform: "translateZ(22px)" }} className="mt-5 text-lg leading-8 text-ink/90">
                  "{item.quote}"
                </p>
                <div style={{ transform: "translateZ(16px)" }} className="mt-8 border-t border-line pt-5">
                  <p className="font-extrabold text-ink">{item.name}</p>
                  <p className="text-sm font-semibold text-muted">{item.role}</p>
                </div>
              </Tilt>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
