# ISSTAS — Plan complet de refonte (React + Laravel + MySQL)

Document de pilotage : analyse, propositions, architecture, puis **toutes les phases sous forme de prompts** à donner à Claude Code, dans l'ordre.

---

## 0. Mode d'emploi

1. Crée un dossier vide `isstas-platform/` et ouvre Claude Code dedans. Copie dedans un dossier `_source-assets/` contenant : logo (idéalement SVG), les 4 dépliants PDF, les photos de l'école (campus, laboratoires, étudiants), la photo de la Directrice si disponible.
2. Colle d'abord le **bloc CONTEXTE (Phase 0)**. La Phase 1 le sauvegarde dans les deux projets pour que chaque nouvelle session le relise.
3. Une phase = une session (ou un lot de sessions). À la fin de chaque phase : relire, tester, `git commit`. Demande à Claude Code d'utiliser le mode plan sur les phases lourdes (2, 3, 12, 13, 17).
4. Ordre : Phases 0-1, puis backend (2-8) et frontend public (9-15) peuvent avancer en parallèle, puis admin (16-17), puis intégration (18-21).
5. Les prompts disent « fais-le » mais gardent des points de validation : si un point de la section 1.5 n'est pas tranché, Claude Code doit mettre un contenu provisoire **modifiable depuis l'admin**, pas bloquer.

---

## 1. Analyse

### 1.1 Site actuel (isstas-cameroun.com)

- **Techno** : WordPress + Elementor, réalisé par un prestataire (mention « Powered by Donsyl » en pied de page). Site en français uniquement.
- **Menu actuel** : Accueil · À propos (Mot de la Directrice, Missions et Vision, Valeurs, Points forts, Milieu de stage) · Nos Filières · Inscrivez-vous (Procédure d'admission, Frais d'inscription et scolarité, Dossiers à fournir) · Téléchargements · Contact.
- **Accueil** : bannière (« L'École de Référence en Formation Sanitaire au Cameroun »), texte de présentation, 4 compteurs (étudiants formés, établissements partenaires, formateurs, filières) **dont les valeurs sont vides/à 0 dans le rendu**, vidéo de présentation, 4 parcours (BTS/HND, Licence, Licence professionnelle, Master), actualités (section quasi vide, répète le slogan), bloc « À propos » (créé en 2014, 3 laboratoires de recherche), contacts, réseaux sociaux.
- **Constats à corriger** :
  - Pas de bilinguisme alors que le BTS a son équivalent anglophone (HND).
  - Les icônes WhatsApp, LinkedIn, TikTok, YouTube du pied de page pointent toutes vers le même lien Facebook.
  - Sections vides ou répétitives (actualités), compteurs sans chiffres.
  - Aucun outil d'aide à la décision (quelle filière avec mon diplôme ? combien ça coûte par mois ?), aucune pré-inscription en ligne : tout passe par le campus.
  - Les infos précieuses (prix, dossier, filières par niveau) existent surtout dans les dépliants PDF, pas comme pages interrogeables.

### 1.2 Contenu de référence (extrait des 4 dépliants, à ne pas inventer ni modifier)

**Identité**
- Institut Supérieur des Sciences et Techniques Appliquées à la Santé (ISSTAS), Yaoundé. Devise : **Éthique – Performance – Avenir**.
- Autorisation N° 18-07981/L/MINESUP/SG/DDES/ESUP/SDA/CAGS du 20 septembre 2018.
- Tutelles académiques : Universités de Douala et de Yaoundé. Tutelles techniques : Faculté de Médecine et des Sciences Pharmaceutiques (Université de Douala) et Faculté de Médecine et des Sciences Biomédicales (Université de Yaoundé).
- Logos partenaires visibles : MINESUP, FMSP/UD, Africa Ophthalmology Network Foundation, HE University (Chine), plus d'autres emblèmes institutionnels.
- Slogans : « Devenez professionnels de santé » · « Composez votre avenir, inscrivez-vous aujourd'hui ! » · « Se former aujourd'hui, soigner demain ! » · « Des formations adaptées aux besoins du terrain pour bâtir votre avenir dans le domaine de la santé. »
- Présentation : référence dans la formation aux métiers de la santé au Cameroun ; pédagogie axée sur la pratique et l'entrepreneuriat ; laboratoires équipés ; enseignants expérimentés ; partenariats internationaux.

**Atouts** : 3 campus modernes · laboratoires spécialisés et équipés · connexion internet illimitée · restaurant universitaire · salle multimédia · bibliothèque · stages en entreprises et centres hospitaliers partenaires · opportunités d'emploi avec les partenaires · caméras de surveillance · communauté d'anciens étudiants · possibilité de bourse scolaire · infirmerie · cabinet de rééducation et réadaptation (kinésithérapie) ouvert au public.

**Filières par niveau**

| Niveau | Durée | Accès | Filières |
|---|---|---|---|
| BTS | 3 ans | Baccalauréat | Sage-femme · Sciences infirmières · Kinésithérapie · Techniques de laboratoire et d'analyse médicale · Radiologie et imagerie · Techniques pharmaceutiques |
| Licence professionnelle | 3 ans (Bac) ou 1 an (BTS en santé, IDE, TMS, TPGS…) | Baccalauréat ou BTS/diplômes cités | Sage-femme · Sciences infirmières · Kinésithérapie · Analyses médicales · Pharmacie · Optométrie · Génie sanitaire |
| Master | 2 ans | Licence en sciences sociales, sciences biomédicales, kinésithérapie, sciences pharmaceutiques, biochimie, microbiologie, droit | Épidémiologie · Santé communautaire · Microbiologie · Kinésithérapie · Sciences infirmières · Immunologie · Assurance qualité |
| DU (diplômes universitaires) | 1 an | Master en kinésithérapie / biologie clinique ; médecins et pharmaciens biologistes | Kinésithérapie : du sport · réadaptation gériatrique · neuro-rééducation du mouvement · rééducation et appareillage en chirurgie de la main · thérapie manuelle · éducation thérapeutique du patient. Biologie clinique : cytologie en hématologie |

Le dépliant d'accueil cite aussi : Santé de la reproduction, Santé publique, Assurance qualité, Microbiologie, Immunologie, et « Diplômes : BTS – Licence professionnelle – Master – DU ».

**Coûts (FCFA)**

| Cycle | Inscription | Pension |
|---|---|---|
| BTS | 50 000 | 500 000 |
| Licence | 95 000 | 500 000 |
| Licence professionnelle | 50 000 | 550 000 |
| Master | 75 000 | 815 000 |
| DU | 100 000 | 600 000 |

Frais d'étude du dossier : 25 000 FCFA. Prévoir un budget pour frais de stage, de recherche et matériel de TP. Scolarité payable en plusieurs mensualités (le dépliant écrit « 2, 3, 4,5 », à clarifier).

**Dossier à fournir** : fiche de renseignements (à retirer au campus) · 4 photos 4x4 · photocopie de l'acte de naissance · photocopie du Baccalauréat ou équivalent · photocopie de la CNI · demande manuscrite adressée à la Direction · frais d'étude du dossier (25 000 FCFA) · chemise à rabat verte, marron ou blanche.
**Pièces supplémentaires (Licence professionnelle et Master)** : 3 relevés de notes · curriculum vitae · photocopie du dernier diplôme.
**Admission** : sur étude du dossier. Rentrée académique annoncée pour octobre 2026, inscriptions ouvertes.

**Contacts** : +237 695 292 287 · +237 671 903 617 · +237 243 737 737 (le site actuel ajoute +237 621 729 715) · B.P. 33422 Yaoundé · Camp SIC Mendong, derrière le Commissariat · www.isstas-cameroun.com · Fb.me/ISSTAS-institut superieur · Instagram, TikTok, YouTube, LinkedIn (@isstascameroun).
**Plan d'accès** (dépliant d'inscription) : entrée Symbock → Gendarmerie de Mendong → Camp SIC Mendong → Carrefour Banane → Commissariat de Mendong → ISSTAS à environ 100 m.

### 1.3 Charte graphique à respecter

D'après le logo (deux mains stylisées en vert, texte « ISSTAS » vertical) et les dépliants :

