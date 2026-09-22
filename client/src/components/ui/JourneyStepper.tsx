import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, ChevronLeft, ChevronRight, FileCheck, PhoneCall, Stethoscope, type LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

const steps: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Prise de contact", description: "Vous appelez ou remplissez le formulaire ; l'accueil qualifie votre demande et vous oriente.", icon: PhoneCall },
  { title: "Consultation", description: "Rendez-vous avec le spécialiste adapté, à l'heure convenue, sans salle d'attente qui déborde.", icon: CalendarCheck },
  { title: "Diagnostic & soin", description: "Examen, explication claire de ce qui est observé, prise en charge immédiate si besoin.", icon: Stethoscope },
  { title: "Suivi", description: "Résultats, ordonnance et prochaine étape ajoutés à votre dossier partagé entre médecins.", icon: FileCheck }
];

/**
 * Stepper de parcours patient, façon "Smile Assessment → Care Planning → Treatment Process →
 * Dental Maintenance" avec pagination "01/04" repéré en inspiration. Avance seule, mais se
 * pilote aussi à la main (flèches, puces) — l'avance auto se remet à zéro après une interaction.
 */
export function JourneyStepper() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setActive((current) => (current + 1) % steps.length), 4000);
    return () => clearInterval(timer);
  }, [active, reduceMotion]);

  const goTo = (index: number) => setActive((index + steps.length) % steps.length);
  const step = steps[active];
  const Icon = step.icon;

  return (
    <div className="glass-panel p-6 sm:p-8">
      {/* Frise : ligne de progression + puces numérotées, cliquables. */}
      <div className="relative flex items-center justify-between">
        <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-line" />
        <motion.div
          className="absolute inset-x-4 top-1/2 h-px origin-left -translate-y-1/2 bg-sage-600"
          initial={false}
          animate={{ scaleX: active / (steps.length - 1) }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        {steps.map((item, index) => (
          <button
            key={item.title}
            onClick={() => goTo(index)}
            aria-label={item.title}
            aria-current={index === active}
            className={cn(
              "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-extrabold transition-colors duration-300 sm:h-9 sm:w-9",
              index === active
                ? "border-sage-600 bg-sage-600 text-ivory"
                : index < active
                  ? "border-sage-600 bg-ivory text-sage-700"
                  : "border-line bg-ivory text-muted"
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Détail de l'étape active. */}
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.title}
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-4"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sage-500 to-sage-700 text-ivory">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-lg font-extrabold text-ink">{step.title}</p>
              <p className="mt-1.5 max-w-md text-sm leading-6 text-muted">{step.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-bold tabular-nums text-muted">
            {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            <button onClick={() => goTo(active - 1)} aria-label="Étape précédente" className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition hover:border-ink">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => goTo(active + 1)} aria-label="Étape suivante" className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition hover:border-ink">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
