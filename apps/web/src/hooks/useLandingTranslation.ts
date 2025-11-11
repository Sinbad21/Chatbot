'use client';

import { useState, useEffect, useCallback } from 'react';

type Language = 'en' | 'it';

const TRANSLATIONS: Record<Language, any> = {
  en: null,
  it: null,
};

let currentLang: Language = 'en';
let listeners: Set<() => void> = new Set();

async function loadTranslation(lang: Language) {
  if (TRANSLATIONS[lang]) return TRANSLATIONS[lang];

  try {
    const module = await import(`@/translations/landing-${lang}.json`);
    TRANSLATIONS[lang] = module.default;
    return TRANSLATIONS[lang];
  } catch (error) {
    console.error(`Failed to load translation for ${lang}`, error);
    return null;
  }
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function useLandingTranslation() {
  const [translations, setTranslations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Language>(currentLang);

  const loadCurrentTranslation = useCallback(async () => {
    setLoading(true);
    const trans = await loadTranslation(currentLang);
    setTranslations(trans);
    setLangState(currentLang);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCurrentTranslation();

    const listener = () => {
      loadCurrentTranslation();
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [loadCurrentTranslation]);

  const setLanguage = useCallback(async (newLang: Language) => {
    if (newLang === currentLang) return;

    currentLang = newLang;

    if (typeof window !== 'undefined') {
      localStorage.setItem('landing_language', newLang);
    }

    await loadTranslation(newLang);
    notifyListeners();
  }, []);

  const t = useCallback((key: string, fallback?: string): any => {
    if (!translations) return fallback || key;

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return value;
  }, [translations]);

  return {
    t,
    lang,
    setLanguage,
    loading,
    translations,
  };
}

// Initialize language from localStorage on client
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('landing_language') as Language;
  if (savedLang && (savedLang === 'en' || savedLang === 'it')) {
    currentLang = savedLang;
  }
}
