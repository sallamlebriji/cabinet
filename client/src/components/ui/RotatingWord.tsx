import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Mot qui pivote en 3D comme sur un cylindre (clin d'œil au « (better) » de Few and Far). */
export function RotatingWord({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % words.length), interval);
    return () => window.clearInterval(timer);
  }, [interval, reduceMotion, words.length]);

  return (
    <span className="relative inline-block align-baseline [perspective:700px]">
      <span className="sr-only">{words.join(", ")}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          aria-hidden
          key={words[index]}
          className="accent-text inline-block italic"
          style={{ originZ: -22 }}
          initial={reduceMotion ? false : { rotateX: -90, opacity: 0, y: "35%" }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { rotateX: 90, opacity: 0, y: "-35%" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
