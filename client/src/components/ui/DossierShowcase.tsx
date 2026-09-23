import { motion, useReducedMotion } from "framer-motion";
import { FileCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "./PhoneFrame";
import { Media } from "./Media";

function ResultScreen({ photoId, doctor, tab }: { photoId: string; doctor: string; tab: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        <Media src={`https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=400&q=75`} alt={`Vue du dossier suivi par ${doctor}`} className="h-full w-full" />
        <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-[9px] font-bold text-ivory backdrop-blur">{doctor}</span>
      </div>
      <div className="flex items-center justify-around border-t border-line bg-ivory px-2 py-2 text-[9px] font-bold text-muted">
        <span className="rounded-full bg-sage-50 px-2 py-1 text-sage-700">{tab}</span>
        <span>Constantes</span>
        <span>Historique</span>
      </div>
    </div>
  );
}

function SyncScreen() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-night-900 px-6 text-center">
      <div className="relative grid h-20 w-20 place-items-center">
        <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#7fb0ec"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={reduceMotion ? { pathLength: 0.75 } : { pathLength: [0, 0.85, 0] }}
            transition={reduceMotion ? undefined : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
        <RefreshCw size={20} className="text-sage-200" />
      </div>
      <p className="text-xs font-bold text-ivory">Synchronisation du dossier…</p>
      <p className="text-[10px] leading-4 text-white/45">Entre chaque médecin consulté, en temps réel.</p>
    </div>
  );
}

/**
 * Trois téléphones qui montrent le même dossier vu par des médecins différents, plus un
 * troisième au centre en pleine synchronisation — la même mécanique que les captures d'écran
 * "face scan" à trois téléphones de lovi.care, adaptée à la coordination des soins.
 */
export function DossierShowcase() {
  return (
    <div className="grid grid-cols-3 items-center gap-3 sm:gap-5">
      <div className="translate-y-4">
        <PhoneFrame>
          <ResultScreen photoId="1622253692010-333f2da6031d" doctor="Dr. Fassi" tab="Vue d'ensemble" />
        </PhoneFrame>
      </div>
      <div className="relative z-10 scale-[1.12]">
        <PhoneFrame dark>
          <SyncScreen />
        </PhoneFrame>
      </div>
      <div className="translate-y-4">
        <PhoneFrame>
          <ResultScreen photoId="1623854767648-e7bb8009f0db" doctor="Dr. Benkirane" tab="Historique" />
        </PhoneFrame>
      </div>
    </div>
  );
}

export const dossierTrust = [
  { icon: ShieldCheck, label: "Chiffré de bout en bout" },
  { icon: FileCheck, label: "Conforme au secret médical" },
  { icon: RefreshCw, label: "Mis à jour en temps réel" }
];
