import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Round } from '../constants';
import { COLOR_LABELS } from '../constants';
import type { VehicleCategory, VehicleColor } from '../vehicleData';
import { createRound, evaluatePick, type RoundGenParams } from '../game/engine';
import { logger } from '../logger';
import { useApp } from './AppContext';
import { usePlayer } from './PlayerContext';

interface QuizContextValue {
  round: Round | null;
  score: number;
  generateRound: () => void;
  handlePick: (vehicle: { id: string; color: VehicleColor; category: VehicleCategory }) => void;
  handleMathPick: (value: number) => void;
  showReward: string | null;
  setShowReward: (vehicleId: string | null) => void;
  showAllCollected: boolean;
  setShowAllCollected: (show: boolean) => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const { language } = useApp();
  const {
    storage, setStorage, markedVehicles, colorCounts, colorForVehicle, categoryForVehicle,
  } = usePlayer();
  const [round, setRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [showReward, setShowReward] = useState<string | null>(null);
  const [showAllCollected, setShowAllCollected] = useState(false);

  const generateRound = useCallback(() => {
    const params: RoundGenParams = {
      colorCounts,
      markedVehicles,
      categoryForVehicle,
      colorForVehicle,
      collectedCards: storage.collectedCards,
      language,
      colorLabel: (color) => COLOR_LABELS[language][color],
    };
    const nextRound = createRound(params);
    logger.info('game', `round:${nextRound.questionType}`, { count: nextRound.targetCount });
    setRound(nextRound);
  }, [colorCounts, markedVehicles, categoryForVehicle, colorForVehicle, storage.collectedCards, language]);

  const completeCorrectAnswer = useCallback(() => {
    setScore((current) => current + 1);
    const newStreak = storage.streak + 1;
    let rewardId: string | null = null;
    if (newStreak % 5 === 0) {
      const collectedIds = new Set(storage.collectedCards);
      const uncollected = markedVehicles.filter((vehicle) => !collectedIds.has(vehicle.id));
      rewardId = uncollected[Math.floor(Math.random() * uncollected.length)]?.id || null;
      if (rewardId) setShowReward(rewardId);
      else setShowAllCollected(true);
    }
    setStorage((previous) => ({
      ...previous,
      streak: newStreak,
      collectedCards: rewardId
        ? [...previous.collectedCards, rewardId]
        : previous.collectedCards,
    }));
  }, [storage.streak, storage.collectedCards, markedVehicles, setStorage]);

  const handlePick = useCallback((vehicle: { id: string; color: VehicleColor; category: VehicleCategory }) => {
    if (!round || round.result === 'correct') return;
    const result = evaluatePick({
      vehicle: { id: vehicle.id, name: '', image: '', color: vehicle.color, category: vehicle.category },
      round,
      colorForVehicle,
      categoryForVehicle,
    });
    if (!result.correct && result.result === 'wrong') {
      setRound({ ...round, ...result, result: 'wrong' });
      setStorage((previous) => ({ ...previous, streak: 0 }));
      return;
    }
    if (result.correct && !round.selectedIds.includes(vehicle.id)) setRound({ ...round, ...result });
    if (result.result === 'correct') completeCorrectAnswer();
  }, [round, colorForVehicle, categoryForVehicle, setStorage, completeCorrectAnswer]);

  const handleMathPick = useCallback((value: number) => {
    if (!round || round.result === 'correct') return;
    const correct = value === round.targetCount;
    setRound({ ...round, lastSelectedId: String(value), result: correct ? 'correct' : 'wrong' });
    if (correct) completeCorrectAnswer();
    else setStorage((previous) => ({ ...previous, streak: 0 }));
  }, [round, completeCorrectAnswer, setStorage]);

  const value = useMemo(() => ({
    round, score, generateRound, handlePick, handleMathPick,
    showReward, setShowReward, showAllCollected, setShowAllCollected,
  }), [
    round, score, generateRound, handlePick, handleMathPick,
    showReward, showAllCollected,
  ]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within QuizProvider');
  return context;
}
