import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NotesLayout from './NotesLayout';
import { formatNoteDate, getNotes } from './notes';

const NotesIndexPage = () => {
  const { t, i18n } = useTranslation();
  const notes = getNotes(i18n.language);

  return (
    <NotesLayout title={t('notes.title')} backTo="/home" backLabel={t('notes.back_to_portfolio')}>
      <section className="notes-index-header">
        <p className="notes-eyebrow">{t('notes.by')}</p>
        <h1 className="notes-page-title">{t('notes.title')}</h1>
        <div className="notes-underline" />
        <p className="notes-intro">{t('notes.intro')}</p>
        <Link to="/home#about-section" className="notes-about-link">
          {t('notes.about_link')} <ArrowRight size={16} strokeWidth={1.8} />
        </Link>
      </section>

      {notes.length === 0 ? (
        <p className="notes-empty">{t('notes.empty')}</p>
      ) : (
        <ol className="notes-list">
          {notes.map((note) => (
            <li key={note.slug}>
              <Link to={`/notes/${note.slug}`} className="notes-list-item" lang={note.lang}>
                <span className="note-card-shine" aria-hidden="true" />
                <div className="note-meta">
                  <span className={`note-type type-${note.type}`}>
                    {t(`notes.types.${note.type}`)}
                  </span>
                  {note.draft && <span className="note-draft">{t('notes.draft')}</span>}
                  <time dateTime={note.date}>{formatNoteDate(note.date, i18n.language)}</time>
                  {note.location && <span>· {note.location}</span>}
                </div>
                <h2>{note.title}</h2>
                {note.excerpt && <p>{note.excerpt}</p>}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </NotesLayout>
  );
};

export default NotesIndexPage;
