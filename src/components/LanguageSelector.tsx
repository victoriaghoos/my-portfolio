import { useState, useEffect, useRef, type FocusEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/home.scss';

const languages = [
  { code: 'en', label: 'English', flag: 'US' },
  { code: 'nl', label: 'Nederlands', flag: 'BE' },
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'ja', label: '日本語', flag: 'JP' },
];

const DROPDOWN_ID = 'language-dropdown';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lngCode: string) => {
    i18n.changeLanguage(lngCode);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  // Esc closes the dropdown and puts the focus back on the button that opened it.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  // Tabbing out of the dropdown closes it, like clicking outside does.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
    }
  };

  // resolvedLanguage is "nl" for a browser set to "nl-BE", so the right option is marked
  const activeCode = i18n.resolvedLanguage || i18n.language;
  const currentLang = languages.find((l) => l.code === activeCode) || languages[0];

  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- only listens for Esc and focus leaving; the controls inside are real buttons
    <div
      className="language-selector-container"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`lang-pill ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={DROPDOWN_ID}
      >
        {/* The accessible name is "Language: EN", so it contains the visible text (WCAG 2.5.3) */}
        <span className="sr-only">{t('a11y.language')}:</span>{' '}
        <span className="lang-code">{currentLang.code.toUpperCase()}</span>
        <span className="dropdown-arrow" aria-hidden="true">
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="lang-dropdown" id={DROPDOWN_ID}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              lang={lang.code}
              aria-current={activeCode === lang.code ? 'true' : undefined}
              className={`lang-option ${activeCode === lang.code ? 'selected' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
