import { useEffect, useState } from "react";

/**
 * Visuel héro optionnel (par ex. généré avec Higgsfield). Déposez un fichier à l'un de ces
 * chemins dans `client/public/media/` : le hero le détecte tout seul.
 * - `heroVideo` a la priorité : si elle charge, la vidéo joue en boucle à travers le shader de
 *   révélation WebGL (voir `webgl/WebGLPhoto.tsx`) — le même procédé que les hero vidéo "3D
 *   intégré" des sites de référence.
 * - `heroPhoto` sert de repli si la vidéo est absente ou échoue, à la place de la photo Unsplash.
 * Les deux absents = aucune erreur, la photo par défaut reste affichée. Voir docs/HIGGSFIELD.md.
 */
export const media = {
  heroPhoto: "/media/hero-photo.jpg",
  heroVideo: "/media/hero-video.mp4"
} as const;

/** `true` quand l'image existe vraiment (le serveur SPA renvoie du HTML pour un fichier absent : le chargement échoue). */
export function useImageReady(src: string) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => active && setReady(image.naturalWidth > 0);
    image.onerror = () => active && setReady(false);
    image.src = src;
    return () => {
      active = false;
    };
  }, [src]);

  return ready;
}
