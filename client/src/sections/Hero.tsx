import { useRef, type PointerEvent } from "react";
import { ArrowRight, Clock, MapPin, Phone, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useGsapHero } from "../hooks/useGsapHero";
import { ctaClass } from "../components/ui/cta";
import { RotatingWord } from "../components/ui/RotatingWord";
import { Counter } from "../components/ui/Counter";
import { PhoneMockup } from "../components/ui/PhoneMockup";
import { Tilt } from "../components/three/Tilt";
import { WebGLPhoto } from "../webgl/WebGLPhoto";
import { media, useImageReady } from "../data/media";
import type { PublicCabinet } from "../hooks/usePublicCabinet";

const FALLBACK_HERO_PHOTO = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1000&q=80";

const proof: [number, string, string][] = [
  [15, "+", "ans d'expérience"],
  [12, "", "spécialités"],
  [24, "h", "délai de réponse"]
];

export function Hero({ cabinet }: { cabinet: PublicCabinet }) {
  const ref = useRef<HTMLElement>(null);
  useGsapHero(ref);
  const customPhotoReady = useImageReady(media.heroPhoto);
  const heroPhoto = customPhotoReady ? media.heroPhoto : FALLBACK_HERO_PHOTO;

  // Parallax léger au pointeur : les deux photos se décalent à des vitesses différentes,
  // ce qui crée une vraie sensation de profondeur sans WebGL.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 120, damping: 18, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const mainX = useTransform(sx, [0, 1], [-10, 10]);
  const mainY = useTransform(sy, [0, 1], [-8, 8]);
  const phoneX = useTransform(sx, [0, 1], [14, -14]);
  const phoneY = useTransform(sy, [0, 1], [12, -12]);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <section ref={ref} id="home" className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 lg:px-8">
      <span aria-hidden className="chapter-num pointer-events-none absolute -top-6 -left-4 select-none text-[30vw] sm:text-[22vw] lg:text-[16vw]">
        01
      </span>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-10">
        <div className="max-w-xl lg:max-w-none">
          <span data-hero-reveal className="eyebrow glass-panel inline-flex rounded-full px-4 py-2">
            Cabinet médical pluridisciplinaire à Casablanca
          </span>

          <h1 data-hero-reveal className="display mt-7 text-5xl text-ink sm:text-6xl lg:text-[5.2rem]">
            {cabinet.cabinetName}
          </h1>

          <p data-hero-reveal className="mt-6 max-w-lg text-lg leading-8 text-muted">
            Une médecine <RotatingWord words={["accessible", "attentive", "rassurante", "coordonnée"]} /> pour vous et
            votre famille : consultations, suivi et dossiers réunis dans un seul cabinet de confiance.
          </p>

          <div data-hero-reveal className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#contact" className={ctaClass("primary")}>
              Prendre rendez-vous <ArrowRight size={18} />
            </a>
            <Link to="/login" className={ctaClass("outline")}>
              Accéder à l'espace cabinet
            </Link>
          </div>

          <div data-hero-reveal className="glass-panel mt-10 grid grid-cols-3 divide-x divide-line rounded-2xl">
            {proof.map(([value, suffix, label]) => (
              <div key={label} className="px-3 py-4 text-center sm:px-5">
                <p className="display text-3xl text-ink sm:text-4xl">
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div data-hero-reveal className="mt-8 grid gap-3 text-sm font-semibold text-muted sm:grid-cols-3">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-sage-600" /> {cabinet.address}
            </span>
            <span className="flex items-center gap-2">
              <Phone size={16} className="text-sage-600" /> {cabinet.phone}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-sage-600" /> Lun–Ven
            </span>
          </div>
        </div>

        <motion.div
          data-parallax
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative mx-auto w-full max-w-md pb-10 pl-6 pt-4 lg:max-w-none"
        >
          {/* Badge de confiance flottant au-dessus du visuel, à la lovi.care ("🌟 Award"). */}
          <div className="float-y glass-panel absolute -top-5 left-6 z-10 flex items-center gap-2 rounded-full px-4 py-2 sm:left-10">
            <span className="flex text-sage-600">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={12} fill="currentColor" />
              ))}
            </span>
            <span className="text-xs font-extrabold text-ink">4.9 · 320 avis patients</span>
          </div>

          <Tilt max={5} glare={false} innerClassName="overflow-hidden rounded-[2rem] border border-line shadow-premium">
            <motion.div style={{ x: mainX, y: mainY }} className="aspect-[4/5]">
              <WebGLPhoto src={heroPhoto} video={media.heroVideo} alt="Médecin souriant échangeant avec un patient au cabinet" className="h-full w-full" />
            </motion.div>
          </Tilt>

          {/* Mockup téléphone avec mini-UI vivante : le parcours de prise de rendez-vous, en boucle
              (même procédé que le "Face scan in progress..." de lovi.care). */}
          <motion.div style={{ x: phoneX, y: phoneY }} className="absolute -left-4 bottom-6 sm:-left-8 sm:bottom-10">
            <PhoneMockup className="w-32 sm:w-40" />
          </motion.div>
        </motion.div>
      </div>

      <div aria-hidden className="pointer-events-none relative mx-auto mt-16 hidden max-w-7xl items-center gap-3 sm:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-muted">Défiler</span>
        <span className="h-10 w-px overflow-hidden bg-line">
          <span className="block h-full w-full origin-top bg-sage-500" style={{ animation: "scroll-cue 2.2s ease-in-out infinite" }} />
        </span>
      </div>
    </section>
  );
}
