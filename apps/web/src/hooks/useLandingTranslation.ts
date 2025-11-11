'use client';

import { useState, useEffect, useCallback } from 'react';
import enTranslations from '@/translations/landing-en.json';
import itTranslations from '@/translations/landing-it.json';

type Language = 'en' | 'it';

const TRANSLATIONS: Record<Language, any> = {
  en: enTranslations,
  it: itTranslations,
};

let currentLang: Language = 'en';
let listeners: Set<() => void> = new Set();

function loadTranslation(lang: Language) {
  return TRANSLATIONS[lang];
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function useLandingTranslation() {
  const [translations, setTranslations] = useState<any>(() => loadTranslation(currentLang));
  const [loading, setLoading] = useState(false);
  const [lang, setLangState] = useState<Language>(currentLang);

  const loadCurrentTranslation = useCallback(() => {
    const trans = loadTranslation(currentLang);
    setTranslations(trans);
    setLangState(currentLang);
  }, []);

  useEffect(() => {
    const listener = () => {
      loadCurrentTranslation();
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [loadCurrentTranslation]);

  const setLanguage = useCallback((newLang: Language) => {
    if (newLang === currentLang) return;

    currentLang = newLang;

    if (typeof window !== 'undefined') {
      localStorage.setItem('landing_language', newLang);
    }

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
