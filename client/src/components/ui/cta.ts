import { cn } from "../../utils/cn";

/**
 * Classes des boutons du site public (relief « touche de clavier »).
 * Retourne uniquement des classes pour pouvoir les poser sur un <a>, un <Link> ou un <button>
 * sans imbriquer un bouton dans un lien.
 */
export function ctaClass(variant: "primary" | "outline" = "primary", className?: string) {
  return cn("cta", variant === "primary" ? "cta-primary" : "cta-outline", className);
}
