import { create } from 'zustand';
import i18n from '../i18n';

interface LocaleState {
  locale: string;
  setLocale: (locale: string) => void;
}

const LOCALE_KEY = 'lifecost-locale';
const savedLocale = localStorage.getItem(LOCALE_KEY) || 'en';

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: savedLocale,

  setLocale: (locale) => {
    localStorage.setItem(LOCALE_KEY, locale);
    i18n.changeLanguage(locale);
    set({ locale });
  },
}));
