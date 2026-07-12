import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VEHICLES, Vehicle } from './vehicleData';
import { vehicleThumbnailPath } from './assets';
import {
  View, Direction, CardRole, Language,
  NOISE_BACKGROUND, HERO_SLIDES, HERO_VEHICLE_IDS, UI_TEXT, assetUrl,
} from './constants';
import { GameProvider } from './context/GameContext';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { PlayView } from './views/PlayView';
import { GarageView } from './views/GarageView';
import { ParentsView } from './views/ParentsView';
import { MemoryView } from './views/MemoryView';
import { RewardModal } from './components/RewardModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

// ── Card styles ──────────────────────────────────────────

const CARD_TRANSITION =
  'transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1), bottom 650ms cubic-bezier(0.4,0,0.2,1), width 650ms cubic-bezier(0.4,0,0.2,1)';

function getVehicleByHint(hint: string) {
  const normalizedHint = hint.toLowerCase();
  return VEHICLES.find((v) => v.id.toLowerCase() === normalizedHint) || VEHICLES.find(
    (v) => v.id.toLowerCase().includes(normalizedHint) || v.name.toLowerCase().includes(normalizedHint),
  );
}

const HERO_VEHICLES = HERO_VEHICLE_IDS.map((id) => getVehicleByHint(id)).filter(Boolean) as Vehicle[];

function getVehicleImageStyle(role: CardRole): CSSProperties {
  const transform =
    role === 'center' ? 'scale(0.92)'
      : role === 'left' || role === 'right' ? 'translateY(-30%) scale(0.86)'
      : 'scale(0.86)';
  return { width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none', transform, transformOrigin: 'center center' };
}

function getCardStyle(role: CardRole, isMobile: boolean): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute', aspectRatio: '16 / 10', overflow: 'visible',
    transition: CARD_TRANSITION, willChange: 'transform, filter, opacity, left, bottom, width',
  };
  if (role === 'center') return { ...base, left: '50%', bottom: isMobile ? '37%' : 'max(21%, 126px)', width: isMobile ? '81%' : 'min(60.72%, calc((100vh - 190px) * 1.75))', transform: 'translateX(-50%) scale(1)', filter: 'none', opacity: 1, zIndex: 20 };
  if (role === 'left') return { ...base, left: isMobile ? '18%' : '13.5%', bottom: isMobile ? '30%' : '26%', width: isMobile ? '22%' : '18.5%', transform: 'translateX(-50%) scale(1)', filter: 'blur(0.4px)', opacity: 0.52, zIndex: 6 };
  if (role === 'right') return { ...base, left: isMobile ? '82%' : '86.5%', bottom: isMobile ? '30%' : '26%', width: isMobile ? '22%' : '18.5%', transform: 'translateX(-50%) scale(1)', filter: 'blur(0.4px)', opacity: 0.52, zIndex: 6 };
  if (role === 'back') return { ...base, left: '50%', bottom: isMobile ? '35%' : '27%', width: isMobile ? '18%' : '14%', transform: 'translate(-50%, 18%) scale(0.7)', filter: 'blur(2px)', opacity: 0, zIndex: 1 };
  return { ...base, left: '50%', bottom: isMobile ? '37%' : '31%', width: isMobile ? '32%' : '20%', transform: 'translateX(-50%) scale(0.58)', filter: 'blur(5px)', opacity: 0, zIndex: 1 };
}

// ── Home View ────────────────────────────────────────────

