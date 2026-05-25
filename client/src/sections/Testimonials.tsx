import { Quote, Star } from "lucide-react";
import { Card } from "../components/ui/Card";
import { SectionReveal } from "../components/ui/SectionReveal";

const testimonials = [
  { name: "Amina E.", role: "Cliente", quote: "J'ai rapidement compris les pieces a preparer et le rendez-vous a ete confirme sans aller-retour inutile." },
  { name: "Karim B.", role: "Dirigeant", quote: "Le cabinet suit nos demandes avec une vraie methode. On gagne du temps sur chaque dossier." },
  { name: "Salma I.", role: "Particuliere", quote: "Accueil serieux, explications claires et suivi rassurant apres la consultation." }
];

export function Testimonials() {
  return (
    <section className="bg-cream px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionReveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="section-kicker">Avis</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-normal text-ink md:text-5xl">Une relation de confiance, du premier contact au suivi.</h2>
          </div>
          <div className="flex gap-1 text-gold-500" aria-label="Note 5 sur 5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={20} fill="currentColor" />
            ))}
          </div>
        </SectionReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <SectionReveal key={item.name} transition={{ delay: index * 0.05, duration: 0.55 }}>
              <Card className="relative h-full p-6">
                <Quote className="text-gold-500" size={26} />
                <p className="mt-5 text-lg leading-8 text-ink">"{item.quote}"</p>
                <div className="mt-8 border-t border-line pt-5">
                  <p className="font-extrabold text-ink">{item.name}</p>
                  <p className="text-sm font-semibold text-muted">{item.role}</p>
                </div>
              </Card>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
