import { useState } from "react";
import { cn } from "../../utils/cn";

type MediaProps = {
  /** Image affichée si aucune vidéo n'est fournie, ou si la vidéo échoue à charger. */
  src: string;
  alt: string;
  className?: string;
  /** Optionnelle : remplace la photo dès le premier rendu — jamais de flash de la photo avant. */
  video?: string;
};

/**
 * Photo (ou vidéo) simple, nette, sans effet superposé. Quand `video` est fourni, seule la
 * vidéo est montée (pas de repli visible tant qu'elle n'a pas échoué) : un serveur de dev en
 * mode SPA (Vite) répond 200 avec la page HTML pour un fichier manquant, ce que le lecteur ne
 * sait pas décoder — l'événement `error` du <video> suffit à détecter aussi bien ce cas qu'un
 * vrai fichier absent, sans requête séparée.
 */
export function Media({ src, alt, className, video }: MediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = Boolean(video) && !videoFailed;

  return (
    <div className={cn("relative overflow-hidden bg-cream", className)}>
      {showVideo ? (
        <video className="h-full w-full object-cover" src={video} autoPlay muted loop playsInline aria-label={alt} onError={() => setVideoFailed(true)} />
      ) : (
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      )}
    </div>
  );
}
