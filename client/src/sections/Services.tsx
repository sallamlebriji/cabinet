import { Baby, Flower2, HeartPulse, PersonStanding, Sparkles, Stethoscope } from "lucide-react";
import { SectionReveal } from "../components/ui/SectionReveal";
import { SplitWords } from "../components/ui/SplitWords";
import { Tilt } from "../components/three/Tilt";

const specialites = [
  { title: "Médecine générale", description: "Consultations, bilans de routine et orientation vers le bon spécialiste.", icon: Stethoscope },
  { title: "Pédiatrie", description: "Suivi de croissance, vaccins et consultations pour les enfants dès la naissance.", icon: Baby },
  { title: "Cardiologie", description: "Bilans cardiovasculaires, ECG et suivi des patients à risque.", icon: HeartPulse },
  { title: "Gynécologie", description: "Suivi gynécologique, grossesse et prévention à chaque étape de la vie.", icon: Flower2 },
  { title: "Dermatologie", description: "Diagnostic de la peau, traitements et suivi dermatologique personnalisé.", icon: Sparkles },
  { title: "Kinésithérapie", description: "Rééducation fonctionnelle et accompagnement post-opératoire sur mesure.", icon: PersonStanding }
];

export function Services({ cabinetName }: { cabinetName: string }) {
  return (
    <section id="specialites" className="relative px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
      <span aria-hidden className="chapter-num pointer-events-none absolute -top-10 right-0 select-none text-[24vw] sm:text-[16vw] lg:text-[11vw]">
        02
      </span>
      <div className="relative mx-auto max-w-7xl">
        <SectionReveal className="max-w-2xl">
          <p className="eyebrow">Spécialités</p>
          <SplitWords as="h2" text={`Les soins réunis de *${cabinetName}*.`} className="display mt-4 text-4xl text-ink md:text-6xl" />
          <p className="mt-6 max-w-xl leading-8 text-muted">
            Une équipe pluridisciplinaire, un dossier patient unique et un accueil pensé pour rassurer, de la
            première consultation au suivi le plus régulier.
          </p>
        </SectionReveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {specialites.map(({ title, description, icon: Icon }, index) => (
            <SectionReveal key={title} transition={{ delay: index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Tilt className="h-full" innerClassName="glass-panel group h-full p-6 transition-colors duration-300 hover:border-sage-300">
                <div
                  style={{ transform: "translateZ(38px)" }}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 text-ivory shadow-sage transition-transform duration-300 group-hover:scale-105"
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ transform: "translateZ(26px)" }} className="mt-6 text-xl font-extrabold text-ink">
                  {title}
                </h3>
                <p style={{ transform: "translateZ(20px)" }} className="mt-3 leading-7 text-muted">
                  {description}
                </p>
              </Tilt>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
