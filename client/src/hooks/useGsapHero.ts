import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapHero(scope: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-reveal]", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out"
      });
      gsap.to("[data-parallax]", {
        yPercent: -10,
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.7
        }
      });
      gsap.utils.toArray<HTMLElement>("[data-gsap-line]").forEach((line) => {
        gsap.from(line, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: line,
            start: "top 82%"
          }
        });
      });
    }, scope);
    return () => ctx.revert();
  }, [scope]);
}
