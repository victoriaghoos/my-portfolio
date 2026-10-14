export type NoteType = 'event' | 'hackathon' | 'podcast' | 'project' | 'site' | 'other';

const NOTE_TYPES: readonly NoteType[] = [
  'event',
  'hackathon',
  'podcast',
  'project',
  'site',
  'other',
];

export const NOTE_LANGUAGES = ['en', 'nl', 'fr', 'ja'] as const;
export type NoteLanguage = (typeof NOTE_LANGUAGES)[number];
export const DEFAULT_NOTE_LANGUAGE: NoteLanguage = 'en';

export interface Note {
  slug: string;
  lang: NoteLanguage;
  title: string;
  date: string;
  type: NoteType;
  location?: string;
  excerpt: string;
  cover?: string;
  draft: boolean;
  body: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const unquote = (value: string) => value.trim().replace(/^(['"])(.*)\1$/, '$2');

// Minimal frontmatter parser: flat `key: value` pairs only, which is all a note needs.
export const parseNote = (
  slug: string,
  raw: string,
  lang: NoteLanguage = DEFAULT_NOTE_LANGUAGE,
): Note => {
  const match = FRONTMATTER.exec(raw);
  const meta: Record<string, string> = {};
  const body = match ? match[2] : raw;

  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const separator = line.indexOf(':');
      if (separator === -1 || line.trimStart().startsWith('#')) continue;
      meta[line.slice(0, separator).trim()] = unquote(line.slice(separator + 1));
    }
  }

  const type = NOTE_TYPES.includes(meta.type as NoteType) ? (meta.type as NoteType) : 'other';

  return {
    slug,
    lang,
    title: meta.title || slug,
    date: meta.date || '',
    type,
    location: meta.location || undefined,
    excerpt: meta.excerpt || '',
    cover: meta.cover || undefined,
    draft: meta.draft === 'true',
    body: body.trim(),
  };
};

export const sortNewestFirst = (notes: Note[]) =>
  [...notes].sort((a, b) => b.date.localeCompare(a.date));

const isNoteLanguage = (value: string): value is NoteLanguage =>
  (NOTE_LANGUAGES as readonly string[]).includes(value);

// "posts/how-i-built-this-site.nl.md" -> { slug: "how-i-built-this-site", lang: "nl" }.
// A file without a language suffix is the English version.
export const parseFileName = (path: string): { slug: string; lang: NoteLanguage } => {
  const name = path.replace(/^.*\//, '').replace(/\.md$/, '');
  const match = /^(.*)\.([a-z]{2})$/.exec(name);
  if (match && isNoteLanguage(match[2])) return { slug: match[1], lang: match[2] };
  return { slug: name, lang: DEFAULT_NOTE_LANGUAGE };
};

// i18next can report "nl-BE", "ja_JP" or even "en-US@posix"; only the base language matters here.
export const toNoteLanguage = (language: string | undefined): NoteLanguage => {
  const base = (language ?? '').toLowerCase().split(/[-_@.]/)[0];
  return isNoteLanguage(base) ? base : DEFAULT_NOTE_LANGUAGE;
};

// Picks the translation for the visitor's language, falling back to English, then to whatever exists.
export const pickTranslation = (
  translations: Partial<Record<NoteLanguage, Note>>,
  language: string | undefined,
): Note | undefined =>
  translations[toNoteLanguage(language)] ??
  translations[DEFAULT_NOTE_LANGUAGE] ??
  Object.values(translations)[0];
