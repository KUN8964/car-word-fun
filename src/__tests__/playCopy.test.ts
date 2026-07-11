import { describe, expect, it } from 'vitest';
import type { Round } from '../constants';
import { UI_TEXT } from '../constants';
import { formatCorrectPrompt, formatWrongPrompt } from '../game/playCopy';

const baseRound: Round = {
  questionType: 'category',
  targetCategory: 'car',
  targetCount: 3,
  options: [],
  selectedIds: [],
  matchedTargets: [],
  lastSelectedId: null,
  result: 'correct',
};

describe('play feedback copy', () => {
  it('does not append an extra 车 to Chinese category labels', () => {
    expect(formatCorrectPrompt(baseRound, UI_TEXT.zh.play, 'zh', (color) => color))
      .toBe('答对啦！这里有3辆小汽车。');
  });

  it('uses natural Chinese wording for color answers', () => {
    expect(formatCorrectPrompt({
      ...baseRound,
      questionType: 'color',
      targetCategory: undefined,
      targetColor: 'red',
    }, UI_TEXT.zh.play, 'zh', () => '红色')).toBe('答对啦！这里有3辆红色的车。');
  });

  it('uses feedback matching the question type', () => {
    expect(formatWrongPrompt(baseRound, UI_TEXT.zh.play)).toContain('目标车型');
    expect(formatWrongPrompt({ ...baseRound, questionType: 'mixed' }, UI_TEXT.zh.play)).toContain('颜色和车型');
  });
});
