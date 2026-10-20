export type Localized<T = string> = T;

export type Settings = {
  settings: Record<string, any>;
  stats: { label: string; value: string; icon: string | null }[];
  languages: { code: string; name: string; is_default: boolean }[];
  floating_actions: Record<string, { settings: Record<string, any> | null; texts: Record<string, any> | null; pages: string[] | null }>;
  brand?: Record<string, string | null>;
};

export type MenuItem = { id: number; label: string; url: string | null; target: string; children: MenuItem[] };

export type Level = {
  id: number;
  slug: string;
  slugs: Record<string, string | null>;
  name: string;
  summary: string | null;
  duration: string | null;
  access_conditions: string | null;
  english_equivalent: string | null;
  programs_count: number | null;
  cover?: string | null;
  cover_alt?: string | null;
  seo?: { title: string | null; description: string | null };
  programs?: { slug: string; slugs: Record<string, string | null>; name: string; summary: string | null; duration_months: number | null }[];
  fees?: Fee | null;
  required_documents?: RequiredDoc[];
};

export type Fee = {
  academic_year: string;
  registration_fee: number;
  tuition_fee: number;
  application_fee: number;
  allowed_installments: number[] | null;
  notes: string | null;
  currency: string;
  level?: { id: number; slug: string; name: string };
};

export type Program = {
  id: number;
  slug: string;
  slugs: Record<string, string | null>;
  name: string;
  summary: string | null;
  cover?: string | null;
  cover_alt?: string | null;
  /** true si la filiere a sa propre photo (sinon la photo du niveau sert de repli, remplacee par un visuel SVG). */
  has_own_cover?: boolean;
  is_featured?: boolean;
  from_tuition_fee?: number | null;
  levels: { id: number; slug: string; name: string; duration_months: number | null }[] | null;
  description?: string | null;
  careers?: string | null;
  curriculum?: string | null;
  internship?: string | null;
  seo?: { title: string | null; description: string | null };
  brochure?: string | null;
  access_rules?: { level_id: number; diploma_code: string; diploma_label: string; duration_months: number | null }[];
  fees?: (Fee & { level_id?: number })[];
};

export type RequiredDoc = { label: string; description: string | null; is_additional: boolean };

export type HomeSection = { type: string; data: Record<string, any> };

export type PageData = {
  cover_alt?: string | null;
  slug: string;
  slugs: Record<string, string | null>;
  title: string;
  summary: string | null;
  template: string;
  seo?: { title: string | null; description: string | null };
  cover?: string | null;
  blocks: { type: string; data: Record<string, any> }[];
};

export type NewsItem = {
  id: number;
  cover_alt?: string | null;
  is_featured?: boolean;
  slug: string;
  slugs: Record<string, string | null>;
  title: string;
  excerpt: string | null;
  body?: string | null;
  cover: string | null;
  category: { name: string; slug: string } | null;
  published_at: string | null;
};

export type EventItem = { id: number; slug: string; title: string; description: string | null; location: string | null; starts_at: string; ends_at: string | null; cover: string | null };

export type DownloadItem = { id: number; title: string; description: string | null; category: string; level_id: number | null; program_id: number | null; languages: ('fr' | 'en')[]; downloads_count: number };

export type Faq = { id: number; name: string; faqs: { question: string; answer: string }[] };
export type Partner = { name: string; description: string | null; type: string; website: string | null; logo: string | null };
export type Testimonial = { name: string; cohort: string | null; quote: string; video_url: string | null; photo: string | null };