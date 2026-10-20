# Guide d'utilisation de l'administration

Connexion : `https://admin.isstas-cameroun.com`. Selon votre rôle, seuls certains modules apparaissent
(éditeur de contenu, gestionnaire des admissions, modérateur, super-administrateur).

## Principe
Tout ce que voit un visiteur se modifie ici, en français **et** en anglais (onglets FR | EN). Un texte anglais vide
s'affiche en français. Le badge « Anglais N % » indique ce qu'il reste à traduire.

## Créer ou modifier une filière
1. **Formations > Filières > Créer**. Remplir le nom, le slug (adresse), la présentation, les débouchés (FR puis EN).
2. Enregistrer, puis **Publier** depuis la liste (icône Brouillon/Publié).
3. Les niveaux et les règles d'accès (« Trouver ma filière ») se règlent dans Niveaux et les règles d'accès de la filière.
4. La brochure PDF se régénère automatiquement dans les 2 minutes.

## Publier une actualité
**Contenu > Actualités > Créer** : titre, extrait, contenu. Enregistrer, puis publier. Une date de publication future
planifie la mise en ligne.

## Traduire un contenu
Passer sur l'onglet **EN** ; le lien « Suggérer depuis le français » propose une traduction automatique, **jamais
enregistrée sans votre relecture**. Corriger puis enregistrer.

## Traiter une candidature
**Candidatures** : colonnes par statut. Cliquer une carte : fiche, pièces (lien sécurisé valable 5 minutes), historique.
Changer le statut ; ajouter un message pour que le candidat le reçoive par e-mail et le voie dans « Suivre ma candidature ».

## Ajouter un dépliant
**Médias > Téléchargements > Créer** (titre, catégorie), puis ajouter le fichier FR et/ou EN, puis publier.

## Modifier le numéro WhatsApp ou la bannière du top header
- Bannière : **Réglages > Top header** (`top_header.announcement` : texte, lien, dates, `enabled`).
- WhatsApp : **Actions flottantes** (numéro, message prérempli, activation).
- Chiffres clés : **Contenu > Chiffres clés** (une valeur vide masque la ligne).

## Chatbot
**Chatbot** : statistiques, questions restées sans réponse. Saisir la réponse validée : elle prime ensuite sur le reste de la base
de connaissances. Le bouton Tester montre la réponse et les sources.
## Lancer l'ensemble en local (données réelles)
1. API : `cd isstas-api && composer install` (ou `composer update --ignore-platform-req=ext-pcntl --ignore-platform-req=ext-posix` sous Windows), `.env` depuis `.env.example` (`DB_CONNECTION=sqlite`, `SESSION_DOMAIN=null`, `QUEUE_CONNECTION=database`), `php artisan key:generate`, `php artisan migrate:fresh --seed`, `php artisan storage:link`.
2. Trois processus : `php artisan serve --host=127.0.0.1 --port=8000`, `php artisan queue:work` (conversions d'images), puis le front : `apps/site/.env.local` avec `VITE_API_URL=http://127.0.0.1:8000/api/v1`, `npx vite --host 127.0.0.1 --port 3000`.
3. Admin : http://127.0.0.1:3000/admin — identifiants du seeder (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` du `.env`). Changer le mot de passe avant toute mise en ligne.

## Décors SVG des sections
Chaque section de l'accueil a un champ **Décor SVG** (Page d'accueil → section) : aucun, ligne de pouls, croix médicales, ADN, molécules, cercles, formes organiques, trame de points. Les décors sont dessinés en SVG (`packages/ui/src/Decor.tsx`), prennent la couleur de la charte (clairs sur fond sombre, verts sur fond clair) et restent derrière le contenu. L'aperçu de la carte montre fond, vague et décor ensemble.

## Comptes et IA
- Créer un administrateur : `php artisan isstas:make-admin email@exemple.com --name=Prenom_Nom --role=super-admin` (mot de passe aléatoire affiché une seule fois). Rôles : super-admin, content-editor, admissions-manager, moderator.
- IA (chatbot et suggestion de traduction) : `AI_PROVIDER=gemini` + `GEMINI_API_KEY` + `GEMINI_MODEL=gemini-flash-latest` dans le `.env` de l'API (jamais dans le front ni dans Git). `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` pour Claude.
