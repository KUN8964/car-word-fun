import { ArrowLeft, Brain, CarFront, Clock3, Grid3X3, Play, RotateCcw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CATEGORY_LABELS, COLOR_LABELS, UI_TEXT, assetUrl } from '../constants';
import { useGame } from '../context/GameContext';
import {
  availableMemoryRules,
  cardsMatch,
  createMemoryDeck,
  memoryBestKey,
  memoryPairCount,
  memoryThumbnailPath,
  type MemoryBoardSize,
  type MemoryCard,
  type MemoryRule,
} from '../game/memory';
import { VEHICLES } from '../vehicleData';

type MemoryPhase = 'setup' | 'preview' | 'playing' | 'resolving' | 'complete';

const BOARD_SIZES: MemoryBoardSize[] = [4, 6, 8];
const RULES: MemoryRule[] = ['vehicle', 'color', 'category'];
const PREVIEW_SECONDS: Record<MemoryBoardSize, number> = { 4: 5, 6: 4, 8: 3 };

export function MemoryView() {
  const {
    language, storage, setStorage, colorForVehicle, categoryForVehicle,
  } = useGame();
  const t = UI_TEXT[language].memory;
  const [rule, setRule] = useState<MemoryRule>('vehicle');
  const [size, setSize] = useState<MemoryBoardSize>(4);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [phase, setPhase] = useState<MemoryPhase>('setup');
  const [previewRemaining, setPreviewRemaining] = useState(0);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const resolveTimer = useRef<number | null>(null);

  const eligibleForRule = useCallback((targetRule: MemoryRule) => VEHICLES.filter((vehicle) => {
    if (targetRule === 'vehicle') {
      return Boolean(storage.lockedColors[vehicle.id] && storage.lockedCategories[vehicle.id]);
    }
    if (targetRule === 'color') {
      return Boolean(storage.lockedColors[vehicle.id]) && colorForVehicle(vehicle) !== 'unknown';
    }
    return Boolean(storage.lockedCategories[vehicle.id]);
  }), [storage.lockedColors, storage.lockedCategories, colorForVehicle]);

  const eligibleVehicles = useMemo(() => eligibleForRule(rule), [eligibleForRule, rule]);
  const supportedRules = useMemo(() => RULES.filter((targetRule) => (
    availableMemoryRules(
      eligibleForRule(targetRule), colorForVehicle, categoryForVehicle,
    ).includes(targetRule)
  )), [eligibleForRule, colorForVehicle, categoryForVehicle]);
  const pairCount = memoryPairCount(size);
  const canStart = rule === 'vehicle'
    ? eligibleVehicles.length >= pairCount
    : supportedRules.includes(rule);
  const best = storage.memoryBest[memoryBestKey(rule, size)];

  useEffect(() => () => {
    if (resolveTimer.current) window.clearTimeout(resolveTimer.current);
  }, []);

  useEffect(() => {
    if (phase !== 'preview') return;
    if (previewRemaining <= 0) {
      setPhase('playing');
      setStartedAt(Date.now());
      return;
    }
    const timer = window.setTimeout(() => setPreviewRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, previewRemaining]);

  useEffect(() => {
    if ((phase !== 'playing' && phase !== 'resolving') || !startedAt) return;
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [phase, startedAt]);

  const startGame = useCallback(() => {
    const deck = createMemoryDeck({
      vehicles: eligibleVehicles,
      rule,
      size,
      colorForVehicle,
      categoryForVehicle,
    });
    if (deck.length === 0) return;
    if (resolveTimer.current) window.clearTimeout(resolveTimer.current);
    setCards(deck);
    setFlippedIds([]);
    setMatchedIds([]);
    setMoves(0);
    setElapsed(0);
    setStartedAt(null);
    setPreviewRemaining(PREVIEW_SECONDS[size]);
    setPhase('preview');
  }, [eligibleVehicles, rule, size, colorForVehicle, categoryForVehicle]);

  const saveBest = useCallback((finalMoves: number, finalSeconds: number) => {
    const key = memoryBestKey(rule, size);
    setStorage((previous) => {
      const current = previous.memoryBest[key];
      const isBetter = !current
        || finalMoves < current.moves
        || (finalMoves === current.moves && finalSeconds < current.seconds);
      if (!isBetter) return previous;
      return {
        ...previous,
        memoryBest: {
          ...previous.memoryBest,
          [key]: { moves: finalMoves, seconds: finalSeconds },
        },
      };
    });
  }, [rule, size, setStorage]);

  const handleCardClick = (card: MemoryCard) => {
    if (phase !== 'playing' || matchedIds.includes(card.id) || flippedIds.includes(card.id)) return;
    if (flippedIds.length === 0) {
      setFlippedIds([card.id]);
      return;
    }

    const first = cards.find((candidate) => candidate.id === flippedIds[0]);
    if (!first) {
      setFlippedIds([card.id]);
      return;
    }

    const nextMoves = moves + 1;
    const nextFlipped = [first.id, card.id];
    setMoves(nextMoves);
    setFlippedIds(nextFlipped);
    setPhase('resolving');

    if (cardsMatch(first, card)) {
      resolveTimer.current = window.setTimeout(() => {
        const nextMatched = [...matchedIds, ...nextFlipped];
        setMatchedIds(nextMatched);
        setFlippedIds([]);
        if (nextMatched.length === cards.length) {
          const finalSeconds = startedAt ? Math.max(1, Math.floor((Date.now() - startedAt) / 1000)) : elapsed;
          setElapsed(finalSeconds);
          setPhase('complete');
          saveBest(nextMoves, finalSeconds);
        } else {
          setPhase('playing');
        }
      }, 450);
    } else {
      resolveTimer.current = window.setTimeout(() => {
        setFlippedIds([]);
        setPhase('playing');
      }, 850);
    }
  };

  const resetToSetup = () => {
    if (resolveTimer.current) window.clearTimeout(resolveTimer.current);
    setCards([]);
    setFlippedIds([]);
    setMatchedIds([]);
    setPhase('setup');
  };

  if (phase === 'setup') {
    return (
      <main className="relative z-[5] mx-auto min-h-[100dvh] max-w-[1200px] px-4 pb-12 pt-28 sm:px-8">
        <header className="mb-8 max-w-[760px]">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] opacity-55">{t.kicker}</p>
          <h1 className="text-4xl font-extrabold uppercase tracking-[0.06em] sm:text-6xl">{t.title}</h1>
          <p className="mt-4 text-sm leading-6 opacity-70 sm:text-base">{t.description}</p>
        </header>

        <section className="mb-8 grid gap-3 md:grid-cols-3">
          {RULES.map((option) => {
            const supported = supportedRules.includes(option);
            return (
              <button
                key={option}
                type="button"
                disabled={!supported}
                onClick={() => setRule(option)}
                className={`rounded-[28px] border p-5 text-left transition-all ${
                  rule === option
                    ? 'border-[#202A36] bg-[#202A36] text-white shadow-lg'
                    : supported
                      ? 'border-[#202A36]/12 bg-white/45 hover:-translate-y-1 hover:bg-white/70'
                      : 'cursor-not-allowed border-[#202A36]/5 bg-white/20 opacity-35'
                }`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#54E84D] text-[#202A36]">
                  {option === 'vehicle' ? <CarFront size={25} /> : option === 'color' ? <Grid3X3 size={25} /> : <Brain size={25} />}
                </div>
                <strong className="block text-xl">{t[option]}</strong>
                <span className="mt-2 block text-sm leading-6 opacity-70">{t[`${option}Hint`]}</span>
              </button>
            );
          })}
        </section>

        <section className="rounded-[32px] border border-[#202A36]/10 bg-white/40 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] opacity-55">{t.boardSize}</p>
              <div className="flex flex-wrap gap-3">
                {BOARD_SIZES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    className={`rounded-2xl border px-5 py-3 text-left transition-all ${
                      size === option ? 'border-[#202A36] bg-[#202A36] text-white' : 'border-[#202A36]/15 bg-white/55'
                    }`}
                  >
                    <strong className="block text-xl">{option}×{option}</strong>
                    <span className="mt-0.5 block text-xs opacity-65">{option * option} {t.cards} · {memoryPairCount(option)} {t.pairs}</span>
                  </button>
                ))}
              </div>
              {size === 8 && <p className="mt-3 text-xs font-bold opacity-55">{t.portraitTip}</p>}
              {best && (
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                  <Trophy size={16} /> {t.best}: {best.moves} {t.moveUnit} · {formatTime(best.seconds)}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={!canStart}
              onClick={startGame}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#54E84D] px-8 py-4 text-base font-extrabold uppercase tracking-[0.1em] text-[#202A36] shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Play size={21} fill="currentColor" /> {t.start}
            </button>
          </div>
          {!canStart && <p className="mt-4 text-sm font-bold text-red-800/70">{t.noData}</p>}
        </section>
      </main>
    );
  }

  const matchedPairs = matchedIds.length / 2;
  const stars = calculateStars(size, moves);
  const cardGap = size === 8 ? 'gap-1 sm:gap-2' : size === 6 ? 'gap-1.5 sm:gap-3' : 'gap-2 sm:gap-4';

  return (
    <main className="relative z-[5] mx-auto min-h-[100dvh] max-w-[1440px] px-2 pb-12 pt-24 sm:px-8 sm:pt-28">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <button type="button" onClick={resetToSetup} className="inline-flex items-center gap-2 rounded-full border border-[#202A36]/15 bg-white/55 px-4 py-2 text-sm font-bold">
          <ArrowLeft size={17} /> {t.back}
        </button>
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-extrabold sm:text-sm">
          <Stat icon={<RotateCcw size={15} />} label={t.moves} value={moves} />
          <Stat icon={<Clock3 size={15} />} label={t.time} value={formatTime(elapsed)} />
          <Stat icon={<Trophy size={15} />} label={t.matched} value={`${matchedPairs}/${pairCount}`} />
        </div>
      </div>

      {phase === 'complete' && (
        <section className="mx-auto mb-5 max-w-[820px] rounded-[28px] border border-green-700/20 bg-green-100/70 p-5 text-center text-green-950 shadow-lg">
          <div className="mb-2 text-3xl" aria-label={`${stars} stars`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t.complete}</h2>
          <p className="mt-2 text-sm opacity-70">{t.completeHint} {moves} {t.moveUnit} · {formatTime(elapsed)}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={startGame} className="rounded-full bg-green-800 px-6 py-3 text-sm font-extrabold text-white">{t.replay}</button>
            <button type="button" onClick={resetToSetup} className="rounded-full border border-green-900/20 bg-white/55 px-6 py-3 text-sm font-extrabold">{t.setup}</button>
          </div>
        </section>
      )}

      <div className="relative mx-auto" style={{ maxWidth: size === 4 ? 760 : size === 6 ? 1040 : 1280 }}>
        {phase === 'preview' && (
          <div className="pointer-events-none sticky top-24 z-40 mx-auto mb-3 flex w-fit items-center gap-3 rounded-full bg-[#202A36] px-5 py-3 font-extrabold text-white shadow-xl">
            <Brain size={19} /> {t.preview} <span className="text-[#54E84D]">{previewRemaining}</span>
          </div>
        )}
        <div className={`grid ${cardGap}`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {cards.map((card) => {
            const open = phase === 'preview' || flippedIds.includes(card.id) || matchedIds.includes(card.id);
            const matched = matchedIds.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                data-memory-card={card.id}
                data-match-key={card.matchKey}
                disabled={phase !== 'playing' || matched}
                onClick={() => handleCardClick(card)}
                className="group aspect-square min-w-0 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36] sm:rounded-[18px]"
                style={{ perspective: '900px' }}
                aria-label={open ? card.vehicle.name : t.preview}
              >
                <span
                  className="relative block h-full w-full transition-transform duration-500"
                  style={{ transformStyle: 'preserve-3d', transform: open ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center rounded-[10px] border border-[#202A36]/15 bg-[#202A36] text-[#54E84D] shadow-sm sm:rounded-[18px]"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <CarFront className="h-[38%] w-[38%]" strokeWidth={1.8} />
                  </span>
                  <span
                    className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[10px] border bg-white p-0.5 shadow-sm sm:rounded-[18px] sm:p-1 ${matched ? 'border-green-600/60 ring-2 ring-green-500/20' : 'border-[#202A36]/10'}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <img
                      src={assetUrl(memoryThumbnailPath(card.vehicle))}
                      alt=""
                      draggable={false}
                      className="h-[78%] w-full object-contain"
                    />
                    {size === 4 && <span className="max-w-full truncate px-1 text-[9px] font-bold opacity-65 sm:text-xs">{card.vehicle.name}</span>}
                    {matched && rule !== 'vehicle' && (
                      <span className="absolute bottom-1 rounded-full bg-green-700 px-1.5 py-0.5 text-[7px] font-bold text-white sm:bottom-2 sm:px-2 sm:text-[10px]">
                        {matchLabel(card, rule, language)}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#202A36]/12 bg-white/55 px-3 py-2">{icon} {label} {value}</span>;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function calculateStars(size: MemoryBoardSize, moves: number): number {
  const thresholds: Record<MemoryBoardSize, [number, number]> = {
    4: [12, 18],
    6: [30, 45],
    8: [56, 80],
  };
  if (moves <= thresholds[size][0]) return 3;
  if (moves <= thresholds[size][1]) return 2;
  return 1;
}

function matchLabel(card: MemoryCard, rule: MemoryRule, language: 'en' | 'zh'): string {
  const key = card.matchKey.slice(card.matchKey.indexOf(':') + 1);
  if (rule === 'color') return COLOR_LABELS[language][key as keyof typeof COLOR_LABELS.en];
  if (rule === 'category') return CATEGORY_LABELS[language][key as keyof typeof CATEGORY_LABELS.en];
  return card.vehicle.name;
}
