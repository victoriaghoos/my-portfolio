import {
  parseFileName,
  parseNote,
  pickTranslation,
  sortNewestFirst,
  type Note,
  type NoteLanguage,
} from './parseNote';

// Every .md file in ./posts is a note. The file name is its URL slug, and an optional language
// suffix marks a translation: `my-note.md` (English), `my-note.nl.md`, `my-note.fr.md`, `my-note.ja.md`.
const files = import.meta.glob('./posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const translationsBySlug = new Map<string, Partial<Record<NoteLanguage, Note>>>();

for (const [path, raw] of Object.entries(files)) {
  const { slug, lang } = parseFileName(path);
  const note = parseNote(slug, raw, lang);
  // Drafts are visible while running `npm run dev`, but never end up in the production build.
  if (note.draft && !import.meta.env.DEV) continue;
  translationsBySlug.set(slug, { ...translationsBySlug.get(slug), [lang]: note });
}

// One entry per note, in the visitor's language when a translation exists (English otherwise).
export const getNotes = (language: string | undefined): Note[] =>
  sortNewestFirst(
    [...translationsBySlug.values()]
      .map((translations) => pickTranslation(translations, language))
      .filter((note): note is Note => Boolean(note)),
  );

export const getNote = (slug: string | undefined, language: string | undefined) => {
  const translations = slug ? translationsBySlug.get(slug) : undefined;
  return translations ? pickTranslation(translations, language) : undefined;
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

export const formatNoteDate = (date: string, language: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  try {
    return new Intl.DateTimeFormat(language, DATE_OPTIONS).format(parsed);
  } catch {
    // the language detector can hand us tags Intl rejects (e.g. "en-US@posix")
    return new Intl.DateTimeFormat('en', DATE_OPTIONS).format(parsed);
  }
};

export type { Note };
