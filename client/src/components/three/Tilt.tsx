import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "../../utils/cn";

type TiltProps = {
  children: ReactNode;
  /** Classes du conteneur (position dans la grille, taille). */
  className?: string;
  /** Classes de la face qui s'incline (fond, bordure, rayon). */
  innerClassName?: string;
  /** Inclinaison maximale en degrés. */
  max?: number;
  glare?: boolean;
};

/**
 * Carte CSS 3D : s'incline vers le pointeur, avec reflet lumineux.
 * Les enfants peuvent se détacher de la face avec `[transform:translateZ(40px)]`.
 * Désactivé au tactile et avec `prefers-reduced-motion`.
 */
export function Tilt({ children, className, innerClassName, max = 9, glare = true }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const spring = { stiffness: 170, damping: 16, mass: 0.5 };
  const smoothX = useSpring(x, spring);
  const smoothY = useSpring(y, spring);
  const rotateY = useTransform(smoothX, [0, 1], [-max, max]);
  const rotateX = useTransform(smoothY, [0, 1], [max, -max]);
  const glareX = useTransform(smoothX, (value) => value * 100);
  const glareY = useTransform(smoothY, (value) => value * 100);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18), transparent 62%)`;

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <div ref={ref} className={cn("group/tilt [perspective:1100px]", className)} onPointerMove={handleMove} onPointerLeave={handleLeave}>
      <motion.div style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }} className={cn("relative h-full", innerClassName)}>
        {children}
        {glare && !reduceMotion && (
          <motion.div
            aria-hidden
            style={{ backgroundImage: sheen }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover/tilt:opacity-100"
          />
        )}
      </motion.div>
    </div>
  );
}
