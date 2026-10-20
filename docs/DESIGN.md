# Design system ISSTAS

Transposé de la base de design de The Lord My Shepherd Foundation (même socle : Tailwind v4, tokens en `@theme`,
Montserrat + Open Sans, composants rares et différenciés, **un seul moment fort animé**).

## L'idée

Un institut qui forme des soignants : le rythme cardiaque. **La ligne de pouls** (tracé d'électrocardiogramme en
vert) est la signature graphique unique :

1. elle se dessine à l'arrivée sur l'accueil, derrière le titre (le moment fort, orchestré une seule fois) ;
2. elle devient ensuite un filet de progression sous la barre de navigation qui suit la lecture ;
3. elle est absente ailleurs, pour rester une signature.

Les deux mains du logo inspirent la **découpe feuille** des images (`.cut-leaf`) : jamais de rectangles stock.

## Principes

- Percutant : titres Montserrat 900 énormes (jusqu'à 6 rem) contre Open Sans 17-18 px ; alignement à gauche.
- Pas de grille de cartes identiques : niveaux = lignes typographiques, atouts = deux colonnes sur fond brun,
  étapes = rail, chiffres = bande (masquée si vides). Aucune icône décorative en pastille.
- Pas d'étiquette en capitales au-dessus des titres, pas de mot coloré isolé, pas de dégradé décoratif.
- Mouvement dosé : le hero est orchestré (ligne de pouls, titre mot à mot, feuilles en parallaxe), les sections se révèlent en cascade une seule fois, les cartes s'inclinent au survol, les chiffres montent. Tout se réduit à l'état final avec prefers-reduced-motion.
- **Vagues** : chaque section prend la couleur de son fond et remonte sur la précédente par un bord ondulé animé (WaveTop), donc l'ordre des sections de l'accueil peut changer depuis l'admin sans casser le raccord.
- Mobile d'abord ; top header sur une ligne ; actions flottantes empilées sans chevauchement.
- **Zéro texte en dur** dans le site : tout vient de l'API (`ui-strings`, contenus). Valeur vide = bloc masqué.

## Tokens

Voir `packages/ui/src/tokens.css` et `docs/BRAND.md`. Rayons par rôle : `photo` 4 px, `panel` 12 px,
`button` 8 px, `leaf` (coins opposés), `pill`.

## Composants (`packages/ui`)

Style shadcn/ui, sans dépendance Radix (accessibilité codée à la main) : Button (primary/secondary/outline/ghost/white, sChild), Card, Accordion, Tabs, Dialog/Sheet (<dialog> natif), Checkbox, Switch, Progress, Tooltip, Separator, Label, Field/TextArea/Select, Badge, Skeleton.
Mouvement : Reveal, Stagger, CountUp, Parallax, Tilt, Marquee, KineticText, PulseLine (+ ScrollPulse), Wave/WaveTop.

## Accessibilité

Focus visible (3 px, vert 700 sur clair, blanc sur sombre), cibles ≥ 44 px, `prefers-reduced-motion` ramène toute
animation à son état final, contrastes AA, navigation clavier du méga-menu et du tiroir, `aria-live` du chat.

## Performance

Images responsives et différées sous le pli, polices `display=swap`, code découpé par route, aucune animation
bloquante. Objectif Lighthouse mobile ≥ 90 (Phase 18).