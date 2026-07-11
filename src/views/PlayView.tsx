import { Check, RotateCcw } from 'lucide-react';
import { Vehicle, VehicleColor } from '../vehicleData';
import { Round, UI_TEXT, assetUrl, Language } from '../constants';
import { useGame } from '../context/GameContext';
import { formatRoundLabel } from '../game/engine';
import { formatCorrectPrompt, formatWrongPrompt } from '../game/playCopy';

function formatFindPrompt(roundData: Round | null, t: typeof UI_TEXT['en']['play'], language: Language, colorLabel: (c: VehicleColor) => string): string {
  if (!roundData) return `${t.find} ${t.fallbackColor}`;
  const label = formatRoundLabel(roundData, language, colorLabel);
  return language === 'zh' ? `${t.find}${label}` : `${t.find} ${label}`;
}

function formatIdlePrompt(roundData: Round, t: typeof UI_TEXT['en']['play'], language: Language, colorLabel: (c: VehicleColor) => string): string {
  if (roundData.questionType === 'mixed') return t.idleMixed;
  if (roundData.questionType === 'math') return '';
  const prefix = roundData.questionType === 'category' ? t.idlePrefixCategory : t.idlePrefixColor;
  const suffix = roundData.questionType === 'category' ? t.idleSuffixCategory : t.idleSuffixColor;
  const label = formatRoundLabel(roundData, language, colorLabel);
  const isCategory = roundData.questionType === 'category';
  return language === 'zh' ? `${prefix}${label}${suffix}` : isCategory ? `${prefix} ${label}${suffix}` : `${prefix} ${label} ${suffix}`;
}

function formatProgressPrompt(roundData: Round, t: typeof UI_TEXT['en']['play'], language: Language): string {
  return language === 'zh'
    ? `${t.progressPrefix}${roundData.selectedIds.length}${t.progressMiddle}${roundData.targetCount}${t.progressSuffix}`
    : `${t.progressPrefix} ${roundData.selectedIds.length} ${t.progressMiddle} ${roundData.targetCount}. ${t.progressSuffix}`;
}

