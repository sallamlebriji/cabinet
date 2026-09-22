import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Bulles de chat qui apparaissent l'une après l'autre à l'entrée en vue — même registre que
 * l'assistant conversationnel de lovi.care ("Hi! I'm Lóvi AI Assistant..."), adapté à la prise
 * de rendez-vous. Purement décoratif (pas de vrai assistant branché).
 */
const bubble = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 }
};

export function AssistantChat() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15%" }}
      transition={{ staggerChildren: 0.45, delayChildren: 0.1 }}
      className="flex flex-col gap-3"
    >
      <motion.div variants={bubble} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex items-end gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sage-500 to-sage-700 text-ivory">
          <Stethoscope size={14} />
        </span>
        <div className="glass-panel rounded-bl-sm px-4 py-2.5 text-sm text-ink">
          👋 Bonjour ! Je suis l'assistant du cabinet, je peux vous aider à trouver un créneau.
        </div>
      </motion.div>

      <motion.div variants={bubble} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="ml-10 flex flex-wrap gap-2">
        {["Consultation générale", "Suivi", "Urgence"].map((reason, index) => (
          <span
            key={reason}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold",
              index === 0 ? "border-sage-600 bg-sage-600 text-ivory" : "border-line bg-white text-muted"
            )}
          >
            {reason}
          </span>
        ))}
      </motion.div>

      <motion.div variants={bubble} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="ml-10 flex items-end gap-2">
        <div className="glass-panel rounded-bl-sm px-4 py-2.5 text-sm text-ink">
          Parfait — un créneau est disponible <span className="font-extrabold text-sage-700">aujourd'hui à 15h30</span>. Je vous le réserve ?
        </div>
      </motion.div>
    </motion.div>
  );
}
