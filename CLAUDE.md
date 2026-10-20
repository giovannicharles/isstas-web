# ISSTAS (front) — conventions

Lire d'abord `docs/CONTEXT.md` (contexte, contenu de référence, règle d'or).

## Structure
- `apps/site` : site public React (rendu serveur/pré-rendu, FR/EN)
- `apps/admin` : back-office React (code séparé, monté par le site sous `/admin` ; bundle chargé à la demande)
- `packages/{ui,api-client,i18n,config}` : design system, client API typé (généré depuis OpenAPI), i18n, configs partagées

## Règles
- TypeScript strict. Aucun `any` non justifié.
- **Zéro texte visible en dur** : textes, images, liens, chiffres viennent de l'API (ui_strings, contenus). Valeur vide = bloc masqué (jamais « 0 »).
- Bilingue : routes `/fr` et `/en`, repli sur le français.
- Charte : valeurs issues de `docs/BRAND.md` uniquement (audit à faire en Phase 9). Polices : Montserrat (titres 700-900) + Open Sans (texte).
- Accessibilité WCAG AA, mobile d'abord, `prefers-reduced-motion` respecté.
- Animations : Motion pour les composants, GSAP ScrollTrigger uniquement pour la ligne de pouls du hero.
- Jamais de clé secrète côté front.
- Commits conventionnels.

## Commandes
- `pnpm install` · `pnpm dev:site` (site sur :3000, admin sur :3000/admin)
- `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test`
- Le site et l'admin lisent toujours l'API réelle (`VITE_API_URL`, voir `apps/site/.env.example`) : aucune donnée de démonstration.
- Textes d'interface : `packages/i18n/ui-strings.json` (source unique, copiée dans isstas-api/database/seeders/data).
- Design : `docs/DESIGN.md` et `docs/BRAND.md` (valeurs provisoires à confirmer).
