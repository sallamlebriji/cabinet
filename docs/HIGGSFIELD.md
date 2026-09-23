# Visuel héro généré (Higgsfield)

Le hero du site public (`client/src/sections/Hero.tsx`) affiche par défaut une photo Unsplash
vérifiée (médecin souriant avec un patient), rendue dans un canvas WebGL avec un effet de
révélation façon polaroid. Vous pouvez la remplacer par une **vidéo courte** générée avec
[Higgsfield](https://higgsfield.ai/) — comme le font les sites de référence dont ce site
s'inspire (une vidéo qui joue directement dans le visuel principal, pas une photo figée) — ou par
une simple photo, **sans toucher au code**.

## Vidéo (priorité)

1. Générez un plan court (4 à 8 s), en boucle si possible, sur
   [console.higgsfield.ai](https://higgsfield.ai/) : scène chaleureuse de consultation, format
   portrait proche de **4:5**, cohérente avec la palette du site (sauge/argile, voir
   `client/tailwind.config.ts`).
2. Exportez en MP4 (H.264), poids raisonnable (< 8 Mo conseillé pour un chargement rapide).
3. Renommez le fichier exactement `hero-video.mp4` et déposez-le dans `client/public/media/`.
4. Rechargez la page : la vidéo joue en boucle, muette, à travers le même effet de révélation que
   la photo — elle **remplace automatiquement** la photo par défaut. Si le fichier est absent ou
   ne charge pas, aucune erreur : la photo prend le relais.

## Photo (repli, ou si vous préférez une image fixe)

1. Générez une image sur Higgsfield, même format (4:5).
2. Exportez en JPG ou WebP, renommez `hero-photo.jpg`, déposez dans `client/public/media/`.
3. Utilisée si aucune vidéo n'est présente (ou si la vidéo échoue à charger).

Higgsfield expose aussi une API (`console.higgsfield.ai`) pour scripter la génération, mais elle
nécessite une clé de compte payante : aucune intégration automatique n'est faite ici, le dépôt de
fichier reste volontaire et simple à auditer, sans exposer de clé côté client.

## Étendre à d'autres visuels

Le composant `client/src/webgl/WebGLPhoto.tsx` accepte un prop `video` optionnel en plus de `src`
(la photo/poster) — réutilisable sur n'importe quelle photo du site (portraits de l'équipe, photo
de la section « Notre équipe ») pour lui donner le même traitement vidéo-dans-le-shader.
