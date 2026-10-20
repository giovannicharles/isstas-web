# Système de design ISSTAS (reconstruction de la couche visuelle)

Référence lue : `D:\SAINT JEAN\ME\DONSYL\isstas-cameroon\frontend` (The Lord My Shepherd Foundation, **lecture seule**,
rien n'y a été modifié ni copié : ni code, ni orange, ni contenus).

## Ce qui est repris de la référence, et pourquoi

| Repris | Où dans la référence | Pourquoi / adaptation ISSTAS |
|---|---|---|
| Tokens dans un seul bloc `@theme` Tailwind v4, rayons et ombres **par rôle** | `styles/tokens.css` | Un fichier à régler ; ici : vert du logo, brun du logo, menthe |
| Duo Montserrat 800/900 (titres, interlignage 1,0, lettrage serré) + Open Sans 17-18 px, interligne 1,7, mesure ≤ 68 car. | `index.css`, `SectionHeading` | Valeurs de la charte ISSTAS (cf. ci-dessous) |
| Un seul moment fort animé (le hero), le reste répond à un geste | `DESIGN.md`, `Hero.jsx` | Ligne de pouls tracée une fois (équivalent de l'arc du logo) |
| Hero plein écran, photo réelle, dégradé de lisibilité, diaporama à onglets de progression | `home/Hero.jsx` | Slides gérées dans l'admin |
| Bandeau de pages intérieures : photo + voile + fil d'Ariane + très gros titre | `PageBanner.jsx` | `PageHeader`, avec vague en bas |
| Bande d'appel final alignée à gauche (titre + phrase + deux accès) | `CtaBand.jsx` | Sur fond brun, avec vague et contacts directs |
| Cartes **différenciées par rôle** (jamais une grille de boîtes jumelles) | `ui/Card.jsx` | Niveaux éditoriaux, mosaïque, carrousel de filières |
| Boutons à libellé en casse normale, icône qui glisse au survol | `ui/Button.jsx`, `index.css` | En pilule 52 px |
| Focus visible, `prefers-reduced-motion`, « skip link » | `Layout.jsx`, `index.css` | Identique |
| Skeleton à la forme de la page, pas de spinner | `PageSkeleton.jsx` | Conservé |

## Ce que la référence n'a pas (donc construit ici)
- **Séparateurs en vague** : la référence n'en a pas (sa signature est l'arc du logo). `WaveDivider` est écrit pour ISSTAS,
  avec la même discipline que `BrandArc` : un tracé SVG, jamais une image, rogné par les bords de la section.
- **Fonds alternés par jetons** réglés dans l'admin.

## Décision de palette
Le **vert du logo (#3D7A5F)** est la couleur principale ; le **brun du logo (#412622)** sert de contrepoint chaud, en petite
quantité (top header, appel final, pied de page). La menthe (#E9F3ED) et le blanc font respirer. Aucun orange.

## Valeurs
- Typographie : hero `clamp(2.75rem,6.5vw,5.75rem)` / 1,02 / 900 / -0,02 em ; H2 `clamp(2rem,4vw,3.5rem)` / 800 ;
  H3 1,5 à 1,75 rem ; texte 1,0625 à 1,125 rem / 1,7.
- Espacements (échelle de 8) : sections 128 px (≥ 1024), 96 px (≥ 768), 72 px mobile ; conteneur 1240 px ; gouttière 24 px ;
  titre → contenu 56 px.
- Formes : photos 34 px avec **un** coin asymétrique (8 px), cartes 20 px, boutons pilule, champs 12 px.
- Ombres : trois couches teintées de vert très sombre (`shadow-card`, `shadow-lift`), lift de 4 px au survol en 220 ms.
- Boutons : 52 px, 28 px de padding ; primaire vert plein, secondaire contour, tertiaire texte souligné animé.
- Vagues : `WaveDivider`, hauteur `clamp(48px,7vw,120px)`, 1 px de recouvrement, variantes `soft`, `double`,
  `asymmetric`, `arc`, `pulse` ; dérive horizontale très lente, coupée en mouvement réduit.