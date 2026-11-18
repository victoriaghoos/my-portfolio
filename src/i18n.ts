import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationNL from './locales/nl/translation.json';
import translationFR from './locales/fr/translation.json';
import translationJA from './locales/ja/translation.json';

const resources = {
  en: { translation: translationEN },
  nl: { translation: translationNL },
  fr: { translation: translationFR },
  ja: { translation: translationJA },
};

// Keep <html lang> in sync with the chosen language, so screen readers pronounce the page in the
// right language (WCAG 3.1.1). Registered before init, so the detected language is set too.
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.resolvedLanguage || lng;
  }
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
