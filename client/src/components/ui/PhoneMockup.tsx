import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calendar, Check, Search } from "lucide-react";
import { PhoneFrame } from "./PhoneFrame";
import { cn } from "../../utils/cn";

/**
 * Mockup de téléphone avec une mini-UI vivante à l'intérieur — le même procédé que le
 * "Face scan in progress..." de lovi.care : montrer le produit en train de fonctionner plutôt
 * qu'une simple photo. Ici, le parcours de prise de rendez-vous se rejoue en boucle.
 */
const steps = [
  {
    key: "search",
    render: () => (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="relative grid h-11 w-11 place-items-center">
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-sage-200 border-t-sage-600" />
          <Search size={16} className="text-sage-700" />
        </span>
        <p className="text-xs font-bold text-ink">Recherche de créneau…</p>
      </div>
    )
  },
  {
    key: "slots",
    render: () => (
      <div className="flex h-full flex-col justify-center gap-2 px-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Aujourd'hui</p>
        {["14h00", "14h30", "15h30"].map((time, index) => (
          <div
            key={time}
            className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold",
              index === 2 ? "border-sage-600 bg-sage-50 text-sage-700" : "border-line text-muted"
            )}
          >
            {time}
            {index === 2 && <Check size={14} />}
          </div>
        ))}
      </div>
    )
  },
  {
    key: "confirmed",
    render: () => (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="grid h-12 w-12 place-items-center rounded-full bg-sage-600 text-ivory"
        >
          <Check size={22} />
        </motion.span>
        <div>
          <p className="text-xs font-extrabold text-ink">Rendez-vous confirmé</p>
          <p className="mt-1 text-[11px] font-semibold text-muted">Dr. Yassine Fassi</p>
          <p className="text-[11px] font-semibold text-muted">Aujourd'hui, 15h30</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 text-[10px] font-bold text-sage-700">
          <Calendar size={12} /> Ajouté à votre agenda
        </span>
      </div>
    )
  }
];

export function PhoneMockup({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const delays = [1400, 1600, 2400];
    const timer = setTimeout(() => setStep((current) => (current + 1) % steps.length), delays[step]);
    return () => clearTimeout(timer);
  }, [step, reduceMotion]);

  const active = reduceMotion ? steps[2] : steps[step];

  return (
    <PhoneFrame className={cn("max-w-[190px]", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {active.render()}
        </motion.div>
      </AnimatePresence>
    </PhoneFrame>
  );
}
