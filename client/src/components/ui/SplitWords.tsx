import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "../../utils/cn";

type SplitWordsProps = {
  /** Texte du titre. Entourez un mot de `*astérisques*` pour l'afficher en italique doré. */
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
};

const tags = { h1: motion.h1, h2: motion.h2, h3: motion.h3 } as const;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Découpe par espace puis suit l'état "emphase active" mot après mot : gère aussi bien
 * `*mot*` que `*plusieurs mots*` (utile pour un nom de cabinet variable), astérisques retirés
 * à l'affichage et ponctuation collée préservée (ex. "Atlas*." -> "Atlas.").
 */
function tokenize(text: string) {
  let active = false;
  return text.split(" ").map((raw) => {
    const starCount = (raw.match(/\*/g) ?? []).length;
    const emphasis = active || raw.includes("*");
    if (starCount % 2 === 1) active = !active;
    return { text: raw.replace(/\*/g, ""), emphasis };
  });
}

/** Titre révélé mot par mot (masque + bascule 3D), à la manière des sites d'agence. */
export function SplitWords({ text, as = "h2", className, delay = 0 }: SplitWordsProps) {
  const reduceMotion = useReducedMotion();
  const Tag = tags[as];
  const words = tokenize(text);

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: delay } } };
  const word: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { y: "110%", rotateX: -55, opacity: 0 },
    show: { y: 0, rotateX: 0, opacity: 1, transition: { duration: 0.9, ease } }
  };

  return (
    <Tag className={className} aria-label={words.map((item) => item.text).join(" ")} variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -12% 0px" }}>
      {words.map((item, index) => (
        <span key={`${item.text}-${index}`} aria-hidden className="inline-block overflow-hidden py-[0.14em] pr-[0.08em] align-bottom -my-[0.14em] [perspective:600px]">
          <motion.span variants={word} style={{ transformOrigin: "50% 100%" }} className={cn("inline-block will-change-transform", item.emphasis && "accent-text italic")}>
            {item.text}
          </motion.span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
