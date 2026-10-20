/**
 * Modules du back-office : groupes de la barre laterale, ressources (cle d'URL de l'API admin),
 * permission de lecture et definition des champs pour la creation.
 * Les champs traduisibles ont { tr: true } : ils s'editent dans les onglets FR | EN.
 */
export type FieldDef = { name: string; label: string; type?: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'datetime' | 'json' | 'relation'; tr?: boolean; required?: boolean; rel?: { resource: string; labelField: string; empty?: string } };
export type ResourceDef = { key: string; label: string; module: string; titleField: string; publishable?: boolean; orderable?: boolean; fields: FieldDef[]; readonly?: boolean };

const t = (name: string, label: string, required = false, type: FieldDef['type'] = 'text'): FieldDef => ({ name, label, tr: true, required, type });
const f = (name: string, label: string, type: FieldDef['type'] = 'text', required = false): FieldDef => ({ name, label, type, required });
/** Champ relationnel : liste deroulante avec recherche a la place d'un identifiant a saisir a la main. */
const rel = (name: string, label: string, resource: string, labelField: string, required = false, empty?: string): FieldDef => ({ name, label, type: 'relation', required, rel: { resource, labelField, empty } });

export const RESOURCES: ResourceDef[] = [
  { key: 'pages', label: 'Pages', module: 'pages', titleField: 'title', publishable: true, orderable: true, fields: [t('title', 'Titre', true), t('slug', 'Slug', true), t('summary', 'Résumé', false, 'textarea'), f('group', 'Groupe'), f('position', 'Ordre', 'number'), t('seo_title', 'Titre SEO'), t('seo_description', 'Description SEO', false, 'textarea')] },
  { key: 'levels', label: 'Niveaux', module: 'levels', titleField: 'name', publishable: true, orderable: true, fields: [t('name', 'Nom', true), t('slug', 'Slug', true), t('summary', 'Résumé', false, 'textarea'), t('duration', 'Durée'), t('access_conditions', "Conditions d'accès", false, 'textarea'), f('english_equivalent', 'Équivalent anglais'), f('position', 'Ordre', 'number')] },
  { key: 'programs', label: 'Filières', module: 'programs', titleField: 'name', publishable: true, orderable: true, fields: [t('name', 'Nom', true), t('slug', 'Slug', true), t('summary', 'Résumé', false, 'textarea'), t('description', 'Description', false, 'textarea'), t('careers', 'Débouchés', false, 'textarea'), t('curriculum', 'Programme', false, 'textarea'), t('internship', 'Stages', false, 'textarea'), f('is_featured', "À la une sur l'accueil", 'boolean')] },
  { key: 'fees', label: 'Frais et scolarité', module: 'fees', titleField: 'academic_year', fields: [f('academic_year', 'Année académique', 'text', true), rel('level_id', 'Niveau', 'levels', 'name', true), f('registration_fee', "Frais d'inscription (FCFA)", 'number', true), f('tuition_fee', 'Pension (FCFA)', 'number', true), f('application_fee', "Frais d'étude du dossier (FCFA)", 'number'), f('allowed_installments', 'Mensualités autorisées (JSON, ex. [2,3,4])', 'json'), t('notes', 'Notes', false, 'textarea')] },
  { key: 'admission-steps', label: "Procédure d'admission", module: 'admission', titleField: 'title', publishable: true, orderable: true, fields: [t('title', 'Titre', true), t('description', 'Description', false, 'textarea'), f('position', 'Ordre', 'number')] },
  { key: 'required-documents', label: 'Pièces à fournir', module: 'admission', titleField: 'label', orderable: true, fields: [t('label', 'Libellé', true), t('description', 'Description', false, 'textarea'), rel('level_id', 'Niveau', 'levels', 'name', false, 'Tous les niveaux'), f('is_additional', 'Pièce supplémentaire', 'boolean'), f('position', 'Ordre', 'number'), f('is_visible', 'Visible', 'boolean')] },
  { key: 'calendar-events', label: 'Calendrier académique', module: 'calendar', titleField: 'title', publishable: true, fields: [t('title', 'Titre', true), t('description', 'Description', false, 'textarea'), f('type', 'Type'), f('starts_on', 'Début', 'date', true), f('ends_on', 'Fin', 'date')] },
  { key: 'news', label: 'Actualités', module: 'news', titleField: 'title', publishable: true, fields: [t('title', 'Titre', true), t('slug', 'Slug', true), t('excerpt', 'Extrait', false, 'textarea'), t('body', 'Contenu (HTML)', false, 'textarea'), t('seo_title', 'Titre SEO'), t('seo_description', 'Description SEO', false, 'textarea')] },
  { key: 'events', label: 'Événements', module: 'events', titleField: 'title', publishable: true, fields: [t('title', 'Titre', true), t('slug', 'Slug', true), t('description', 'Description', false, 'textarea'), f('location', 'Lieu'), f('starts_at', 'Début', 'datetime', true), f('ends_at', 'Fin', 'datetime')] },
  { key: 'downloads', label: 'Téléchargements', module: 'downloads', titleField: 'title', publishable: true, fields: [t('title', 'Titre', true), t('description', 'Description', false, 'textarea'), f('category', 'Catégorie (brochure, form, fees, guide)', 'text', true), rel('level_id', 'Niveau', 'levels', 'name', false, 'Aucun niveau'), rel('program_id', 'Filière', 'programs', 'name', false, 'Aucune filière')] },
  { key: 'faq-categories', label: 'FAQ : catégories', module: 'faqs', titleField: 'name', orderable: true, fields: [t('name', 'Nom', true), f('position', 'Ordre', 'number')] },
  { key: 'faqs', label: 'FAQ : questions', module: 'faqs', titleField: 'question', publishable: true, orderable: true, fields: [rel('faq_category_id', 'Catégorie', 'faq-categories', 'name', true), t('question', 'Question', true), t('answer', 'Réponse (HTML)', true, 'textarea'), f('position', 'Ordre', 'number')] },
  { key: 'testimonials', label: 'Témoignages', module: 'testimonials', titleField: 'name', publishable: true, orderable: true, fields: [f('name', 'Nom', 'text', true), f('cohort', 'Promotion'), t('quote', 'Citation', true, 'textarea'), f('video_url', 'Vidéo (URL)')] },
  { key: 'staff', label: 'Corps enseignant', module: 'staff', titleField: 'name', orderable: true, fields: [f('name', 'Nom', 'text', true), t('title', 'Titre'), t('bio', 'Biographie', false, 'textarea'), rel('program_id', 'Filière', 'programs', 'name', false, 'Toutes / aucune'), f('position', 'Ordre', 'number'), f('is_visible', 'Visible', 'boolean')] },
  { key: 'partners', label: 'Partenaires', module: 'partners', titleField: 'name', orderable: true, fields: [f('name', 'Nom', 'text', true), t('description', 'Description', false, 'textarea'), f('type', 'Type (academic, hospital, institution, international)'), f('website', 'Site web'), f('position', 'Ordre', 'number'), f('is_visible', 'Visible', 'boolean')] },
  { key: 'internship-sites', label: 'Lieux de stage', module: 'internships', titleField: 'name', orderable: true, fields: [f('name', 'Nom', 'text', true), f('city', 'Ville'), f('type', 'Type'), t('description', 'Description', false, 'textarea'), f('latitude', 'Latitude', 'number'), f('longitude', 'Longitude', 'number')] },
  { key: 'research-labs', label: 'Laboratoires', module: 'labs', titleField: 'name', orderable: true, fields: [t('name', 'Nom', true), t('description', 'Description', false, 'textarea'), f('head', 'Responsable')] },
  { key: 'campuses', label: 'Campus', module: 'campuses', titleField: 'name', publishable: true, orderable: true, fields: [t('name', 'Nom', true), t('address', 'Adresse', false, 'textarea'), t('description', 'Description', false, 'textarea'), f('latitude', 'Latitude', 'number'), f('longitude', 'Longitude', 'number')] },
  { key: 'stats', label: 'Chiffres clés', module: 'settings', titleField: 'label', orderable: true, fields: [t('label', 'Libellé', true), f('value', 'Valeur (vide = masqué)'), f('position', 'Ordre', 'number'), f('is_visible', 'Visible', 'boolean')] },
  { key: 'ui-strings', label: "Textes de l'interface", module: 'ui_strings', titleField: 'key', fields: [f('key', 'Clé', 'text', true), f('group', 'Groupe'), t('value', 'Texte', true, 'textarea'), f('description', 'Contexte')] },
  { key: 'home-sections', label: "Sections de l'accueil", module: 'home', titleField: 'type', orderable: true, fields: [f('type', 'Type', 'text', true), f('position', 'Ordre', 'number'), f('is_visible', 'Visible', 'boolean'), f('data', 'Données (JSON { "fr": {...}, "en": {...} })', 'json')] },
  { key: 'redirects', label: 'Redirections 301', module: 'seo', titleField: 'from_path', fields: [f('from_path', 'Ancienne URL', 'text', true), f('to_path', 'Nouvelle URL', 'text', true), f('status_code', 'Code', 'number'), f('is_active', 'Active', 'boolean')] },
  { key: 'chat-knowledge', label: 'Chatbot : réponses validées', module: 'chatbot', titleField: 'question', fields: [f('question', 'Question', 'textarea', true), t('answer', 'Réponse', true, 'textarea'), f('is_active', 'Active', 'boolean')] },
  { key: 'contact-messages', label: 'Messages de contact', module: 'messages', titleField: 'subject', readonly: true, fields: [f('status', 'Statut'), f('internal_reply', 'Réponse interne', 'textarea')] },
  { key: 'appointments', label: 'Rendez-vous du cabinet', module: 'appointments', titleField: 'name', fields: [f('status', 'Statut (new, confirmed, done, cancelled)')] },
  { key: 'newsletter-subscribers', label: 'Abonnés newsletter', module: 'newsletter', titleField: 'email', readonly: true, fields: [] },
];

