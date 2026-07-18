import { ACHIEVEMENT_HERO } from './hintsContent';

/**
 * Achievement catalog (v2.6 batch 3.3) — expands the single "Diabetes Hero"
 * achievement into a ladder of 10. Unlock state lives in MMKV
 * (ACHIEVEMENTS_UNLOCKED, JSON array of ids); conditions are evaluated by
 * achievementEngine.checkAchievements() against DB counts + the streak.
 */

export type AchievementCondition =
  | {
      type: 'glucoseCount' | 'injectionCount' | 'weightCount' | 'totalCount' | 'streakDays';
      threshold: number;
    }
  /** Legacy hero: 30 days with the app OR 30 injections (either qualifies). */
  | { type: 'hero' };

export interface AchievementDef {
  id: string;
  /** Icon name understood by @shared/components/ui/Icon */
  icon: string;
  condition: AchievementCondition;
  title: { ru: string; en: string };
  congratulation: { ru: string; en: string };
  cardText: { ru: string; en: string };
}

/** Order matters: when several unlock at once, earlier entries show first. */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_glucose',
    icon: 'water',
    condition: { type: 'glucoseCount', threshold: 1 },
    title: { ru: 'Первый замер', en: 'First reading' },
    congratulation: {
      ru: 'Первый замер глюкозы записан. Именно с этого начинается контроль диабета — теперь у вас есть данные, а не догадки.',
      en: 'Your first glucose reading is logged. This is where diabetes control begins — now you have data instead of guesses.',
    },
    cardText: {
      ru: 'Каждый большой путь начинается с первой записи.',
      en: 'Every long journey starts with the first entry.',
    },
  },
  {
    id: 'first_injection',
    icon: 'fitness',
    condition: { type: 'injectionCount', threshold: 1 },
    title: { ru: 'Первый укол', en: 'First injection' },
    congratulation: {
      ru: 'Первая инъекция позади. Волнение при первом уколе — это нормально; дальше будет проще, и питомец привыкнет быстрее, чем кажется.',
      en: "The first injection is behind you. Feeling nervous the first time is normal; it gets easier, and your pet will adapt faster than you'd think.",
    },
    cardText: {
      ru: 'Самый трудный укол — первый. Он уже сделан.',
      en: 'The hardest injection is the first one. It is done.',
    },
  },
  {
    id: 'week_streak',
    icon: 'flame',
    condition: { type: 'streakDays', threshold: 7 },
    title: { ru: 'Неделя без пропусков', en: 'One-week streak' },
    congratulation: {
      ru: '7 дней подряд с записями. Регулярность — главное, что помогает вашему ветеринару подбирать лечение. Так держать!',
      en: '7 days of entries in a row. Consistency is what helps your vet fine-tune the treatment. Keep it up!',
    },
    cardText: {
      ru: '7 дней подряд. Дисциплина сильнее мотивации.',
      en: '7 days in a row. Discipline beats motivation.',
    },
  },
  {
    id: 'hero',
    icon: 'star',
    condition: { type: 'hero' },
    title: ACHIEVEMENT_HERO.title,
    congratulation: ACHIEVEMENT_HERO.congratulation,
    cardText: ACHIEVEMENT_HERO.cardText,
  },
  {
    id: 'glucose_50',
    icon: 'analytics',
    condition: { type: 'glucoseCount', threshold: 50 },
    title: { ru: '50 замеров', en: '50 readings' },
    congratulation: {
      ru: '50 замеров глюкозы! На таком объёме данных анализатор уже видит настоящие тренды, а не случайные колебания.',
      en: '50 glucose readings! With this much data the analyzer can see real trends, not random noise.',
    },
    cardText: {
      ru: '50 точек данных — это уже история болезни.',
      en: '50 data points — that is a real medical history.',
    },
  },
  {
    id: 'month_streak',
    icon: 'trophy',
    condition: { type: 'streakDays', threshold: 30 },
    title: { ru: 'Месяц дисциплины', en: 'One-month streak' },
    congratulation: {
      ru: '30 дней подряд без единого пропуска. Такой дисциплине позавидует большинство людей с диабетом. Ваш питомец в надёжных руках.',
      en: '30 days in a row without a single gap. Most human diabetics would envy this discipline. Your pet is in reliable hands.',
    },
    cardText: {
      ru: '30 дней подряд. Это уже не привычка — это забота.',
      en: '30 days straight. Not a habit anymore — devotion.',
    },
  },
  {
    id: 'injections_100',
    icon: 'medal',
    condition: { type: 'injectionCount', threshold: 100 },
    title: { ru: '100 инъекций', en: '100 injections' },
    congratulation: {
      ru: '100 инъекций — уверенной рукой. То, что когда-то пугало, стало обычной частью дня. Вы настоящий профи.',
      en: '100 injections — with a steady hand. What once felt scary is now just part of the day. You are a pro.',
    },
    cardText: {
      ru: '100 уколов. Рука уже не дрожит.',
      en: '100 shots. The hand no longer shakes.',
    },
  },
  {
    id: 'weight_watch',
    icon: 'scale-outline',
    condition: { type: 'weightCount', threshold: 5 },
    title: { ru: 'Контроль веса', en: 'Weight watcher' },
    congratulation: {
      ru: '5 записей веса. Динамика веса — один из важнейших индикаторов при диабете, и вы за ней следите. Ветеринар это оценит.',
      en: '5 weight entries. Weight trend is one of the key indicators in diabetes, and you are tracking it. Your vet will appreciate this.',
    },
    cardText: {
      ru: 'Вес под контролем — диабет под контролем.',
      en: 'Weight under control — diabetes under control.',
    },
  },
  {
    id: 'glucose_200',
    icon: 'sparkles',
    condition: { type: 'glucoseCount', threshold: 200 },
    title: { ru: '200 замеров', en: '200 readings' },
    congratulation: {
      ru: '200 замеров глюкозы. Вы знаете организм своего питомца лучше, чем кто-либо. Такой дневник — золото для любого ветеринара.',
      en: "200 glucose readings. You know your pet's body better than anyone. A diary like this is gold for any vet.",
    },
    cardText: {
      ru: '200 замеров. Вы — эксперт по своему питомцу.',
      en: '200 readings. You are the expert on your pet.',
    },
  },
  {
    id: 'records_500',
    icon: 'book',
    condition: { type: 'totalCount', threshold: 500 },
    title: { ru: 'Летописец', en: 'Chronicler' },
    congratulation: {
      ru: '500 записей в дневнике — замеры, уколы, кормления. За каждой из них — минута заботы. Вместе они складываются в долгую и хорошую жизнь питомца.',
      en: '500 diary entries — readings, injections, feedings. Each one is a minute of care. Together they add up to a long, good life for your pet.',
    },
    cardText: {
      ru: '500 записей заботы. День за днём.',
      en: '500 entries of care. Day after day.',
    },
  },
];

export function getAchievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
