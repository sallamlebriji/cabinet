import { Hero } from "../sections/Hero";
import { Services } from "../sections/Services";
import { Journey } from "../sections/Journey";
import { About } from "../sections/About";
import { Dossier } from "../sections/Dossier";
import { Testimonials } from "../sections/Testimonials";
import { Contact } from "../sections/Contact";
import { Ticker } from "../components/ui/Ticker";
import { TagTicker } from "../components/ui/TagTicker";
import { usePublicCabinet } from "../hooks/usePublicCabinet";

const consultationReasons = [
  "Fièvre",
  "Bilan de routine",
  "Suivi de grossesse",
  "Douleurs articulaires",
  "Vaccination",
  "Consultation pédiatrique",
  "Bilan cardiaque",
  "Problème de peau",
  "Rééducation",
  "Contrôle de tension"
];

export function Home() {
  const cabinet = usePublicCabinet();

  return (
    <>
      <Hero cabinet={cabinet} />
      <div className="py-8">
        <TagTicker items={consultationReasons} />
      </div>
      <Services cabinetName={cabinet.cabinetName} />
      <div className="border-y border-line py-7">
        <Ticker items={["Écoute", "Méthode", "Ponctualité", "Confidentialité", "Suivi"]} reverse />
      </div>
      <Journey />
      <About cabinet={cabinet} />
      <Dossier />
      <Testimonials />
      <Contact cabinet={cabinet} />
    </>
  );
}
