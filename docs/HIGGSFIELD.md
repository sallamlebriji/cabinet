# Photo héro générée (Higgsfield)

Le hero du site public (`client/src/sections/Hero.tsx`) affiche par défaut une photo Unsplash
vérifiée (médecin souriant avec un patient). Vous pouvez la remplacer par une photo générée avec
[Higgsfield](https://higgsfield.ai/) — ou toute autre image — **sans toucher au code**.

## Marche à suivre

1. Générez une image sur [console.higgsfield.ai](https://higgsfield.ai/) : scène chaleureuse de
   consultation, format portrait proche de **4:5** (ex. 1000×1250), cohérente avec la palette du
   site (sauge/argile, voir `client/tailwind.config.ts`).
2. Exportez en JPG ou WebP.
3. Renommez le fichier exactement `hero-photo.jpg` et déposez-le dans `client/public/media/`.
4. Rechargez la page : le hero détecte le fichier tout seul et l'affiche à la place de la photo
   par défaut. Si le fichier est absent, aucune erreur — la photo Unsplash reste affichée.

Higgsfield expose aussi une API (`console.higgsfield.ai`) pour scripter la génération, mais elle
nécessite une clé de compte payante : aucune intégration automatique n'est faite ici, le dépôt de
fichier reste volontaire et simple à auditer, sans exposer de clé côté client.

## Étendre à d'autres photos

Le même principe (`useImageReady` dans `client/src/data/media.ts`) peut être réutilisé pour
d'autres images du site (portraits de l'équipe, photo de la section « Notre équipe ») : ajoutez un
chemin dans `media`, puis appelez `useImageReady(monChemin)` dans le composant concerné.
