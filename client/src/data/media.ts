import { useEffect, useState } from "react";

/**
 * Photo héro optionnelle (par ex. générée avec Higgsfield). Déposez un fichier à cet exact
 * chemin dans `client/public/media/` : le hero la détecte tout seul et remplace la photo
 * Unsplash par défaut. Absent = aucune erreur, la photo par défaut reste affichée.
 * Voir docs/HIGGSFIELD.md.
 */
export const media = {
  heroPhoto: "/media/hero-photo.jpg"
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
