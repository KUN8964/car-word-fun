import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Language, View } from '../constants';

interface AppContextValue {
  view: View;
  openView: (view: View) => void;
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>('home');
  const [language, setLanguage] = useState<Language>('en');
  const openView = useCallback((nextView: View) => setView(nextView), []);
  const value = useMemo(
    () => ({ view, openView, language, setLanguage }),
    [view, openView, language],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