- **Vert** vif dominant (boutons, titres, pastilles, cadres) avec une nuance profonde pour les titres sur fond clair et un vert plus clair (feuille) pour les accents du logo.
- **Brun chocolat très sombre** pour les bandeaux de contact, tableaux et le mot « SUPÉRIEUR » du logo.
- **Blanc** et **dégradés menthe très clairs** en fonds.
- **Typographie (décision)** : on reprend le duo du projet The Lord My Shepherd : **Montserrat** pour les titres (graisses 700 à 900, très affirmée, capitales possibles sur les grands titres comme sur les dépliants : « DEVENEZ PROFESSIONNELS DE SANTÉ ») et **Open Sans** pour le texte. Montserrat en graisse extra-grasse donne la même autorité que le condensé des dépliants, avec une lisibilité bien meilleure à l'écran. Si l'audit de charte révèle une police différente sur le site actuel, on la signale avant de trancher.
- **Formes** : cartes à coins arrondis avec filet vert, pastilles vertes pour les en-têtes de section, icônes de coches vertes, cadre blanc translucide sur les photos.

**Source de vérité : le site actuel (isstas-cameroun.com), puis le logo et les dépliants.** Le site est bâti avec Elementor : ses couleurs et polices globales sont définies dans les réglages du site (Elementor > Réglages du site > Couleurs globales / Polices globales) et dans le CSS généré. Les valeurs exactes n'ont pas pu être lues depuis cet environnement (accès réseau refusé), donc **aucune valeur n'est figée ici**. La Phase 9 commence par un **audit de charte obligatoire** : Claude Code ouvre le site en ligne, relève les couleurs, polices, tailles, arrondis et styles de boutons réellement utilisés (styles calculés dans le navigateur ou CSS Elementor), les recoupe avec le logo et les dépliants, et consigne le résultat dans `docs/BRAND.md`. Les tokens du design system sont générés à partir de ce fichier, jamais devinés.

Pour aller plus vite et éviter toute erreur, tu peux lui donner directement : (a) les couleurs globales Elementor (copie depuis Réglages du site), (b) les noms des polices globales, (c) le logo en SVG ou PNG haute définition.

