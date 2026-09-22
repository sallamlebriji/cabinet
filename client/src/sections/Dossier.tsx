import { SectionReveal } from "../components/ui/SectionReveal";
import { SplitWords } from "../components/ui/SplitWords";
import { DossierShowcase, dossierTrust } from "../components/ui/DossierShowcase";
import { DossierTimeline } from "../components/ui/DossierTimeline";

export function Dossier() {
  return (
    <section id="dossier" className="relative px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionReveal className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow">Coordination des soins</p>
            <SplitWords as="h2" text="Un dossier, *toute l'équipe* soignante." className="display mt-4 text-4xl text-ink md:text-6xl" />
            <p className="mt-6 max-w-md leading-8 text-muted">
              Chaque médecin consulté voit le même dossier à jour : constantes, allergies,
              ordonnances et comptes-rendus, synchronisés en temps réel entre tous vos praticiens.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {dossierTrust.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-sm font-bold text-muted">
                  <Icon size={16} className="text-sage-600" /> {label}
                </span>
              ))}
            </div>
          </div>
          <DossierShowcase />
        </SectionReveal>

        <SectionReveal className="mt-16" transition={{ delay: 0.1, duration: 0.6 }}>
          <DossierTimeline />
        </SectionReveal>
      </div>
    </section>
  );
}
