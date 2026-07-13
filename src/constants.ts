import type { VehicleColor, VehicleCategory, Vehicle } from './vehicleData';

export type View = 'home' | 'play' | 'memory' | 'garage' | 'parents';
export type Direction = 'next' | 'prev';
export type CardRole = 'center' | 'left' | 'right' | 'back' | 'hidden';
export type Language = 'en' | 'zh';
export type NavLabel = 'Start' | 'Games' | 'Memory' | 'Garage' | 'Colors' | 'Parents';

type DeepTranslation<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? Array<DeepTranslation<Item>>
    : T extends object
      ? { [Key in keyof T]: DeepTranslation<T[Key]> }
      : T;

function defineTranslations<const English extends {
  nav: Record<NavLabel, string>;
  heroSlides: Array<{ title: string; label: string; description: string; cta: string }>;
}>(translations: { en: English; zh: DeepTranslation<English> }): Record<Language, DeepTranslation<English>> {
  return translations as Record<Language, DeepTranslation<English>>;
}

export type HeroSlide = {
  vehicleId: string;
  title: string;
  label: string;
  ghostText: string;
  description: string;
  cta: string;
};

export type QuestionType = 'color' | 'category' | 'mixed' | 'math';

export type MixedTarget = {
  color?: VehicleColor;
  category?: VehicleCategory;
  count: number;
};

export type Round = {
  questionType: QuestionType;
  targetColor?: VehicleColor;
  targetCategory?: VehicleCategory;
  mixedTargets?: MixedTarget[];
  targetCount: number;
  options: Vehicle[];
  selectedIds: string[];
  matchedTargets: number[];
  lastSelectedId: string | null;
  result: 'idle' | 'progress' | 'correct' | 'wrong';
  mathQuestion?: string;
  mathChoices?: number[];
};

export const COLOR_LABELS: Record<Language, Record<VehicleColor, string>> = {
  en: {
    red: 'Red',
    blue: 'Blue',
    yellow: 'Yellow',
    green: 'Green',
    white: 'White',
    black: 'Black',
    silver: 'Silver',
    orange: 'Orange',
    gray: 'Gray',
    brown: 'Brown',
    camouflage: 'Camo',
    blackWhite: 'B&W',
    other: 'Other',
    unknown: 'Unmarked',
  },
  zh: {
    red: '红色',
    blue: '蓝色',
    yellow: '黄色',
    green: '绿色',
    white: '白色',
    black: '黑色',
    silver: '银色',
    orange: '橙色',
    gray: '灰色',
    brown: '棕色',
    camouflage: '迷彩',
    blackWhite: '黑白',
    other: '其它',
    unknown: '未标记',
  },
};

export const CATEGORY_LABELS: Record<Language, Record<VehicleCategory, string>> = {
  en: {
    car: 'Car',
    race: 'Race',
    bus: 'Bus',
    construction: 'Construction',
    motorcycle: 'Motorcycle',
    tank: 'Tank',
    watercraft: 'Watercraft',
    offroad: 'Off-road',
    aircraft: 'Aircraft',
  },
  zh: {
    car: '小汽车',
    race: '赛车',
    bus: '巴士',
    construction: '工程车',
    motorcycle: '摩托车',
    tank: '坦克',
    watercraft: '摩托艇',
    offroad: '越野车',
    aircraft: '飞机',
  },
};

export const COLOR_OPTIONS: VehicleColor[] = [
  'red', 'blue', 'yellow', 'green', 'white', 'black',
  'silver', 'orange', 'gray', 'brown', 'camouflage', 'blackWhite', 'other',
];
export const CATEGORY_OPTIONS: VehicleCategory[] = [
  'car', 'race', 'bus', 'construction', 'motorcycle',
  'tank', 'watercraft', 'offroad', 'aircraft',
];
export const GAME_COLORS: VehicleColor[] = ['red', 'blue', 'yellow', 'green', 'white', 'black'];

export const CARD_TRANSITION =
  'transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1), bottom 650ms cubic-bezier(0.4,0,0.2,1), width 650ms cubic-bezier(0.4,0,0.2,1)';

export const NOISE_BACKGROUND =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E\")";

export const HERO_SLIDES: HeroSlide[] = [
  {
    vehicleId: '458',
    title: 'Color Hunt',
    label: 'FIND RED CARS',
    ghostText: 'COLOR HUNT',
    description: 'Start a gentle color game with real toy vehicle pictures.',
    cta: 'START GAME',
  },
  {
    vehicleId: 'a4',
    title: 'City Colors',
    label: 'SPOT THE CITY CAR',
    ghostText: 'CITY CAR',
    description: 'Look at each vehicle, name its color, and tap carefully.',
    cta: 'START GAME',
  },
  {
    vehicleId: 'vehicle-34',
    title: 'Find the Bus',
    label: 'TAP THE BUS',
    ghostText: 'BIG BUS',
    description: 'Buses, cars, race cars, diggers, and planes can all appear.',
    cta: 'START GAME',
  },
  {
    vehicleId: 'rb7',
    title: 'Garage Star',
    label: 'COLLECT VEHICLES',
    ghostText: 'GARAGE',
    description: 'Every marked vehicle can become part of the learning set.',
    cta: 'MY GARAGE',
  },
  {
    vehicleId: 'vehicle-12',
    title: 'Memory Garage',
    label: 'MATCH THE CARS',
    ghostText: 'MEMORY',
    description: 'Flip cards and match vehicles, colors, or categories.',
    cta: 'MEMORY GAME',
  },
];

