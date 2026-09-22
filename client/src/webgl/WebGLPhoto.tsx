import { useEffect, useRef, useState } from "react";
import { fragmentShader, vertexShader } from "./shaders";

type WebGLPhotoProps = {
  src: string;
  alt: string;
  className?: string;
  /** Couleur "polaroid non développé" affichée avant que la photo ne se révèle. */
  tint?: [number, number, number];
};

/**
 * Photo rendue dans un <canvas> WebGL (plan texturé + shader), à la manière des sites d'agence
 * qui embarquent un canvas pour leurs visuels (cf. otsuka-air.jp) plutôt qu'une simple <img>.
 * Un seul effet, discret et pensé pour un cabinet médical (pas un gadget) : développement façon
 * polaroid quand la photo entre dans le viewport, une fois. Aucune interaction à la souris.
 * Se dégrade en <img> normale si WebGL échoue, ou si l'utilisateur préfère moins d'animation.
 */
export function WebGLPhoto({ src, alt, className, tint = [0.243, 0.325, 0.278] }: WebGLPhotoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let disposeScene: (() => void) | undefined;

    import("three")
      .then((THREE) => {
        if (cancelled || !container) return;

        let disposed = false;
        const trash: { dispose: () => void }[] = [];

        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
          setWebglFailed(true);
          return;
        }

        const canvas = renderer.domElement;
        canvas.style.cssText = "display:block;width:100%;height:100%";
        container.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const uniforms = {
          uTexture: { value: null as InstanceType<typeof THREE.Texture> | null },
          uScale: { value: new THREE.Vector2(1, 1) },
          uReveal: { value: -0.15 },
          uTint: { value: new THREE.Vector3(...tint) }
        };

        const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(mesh);
        trash.push(mesh.geometry, material);

        let imageAspect = 1;
        const applyScale = () => {
          const containerAspect = Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight);
          uniforms.uScale.value.set(
            containerAspect > imageAspect ? 1 : containerAspect / imageAspect,
            containerAspect > imageAspect ? imageAspect / containerAspect : 1
          );
          render();
        };

        const render = () => renderer.render(scene, camera);

        new THREE.TextureLoader().load(src, (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = false;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          imageAspect = texture.image.width / texture.image.height;
          applyScale();
          uniforms.uTexture.value = texture;
          trash.push(texture);
          render();
        });

        const resize = () => {
          const width = Math.max(1, container.clientWidth);
          const height = Math.max(1, container.clientHeight);
          renderer.setSize(width, height, false);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          applyScale();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
        resize();

        // Révélation déclenchée une fois, quand la photo entre dans le viewport : c'est le seul
        // moment où l'on a besoin d'animer, donc la boucle s'arrête juste après (pas de rendu
        // continu inutile — utile ici vu le nombre de photos WebGL sur une même page).
        let revealTarget = 0;
        const intersectionObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              revealTarget = 1.15;
              startTicking();
              intersectionObserver.disconnect();
            }
          },
          { threshold: 0.2 }
        );
        intersectionObserver.observe(container);

        let last = performance.now();
        let raf = 0;
        let ticking = false;
        const tick = (now: number) => {
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          uniforms.uReveal.value += (revealTarget - uniforms.uReveal.value) * Math.min(1, dt * 1.8);
          render();
          if (Math.abs(revealTarget - uniforms.uReveal.value) > 0.002) {
            raf = requestAnimationFrame(tick);
          } else {
            uniforms.uReveal.value = revealTarget;
            render();
            ticking = false;
          }
        };
        const startTicking = () => {
          if (ticking) return;
          ticking = true;
          last = performance.now();
          raf = requestAnimationFrame(tick);
        };

        const onVisibility = () => {
          last = performance.now();
        };
        document.addEventListener("visibilitychange", onVisibility);

        disposeScene = () => {
          disposed = true;
          cancelAnimationFrame(raf);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          document.removeEventListener("visibilitychange", onVisibility);
          for (const item of trash) item.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          canvas.remove();
        };
      })
      .catch(() => setWebglFailed(true));

    return () => {
      cancelled = true;
      disposeScene?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const showFallback = webglFailed || reducedMotion;

  return (
    <div ref={containerRef} className={className}>
      {showFallback && <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />}
      {!showFallback && <span className="sr-only">{alt}</span>}
    </div>
  );
}
