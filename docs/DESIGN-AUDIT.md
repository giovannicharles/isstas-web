# Audit de design du site public

Constats faits sur des captures (Edge headless, 1440 px et 481 px, plus un contrôle automatique du
débordement horizontal à 320, 360, 390, 768, 1024, 1440 et 1920 px). Chaque point a sa correction.

| # | Constat | Pourquoi ça fait « template » | Correction |
|---|---|---|---|
| 1 | Vagues partout, trois couches, grosses, animées | Effet décoratif répété à chaque section ; les couches semi-transparentes donnaient du gris | Une seule couche (double = reflet), hauteur 32 à 64 px, une dérive très lente, **posée seulement entre deux fonds différents** ; variantes `soft`, `double`, `asymmetric`, `arc`, `pulse` (réservée) ; réglables par section dans l'admin |
| 2 | Quatre niveaux en quatre cartes jumelles | Même gabarit, même ombre | Blocs éditoriaux alternés : photo en découpe feuille, durée et accès lisibles, rythme gauche/droite |
| 3 | Sections de même fond collées | Pas de respiration, hiérarchie plate | Fonds alternés blanc / menthe / vert du logo / vert profond, jetons de la charte, réglables |
| 4 | Hero avec une seule image et une bande de slogans | Chargé, image figée | Diaporama (slides gérées dans l'admin), photo en découpe feuille, ligne de pouls tracée une fois, titre mot à mot |
| 5 | Atouts en grille de tuiles identiques | Icônes de même taille, même largeur | Composition asymétrique : tuiles de largeurs variées autour d'une photo |
| 6 | Filières en liste de lignes | Aucune photo, aucune hiérarchie | Cartes riches : photo, niveau et durée, résumé qui se déploie au survol |
| 7 | Actualités : trois cartes égales | Pas de « une » | Une grande à la une (champ `is_featured`) et deux plus petites |
| 8 | Partenaires en bande défilante | Illisible, bruit | Grille de logos alignés en niveaux de gris, couleur au survol |
| 9 | Top header chargé sur mobile | Débordement du texte | Pastille d'annonce tronquée proprement, téléphones en liste déroulante, icônes réseaux et brochure repliées sur petit écran |
| 10 | Brun trop sombre sur les grandes surfaces | Aplat lourd, peu utile | Le vert du logo (#3D7A5F) est la couleur principale ; le brun n'est plus qu'un jeton disponible |

## Décision de charte
La demande mentionne des sections brun chocolat ; la consigne la plus récente de l'école est que le **vert du logo**
soit la couleur principale et que le brun foncé soit peu utile. Les fonds disponibles sont donc `white`, `mint`,
`green` (logo) et `deep` (vert profond). Le brun reste défini dans `tokens.css` si l'école le souhaite.

## Ce qui reste à améliorer
- Photos : plusieurs sont de faible résolution (portrait de la Directrice) ; versions HD à fournir.
- Logo : le fichier fourni (100 × 64 px) est affiché sur pastille blanche ; un SVG est attendu.
- Textes anglais des pages institutionnelles : à saisir et valider.
- Captures avant/après systématiques (fr + en) à compléter ; Lighthouse mobile non mesuré (dépendances non installées).