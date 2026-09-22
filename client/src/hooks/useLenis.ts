import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth-scroll façon site d'agence (Lenis, la même librairie détectée sur otsuka-air.jp).
 * Piloté par le ticker GSAP : c'est l'intégration officielle Lenis + ScrollTrigger, ça évite
 * deux boucles de rendu qui se battent et garde `useGsapHero` parfaitement synchronisé.
 * Ignoré si l'utilisateur préfère moins de mouvement — le défilement natif reste alors actif.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: import("lenis").default | undefined;
    let rafCallback: ((time: number) => void) | undefined;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);

      rafCallback = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0);
    });

    return () => {
      cancelled = true;
      if (rafCallback) gsap.ticker.remove(rafCallback);
      lenis?.destroy();
    };
  }, []);
}