Repères visuels observés sur les dépliants (à confirmer par l'audit) : vert vif dominant, vert plus profond pour les titres, brun chocolat très sombre, menthe très claire.

### 1.4 Recherche : ce qui est retenu

**UX d'un site d'établissement supérieur** (recherches et bonnes pratiques 2025-2026) :
- La page d'accueil doit servir les tâches des futurs étudiants avant tout : voir les programmes, accéder à l'admission, demander des informations. Des appels à l'action admission en haut de page valent mieux qu'un bloc d'actualités.
- Une page d'ensemble des programmes, des parcours d'admission séparés par niveau, des brochures téléchargeables, un chat intégré, le mobile d'abord, la vitesse, l'accessibilité et des micro-animations discrètes figurent parmi les tendances citées.

**Animation React** (comparatifs 2026) :
- **Motion** (ex Framer Motion, import `motion/react`) pour les animations de composants, transitions de pages, menus, listes, gestes.
- **GSAP + ScrollTrigger** uniquement pour les mises en scène liées au scroll (ici : la ligne de pouls), avec `useGSAP`.
- **Lenis** pour un défilement doux, activable seulement sur desktop et désactivé si l'utilisateur préfère moins d'animations.
- Tout respecte `prefers-reduced-motion`.

**Composants retenus**
- Site public : Tailwind CSS v4, primitives accessibles Radix UI, Embla Carousel, lightbox accessible, `react-i18next`, `react-helmet`/API meta native du routeur, `@tanstack/react-query`.
- Admin : shadcn/ui, TanStack Table et Query, React Hook Form + Zod, Tiptap (éditeur riche), dnd-kit (tri par glisser-déposer), Recharts (graphiques), cmdk (palette de commandes Ctrl+K), sonner (notifications).
- Backend Laravel : Sanctum, spatie/laravel-translatable, spatie/laravel-permission, spatie/laravel-medialibrary, spatie/laravel-activitylog, spatie/laravel-query-builder, dedoc/scramble (OpenAPI auto), Redis, Horizon, Pest, Larastan, Pint.

### 1.5 Points à valider avec l'ISSTAS (Claude Code met un contenu provisoire éditable depuis l'admin)

0. **Charte** : couleurs globales et polices Elementor du site actuel, logo vectoriel (voir 1.3).
1. **Rentrée** : les dépliants annoncent octobre 2026 et nous sommes le 14 octobre 2026. Confirmer si les inscriptions sont toujours ouvertes, la date de clôture et la prochaine échéance. La bannière du top header doit être pilotable depuis l'admin (texte, dates, activée/désactivée).
2. **Mensualités** : « 2, 3, 4,5 » : 2, 3, 4 ou 5 ? Valeurs exactes attendues pour le simulateur.
3. **Licence vs Licence professionnelle** : le tableau des prix et le site actuel citent « Licence » (95 000 d'inscription), mais les dépliants de filières ne détaillent que la licence professionnelle. Y a-t-il une licence académique, et avec quelles filières ?
4. **Filières** : « Santé de la reproduction » et « Santé publique » apparaissent sur le dépliant d'accueil mais pas dans la liste détaillée. À rattacher à un niveau ou à retirer.
5. **Chiffres clés** : valeurs réelles pour étudiants formés, partenaires, formateurs, filières.
6. **Quatrième numéro** +237 621 729 715 : à garder ou non.
7. **Liens réseaux sociaux** corrects (WhatsApp Business, LinkedIn, TikTok, YouTube).
8. **Date de création** : le site dit 2014, l'autorisation date de 2018. Formulation à arrêter.
9. **Traductions anglaises** : qui valide ? (le CMS affichera un indicateur de complétude par langue.)
10. **Techniques** : hébergement (Node disponible pour le rendu serveur ?), noms de domaine/sous-domaines, numéro WhatsApp Business, budget API du chatbot, SMTP, consentement photo des personnes visibles sur les visuels.

---

## 2. Propositions : pages et fonctionnalités en plus du contenu actuel

Légende : **MVP** = livrée dans la première version · **V1.1** = juste après · **V2** = évolution.

| Proposition | Pourquoi | Prio |
|---|---|---|
| **Trouver ma filière** (assistant en 3 questions : mon diplôme, mon domaine, ma durée → filières accessibles, coût, durée) | Réduit l'hésitation, génère des candidatures qualifiées | MVP |
| **Simulateur de coût et d'échéancier** (cycle + nombre de mensualités → inscription, pension, montant mensuel, total) | Transparence des prix, argument de décision | MVP |
| **Checklist du dossier interactive** (cocher les pièces, adaptée au niveau, imprimable/PDF, partageable par WhatsApp) | Moins de dossiers incomplets | MVP |
| **Pré-inscription en ligne** avec dépôt de pièces et **numéro de suivi** ; page « Suivre ma candidature » | Désengorge le campus, capte les candidats hors Yaoundé | MVP |
| **Centre de téléchargements** (dépliants par filière et par niveau, fiche de renseignements, liste du dossier, tarifs ; filtres FR/EN ; compteur de téléchargements) | Demandé explicitement | MVP |
| **Brochure PDF générée automatiquement** par filière à partir des données du CMS (toujours à jour, FR/EN) | Plus de dépliants obsolètes | V1.1 |
| **Comparateur de filières** (2 à 3 côte à côte : durée, accès, coût, débouchés) | Aide à la décision | MVP |
| **Pages filière détaillées** (présentation, durée, accès, programme, débouchés, stages, coût, brochure, QR code, bouton « Je postule ») | Référencement Google par filière | MVP |
| **Cabinet de kinésithérapie ouvert au public** : page dédiée + demande de rendez-vous | Service réel cité dans les atouts, ouvre un public hors étudiants | V1.1 |
| **Carte des milieux de stage et partenaires** (hôpitaux, centres de santé, partenaires internationaux) | Preuve de crédibilité, rassure sur l'insertion | V1.1 |
| **Recherche et laboratoires** (les 3 laboratoires) | Montre le niveau académique | V1.1 |
| **Actualités et événements** (portes ouvertes, cérémonies, rentrée), calendrier académique | Le site vit, SEO | MVP |
| **Témoignages et anciens étudiants** (vidéo + texte), parcours d'insertion | Preuve sociale | V1.1 |
| **Galerie et visite virtuelle** (photos par campus, laboratoire ; 360° plus tard) | Rassure parents et candidats | V1.1 |
| **Bourses et aides** (critères, démarche) | Atout cité dans le dépliant | MVP |
| **FAQ** (par thème, recherche instantanée, alimente aussi le chatbot) | Moins de questions répétitives | MVP |
| **Espace parents** (page réponses : sécurité, encadrement, paiement échelonné) | Les parents décident souvent | V1.1 |
| **Corps enseignant** (annuaire par filière) | Crédibilité | V1.1 |
| **Newsletter** et alertes de rentrée | Fidélisation | V1.1 |
| **Mentions légales, confidentialité, cookies** | Obligatoire, la pré-inscription collecte des données | MVP |
| **Espace étudiant** (emploi du temps, notes, paiement mobile money) | Évolution naturelle | V2 |
| **Paiement en ligne** (Orange Money, MTN MoMo) des frais de dossier | Le dossier coûte 25 000 FCFA | V2 |

Fonctions transversales du site : **top header**, **chatbot IA**, **bouton WhatsApp**, **bouton retour en haut** (apparaît après ~400 px de défilement), **bascule FR/EN** avec URLs localisées (`/fr/...`, `/en/...`), mode d'impression propre, partage WhatsApp d'une filière.

---

## 3. Architecture cible

Deux projets distincts, dans un dossier parent :

    isstas-platform/
    ├── isstas/          (front : site public + admin, séparés mais dans le même dépôt)
    │   ├── apps/
    │   │   ├── site/    (React, rendu serveur pour le SEO, FR/EN)
    │   │   └── admin/   (React SPA, back-office)
    │   ├── packages/
    │   │   ├── ui/          (tokens de design, composants partagés)
    │   │   ├── api-client/  (client TypeScript typé, généré depuis l'OpenAPI)
    │   │   ├── i18n/        (clés communes, utilitaires de langue)
    │   │   └── config/      (tsconfig, eslint, tailwind préréglés)
    │   └── docs/
    └── isstas-api/      (Laravel, API REST versionnée)

**Pourquoi un monorepo pnpm** : « même projet » comme demandé, mais le bundle admin n'est jamais chargé par un visiteur du site, les deux applis se déploient séparément (`isstas-cameroun.com` et `admin.isstas-cameroun.com`) et partagent design system et client API.

**Décision D1 (rendu du site public)** : le site public doit être indexable par Google (candidats qui cherchent « BTS sage-femme Yaoundé »). Recommandation : React Router v7 en mode framework (rendu serveur ou pré-rendu) pour `apps/site`, SPA classique pour `apps/admin`. Si l'hébergement n'a pas Node, repli : pré-rendu statique régénéré à la publication depuis l'admin.

**Backend** : Laravel (dernière version stable), PHP 8.3+, MySQL 8, Redis (cache, files d'attente), API REST `/api/v1`, JSON, ressources API, OpenAPI générée automatiquement.

**Bilinguisme** : toute chaîne **visible sur le site** est traduisible (colonnes JSON `{ "fr": "...", "en": "..." }` via spatie/laravel-translatable), y compris **slugs** et métadonnées SEO. Le français est obligatoire, l'anglais optionnel avec repli sur le français et un indicateur de complétude dans l'admin. Les données internes (notes, statuts) ne sont pas traduisibles. Les libellés d'interface vivent dans des fichiers de traduction, pas en base.

**Performance de l'API** : cache Redis par ressource invalidé par des observers à chaque modification admin, en-têtes ETag/Cache-Control, pagination, chargement anticipé des relations (`preventLazyLoading` en dev), index SQL, images converties en WebP/AVIF avec tailles multiples, files d'attente pour e-mails/PDF/IA, Laravel Octane en option, CDN devant les médias.

**Sécurité** : Sanctum (cookie SPA) pour l'admin, rôles/permissions, journal d'activité, limitation de débit, validation par Form Requests, fichiers de candidature en stockage privé avec URLs signées, CORS strict, en-têtes de sécurité, clé IA uniquement côté serveur.

### 3.1 Règle d'or : TOUT est géré depuis l'admin (zéro contenu en dur)

Rien de ce qu'un visiteur voit ne doit être écrit en dur dans le code React. Le code ne contient que la **mise en page** ; les **mots, images, liens, nombres, ordres et activations** viennent de l'API et sont modifiables depuis le back-office, en français et en anglais.

| Élément visible | Où il se gère dans l'admin |
|---|---|
| Logo, favicon, image de partage réseaux sociaux | Apparence et identité |
| Top header : téléphones, e-mail, bannière d'annonce (texte, lien, dates, on/off), liens sociaux, lien brochure | Paramètres > Top header |
| Menus header et footer (libellés, liens, ordre, sous-menus) | Menus |
| Sections de l'accueil : titres, textes, images, boutons, **ordre et visibilité de chaque section** | Page d'accueil (constructeur de sections) |
| Textes de boutons et d'interface (« S'inscrire », « Télécharger », messages d'erreur, étiquettes de formulaire, états vides) | Textes de l'interface (clé, fr, en) |
| Chiffres clés, atouts, valeurs, missions, mot de la Directrice | Contenus institutionnels et chiffres |
| Niveaux, filières, accès, débouchés, programmes | Formations |
| Tarifs, mensualités autorisées, frais de dossier | Frais et scolarité |
| Procédure, pièces à fournir, calendrier | Admission |
| Dépliants et documents, avec fichier fr/en | Téléchargements |
| Actualités, événements, galerie, témoignages, FAQ, enseignants, partenaires, lieux de stage, laboratoires, campus | Modules dédiés |
| Bouton WhatsApp : numéro, message prérempli fr/en, activation, pages où il s'affiche | Paramètres > Actions flottantes |
| Bouton retour en haut : seuil d'apparition (px), activation | Paramètres > Actions flottantes |
| Chatbot : activation, nom, message d'accueil, questions suggérées, ton, réponses validées, pages où il s'affiche, horaires de présence humaine | Chatbot |
| Formulaires : champs affichés, textes de consentement, e-mails de notification, messages de confirmation | Formulaires |
| SEO : titre, description, image de partage par page, redirections 301, robots, sitemap | SEO et redirections |
| Langues actives, langue par défaut | Paramètres > Langues |
| Pages légales, bandeau de cookies | Pages |
| Gabarits d'e-mails (accusé de réception, pièces manquantes, newsletter) fr/en | E-mails |

Conséquences pour le code : un composant reçoit toujours ses textes en props ou via un hook d'API, jamais en littéral. Une valeur vide masque proprement le bloc (pas de « 0 », pas de titre orphelin). Un test automatique (Phase 19) cherche les textes en dur dans `apps/site` et fait échouer la CI.

---

## 4. Les phases et leurs prompts

### Phase 0 — Bloc CONTEXTE (à coller une seule fois, en tête de session)

```
Contexte : je refais entièrement le site de l'ISSTAS (Institut Supérieur des Sciences et
Techniques Appliquées à la Santé, Yaoundé, Cameroun) : https://isstas-cameroun.com/
(actuellement WordPress + Elementor, français uniquement).

Le CONTENU reste le même, le DESIGN change totalement. RÈGLE D'OR : TOUT ce qui s'affiche
sur le site (textes, boutons, images, liens, chiffres, menus, ordre et visibilité des sections,
messages du chatbot, bouton WhatsApp, bannière du top header...) est géré depuis l'admin, en
français et en anglais. Zéro texte en dur dans le code React (voir tableau de couverture dans
docs/CONTEXT.md).

CHARTE GRAPHIQUE : on garde celle du site actuel https://isstas-cameroun.com/ (Elementor),
recoupée avec le logo et les dépliants de _source-assets/. Avant tout design, fais un audit
de charte : relève les couleurs, polices, tailles, arrondis et styles de boutons réellement
utilisés sur le site en ligne (styles calculés ou CSS Elementor), puis écris-les dans
docs/BRAND.md. Ne devine aucune valeur. Repères observés sur les dépliants, à confirmer :
vert vif dominant, vert plus profond pour les titres, brun chocolat très sombre pour les
bandeaux et tableaux, blanc et fonds menthe très clairs, cartes arrondies à filet vert,
pastilles vertes de titre de section. TYPOGRAPHIE imposée : Montserrat (titres, graisses 700
à 900) + Open Sans (texte), comme sur le projet The Lord My Shepherd.

Objectifs :
1. Site public bilingue FR/EN avec contenu 100 % géré depuis un back-office (CMS maison).
2. Back-office admin soigné (design, ergonomie), rôles et permissions.
3. Pages par niveau de formation (BTS, Licence professionnelle, Master, DU), prix et frais,
   dossier à fournir, téléchargements de dépliants/documents, pré-inscription en ligne.
4. Chatbot IA en bas à droite, bouton WhatsApp en bas à droite, bouton « retour en haut »
   visible après ~400 px de défilement, top header (contact, bannière d'annonce, langue,
   réseaux sociaux, lien brochure).
5. Fonctionnalités innovantes : « Trouver ma filière », simulateur de coût/mensualités,
   checklist de dossier interactive, comparateur de filières, brochures PDF générées
   automatiquement, suivi de candidature, rendez-vous au cabinet de kinésithérapie.

Architecture imposée (voir détails Phase 1) :
- Dossier parent isstas-platform/ contenant deux projets que TU crées :
  * isstas/      : monorepo pnpm avec apps/site (React, SEO, FR/EN), apps/admin (React SPA),
                   packages/ui, packages/api-client, packages/i18n, packages/config
  * isstas-api/  : Laravel (dernière version stable), PHP 8.3+, MySQL 8, Redis, API REST
                   /api/v1, OpenAPI générée automatiquement
- TypeScript strict côté front. Pest + Larastan + Pint côté API.
- Bilinguisme : tout champ visible sur le site est traduisible (colonnes JSON fr/en via
  spatie/laravel-translatable, slugs et SEO compris). Français obligatoire, anglais
  optionnel avec repli sur le français.
- Qualité attendue : maintenable, évolutive, performante, accessible (WCAG AA), mobile d'abord.

Contenu de référence : reprendre mot pour mot les données ci-dessous, ne rien inventer.
Tout ce qui est incertain doit rester modifiable depuis l'admin.

[COLLE ICI LA SECTION 1.2 DU PLAN : identité, atouts, filières par niveau, coûts, dossier,
contacts, plan d'accès] 

[COLLE ICI LA SECTION 1.5 DU PLAN : points à valider]
```

### Phase 1 — Création des projets, outillage et conventions

```
Crée dans isstas-platform/ les deux projets décrits dans le contexte.

1) isstas-api : installe Laravel (dernière version stable). Ajoute : laravel/sanctum,
   spatie/laravel-translatable, spatie/laravel-permission, spatie/laravel-medialibrary,
   spatie/laravel-activitylog, spatie/laravel-query-builder, dedoc/scramble, laravel/horizon,
   predis ou phpredis, pestphp/pest, larastan, laravel/pint, barryvdh/laravel-dompdf (ou
   spatie/browsershot si tu estimes que le rendu des brochures l'exige, justifie).
   Structure : app/Domain/{Content,Programs,Admissions,Chat,Media,Settings}/ avec
   Actions, DTOs/Data, Policies ; app/Http/Controllers/Api/V1/{Public,Admin}/ ;
   app/Http/Resources/ ; routes/api/v1/{public.php,admin.php}. Configure Redis pour cache
   et files, CORS strict via FRONTEND_URL / ADMIN_URL, .env.example complet, Docker Compose
   de développement (php, mysql, redis, mailpit).

2) isstas : monorepo pnpm avec apps/site, apps/admin, packages/ui, packages/api-client,
   packages/i18n, packages/config. TypeScript strict, ESLint, Prettier, Vitest, Playwright.
   apps/site : React Router v7 mode framework (rendu serveur/pré-rendu), Tailwind v4.
   apps/admin : Vite + React + Tailwind v4 + shadcn/ui, SPA. Alias de paquets propres.
   Variables d'environnement via .env.example.

3) Dans chaque projet : crée docs/CONTEXT.md (le contexte de la Phase 0), un CLAUDE.md qui
   résume les conventions (nommage, structure de dossiers, règles de bilinguisme, règles de
   design, commandes de test/lint/build, « ne jamais exposer de clé secrète au front »),
   un README, et initialise git avec des commits conventionnels.

4) Mets en place la CI (GitHub Actions) : lint, types, tests, build pour chaque projet.

À la fin : montre l'arborescence créée, les commandes pour lancer les deux projets, et
vérifie que les deux démarrent.
```

---

### PARTIE BACKEND (isstas-api)

### Phase 2 — Fondations de l'API

```
Dans isstas-api, pose les fondations transverses avant les fonctionnalités :
- Versionnage /api/v1, séparation routes publiques (lecture, sans authentification) et
  routes admin (auth:sanctum + permissions).
- Authentification admin par Sanctum (cookie SPA), connexion, déconnexion, profil,
  changement de mot de passe, réinitialisation par e-mail, limitation de tentatives.
- Rôles et permissions (spatie/laravel-permission) : super-admin, éditeur de contenu,
  gestionnaire des admissions, modérateur (messages/chat). Permissions fines par module.
- Langue : middleware qui lit l'en-tête Accept-Language ou le paramètre ?locale=fr|en,
  repli sur fr. Trait réutilisable pour les modèles traduisibles + helper qui calcule la
  complétude de traduction d'un enregistrement (pourcentage de champs en en).
- Format d'erreur JSON unifié (type, message, détails de validation), gestion des exceptions,
  codes HTTP corrects.
- Enveloppe de réponse et pagination cohérentes, filtres/tri via spatie/laravel-query-builder.
- Cache : classe utilitaire de cache par ressource avec étiquettes Redis ; observers qui
  invalident le cache quand un contenu admin change ; en-têtes ETag et Cache-Control sur les
  endpoints publics.
- Documentation OpenAPI automatique (Scramble) et export du schéma vers
  isstas/packages/api-client pour générer le client TypeScript.
- Journal d'activité (qui a modifié quoi) sur tous les modèles de contenu.
- Tests Pest pour : auth, permissions, négociation de langue, invalidation de cache.
```

### Phase 3 — Modèle de données et migrations

```
Crée les migrations, modèles, factories et relations pour (tous les champs affichés sur le
site sont traduisibles fr/en : title, summary, body, seo_title, seo_description, slug...) :

Contenu institutionnel
- pages (pages libres et pages institutionnelles : mot de la directrice, missions et vision,
  valeurs, points forts, milieu de stage, recherche et laboratoires, bourses, mentions
  légales...) avec blocs de contenu ordonnés (page_blocks : type, données JSON traduisibles).
- site_settings (clé/valeur JSON : coordonnées, numéros, e-mail, adresse, plan d'accès, liens
  réseaux sociaux, numéro WhatsApp et message prérempli traduisible, bannière du top header
  avec dates d'activation, chiffres clés, textes de pied de page, couleurs SEO par défaut).
- menus et menu_items (arborescence, traduisible, ordre, cible interne/externe).
- campuses (3 campus : nom, adresse, description, photos, coordonnées GPS).
- partners (nom, type : académique/hôpital/institution/international, logo, lien).
- internship_sites (milieux de stage : nom, ville, type, coordonnées GPS, description).
- research_labs (3 laboratoires : nom, description, responsable, photos).
- staff_members (corps enseignant et direction : nom, titre traduisible, filière, photo, bio).
- testimonials (étudiants/anciens : nom, promotion, filière, citation, vidéo optionnelle).
- faq_categories et faqs (question/réponse traduisibles, ordre, publication).
- stats (chiffres clés : valeur, libellé traduisible, icône, ordre).
- ui_strings (textes de l'interface : clé unique, fr, en, groupe, description du contexte ;
  boutons, étiquettes de formulaire, messages d'erreur et de succès, états vides). Endpoint
  public qui renvoie tous les textes d'une langue, mis en cache et invalidé à la modification.
- home_sections (sections de l'accueil : type, ordre, visible oui/non, données JSON
  traduisibles : titres, textes, images, boutons) pour que l'admin compose l'accueil.
- floating_actions (paramètres du bouton WhatsApp : numéro, messages fr/en, activation, pages
  concernées ; du bouton retour en haut : seuil en px, activation ; du chatbot : activation,
  nom, message d'accueil, questions suggérées, pages concernées).
- forms (définition des formulaires : champs affichés, libellés, textes de consentement,
  e-mails destinataires, message de confirmation, par langue) et email_templates (sujet et
  corps fr/en avec variables).
- redirects (anciennes URLs WordPress vers nouvelles, code 301) et seo_defaults.
- brand_assets (logo clair/foncé, favicon, image de partage, images de fond du hero) et
  languages (langues actives, langue par défaut, ordre).

Formations
- levels (BTS, Licence professionnelle, Master, DU... avec durée, conditions d'accès,
  équivalent anglais, ex. HND).
- programs (filières : niveau, slug, présentation, débouchés, programme, durée, accès, stage,
  photo, brochure, statut, ordre) + program_level pivot si une filière existe à plusieurs
  niveaux ; program_access_rules (diplômes d'entrée acceptés par filière et niveau, pour
  l'assistant « Trouver ma filière »).
- fee_schedules (année académique, niveau, frais d'inscription, pension, mensualités
  autorisées, frais d'étude du dossier) en montants entiers FCFA.
- admission_steps (procédure d'admission ordonnée) et required_documents (pièces à fournir,
  par niveau, avec drapeau « supplémentaire Licence pro/Master »).
- academic_calendar_events (rentrée, clôture des inscriptions, portes ouvertes...).

Médias et téléchargements
- downloads (titre, description traduisibles, fichier fr et/ou en, catégorie : dépliant,
  formulaire, tarifs, guide ; rattachement optionnel à un niveau ou une filière ; compteur de
  téléchargements ; publication).
- galerie : albums et items (spatie/laravel-medialibrary avec conversions WebP/AVIF).

Actualités
- news_posts (catégories, image de couverture, extrait, corps riche, auteur, publication
  planifiée), events.

Interactions
- applications (pré-inscriptions : numéro de suivi unique, identité, contact, niveau et
  filière visés, statut : reçue/en étude/pièces manquantes/acceptée/refusée/liste d'attente,
  notes internes, historique des statuts) + application_documents (fichiers en stockage privé).
- contact_messages (statut, réponse interne).
- appointments (rendez-vous du cabinet de kinésithérapie : nom, téléphone, motif, créneau
  souhaité, statut).
- newsletter_subscribers (e-mail, langue, consentement, date).
- chat_conversations et chat_messages (session, langue, messages, satisfaction, drapeau
  « sans réponse »), chat_knowledge_overrides (réponses validées manuellement).
- download_logs (anonymisés : fichier, langue, date).

Ajoute index, contraintes de clé étrangère, softDeletes là où utile, et des seeders qui
chargent EXACTEMENT le contenu de référence de la section « Contenu de référence » (filières,
niveaux, coûts, dossier, atouts, contacts, tutelles, partenaires). Les textes anglais sont
générés comme brouillon et marqués « à valider ».
```

### Phase 4 — API publique

```
Crée les contrôleurs, Form Requests et API Resources de l'API publique /api/v1 (lecture
seule, mise en cache, locale respectée, slugs localisés) :
- GET /settings (coordonnées, réseaux, bannière active, WhatsApp, chiffres clés)
- GET /menus/{location} (header, footer)
- GET /pages/{slug} et /pages (listes institutionnelles)
- GET /levels, /levels/{slug}, /programs (filtres level, search), /programs/{slug},
  /programs/compare?ids=
- GET /fees (par année et niveau) et POST /fees/simulate (niveau, nombre de mensualités →
  échéancier)
- POST /programs/finder (diplôme, domaine → filières accessibles, avec coût et durée)
- GET /admission/steps, /admission/documents?level=
- GET /downloads (filtres catégorie, niveau, filière, langue) et
  GET /downloads/{id}/file (enregistre le téléchargement puis redirige/streame le fichier)
- GET /news, /news/{slug}, /events, /calendar
- GET /gallery, /testimonials, /faqs, /staff, /partners, /internship-sites, /research-labs,
  /campuses
- GET /sitemap (toutes les URLs fr et en avec hreflang)
- Résolution de slugs : un slug existe par langue, la réponse inclut les slugs alternatifs
  pour construire le sélecteur de langue et les balises hreflang.
Écris les tests Pest (réponses fr/en, repli sur fr, cache, filtres) et vérifie via Scramble
que le schéma OpenAPI est correct.
```

### Phase 5 — API d'administration (CRUD complet)

```
Crée l'API admin /api/v1/admin protégée par Sanctum et permissions pour gérer TOUT le
contenu listé en Phase 3 : liste paginée avec filtres/tri/recherche, création, lecture,
mise à jour, suppression (corbeille), publication/dépublication, duplication, réordonnancement
(endpoint de tri en lot), et pour chaque ressource traduisible la lecture/écriture des deux
langues dans la même requête (payload { fr: ..., en: ... }) avec indicateur de complétude.
- Médiathèque : upload multiple, dossiers, texte alternatif traduisible, recadrage, génération
  des conversions, suppression sécurisée si le média est utilisé.
- Paramètres du site : édition par groupes (coordonnées, réseaux, bannière, WhatsApp, SEO).
- Gestionnaire de menus (arborescence glisser-déposer côté front, sauvegarde en lot ici).
- Utilisateurs admin et rôles, journal d'activité consultable, tableau de bord (KPI :
  candidatures par statut, messages non lus, téléchargements par fichier, pages vues si
  disponible, conversations du chatbot).
- Endpoint « Traduire avec l'IA » : à partir d'un texte français, renvoie une SUGGESTION
  anglaise via l'API Claude (côté serveur), jamais enregistrée automatiquement ; la relecture
  humaine reste obligatoire.
- Export CSV des candidatures, messages, abonnés.
Tests Pest sur chaque permission (un éditeur ne peut pas toucher aux utilisateurs, un
gestionnaire des admissions ne peut pas modifier les pages, etc.).
```

### Phase 6 — Pré-inscription, contact, rendez-vous, newsletter

```
Implémente les flux d'interaction publics, sécurisés et limités en débit :
- POST /applications : pré-inscription en plusieurs étapes (identité, parcours scolaire,
  niveau/filière visés, pièces jointes). Valide le niveau (les pièces supplémentaires sont
  obligatoires pour Licence pro et Master), génère un numéro de suivi unique et lisible
  (ex. ISS-2026-000123), stocke les fichiers en stockage privé (types et tailles contrôlés),
  envoie un accusé de réception par e-mail (file d'attente) dans la langue du candidat.
- GET /applications/track?number=&phone= : statut et message public de la candidature, sans
  exposer de données sensibles.
- Admin : pipeline de candidatures (changement de statut avec historique, notes internes,
  demande de pièces manquantes par e-mail, téléchargement des pièces via URL signée courte).
- POST /contact (message + reCAPTCHA v3 ou Turnstile côté serveur, e-mail de notification à
  l'école), POST /appointments (cabinet de kinésithérapie), POST /newsletter (double opt-in).
- Protection anti-spam : limitation de débit, champ piège, validation stricte.
- Mentions de consentement et durée de conservation configurables dans les paramètres.
Tests Pest sur la validation, le suivi, les droits d'accès aux pièces, les limites de débit.
```

### Phase 7 — Chatbot IA (côté serveur)

```
Crée le chatbot de l'ISSTAS côté Laravel (domaine Chat), appelant l'API Claude d'Anthropic :
- Service ChatbotService : construit un prompt système à partir du CONTENU DU CMS (filières,
  niveaux, frais, dossier, procédure, contacts, FAQ, calendrier) via une base de connaissances
  recherchable (au minimum : sélection des passages pertinents par mots-clés/embedding simple,
  mise en cache) + chat_knowledge_overrides validés par l'admin.
- Règles du prompt système : répondre dans la langue du visiteur (fr/en), ne jamais inventer
  un prix, une date ou une condition ; si l'information est absente, dire qu'on ne la
  connaît pas et proposer WhatsApp, téléphone ou le formulaire de contact ; ne jamais promettre
  une admission ; rester dans le périmètre de l'école ; ton chaleureux et concis.
- Modèle configurable par variable d'environnement (ANTHROPIC_MODEL), valeur par défaut un
  modèle Claude actuel adapté au coût (consulter la documentation Anthropic pour les
  identifiants à jour). Clé uniquement dans .env.
- POST /chat/messages avec streaming (SSE) pour que la réponse s'affiche au fil de l'eau,
  historique limité aux N derniers messages, limitation de débit par IP et par session, délai
  d'expiration et message de repli propre en cas d'erreur de l'API.
- Enregistre les conversations (avec avis de confidentialité affiché côté widget), note
  « utile / pas utile », et marque « sans réponse » les questions où le bot a dû renvoyer vers
  un humain, pour les afficher dans l'admin et enrichir la FAQ.
- Actions guidées : le bot peut renvoyer vers la pré-inscription, le simulateur ou un
  téléchargement avec des liens localisés.
- Tests avec Http::fake() : flux complet, repli sur erreur, limite de débit, langue.
```

### Phase 8 — Brochures PDF, SEO et seeders finaux

```
- Génération automatique de brochures PDF : une par filière et une par niveau, en fr et en,
  à partir des données du CMS, avec la charte ISSTAS (logo, vert, brun, Montserrat et Open Sans),
  QR code vers la page en ligne, coordonnées en pied de page. Génération en file d'attente,
  régénérée quand le contenu change, enregistrée dans downloads avec un drapeau « auto ».
- SEO : génération du sitemap multilingue, données structurées JSON-LD (EducationalOrganization,
  Course), balises hreflang, endpoint de métadonnées par page.
- Compléter les seeders pour que l'environnement de démonstration soit entièrement utilisable
  (contenu réel de référence + brouillons anglais marqués « à valider »).
- Commande artisan isstas:warm-cache pour préchauffer le cache.
```

---

### PARTIE FRONTEND PUBLIC (isstas/apps/site)

### Phase 9 — Design system et coquille du site

```
Dans isstas/packages/ui et apps/site, construis le design system à partir de la charte
ACTUELLE du site isstas-cameroun.com. Étape 0 obligatoire, avant toute ligne de design :
AUDIT DE CHARTE. Ouvre le site en ligne, relève les couleurs (fonds, textes, boutons, liens,
bordures), polices (familles, graisses, tailles, interlignage), arrondis, ombres, styles de
boutons et d'icônes réellement utilisés ; recoupe avec le logo et les dépliants de
_source-assets/ ; écris le résultat dans docs/BRAND.md (valeurs exactes + capture de
référence). Si tu ne peux pas lire le site, demande-moi les couleurs/polices globales
Elementor au lieu d'estimer. Puis fige les tokens (vert, vert profond, vert feuille, brun
chocolat, menthe, blanc, gris neutres, états succès/erreur) avec les contrastes vérifiés
WCAG AA, et ajuste uniquement si un contraste est insuffisant en le signalant.
Rappel : aucun texte de l'interface en dur. Tout vient de l'API (ui_strings et contenus).

Typographie (imposée, identique à The Lord My Shepherd) : Montserrat pour les titres
(graisses 700, 800, 900 ; capitales autorisées sur les grands titres de hero et de section,
jamais sur les libellés courts), Open Sans pour le texte (400, 600). Contraste d'échelle
marqué : très gros titres Montserrat 800/900 serrés, texte Open Sans à interligne généreux,
lignes de moins de 80 caractères.
Auto-hébergées avec fontsource, sous-ensemble latin. Échelle typographique définie.

Principes de design (à respecter dans tout le site) :
- Le logo représente deux mains qui protègent : en faire le motif graphique signature
  (formes courbes, découpes d'images), pas un simple décor.
- Une SEULE signature visuelle forte, la « ligne de pouls » (tracé d'électrocardiogramme en
  vert) qui apparaît dans le hero et accompagne la lecture ; tout le reste reste sobre.
- Éviter les clichés génériques : pas de cartes identiques partout avec la même ombre grise,
  pas d'étiquette en capitales au-dessus de chaque titre, pas de numérotation 01/02/03 sauf
  vraie séquence, pas de dégradé décoratif gratuit, pas d'animation d'apparition sur chaque
  bloc. Garder les pastilles vertes de titre de section des dépliants, mais avec parcimonie.
- Variété des composants selon le contenu : une carte de filière, une carte d'actualité, un
  tableau de tarifs et un encart de chiffres n'ont pas le même traitement.

Composants : Button (variantes, tailles, état de chargement), Link, Badge, Card (plusieurs
variantes), Tabs, Accordion, Table de tarifs, Stepper, Tooltip, Dialog, Drawer, Skeleton,
Toast, Form (champ, erreur, aide), Breadcrumb, Pagination, Carousel (Embla), Lightbox,
SectionTitle, PageHeader, Callout, StatBlock, DownloadCard. Basés sur Radix UI (accessibilité
clavier et ARIA), Tailwind v4.

Coquille du site (layout) :
- TOP HEADER : numéro(s) de téléphone et e-mail à gauche ; bannière d'annonce au centre
  (texte, dates et activation pilotés par l'API, par ex. inscriptions ouvertes) ; à droite
  sélecteur de langue FR | EN, icônes des réseaux sociaux (vrais liens) et lien « Télécharger
  la brochure ». En mobile : une seule ligne (annonce + langue), le reste dans le menu.
- NAVBAR : logo, menu alimenté par l'API avec méga-menu « Formations » organisé par niveau
  (BTS, Licence professionnelle, Master, DU) et entrée « Admission », devient collante et
  compacte au défilement, tiroir latéral en mobile, navigation clavier complète.
- FOOTER : coordonnées, plan d'accès, liens rapides, réseaux, newsletter, mentions légales,
  tutelles et logos partenaires.
- i18n : routes /fr et /en, détection de la langue, redirection de la racine, balises hreflang
  et canonical, sélecteur qui conserve la page courante via les slugs alternatifs de l'API.
- Gestion globale du chargement (squelettes), des erreurs réseau (message utile, pas de
  crash) et des pages 404/500 designées.
- Défilement : Lenis optionnel, desktop uniquement, désactivé si prefers-reduced-motion.
Fournis un petit « catalogue » de composants (page /design) en développement uniquement.
```

### Phase 10 — Page d'accueil (le moment fort)

```
Construis la page d'accueil. Elle doit servir d'abord les futurs étudiants : voir les
formations, comprendre le coût, démarrer une candidature. La page est rendue à partir de
home_sections (API) : chaque section ci-dessous est un type de section dont les textes,
images, boutons, ordre et visibilité se règlent dans l'admin ; l'ordre proposé n'est que la
valeur initiale des seeders.

Sections, dans l'ordre :
1. Hero plein écran : titre en Montserrat extra-gras « Devenez professionnels de santé »
   (textes issus de l'API, fr/en), photo réelle des étudiants en laboratoire, deux boutons
   (« Voir les formations », « S'inscrire »), mention de la rentrée pilotée par l'API.
   C'est LE moment fort : la ligne de pouls se trace à l'arrivée sur la page (une séquence
   orchestrée, une fois) puis se prolonge en filet de progression qui accompagne le défilement
   (GSAP ScrollTrigger, seulement ici). Tout le reste de la page reste calme.
2. « Trouver ma filière » juste sous le hero : 3 questions (mon diplôme, mon domaine, la durée)
   qui affichent immédiatement les filières accessibles avec durée et coût, boutons vers la
   fiche et la pré-inscription.
3. Les quatre niveaux (BTS/HND, Licence professionnelle, Master, DU) : chaque niveau avec sa
   durée, son accès et le nombre de filières, composition visuelle non répétitive.
4. Pourquoi l'ISSTAS : les atouts réels (3 campus, laboratoires, stages, restaurant, internet,
   infirmerie, cabinet de kinésithérapie ouvert au public, bourses...) sous une forme qui n'est
   pas une grille d'icônes identiques.
5. Chiffres clés (valeurs depuis l'API ; si une valeur est vide, masquer la ligne plutôt
   qu'afficher 0).
6. Mot de la Directrice (extrait + lien), vidéo de présentation chargée à la demande.
7. Admission en 3 étapes avec lien vers le simulateur de coût et la checklist du dossier,
   bloc de téléchargement des dépliants.
8. Actualités et événements à venir, témoignages, partenaires et tutelles (logos).
9. Appel final à l'inscription + coordonnées + plan d'accès.
Performance : images responsives (srcset, formats modernes), chargement différé sous le pli,
LCP < 2,5 s sur mobile, aucune animation bloquante, respect de prefers-reduced-motion.
```

### Phase 11 — Pages institutionnelles

```
Construis, avec des gabarits réutilisables pilotés par l'API (blocs de contenu) :
- À propos (vue d'ensemble), Mot de la Directrice, Missions et Vision, Valeurs, Points forts,
  Milieu de stage (avec carte des lieux de stage et liste des partenaires), Recherche et
  laboratoires (les 3 laboratoires), Campus et infrastructures (galerie), Corps enseignant,
  Partenaires et tutelles, Bourses et aides.
- Chaque page : en-tête de page avec fil d'Ariane, contenu en blocs (texte riche, image,
  citation, chiffres, galerie, liste de coches, appel à l'action), navigation latérale entre
  pages de la section, bloc d'appel à l'inscription en bas.
- Page « Notre histoire » en frise chronologique si les dates sont fournies (sinon gabarit
  prêt mais masqué tant que le contenu est vide).
- Données structurées JSON-LD et métadonnées SEO par page.
```

### Phase 12 — Formations par niveau (cœur du site)

```
Construis le parcours de formation :
- /formations : vue d'ensemble des 4 niveaux et de toutes les filières avec filtres (niveau,
  domaine, durée, recherche), tableau/grille bascule.
- /formations/{niveau} : page par niveau (BTS, Licence professionnelle, Master, DU) avec
  durée, accès, liste des filières, coûts (inscription et pension), voies d'accès (ex. Licence
  pro en 1 an après BTS/IDE/TMS/TPGS), téléchargement du dépliant du niveau.
- /formations/{niveau}/{filière} : fiche filière détaillée (présentation, durée, conditions
  d'accès, programme, débouchés, stages, coût, brochure PDF, QR code vers la page, bouton
  « Je postule » qui préremplit la pré-inscription, filières voisines).
- Comparateur : sélection de 2 à 3 filières, tableau côte à côte (durée, accès, coût,
  débouchés), partage du lien.
- « Trouver ma filière » en version complète (assistant pas à pas, résultat partageable).
- Tableau des tarifs lisible en mobile (cartes empilées plutôt que scroll horizontal).
- Chaque page filière a ses propres métadonnées SEO et JSON-LD Course.
```

### Phase 13 — Admission et inscription

```
Construis le parcours d'admission :
- Procédure d'admission (étapes depuis l'API), « admission sur étude du dossier » mise en
  évidence, dates clés issues du calendrier.
- Dossier à fournir : CHECKLIST INTERACTIVE par niveau (les pièces supplémentaires de la
  Licence pro et du Master apparaissent selon le niveau choisi), cases à cocher avec barre de
  progression sauvegardée sur l'appareil, impression propre, export PDF et partage WhatsApp.
- Frais d'inscription et scolarité : tableau (cycle, inscription, pension), rappel des frais
  d'étude du dossier, SIMULATEUR : choix du cycle et du nombre de mensualités autorisées →
  montant par échéance et total, avec rappel qu'il faut prévoir stage, recherche et matériel
  de TP. Formatage FCFA en fr et XAF/FCFA en en.
- PRÉ-INSCRIPTION en ligne : formulaire en plusieurs étapes avec enregistrement du brouillon,
  validation instantanée (React Hook Form + Zod), dépôt de pièces (glisser-déposer, aperçu,
  taille/type contrôlés), récapitulatif, page de confirmation avec numéro de suivi.
- « Suivre ma candidature » : numéro de suivi + téléphone → statut et message.
- Page de contact admission avec WhatsApp, appel et plan d'accès.
Accessibilité des formulaires : labels, erreurs annoncées, navigation clavier, pas de perte de
saisie.
```

### Phase 14 — Téléchargements, actualités, galerie, FAQ, contact

```
Construis :
- /telechargements : centre de téléchargement avec filtres (catégorie, niveau, filière,
  langue), cartes avec aperçu, taille et format, bouton télécharger, section « Dépliants par
  filière » et « Documents d'admission » (fiche de renseignements, tarifs, dossier).
- Actualités (liste paginée, catégories, article avec partage) et événements/calendrier
  académique (portes ouvertes, rentrée), avec export vers le calendrier (ICS).
- Galerie photos par album avec lightbox accessible, section vidéos (YouTube chargé à la
  demande), témoignages et parcours d'anciens.
- FAQ avec recherche instantanée et catégories (admission, scolarité, vie de campus, parents).
- Cabinet de kinésithérapie : présentation, horaires, formulaire de demande de rendez-vous.
- Contact : formulaire (anti-spam), coordonnées complètes, plan d'accès interactif et schéma
  du dépliant, boutons d'appel et WhatsApp directs.
- Pages légales : mentions légales, confidentialité, cookies, avec bandeau de consentement
  si nécessaire.
```

### Phase 15 — Chatbot, WhatsApp et retour en haut

```
Construis les trois actions flottantes dans apps/site, en bas à droite, sans chevauchement et
sans masquer le contenu, en respectant les zones sûres mobiles :
1) Bouton RETOUR EN HAUT : invisible au départ, apparaît avec une transition douce après
   un seuil de défilement lu depuis les paramètres (400 px par défaut, modifiable dans
   l'admin), anneau de progression de lecture autour de l'icône, remonte en
   douceur (instantané si prefers-reduced-motion), libellé accessible.
2) Bouton WHATSAPP : ouvre wa.me avec le numéro et le message prérempli traduits, depuis les
   paramètres de l'API (modifiables dans l'admin), ouvre dans un nouvel onglet, vert WhatsApp
   reconnaissable mais intégré.
3) CHATBOT : bouton d'ouverture avec pastille d'invitation discrète la première fois,
   panneau (≈ 400 px, plein écran en mobile) avec en-tête de l'école, message d'accueil dans la
   langue de la page, suggestions de questions fréquentes (« Combien coûte la filière
   Sage-femme ? », « Quels documents pour m'inscrire ? »), bulles utilisateur/assistant,
   réponse en streaming (SSE), indicateur de saisie, liens d'action dans les réponses
   (pré-inscription, simulateur, téléchargements), boutons « utile / pas utile », « parler à
   un humain » (WhatsApp), conservation de la conversation de la session, avis de
   confidentialité visible, erreurs gérées sans crash. Accessibilité : focus géré, aria-live,
   fermeture par Échap, rôle dialogue.
Pile verticale cohérente (ordre et espacement définis dans un seul composant), animation
d'ouverture sobre (une transition), aucun chevauchement avec bandeau de cookies ou barre
d'action mobile.
```

### Phase 15b — Passe de polish visuel « magnifique » (site public)

À lancer quand les Phases 9 à 15 sont en place, avant de passer à l'admin. C'est le même esprit que la passe de finition faite sur The Lord My Shepherd, adaptée à ISSTAS.

```
Fais un passage complet de direction artistique sur tout le site public déjà construit
(coquille, accueil, formations, admission, téléchargements, contact, widgets flottants).
Objectif : un site magnifique, premium et chaleureux, qui ne ressemble à aucun autre
établissement de santé générique, tout en gardant la charte actuelle d'ISSTAS (docs/BRAND.md)
et le duo typographique Montserrat (titres) + Open Sans (texte).

1. Typographie : contraste d'échelle franc entre les très gros titres Montserrat 800/900 et le
   texte Open Sans, interligne confortable, lignes < 80 caractères. Pas d'étiquette en
   capitales au-dessus de chaque titre, pas d'un seul mot coloré dans un titre.
2. Un seul moment fort : la ligne de pouls du hero (composition, rythme, micro-interaction
   travaillés à fond). Partout ailleurs, sobriété : supprime les apparitions au scroll sur
   chaque bloc ; garde seulement les animations qui répondent à une action (menu, ouverture
   du chat, survol de carte de filière, étapes du formulaire).
3. Photographie : cadrages généreux, découpes inspirées des deux mains du logo, traitement
   cohérent des images (même chaleur, même arrondi), jamais d'image étirée ou pixelisée.
4. Composants différenciés selon le contenu : carte de filière, carte d'actualité, tableau de
   tarifs, simulateur, checklist, chiffres clés n'ont pas le même traitement ni la même
   ombre. Vérifie tous les états : survol, focus clavier visible, désactivé, chargement
   (squelettes), vide (invitation à agir), erreur (explique comment corriger).
5. Rythme : espacements verticaux réguliers mais pas monotones, alignement à gauche pour le
   contenu long, centré seulement pour les accroches courtes, zones de respiration autour des
   appels à l'action (S'inscrire, Télécharger la brochure, WhatsApp).
6. Mobile d'abord : repasse chaque breakpoint en pensant l'expérience mobile comme prioritaire ;
   le top header, le bouton WhatsApp, le chatbot et le bouton retour en haut ne se chevauchent
   jamais et ne masquent ni formulaire ni bouton principal.
7. Qualité de base : contraste AA partout (texte sur vert vérifié), focus visible,
   prefers-reduced-motion respecté, alt pertinents, performance (pas d'image lourde non
   différée).
8. Auto-critique : si une section pourrait appartenir à n'importe quel site d'école, retravaille-
   la. Prends des captures (mobile et desktop, fr et en) avant et après, et liste ce que tu as
   changé et pourquoi.
Ne modifie ni les routes ni la logique métier ni la règle « tout est géré depuis l'admin ».
```

---

### PARTIE ADMIN (isstas/apps/admin)

### Phase 16 — Design et coquille du back-office

```
Dans apps/admin, construis un back-office qui a de la personnalité tout en restant très
efficace. Même identité que le site (vert, brun chocolat, polices), mais pensé pour le travail
quotidien : dense, clair, rapide.
- Connexion soignée (Sanctum), mot de passe oublié, session expirée gérée proprement.
- Coquille : barre latérale brun chocolat rétractable avec groupes de modules (Contenu,
  Formations, Admissions, Médias, Interactions, Chatbot, Paramètres), barre supérieure avec
  recherche globale / palette de commandes (Ctrl+K : aller à un module, créer un contenu,
  chercher une candidature), sélecteur de langue d'édition, notifications, profil, mode
  clair/sombre.
- Tableau de bord : cartes de KPI (candidatures par statut, messages non lus, téléchargements
  les plus populaires, conversations du chatbot, contenus incomplets en anglais), graphiques
  Recharts, liste « à faire » (candidatures à traiter, messages sans réponse, traductions
  manquantes).
- Composants admin réutilisables : DataTable (TanStack Table : tri, filtres, recherche,
  sélection multiple, actions en lot, colonnes configurables, pagination serveur),
  FormLayout avec onglets FR | EN et indicateur de complétude par langue, bouton « suggérer la
  traduction EN » (Phase 5), éditeur riche Tiptap (titres, listes, liens, images depuis la
  médiathèque, tableaux), sélecteur de média, sélecteur de date, tri par glisser-déposer
  (dnd-kit), confirmations, toasts (sonner), états vides utiles, squelettes de chargement,
  enregistrement automatique des brouillons, alerte avant de quitter une page modifiée.
- Permissions : l'interface masque les modules non autorisés, gère les erreurs 403.
- Responsive utilisable sur tablette ; accessibilité clavier.
```

### Phase 17 — Modules du back-office

```
Construis tous les modules, chacun avec liste, création/édition bilingue, publication,
duplication, corbeille, et connexion à l'API admin :
- Pages et blocs de contenu (éditeur par blocs avec réordonnancement et aperçu), menus
  (arborescence glisser-déposer), paramètres du site (coordonnées, réseaux, WhatsApp et
  message prérempli, bannière du top header avec dates, chiffres clés, SEO par défaut).
- Constructeur de la page d'accueil (ajouter, ordonner, masquer, éditer chaque section en fr
  et en), Textes de l'interface (tableau clé / fr / en avec recherche, filtre « anglais
  manquant » et import/export CSV), Apparence et identité (logo, favicon, image de partage,
  visuels du hero), Actions flottantes (WhatsApp, retour en haut avec seuil en px, chatbot :
  activation, message d'accueil, questions suggérées, pages concernées), Formulaires (champs,
  consentements, destinataires, messages), Gabarits d'e-mails fr/en, SEO et redirections 301,
  Langues actives.
- Aperçu : bouton « Voir sur le site » et aperçu avant publication pour chaque contenu.
- Niveaux, filières (fiche complète, règles d'accès, brochure), frais et scolarité par année,
  procédure d'admission, pièces à fournir, calendrier académique.
- Téléchargements (upload du fichier fr et/ou en, catégorie, rattachement, statistiques),
  brochures auto (régénération à la demande).
- Actualités, événements, galerie et médiathèque, témoignages, FAQ, corps enseignant,
  partenaires, lieux de stage, laboratoires, campus.
- Candidatures : vue liste ET tableau kanban par statut, fiche candidat (pièces jointes
  aperçues via URL signée, historique, notes internes, e-mail de demande de pièces), export CSV.
- Messages de contact, rendez-vous du cabinet, abonnés newsletter.
- Chatbot : conversations, questions sans réponse, réponses validées à ajouter à la base de
  connaissances, statistiques de satisfaction, test du bot dans l'admin.
- Utilisateurs, rôles, journal d'activité, sauvegarde/restauration de paramètres.
- Tableau de bord alimenté par les vrais endpoints.
```

---

### PARTIE FINALISATION

### Phase 17b — Passe de polish visuel (admin)

```
Reprends le back-office avec le même niveau d'exigence visuelle que le site : Montserrat pour
les titres et Open Sans pour le texte, barre latérale brun chocolat soignée, tableaux denses
mais aérés, formulaires bilingues clairs (onglets FR | EN, indicateur de complétude lisible),
états vides utiles, squelettes, retours d'action immédiats (toasts), tableau de bord qui donne
envie de s'en servir. Un seul élément mémorable (le tableau de bord ou la vue kanban des
candidatures), tout le reste discipliné. Vérifie clavier, contrastes et usage sur tablette.
```

---

### Phase 18 — Intégration front-API, performance et SEO

```
- Brancher chaque page du site et chaque module admin sur l'API via le client TypeScript
  généré (zéro appel axios « à la main » dispersé), avec TanStack Query (cache, invalidation,
  mises à jour optimistes côté admin).
- Vérifier la cohérence des slugs localisés, hreflang, canonical, sitemap, robots.txt, balises
  Open Graph, données structurées.
- Performance : budget (bundle initial, LCP, CLS, TBT), découpage du code par route (le bundle
  admin n'est jamais chargé par le site), préchargement des polices, images responsives en
  AVIF/WebP, mise en cache HTTP, compression.
- Mesurer avec Lighthouse sur mobile : viser ≥ 90 en Performance, Accessibilité, Bonnes
  pratiques et SEO sur l'accueil, une fiche filière et la pré-inscription ; corriger les
  écarts et documenter ce qui reste.
```

### Phase 19 — Tests, accessibilité et sécurité

```
- Tests : Pest (unitaires + fonctionnels) sur l'API ; Vitest + Testing Library sur les
  composants critiques ; Playwright sur les parcours clés (changer de langue, trouver une
  filière, simuler un coût, pré-inscription complète, suivi de candidature, chatbot,
  connexion admin, publication d'un contenu bilingue).
- Couverture admin : test automatique qui parcourt apps/site et fait échouer la CI s'il trouve
  un texte visible en dur (hors clés techniques) ; revue manuelle page par page avec une
  checklist « chaque mot, image, lien et nombre visible est modifiable depuis l'admin ? ».
  Ajoute un parcours Playwright : modifier un texte, un prix, le numéro WhatsApp et l'ordre
  d'une section dans l'admin, puis vérifier le changement sur le site en fr et en en.
- Accessibilité : audit axe sur toutes les pages types, navigation clavier complète, contrastes,
  focus visible, annonces ARIA du chatbot et des formulaires.
- Sécurité : revue complète (validation, autorisations, upload de fichiers, URLs signées,
  CORS, CSRF/Sanctum, en-têtes de sécurité, limites de débit, secrets absents du dépôt, clé IA
  non exposée, journalisation sans données sensibles). Mentionne les points de conformité à
  faire valider juridiquement concernant les données personnelles collectées.
- Rapport final listant les risques restants.
```

### Phase 20 — Déploiement et documentation

```
Rédige et prépare :
- DEPLOYMENT.md : déploiement de isstas-api (PHP 8.3+, extensions, migrations, files
  d'attente Horizon/superviseur, planificateur, Redis, permissions storage/, sauvegardes
  MySQL, CDN médias) et de isstas (site avec rendu serveur ou pré-rendu, admin statique),
  domaines/sous-domaines, variables d'environnement complètes sans valeurs, HTTPS, CORS.
- Dockerfiles et pipeline de déploiement (CI/CD) avec migration automatique et retour arrière.
- Surveillance : journaux, alertes d'erreur, suivi des files d'attente, page de santé /up.
- Guide d'utilisation de l'admin pour l'équipe ISSTAS (créer une filière, publier une
  actualité, traduire un contenu, traiter une candidature, ajouter un dépliant, modifier le
  numéro WhatsApp ou la bannière du top header) avec captures.
- Checklist de mise en production : contenus validés (section 1.5), traductions relues,
  redirections depuis l'ancien site WordPress (301 pour chaque ancienne URL), sitemap soumis,
  sauvegardes testées.
```

### Phase 21 — Évolutions à documenter (ne pas implémenter maintenant)

```
Rédige ARCHITECTURE.md et ROADMAP.md expliquant comment le projet évoluera sans réécriture :
espace étudiant (emploi du temps, notes, relevés), paiement mobile money (Orange Money,
MTN MoMo) des frais de dossier puis de la scolarité (nouveau domaine Payments, passerelles
interchangeables, webhooks idempotents), visite virtuelle 360°, application mobile qui
réutilise l'API /api/v1, tableau de bord décisionnel, notifications WhatsApp Business, moteur
de recherche plein texte (Meilisearch), mise à l'échelle (Octane, réplicas MySQL, cache en
périphérie via CDN). Pour chacun : tables et endpoints à ajouter, impacts sur l'existant, ordre conseillé.
```

---

## 5. Rappels pour réussir

- **Fournis les assets sources** (logo vectoriel, photos réelles, photo de la Directrice) avant les Phases 9-10 : un site de formation en santé vit de photos authentiques.
- **Ne laisse pas Claude Code inventer du contenu** : les prompts lui imposent les données des dépliants. Tout ajout (histoire, témoignages, débouchés détaillés) doit venir de l'école.
- **Valide la section 1.5 en parallèle** : elle conditionne le simulateur de mensualités, les filières affichées et les dates.
- **Teste en conditions réelles** : connexion mobile lente, smartphone d'entrée de gamme, car une grande partie des candidats navigue ainsi.

## 6. Sources consultées

- Site actuel : https://isstas-cameroun.com/
- Comparatifs de bibliothèques d'animation : https://www.syncfusion.com/blogs/post/motion-vs-gsap-react · https://blog.openreplay.com/motion-vs-gsap/ · https://www.pkgpulse.com/guides/best-react-animation-libraries-2026
- UX des sites d'établissements supérieurs : https://seahawkmedia.com/design/university-website-design/ · https://dxstudio.msu.edu/experience-design/ux-conventions · https://www.enrollify.org/blog/increase-enrollment-with-admissions-pages · https://www.insidenewcity.com/the-top-ten-accessible-web-design-trends-for-2025
