'use client';
import { LanguageContext } from '@/contexts/language-provider';
import { useContext } from 'react';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
