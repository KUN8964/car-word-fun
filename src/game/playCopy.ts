import type { Language, Round } from '../constants';
import { UI_TEXT } from '../constants';
import type { VehicleColor } from '../vehicleData';
import { formatRoundLabel } from './engine';

export function formatCorrectPrompt(
  roundData: Round,
  t: typeof UI_TEXT['en']['play'],
  language: Language,
  colorLabel: (color: VehicleColor) => string,
): string {
  const label = formatRoundLabel(roundData, language, colorLabel);
  if (roundData.questionType === 'mixed') {
    return language === 'zh'
      ? `${t.correctPrefixMixed}${roundData.targetCount}${t.correctSuffixMixed}`
      : `${t.correctPrefixMixed} ${roundData.targetCount} ${t.correctSuffixMixed}`;
  }
  if (language === 'zh') {
    return roundData.questionType === 'category'
      ? `${t.correctPrefixColor}${roundData.targetCount}辆${label}。`
      : `${t.correctPrefixColor}${roundData.targetCount}辆${label}的车。`;
  }
  return `${t.correctPrefixColor} ${roundData.targetCount} ${label.toLowerCase()} ${t.correctSuffixColor}`;
}

export function formatWrongPrompt(roundData: Round, t: typeof UI_TEXT['en']['play']): string {
  if (roundData.questionType === 'category') return t.wrongCategory;
  if (roundData.questionType === 'mixed') return t.wrongMixed;
  return t.wrongColor;
}
