import { motion } from "framer-motion";
import { AlertTriangle, FileText, HeartPulse, Pill, ScrollText, Stethoscope, Syringe, Users } from "lucide-react";
import { Media } from "./Media";

const indicators = [
  { icon: AlertTriangle, label: "Allergies", tone: "text-clay-600 bg-clay-100" },
  { icon: Syringe, label: "Vaccins", tone: "text-sage-700 bg-sage-100" },
  { icon: HeartPulse, label: "Constantes", tone: "text-sage-700 bg-sage-100" },
  { icon: Pill, label: "Ordonnances", tone: "text-clay-600 bg-clay-100" },
  { icon: FileText, label: "Bilans", tone: "text-sage-700 bg-sage-100" },
  { icon: Stethoscope, label: "Imagerie", tone: "text-sage-700 bg-sage-100" },
  { icon: ScrollText, label: "Antécédents", tone: "text-clay-600 bg-clay-100" },
  { icon: Users, label: "Contacts d'urgence", tone: "text-sage-700 bg-sage-100" }
];

const visits = [
  { month: "Jan", photo: null },
  { month: "Fév", photo: null },
  { month: "Mar", photo: "1622253692010-333f2da6031d" },
  { month: "Avr", photo: null },
  { month: "Mai", photo: null },
  { month: "Jun", photo: "1623854767648-e7bb8009f0db" },
  { month: "Jul", photo: null },
  { month: "Août", photo: null },
  { month: "Sep", photo: "1758691463393-a2aa9900af8a" }
];

/**
 * Carte double, même découpage que le module "See the condition of 11+ skin issues /
 * Track how your skin changes over time" de lovi.care : à gauche une grille d'indicateurs
 * suivis, à droite une frise chronologique des consultations avec des repères photo.
 */
export function DossierTimeline() {
  return (
    <div className="glass-panel grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10">
      <div>
        <p className="text-sm font-extrabold text-ink">8 indicateurs suivis à chaque visite</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {indicators.map(({ icon: Icon, label, tone }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="flex items-center gap-2 rounded-xl border border-line bg-white/70 px-3 py-2.5"
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${tone}`}>
                <Icon size={13} />
              </span>
              <span className="text-xs font-bold text-ink/80">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-extrabold text-ink">Vos consultations, visibles dans le temps</p>
        <div className="relative mt-10 flex h-11 items-center justify-between px-1">
          <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-line" />
          {visits.map((visit) =>
            visit.photo ? (
              <div key={visit.month} className="relative z-10 h-9 w-9 overflow-hidden rounded-full border-2 border-sage-600 shadow-soft sm:h-11 sm:w-11">
                <Media src={`https://images.unsplash.com/photo-${visit.photo}?auto=format&fit=crop&w=100&q=70`} alt={`Consultation de ${visit.month}`} className="h-full w-full" />
              </div>
            ) : (
              <span key={visit.month} className="relative z-10 h-2 w-2 rounded-full bg-line ring-4 ring-ivory" />
            )
          )}
        </div>
        <div className="mt-2 flex justify-between px-1">
          {visits.map((visit) => (
            <span key={visit.month} className="w-9 text-center text-[9px] font-bold uppercase tracking-wide text-muted sm:w-11 sm:text-[10px]">
              {visit.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
