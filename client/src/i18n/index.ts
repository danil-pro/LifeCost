import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enExpenses from './locales/en/expenses.json';
import enInsights from './locales/en/insights.json';
import enAuth from './locales/en/auth.json';
import enPremium from './locales/en/premium.json';

import ruCommon from './locales/ru/common.json';
import ruDashboard from './locales/ru/dashboard.json';
import ruExpenses from './locales/ru/expenses.json';
import ruInsights from './locales/ru/insights.json';
import ruAuth from './locales/ru/auth.json';
import ruPremium from './locales/ru/premium.json';

const LOCALE_KEY = 'lifecost-locale';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    expenses: enExpenses,
    insights: enInsights,
    auth: enAuth,
    premium: enPremium,
  },
  ru: {
    common: ruCommon,
    dashboard: ruDashboard,
    expenses: ruExpenses,
    insights: ruInsights,
    auth: ruAuth,
    premium: ruPremium,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  lng: localStorage.getItem(LOCALE_KEY) || 'en',
  supportedLngs: ['en', 'ru'],
  ns: ['common', 'dashboard', 'expenses', 'insights', 'auth', 'premium'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
