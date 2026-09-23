import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

type MediaProps = {
  /** Image affichée directement, et pendant que la vidéo (si fournie) n'est pas encore prête. */
  src: string;
  alt: string;
  className?: string;
  /** Optionnelle : si elle charge vraiment, une vidéo en boucle remplace la photo. */
  video?: string;
};

/**
 * Photo (ou vidéo) simple, nette, sans effet superposé. Si `video` est fourni, on vérifie
 * d'abord son vrai Content-Type avant de l'utiliser : un serveur de dev en mode SPA (Vite)
 * répond 200 avec la page HTML pour une URL absente, y compris une vidéo manquante — sans ce
 * contrôle, un <video> peut rester bloqué sur un fichier qui n'existe pas. Repli silencieux sur
 * la photo si la vidéo est absente ou invalide.
 */
export function Media({ src, alt, className, video }: MediaProps) {
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!video) return;
    let cancelled = false;
    fetch(video, { method: "HEAD" })
      .then((response) => {
        const type = response.headers.get("content-type") ?? "";
        if (!cancelled && response.ok && type.startsWith("video/")) setVideoReady(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [video]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      {videoReady && video && (
        <video className="absolute inset-0 h-full w-full object-cover" src={video} autoPlay muted loop playsInline aria-hidden />
      )}
    </div>
  );
}
