# Journal des itérations visuelles — accueil ISSTAS

Méthode : captures pleine page Microsoft Edge headless (Playwright n'a pas pu être installé dans cet environnement), largeurs 390 / 768 / 1440 px, fr puis en, `prefers-reduced-motion` forcé pour des images stables.

Questions posées à chaque passe : assez d'espace ? hiérarchie lisible en 2 s ? sections trop semblables ? vagues propres ? texte lisible ? « site d'école générique » ?

## Itération 1 — première reconstruction (1440 px, fr)
Constats
- Hero trop haut sur écran très grand (`vh` non plafonné) : le titre flottait loin des boutons.
- Pastille « Inscriptions ouvertes » en double (bandeau brun + hero).
- Vagues trop épaisses, décollées des sections voisines (liseré clair visible).
- Cartes de niveaux trop semblables entre elles.
Corrections
- Hero : `min-h-[min(92vh,56rem)]`.
- Le hero utilise son propre champ `badge` (admin) ; le bandeau brun garde l'annonce.
- Vagues : chemins débordant de 1 px, hauteur `clamp(48px,7vw,120px)`.
- Niveaux : alternance gauche/droite, coin de photo asymétrique, durée en vert.

## Itération 2 — sections du bas (1440 px, fr)
Constats
- Carrousel « Filières à la une » : premier élément décalé de 40 px et bord droit coupé net à l'intérieur de la page.
- Vignette vidéo grisée par un voile uniforme.
- Section Chiffres clés absente : les valeurs étaient vides (comportement voulu : rien d'inventé).
- Formulaire newsletter du pied de page : champ tronqué, bouton gris peu lisible.
Corrections
- Carrousel pleine largeur avec `padding-inline` et `scroll-padding-inline` alignés sur le conteneur 1240 px.
- Voile vidéo en dégradé bas seulement.
- Données de démonstration : uniquement des faits du contenu de référence (3 campus, 4 niveaux, 7 filières DU, création 2014) ; en production tout reste piloté par l'admin.
- Newsletter : champ pleine largeur, bouton blanc dessous.

## Itération 3 — tablette et mobile
Constats
- 768 px : hero, finder flottant, niveaux et mosaïque propres ; bande verte des chiffres lisible, vagues nettes. Le bandeau brun tronque l'annonce (volontaire, lien complet au clic).
- 390 px : aucun débordement horizontal ; boutons du hero empilés, finder pleine largeur, cartes ≥ 44 px. Les 12 atouts en une colonne font une liste longue (à regrouper si la validation le demande).
- Note de méthode : Edge headless impose une fenêtre d'au moins ~500 px ; le rendu 390 px est donc capturé via un iframe (`frame.html`, outil de dev).
Captures : `docs/captures/accueil-fr-1440.png`, `accueil-fr-768.png`, `accueil-fr-390.png`. La passe anglaise (en) reste à capturer après validation du fr.

## Itération 4 — anglais et pages intérieures
- en 390 px : même structure, aucun texte fr résiduel, pastille/boutons lisibles ; OK.
- Atouts mobile : tuiles compactées (padding et icônes réduits) pour raccourcir la liste.
- Pages intérieures contrôlées à 1440 px (fiche filière, frais) : bandeau photo + vague + pouls, tableau vert, simulateur et pied de page cohérents avec l'accueil.
- Restant : fiche filière encore sobre (peu de contenu réel renseigné), barre d'infos collante et tableaux → cartes sur mobile à finaliser après validation.

## Itération 5 — fiche filière
- Constat : page maigre (conditions + tableau), carte latérale redondante, titres de tailles incohérentes.
- Changements : bandeau de 4 faits clés (durée, niveau, pension, admission), carte verte « détail sur demande » quand le contenu rédactionnel n'est pas encore saisi, h2 uniformes, carte latérale réduite à l'action (S'inscrire, brochure, comparer). Chaînes ajoutées à `ui-strings.json` (groupe programs).

## Itération 6 — admin
- Constat : barre latérale verte terne, cartes à bordure épaisse, connexion sans carte, constructeur d'accueil sans aperçu.
- Changements : barre latérale brun logo + entrée active verte, fond de l'espace menthe très clair, cartes à ombre douce (plus de bordures de 2 px), tableau de bord avec sous-titre, écran de connexion en carte sur fond menthe avec ligne de pouls, aperçu du fond et de la vague dans chaque section du constructeur d'accueil.
- Bogue corrigé : `HomeBuilder` et `FloatingActions` importaient le client API du site au lieu de celui de l'admin.
- Outil : jeu de données de démonstration admin (uniquement avec `VITE_FIXTURES`) pour vérifier les écrans sans API.
