# Contexte du projet ISSTAS

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


## Contenu de référence


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