export const GROUPS: { label: string; keys: string[] }[] = [
  { label: 'Contenu', keys: ['pages', 'news', 'events', 'faq-categories', 'faqs', 'testimonials', 'stats', 'home-sections'] },
  { label: 'Formations', keys: ['levels', 'programs', 'fees', 'admission-steps', 'required-documents', 'calendar-events'] },
  { label: 'Médias', keys: ['downloads'] },
  { label: 'Institution', keys: ['staff', 'partners', 'internship-sites', 'research-labs', 'campuses'] },
  { label: 'Interactions', keys: ['contact-messages', 'appointments', 'newsletter-subscribers'] },
  { label: 'Chatbot', keys: ['chat-knowledge'] },
  { label: 'Paramètres', keys: ['ui-strings', 'redirects'] },
];

export const resourceByKey = (key: string) => RESOURCES.find((r) => r.key === key);

export const SETTING_GROUPS = [
  { key: 'contact', label: 'Coordonnées' },
  { key: 'social', label: 'Réseaux sociaux' },
  { key: 'institution', label: "Identité de l'institut" },
  { key: 'top_header', label: 'Top header (annonce)' },
  { key: 'privacy', label: 'Confidentialité' },
];

export const APPLICATION_STATUSES = [
  { key: 'received', label: 'Reçues' },
  { key: 'under_review', label: 'En étude' },
  { key: 'missing_documents', label: 'Pièces manquantes' },
  { key: 'accepted', label: 'Acceptées' },
  { key: 'waitlisted', label: "Liste d'attente" },
  { key: 'rejected', label: 'Refusées' },
];
/** Sections de la page d'accueil (sous-menu « Page d'accueil » : une section = une page, plus de defilement interminable). */
export const HOME_SECTIONS: { type: string; label: string }[] = [
  { type: 'hero', label: 'Héros (diaporama)' },
  { type: 'program_finder', label: 'Trouver ma filière' },
  { type: 'levels', label: 'Niveaux de formation' },
  { type: 'strengths', label: 'Atouts' },
  { type: 'stats', label: 'Chiffres clés' },
  { type: 'featured_programs', label: 'Filières à la une' },
  { type: 'director_word', label: 'Mot de la Directrice' },
  { type: 'video', label: 'Vidéo' },
  { type: 'admission', label: 'Admission' },
  { type: 'news_events', label: 'Actualités et événements' },
  { type: 'testimonials', label: 'Témoignages' },
  { type: 'partners', label: 'Partenaires' },
  { type: 'final_cta', label: 'Appel final' },
];

export const CHATBOT_TABS: { key: string; label: string }[] = [
  { key: 'apercu', label: 'Aperçu' },
  { key: 'questions', label: 'Questions sans réponse' },
  { key: 'test', label: 'Tester le bot' },
];
