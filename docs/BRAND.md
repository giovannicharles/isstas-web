# Charte graphique ISSTAS

> **Statut : provisoire.** L'audit de charte exige l'accès au site en ligne (styles calculés / CSS Elementor).
> Depuis cet environnement, la page ne livre ni couleurs ni polices (Elementor : valeurs dans les réglages
> globaux). Les valeurs ci-dessous viennent des dépliants (repères visuels) et du logo décrit dans le plan.
> **À confirmer** : copier les « Couleurs globales » et « Polices globales » Elementor, et fournir le logo en SVG.
> Les tokens vivent dans `packages/ui/src/tokens.css` : un seul fichier à ajuster.

## Couleurs (provisoires)

| Token | Valeur | Usage |
|---|---|---|
| `green-500` | #2E9E3F | Vert vif de marque : remplissages, icônes, ligne de pouls |
| `green-600` | #25832F | Boutons pleins (texte blanc 4,9:1) |
| `green-700` | #1B6B2A | Titres et liens sur fond clair (7:1) |
| `green-400` | #5CC46C | Ligne de pouls et accents sur fond sombre |
| `brown-900` | #241409 | Bandeaux, pied de page, texte sur vert vif |
| `brown-800` | #3B2314 | Brun chocolat des dépliants |
| `mint-50` / `mint-100` | #F4FBF5 / #EAF7EC | Fonds alternés très clairs |
| `ink` | #1F2933 | Texte courant |

Règle de contraste : texte blanc seulement sur `green-600` ou plus foncé ; sur `green-500` le texte est `brown-900`.

## Typographie (imposée)

- **Montserrat** 700 / 800 / 900 pour les titres (serrés, capitales autorisées sur les grands titres uniquement).
- **Open Sans** 400 / 600 pour le texte, interligne généreux, mesure < 70 caractères.

## Formes

Photos : découpe « feuille » (deux coins opposés très arrondis), évoquant les deux mains du logo.
Panneaux 12 px, boutons 8 px, pastilles rondes pour les puces et statuts.

## Logo

Deux mains stylisées en vert, texte « ISSTAS » vertical, « SUPÉRIEUR » en brun. Fichier source attendu :
`_source-assets/` (SVG de préférence). Le composant `Brand` utilise l'image fournie via l'API (`brand_assets`).