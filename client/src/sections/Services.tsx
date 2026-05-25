import { BriefcaseBusiness, CalendarCheck, FileText, Handshake, Scale, ShieldCheck } from "lucide-react";
import { Card } from "../components/ui/Card";
import { SectionReveal } from "../components/ui/SectionReveal";

const services = [
  { title: "Consultation initiale", description: "Analyse de votre situation, qualification de la demande et orientation vers le bon interlocuteur.", icon: Handshake },
  { title: "Suivi de dossier", description: "Pieces, notes, historique et prochaines actions organises dans un parcours lisible.", icon: FileText },
  { title: "Rendez-vous planifies", description: "Creneaux confirmes, rappels utiles et gestion fluide des changements de planning.", icon: CalendarCheck },
  { title: "Accompagnement professionnel", description: "Prise en charge structuree des demandes recurrentes pour entreprises et dirigeants.", icon: BriefcaseBusiness },
  { title: "Conseil et conformite", description: "Methodologie rigoureuse, preparation documentaire et respect des obligations.", icon: Scale },
  { title: "Confidentialite", description: "Acces controles, donnees protegees et communication sobrement centralisee.", icon: ShieldCheck }
];

export function Services({ cabinetName }: { cabinetName: string }) {
  return (
    <section id="services" className="bg-cream px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionReveal className="max-w-3xl">
          <p className="section-kicker">Prestations</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-normal text-ink md:text-5xl">Les services essentiels de {cabinetName}.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-muted">Une experience claire, rassurante et efficace, adaptee aux cabinets medicaux, dentaires, juridiques, comptables, de conseil ou d'architecture.</p>
        </SectionReveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ title, description, icon: Icon }, index) => (
            <SectionReveal key={title} transition={{ delay: index * 0.04, duration: 0.55 }}>
              <Card className="group h-full p-6 transition duration-300 hover:-translate-y-1 hover:border-gold-200 hover:shadow-premium">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-petrol-50 text-petrol-600 transition group-hover:bg-ink group-hover:text-gold-200">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-ink">{title}</h3>
                <p className="mt-3 leading-7 text-muted">{description}</p>
              </Card>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
