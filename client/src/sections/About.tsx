import { Award, CheckCircle2, HeartHandshake, LockKeyhole, UsersRound } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { SectionReveal } from "../components/ui/SectionReveal";
import type { PublicCabinet } from "../hooks/usePublicCabinet";

const reasons = [
  ["Accueil qualifie", "Les informations importantes sont recueillies avant le rendez-vous."],
  ["Dossiers centralises", "Documents, notes et historiques restent accessibles a l'equipe autorisee."],
  ["Communication claire", "Vous savez quoi preparer, quand venir et quelle est la prochaine etape."],
  ["Coordonnees fiables", "Contact direct, adresse visible et horaires lisibles pour limiter les frictions."]
];

const team = [
  { name: "Direction du cabinet", role: "Pilotage et qualite", icon: Award },
  { name: "Experts referents", role: "Conseil et prise en charge", icon: UsersRound },
  { name: "Accueil dedie", role: "Rendez-vous et orientation", icon: HeartHandshake },
  { name: "Confidentialite", role: "Gestion securisee", icon: LockKeyhole }
];

export function About({ cabinet }: { cabinet: PublicCabinet }) {
  return (
    <section id="about" className="bg-ivory px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionReveal className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge>Notre approche</Badge>
            <h2 className="mt-5 font-serif text-4xl font-bold tracking-normal text-ink md:text-5xl">
              Un cabinet organise autour de la clarte, de la ponctualite et du suivi.
            </h2>
            <p className="mt-5 leading-8 text-muted">
              {cabinet.cabinetName} donne une image serieuse des le premier contact: discretion, methode et accompagnement humain.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {reasons.map(([title, text]) => (
              <div key={title} className="rounded-lg border border-line bg-white p-5 shadow-soft">
                <CheckCircle2 className="text-petrol-600" size={21} />
                <h3 className="mt-4 font-extrabold text-ink">{title}</h3>
                <p className="mt-3 leading-7 text-muted">{title === "Coordonnees fiables" ? `${cabinet.address || "Casablanca, Maroc"} - ${cabinet.phone || "+212 522 00 00 00"}` : text}</p>
              </div>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal className="mt-16">
          <div className="soft-divider" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {team.map(({ name, role, icon: Icon }) => (
              <div key={name} className="rounded-lg border border-line bg-cream p-5">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-petrol-600 shadow-soft">
                  <Icon size={21} />
                </div>
                <p className="mt-5 font-extrabold text-ink">{name}</p>
                <p className="mt-2 text-sm font-semibold text-muted">{role}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