export const HERO_VEHICLE_IDS = [
  '458', 'a4', 'vehicle-34', 'rb7', 'countach', '777', 'd11', 'g63',
  'ae86', 'v4', 'cat-797', 'f40', '250gto', 'f2004', '312t', 'f1',
  'mp4', 'vehicle-06', 'e-type', 'h1',
];

export const NAV_ITEMS: Array<{ label: NavLabel; view: View }> = [
  { label: 'Start', view: 'play' },
  { label: 'Memory', view: 'memory' },
  { label: 'Garage', view: 'garage' },
  { label: 'Parents', view: 'parents' },
];

export const UI_TEXT = defineTranslations({
  en: {
    languageToggle: '中文',
    nav: {
      Start: 'Start',
      Games: 'Games',
      Memory: 'Memory',
      Garage: 'Garage',
      Colors: 'Colors',
      Parents: 'Parents',
    },
    heroSlides: [
      { title: 'Color Hunt', label: 'FIND RED CARS', description: 'Start a gentle color game with real toy vehicle pictures.', cta: 'START GAME' },
      { title: 'City Colors', label: 'SPOT THE CITY CAR', description: 'Look at each vehicle, name its color, and tap carefully.', cta: 'START GAME' },
      { title: 'Find the Bus', label: 'TAP THE BUS', description: 'Buses, cars, race cars, diggers, and planes can all appear.', cta: 'START GAME' },
      { title: 'Garage Star', label: 'COLLECT VEHICLES', description: 'Every marked vehicle can become part of the learning set.', cta: 'MY GARAGE' },
      { title: 'Memory Garage', label: 'MATCH THE CARS', description: 'Flip cards and match vehicles, colors, or categories.', cta: 'MEMORY GAME' },
    ],
    play: {
      kickerColor: 'Color game', kickerCategory: 'Category game', kickerMixed: 'Mixed game', kickerMath: 'Math game',
      find: 'Find', fallbackColor: 'a color', fallbackCategory: 'a category',
      instructionColor: 'Look at the vehicles below. Tap every vehicle that matches the target color, then count them.',
      instructionCategory: 'Look at the vehicles below. Tap every vehicle that matches the target category, then count them.',
      instructionMixed: 'Look at the vehicles below. Find vehicles matching each target color or category.',
      instructionMath: 'Count how many vehicles in total. Tap the correct number.',
      score: 'Score', newRound: 'New round',
      idlePrefixColor: 'Tap a', idleSuffixColor: 'vehicle.',
      idlePrefixCategory: 'Tap a', idleSuffixCategory: '.',
      idleMixed: 'Tap vehicles that match the conditions.',
      progressPrefix: 'Found', progressMiddle: 'of', progressSuffix: 'Keep looking.',
      correctPrefixColor: 'Correct. There are', correctSuffixColor: 'matching vehicles here.',
      correctPrefixMixed: 'Correct. You found', correctSuffixMixed: 'vehicles in total.',
      wrongColor: 'Try again. Look for another vehicle with the target color.',
      wrongCategory: 'Try again. Look for another vehicle in the target category.',
      wrongMixed: 'Try again. Check every target condition.',
    },
    garage: { kicker: 'Collection garage', markedVehicles: 'marked vehicles', editColors: 'Edit colors' },
    memory: {
      kicker: 'Memory garage', title: 'Flip & match', description: 'Choose a matching rule and board size. Only parent-locked tags are used.',
      vehicle: 'Same vehicle', vehicleHint: 'Match two identical vehicles.',
      color: 'Same color', colorHint: 'Match two different vehicles with the same main color.',
      category: 'Same category', categoryHint: 'Match two different vehicles from the same category.',
      boardSize: 'Board size', cards: 'cards', pairs: 'pairs', start: 'Start memory game', back: 'Change mode',
      moves: 'Moves', moveUnit: 'moves', time: 'Time', best: 'Best', preview: 'Remember them', complete: 'Garage complete!',
      completeHint: 'You matched every vehicle.', replay: 'Play again', setup: 'Choose another mode',
      noData: 'Not enough locked vehicle data for this mode.', matched: 'Matched', portraitTip: 'For 8×8, landscape works best on phones.',
    },
    parents: {
      kicker: 'Parent controls', title: 'Mark vehicle colors',
      description: 'This is the lightweight data layer: color tags are saved in this browser with localStorage. No account, no server, easy to revise.',
      reset: 'Reset tags', all: 'All', mainColor: 'Main color', category: 'Category',
      lockColor: 'Lock color', unlockColor: 'Unlock color', lockCategory: 'Lock category', unlockCategory: 'Unlock category',
    },
    reward: { newCard: 'New Card!', continue: 'Continue', allCollected: 'All vehicles collected!', amazing: 'Amazing!' },
    aria: { openMenu: 'Open menu', closeMenu: 'Close menu', previous: 'Previous game mode', next: 'Next game mode', switchLanguage: 'Switch language', muteSounds: 'Mute sounds', enableSounds: 'Enable sounds' },
  },
  zh: {
    languageToggle: 'EN',
    nav: { Start: '开始', Games: '游戏', Memory: '记忆车库', Garage: '车库', Colors: '颜色', Parents: '家长' },
    heroSlides: [
      { title: '颜色找找看', label: '找到红色车', description: '用真实玩具车图片开始一局温和的颜色小游戏。', cta: '开始游戏' },
      { title: '城市颜色', label: '找到城市小车', description: '观察每一辆车，说出颜色，再轻轻点选。', cta: '开始游戏' },
      { title: '找到巴士', label: '点击巴士', description: '巴士、小汽车、赛车、工程车和飞机都可能出现。', cta: '开始游戏' },
      { title: '收藏车库', label: '收集车辆', description: '每辆已标记颜色的车，都可以进入孩子的学习素材库。', cta: '我的车库' },
      { title: '记忆车库', label: '翻牌找配对', description: '翻开卡牌，配对相同车辆、颜色或车型。', cta: '开始记忆游戏' },
    ],
    play: {
      kickerColor: '颜色游戏', kickerCategory: '类别游戏', kickerMixed: '混合游戏', kickerMath: '数学游戏',
      find: '找到', fallbackColor: '一种颜色', fallbackCategory: '一种类别',
      instructionColor: '看看下面的车辆，把所有符合目标颜色的车都点出来，然后数一数一共有几辆。',
      instructionCategory: '看看下面的车辆，把所有符合目标类别的车都点出来，然后数一数一共有几辆。',
      instructionMixed: '看看下面的车辆，找出符合每种目标颜色或类别的车。',
      instructionMath: '算一算一共有多少辆车，点击正确的数字。',
      score: '得分', newRound: '换一题',
      idlePrefixColor: '请点击一辆', idleSuffixColor: '的车。',
      idlePrefixCategory: '请点击一辆', idleSuffixCategory: '。',
      idleMixed: '请点击符合条件的车辆。',
      progressPrefix: '已经找到', progressMiddle: '辆，共', progressSuffix: '辆，继续找。',
      correctPrefixColor: '答对啦！这里有', correctSuffixColor: '辆这种颜色的车。',
      correctPrefixMixed: '答对啦！一共找到了', correctSuffixMixed: '辆车。',
      wrongColor: '再试一次，找找另一辆符合目标颜色的车。',
      wrongCategory: '再试一次，找找另一辆符合目标车型的车。',
      wrongMixed: '再试一次，仔细检查颜色和车型条件。',
    },
    garage: { kicker: '收藏车库', markedVehicles: '辆已标记车辆', editColors: '编辑颜色' },
    memory: {
      kicker: '记忆车库', title: '翻牌找配对', description: '选择配对规则和棋盘规模，游戏只使用家长已锁定的标签。',
      vehicle: '相同车辆', vehicleHint: '找到两张完全相同的车辆。',
      color: '相同颜色', colorHint: '配对两辆主颜色相同的不同车辆。',
      category: '相同车型', categoryHint: '配对两辆属于同一车型的不同车辆。',
      boardSize: '棋盘规模', cards: '张卡牌', pairs: '对', start: '开始记忆游戏', back: '更换模式',
      moves: '步数', moveUnit: '步', time: '时间', best: '最佳', preview: '记住它们', complete: '车库配对完成！',
      completeHint: '你已经找到了所有配对。', replay: '再玩一次', setup: '选择其他模式',
      noData: '已锁定的车辆数据不足，暂时无法生成这个模式。', matched: '已配对', portraitTip: '8×8 在手机上建议横屏使用。',
    },
    parents: {
      kicker: '家长控制', title: '标记车辆颜色',
      description: '这是轻量数据层：颜色标签保存在当前浏览器的 localStorage 中。无需账号、无需服务器，随时可以修改。',
      reset: '重置标签', all: '全部', mainColor: '主颜色', category: '类别',
      lockColor: '锁定颜色', unlockColor: '解锁颜色', lockCategory: '锁定类别', unlockCategory: '解锁类别',
    },
    reward: { newCard: '获得了新卡牌！', continue: '继续游戏', allCollected: '已收集全部车辆！', amazing: '太厉害了！' },
    aria: { openMenu: '打开菜单', closeMenu: '关闭菜单', previous: '上一个游戏模式', next: '下一个游戏模式', switchLanguage: '切换语言', muteSounds: '关闭音效', enableSounds: '开启音效' },
  },
});

export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
