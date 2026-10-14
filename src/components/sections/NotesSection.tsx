import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NotesStars from '../../notes/NotesStars';
import { formatNoteDate, getNotes } from '../../notes/notes';
import '../../styles/sections/NotesSection.scss';

const LATEST_COUNT = 3;

const NotesSection = ({ id }: { id: string }) => {
  const { t, i18n } = useTranslation();
  const latest = getNotes(i18n.language).slice(0, LATEST_COUNT);

  if (latest.length === 0) return null;

  return (
    <section id={id} className="notes-section">
      <div className="notes-nebula" aria-hidden="true" />
      <NotesStars />

      <div className="notes-content">
        <motion.div
          className="notes-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="notes-title">{t('notes.title')}</h2>
          <div className="notes-underline" />
          <p className="notes-subtitle">{t('notes.subtitle')}</p>
        </motion.div>

        <div className={`notes-grid count-${latest.length}`}>
          {latest.map((note, index) => (
            <motion.div
              key={note.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.15 + index * 0.15, ease: 'easeOut' }}
            >
              <Link to={`/notes/${note.slug}`} className="note-card" lang={note.lang}>
                <span className="note-card-shine" aria-hidden="true" />
                <div className="note-card-meta">
                  <span className={`note-type type-${note.type}`}>
                    {t(`notes.types.${note.type}`)}
                  </span>
                  {note.draft && <span className="note-draft">{t('notes.draft')}</span>}
                  <time dateTime={note.date}>{formatNoteDate(note.date, i18n.language)}</time>
                </div>
                <h3>{note.title}</h3>
                {note.excerpt && <p>{note.excerpt}</p>}
                <span className="note-card-link">
                  {t('notes.read_more')} <ArrowRight size={16} strokeWidth={1.8} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/notes" className="notes-all-button">
            <BookOpen size={20} strokeWidth={1.5} />
            <span>{t('notes.all_notes')}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NotesSection;