export function PlayView() {
  const {
    language, round, score, markedVehicles,
    generateRound, handlePick, handleMathPick,
    openView, colorLabel, colorForVehicle, categoryForVehicle,
  } = useGame();
  const t = UI_TEXT[language];

  if (markedVehicles.length === 0) {
    return (
      <main className="relative z-[5] mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col items-center justify-center px-4 pb-10 pt-28 sm:px-8">
        <p className="text-2xl font-extrabold opacity-50 text-center">
          {language === 'zh' ? '请家长先标记车辆颜色' : 'Please mark vehicle colors first'}
        </p>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#202A36] px-8 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-transform active:scale-95"
          type="button"
          onClick={() => openView('parents')}
        >
          {language === 'zh' ? '去家长控制 →' : 'Parents →'}
        </button>
      </main>
    );
  }

  return (
    <main className="relative z-[5] mx-auto min-h-[100dvh] max-w-[1440px] px-4 pb-10 pt-28 sm:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] opacity-55">
            {round
              ? round.questionType === 'color' ? t.play.kickerColor
                : round.questionType === 'category' ? t.play.kickerCategory
                : round.questionType === 'mixed' ? t.play.kickerMixed
                : round.questionType === 'math' ? t.play.kickerMath
                : t.play.kickerColor
              : t.play.kickerColor}
          </p>
          <h1 className="text-4xl font-extrabold uppercase tracking-[0.08em] sm:text-6xl">
            {formatFindPrompt(round, t.play, language, colorLabel)}
          </h1>
          <p className="mt-3 max-w-[580px] text-sm leading-6 opacity-70">
            {round
              ? round.questionType === 'color' ? t.play.instructionColor
                : round.questionType === 'category' ? t.play.instructionCategory
                : round.questionType === 'mixed' ? t.play.instructionMixed
                : round.questionType === 'math' ? t.play.instructionMath
                : t.play.instructionColor
              : t.play.instructionColor}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#202A36]/15 bg-white/45 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.12em]">
            {t.play.score} {score}
          </span>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[#202A36]/20 bg-white/55 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.12em] transition-transform active:scale-95"
            type="button"
            onClick={generateRound}
          >
            <RotateCcw size={16} strokeWidth={2.25} />
            {t.play.newRound}
          </button>
        </div>
      </div>

      {round && (
        <>
          <div
            className={`mb-5 rounded-[28px] border px-5 py-4 text-sm font-bold ${
              round.result === 'correct'
                ? 'border-green-700/20 bg-green-100/55 text-green-900'
                : round.result === 'progress'
                  ? 'border-green-700/15 bg-green-50/55 text-green-900'
                  : round.result === 'wrong'
                    ? 'border-red-700/20 bg-red-100/55 text-red-900'
                    : 'border-[#202A36]/10 bg-white/35'
            }`}
            aria-live="polite"
          >
            {round.result === 'correct' ? (
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-green-700 text-[42px] leading-none text-white" style={{ fontFamily: "'Anton', sans-serif" }}>
                  {round.targetCount}
                </span>
                <div>
                  <strong className="block text-base">{formatCorrectPrompt(round, t.play, language, colorLabel)}</strong>
                  <span className="mt-1 block text-xs uppercase tracking-[0.14em] opacity-65">
                    {language === 'zh' ? `数字 ${round.targetCount}` : `Number ${round.targetCount}`}
                  </span>
                </div>
              </div>
            ) : round.result === 'progress' ? (
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-700 text-[36px] leading-none text-white" style={{ fontFamily: "'Anton', sans-serif" }}>
                  {round.selectedIds.length}
                </span>
                <div>
                  <strong className="block text-base">{formatProgressPrompt(round, t.play, language)}</strong>
                  <span className="mt-1 block text-xs uppercase tracking-[0.14em] opacity-65">
                    {language === 'zh' ? `目标 ${round.targetCount} 辆` : `Target ${round.targetCount} vehicles`}
                  </span>
                </div>
              </div>
            ) : round.result === 'wrong' ? (
              formatWrongPrompt(round, t.play)
            ) : (
              formatIdlePrompt(round, t.play, language, colorLabel)
            )}
          </div>

          {round.questionType === 'math' && (
            <div className="mb-5 rounded-[28px] border border-[#202A36]/10 bg-white/55 p-6 text-center">
              <p className="mb-6 text-2xl font-extrabold sm:text-4xl">{round.mathQuestion}</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {round.mathChoices?.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-3xl font-extrabold transition-all active:scale-95 ${
                      round.result === 'correct' && n === round.targetCount
                        ? 'border-green-700 bg-green-700 text-white'
                        : round.result === 'wrong' && round.lastSelectedId === String(n)
                          ? 'border-red-700/45 bg-red-100/55 text-red-900'
                          : 'border-[#202A36]/20 bg-white hover:border-[#202A36]/40'
                    }`}
                    onClick={() => handleMathPick(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          {round.questionType !== 'math' && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {round.options.map((vehicle: Vehicle) => {
                const selected = round.selectedIds.includes(vehicle.id);
                const wrongSelected = round.lastSelectedId === vehicle.id && round.result === 'wrong';
                return (
                  <button
                    key={vehicle.id}
                    className={`group relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-[28px] border bg-white/35 p-3 transition-transform active:scale-[0.98] ${
                      selected
                        ? 'border-green-700/45'
                        : wrongSelected
                          ? 'border-red-700/45'
                          : 'border-[#202A36]/10 hover:border-[#202A36]/28'
                    }`}
                    type="button"
                    onClick={() => handlePick(vehicle)}
                  >
                    <img className="h-[76%] w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]" src={assetUrl(vehicle.image)} alt={vehicle.name} />
                    <span className="mt-1 max-w-full truncate text-xs font-bold opacity-70">{vehicle.name}</span>
                    {selected && (
                      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-white">
                        <Check size={17} strokeWidth={2.4} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