function HomeView() {
  const { openView, language } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const animationTimer = useRef<number | null>(null);
  const autoPausedUntil = useRef(0);
  const isAnimatingRef = useRef(false);

  const totalHeroItems = HERO_VEHICLES.length;
  const activeSlide = HERO_SLIDES[activeIndex % HERO_SLIDES.length] || HERO_SLIDES[0];
  const t = UI_TEXT[language];
  const activeSlideText = t.heroSlides[activeIndex % t.heroSlides.length] || t.heroSlides[0];
  const activeHeroVehicle = HERO_VEHICLES[activeIndex] || VEHICLES[0];

  const positions = useMemo(() => ({
    center: activeIndex,
    left: (activeIndex + totalHeroItems - 1) % totalHeroItems,
    right: (activeIndex + 1) % totalHeroItems,
    back: (activeIndex + 2) % totalHeroItems,
  }), [activeIndex, totalHeroItems]);

  const roleForIndex = (index: number): CardRole => {
    if (index === positions.center) return 'center';
    if (index === positions.left) return 'left';
    if (index === positions.right) return 'right';
    if (index === positions.back) return 'back';
    return 'hidden';
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (animationTimer.current) window.clearTimeout(animationTimer.current);
      isAnimatingRef.current = false;
    };
  }, []);

  const releaseAnimationLock = useCallback(() => {
    if (animationTimer.current) window.clearTimeout(animationTimer.current);
    animationTimer.current = window.setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }, 650);
  }, []);

  const pauseAutoRotation = useCallback(() => {
    autoPausedUntil.current = Date.now() + 6000;
  }, []);

  const navigateHero = useCallback(
    (direction: Direction, userInitiated = true) => {
      if (isAnimatingRef.current) return;
      if (userInitiated) pauseAutoRotation();
      isAnimatingRef.current = true;
      setIsAnimating(true);
      setActiveIndex((prev) =>
        direction === 'next' ? (prev + 1) % totalHeroItems : (prev + totalHeroItems - 1) % totalHeroItems,
      );
      releaseAnimationLock();
    },
    [pauseAutoRotation, releaseAnimationLock, totalHeroItems],
  );

  useEffect(() => {
    const autoTimer = window.setInterval(() => {
      if (Date.now() < autoPausedUntil.current) return;
      navigateHero('next', false);
    }, 2000);
    return () => window.clearInterval(autoTimer);
  }, [navigateHero]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 flex select-none items-center justify-center"
        data-hero-ghost
        style={{
          zIndex: 2, top: isMobile ? '18%' : '15%', fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(42px, 10.8vw, 168px)', fontWeight: 400, lineHeight: 1,
          textTransform: 'uppercase', letterSpacing: 0, whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#202A36', opacity: 0.12, textShadow: '0 14px 34px rgba(32,42,54,0.14)' }}>HELLO! MY BABY</span>
        <span className="ml-[0.08em] -rotate-3" style={{ color: '#54E84D', fontFamily: "'Comic Sans MS', 'Marker Felt', cursive", fontSize: '1.04em', fontWeight: 900, opacity: 0.28, textShadow: '0 10px 28px rgba(84,232,77,0.22)', textTransform: 'none' }}>Anpu</span>
      </div>

      <div className="absolute inset-0 z-[3]" aria-label="Vehicle cutout carousel">
        {HERO_VEHICLES.map((vehicle, index) => {
          const role = roleForIndex(index);
          return (
            <article key={vehicle.id} data-hero-role={role} data-vehicle-id={vehicle.id} aria-hidden={role !== 'center'} className="flex items-center justify-center" style={getCardStyle(role, isMobile)}>
              <img alt={vehicle.name} draggable={false} loading={index < 4 ? 'eager' : 'lazy'} style={getVehicleImageStyle(role)} src={assetUrl(vehicleThumbnailPath(vehicle))} />
            </article>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-[30] w-[12vw]" style={{ background: 'linear-gradient(to right, rgba(248,244,244,0.98), rgba(248,244,244,0))' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[30] w-[12vw]" style={{ background: 'linear-gradient(to left, rgba(248,244,244,0.98), rgba(248,244,244,0))' }} />

      <section className="absolute bottom-4 left-4 z-[60] max-w-[360px] sm:bottom-10 sm:left-24">
        <h1 className="mb-2 text-base font-extrabold uppercase tracking-widest opacity-95 sm:text-[24px]">{activeSlideText.title}</h1>
        <p className="mb-5 hidden text-xs leading-[1.65] opacity-70 sm:block sm:text-sm">{activeSlideText.description}</p>
        <div className="mb-4 flex items-center gap-2">
          {HERO_SLIDES.map((slide, index) => (
            <span key={slide.title} className="h-2 rounded-full transition-all duration-[650ms]" style={{ width: index === activeIndex % HERO_SLIDES.length ? '32px' : '8px', backgroundColor: '#202A36', opacity: index === activeIndex % HERO_SLIDES.length ? 0.9 : 0.24 }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#202A36]/75 bg-white/45 backdrop-blur transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/30 sm:h-16 sm:w-16" type="button" aria-label={t.aria.previous} onClick={() => navigateHero('prev')}>
            <ArrowLeft size={26} strokeWidth={2.25} />
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#202A36]/75 bg-white/45 backdrop-blur transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/30 sm:h-16 sm:w-16" type="button" aria-label={t.aria.next} onClick={() => navigateHero('next')}>
            <ArrowRight size={26} strokeWidth={2.25} />
          </button>
        </div>
      </section>

      <button
        className="absolute bottom-4 right-4 z-[60] flex items-center gap-2 font-display uppercase leading-none opacity-95 transition-opacity duration-200 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/30 sm:bottom-10 sm:right-10 sm:gap-3"
        type="button"
        onClick={() => openView(
          activeSlide.cta === 'MY GARAGE'
            ? 'garage'
            : activeSlide.cta === 'MEMORY GAME'
              ? 'memory'
              : 'play',
        )}
        style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(22px, 4vw, 58px)', fontWeight: 400, letterSpacing: 0 }}
      >
        <span>{activeSlideText.cta}</span>
        <ArrowRight className="h-5 w-5 sm:h-8 sm:w-8" strokeWidth={2.25} />
      </button>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[40] h-36" style={{ background: 'linear-gradient(to top, rgba(248,244,244,0.96), rgba(248,244,244,0))' }} />
    </main>
  );
}

// ── App Shell ────────────────────────────────────────────

function AppShell() {
  const { view } = useApp();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#F8F4F4] font-sans text-[#202A36]">
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-20 mix-blend-soft-light">
        <div className="h-full w-full" style={{ backgroundImage: NOISE_BACKGROUND, backgroundSize: '200px 200px', backgroundRepeat: 'repeat' }} />
      </div>

      <Header isMobile={isMobile} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {view === 'home' && <HomeView />}
      {view === 'play' && <PlayView />}
      {view === 'memory' && <MemoryView />}
      {view === 'garage' && <GarageView />}
      {view === 'parents' && <ParentsView />}

      <RewardModal />

      <style>{`
        @keyframes cardReveal {
          0% { transform: rotateY(0deg) scale(0.3); }
          50% { transform: rotateY(180deg) scale(1.05); }
          100% { transform: rotateY(360deg) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Entry Point ───────────────────────────────────────────

export function CarAdventureHero() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppShell />
      </GameProvider>
    </ErrorBoundary>
  );
}
