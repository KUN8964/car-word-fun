import { Menu, X } from 'lucide-react';
import { Language, NAV_ITEMS, UI_TEXT } from '../constants';
import { useGame } from '../context/GameContext';

interface HeaderProps {
  isMobile: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (v: boolean) => void;
}

export function Header({ isMobile, isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const { view, openView, language, setLanguage } = useGame();
  const t = UI_TEXT[language];

  return (
    <header className="fixed left-0 right-0 top-0 z-[90] px-4 py-5 sm:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">
        <button
          className="text-left text-xs font-extrabold uppercase tracking-[0.16em] opacity-90 outline-none transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#202A36]/30 sm:text-sm"
          type="button"
          onClick={() => { openView('home'); setIsMenuOpen(false); }}
        >
          CAR CAR ADVENTURE
        </button>

        <div className="flex items-center gap-3 md:gap-8">
          <nav className="hidden gap-8 md:flex" aria-label="Desktop menu">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`text-sm font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/30 ${
                  view === item.view ? 'text-[#202A36]' : 'text-[#202A36]/62 hover:text-[#202A36]'
                }`}
                onClick={() => openView(item.view)}
              >
                {t.nav[item.label]}
              </button>
            ))}
          </nav>

          <button
            className="rounded-full border border-[#202A36]/15 bg-white/55 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] backdrop-blur transition-transform active:scale-95"
            type="button"
            aria-label={t.aria.switchLanguage}
            onClick={() => setLanguage((language === 'en' ? 'zh' : 'en') as Language)}
          >
            {t.languageToggle}
          </button>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#202A36]/15 bg-white/60 backdrop-blur transition-transform active:scale-95 md:hidden"
            type="button"
            aria-label={isMenuOpen ? t.aria.closeMenu : t.aria.openMenu}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} strokeWidth={2.25} /> : <Menu size={24} strokeWidth={2.25} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          className="mx-auto mt-4 flex max-w-[1440px] flex-col gap-3 rounded-3xl border border-[#202A36]/10 bg-[#F8F4F4]/95 p-5 backdrop-blur-md md:hidden"
          aria-label="Mobile menu"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="rounded-2xl px-4 py-3 text-left text-base font-extrabold uppercase tracking-[0.14em] transition-colors hover:bg-white/60"
              onClick={() => { openView(item.view); setIsMenuOpen(false); }}
            >
              {t.nav[item.label]}
            </button>
          ))}
          <button
            type="button"
            className="rounded-2xl border border-[#202A36]/15 bg-white/45 px-4 py-3 text-left text-base font-extrabold uppercase tracking-[0.14em]"
            onClick={() => setLanguage((language === 'en' ? 'zh' : 'en') as Language)}
          >
            {t.aria.switchLanguage}: {t.languageToggle}
          </button>
        </nav>
      )}
    </header>
  );
}
