import { CheckCircle2 } from "lucide-react";
import { SectionReveal } from "../components/ui/SectionReveal";
import { SplitWords } from "../components/ui/SplitWords";
import { TrendCard } from "../components/ui/TrendCard";
import { Tilt } from "../components/three/Tilt";
import { WebGLPhoto } from "../webgl/WebGLPhoto";
import type { PublicCabinet } from "../hooks/usePublicCabinet";

const reasons = [
  ["Accueil qualifié", "Les informations importantes sont recueillies avant la consultation."],
  ["Dossier médical partagé", "Antécédents, ordonnances et comptes-rendus accessibles à l'équipe autorisée."],
  ["Coordination des soins", "Vos différents spécialistes suivent le même dossier, sans doublon d'examens."],
  ["Secret médical", "Accès contrôlés et données de santé protégées, conformément à la réglementation."]
] as const;

const team = [
  { name: "Dr. Yassine Fassi", role: "Médecine générale", photo: "1622253692010-333f2da6031d" },
  { name: "Dr. Salma Benkirane", role: "Pédiatrie", photo: "1623854767648-e7bb8009f0db" },
  { name: "Dr. Karim Idrissi", role: "Cardiologie", photo: "1758691463393-a2aa9900af8a" },
  { name: "Dr. Nadia El Amrani", role: "Dermatologie", photo: "1622253694238-3b22139576c6" }
];

export function About({ cabinet }: { cabinet: PublicCabinet }) {
  return (
    <section id="equipe" className="relative px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionReveal className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eyebrow glass-panel inline-flex rounded-full px-4 py-2">Notre approche</span>
            <SplitWords as="h2" text="Un cabinet organisé autour de la *clarté*, de la ponctualité et du suivi." className="display mt-6 text-4xl text-ink md:text-6xl" />
            <p className="mt-6 max-w-md leading-8 text-muted">
              {cabinet.cabinetName} donne une image sérieuse dès le premier contact : discrétion, méthode et
              accompagnement humain, pour chaque patient reçu au cabinet.
            </p>
            <div className="mt-8">
              <TrendCard />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {reasons.map(([title, text]) => (
              <div key={title} className="glass-panel p-5 transition-transform duration-300 hover:-translate-y-1">
                <CheckCircle2 className="text-sage-600" size={21} />
                <h3 className="mt-4 font-extrabold text-ink">{title}</h3>
                <p className="mt-3 leading-7 text-muted">
                  {title === "Accueil qualifié" && cabinet.address ? `${text} Cabinet situé ${cabinet.address}.` : text}
                </p>
              </div>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Notre équipe</p>
              <h3 className="display mt-3 text-3xl text-ink md:text-4xl">Des médecins que vous connaîtrez par leur nom.</h3>
            </div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map(({ name, role, photo }) => (
              <Tilt key={name} max={6} innerClassName="glass-panel overflow-hidden">
                <div className="aspect-[4/5] overflow-hidden">
                  <WebGLPhoto
                    src={`https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=500&q=80`}
                    alt={`Portrait de ${name}`}
                    className="h-full w-full"
                  />
                </div>
                <div className="p-4">
                  <p className="font-extrabold text-ink">{name}</p>
                  <p className="mt-1 text-sm font-semibold text-sage-700">{role}</p>
                </div>
              </Tilt>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
