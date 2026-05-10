import React, { createContext, useContext, useState } from 'react';
import fr from './fr.js';
import en from './en.js';
import zhTW from './zh-TW.js';

const TRANSLATIONS = { fr, en, 'zh-TW': zhTW };

const LanguageContext = createContext({ t: fr, lang: 'fr', setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr');

  const setLanguage = (newLang) => {
    localStorage.setItem('lang', newLang);
    setLang(newLang);
  };

  const t = TRANSLATIONS[lang] || fr;

  return (
    <LanguageContext.Provider value={{ t, lang, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
