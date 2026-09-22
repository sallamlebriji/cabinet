import { SectionReveal } from "../components/ui/SectionReveal";
import { SplitWords } from "../components/ui/SplitWords";
import { JourneyStepper } from "../components/ui/JourneyStepper";

export function Journey() {
  return (
    <section id="parcours" className="relative px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionReveal className="max-w-2xl">
          <p className="eyebrow">Parcours patient</p>
          <SplitWords as="h2" text="Un chemin *clair*, du premier appel au suivi." className="display mt-4 text-4xl text-ink md:text-6xl" />
        </SectionReveal>
        <SectionReveal className="mt-10" transition={{ delay: 0.1, duration: 0.6 }}>
          <JourneyStepper />
        </SectionReveal>
      </div>
    </section>
  );
}
