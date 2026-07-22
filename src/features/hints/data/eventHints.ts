import type { PetSpecies } from '@storage/domain/types';
import type { HintCategory } from './hintsContent';

/**
 * Event-driven hints (v2.6 batch 3.4) — lift the hard 30-day cliff of the
 * staged hint system. These react to what actually happened (a low reading,
 * a new food, a long absence, a milestone) and work at ANY day number;
 * generic "ongoing" tips fire only after day 30, max one per day.
 *
 * Medical guardrail: no dose advice beyond "talk to your vet" — same policy
 * as hintsContent.
 */

export type EventHintTrigger =
  | 'hypo_logged' // reading below target but above emergency (emergencies go through SOS flow)
  | 'hyper_logged' // reading above the "increase monitoring" threshold, below emergency
  | 'new_food' // feeding logged with a food brand not seen before for this pet
  | 'milestone_90' // day 90..179 with the app
  | 'milestone_180' // day 180+
  | 'return_after_gap' // app opened after >=4 days of silence
  | 'ongoing'; // post-30-day generic tips / encyclopedia teasers

export interface EventHintContent {
  id: string;
  trigger: EventHintTrigger;
  category: HintCategory;
  species?: PetSpecies | 'all';
  /** Optional encyclopedia article id for a "Подробнее" deep-link. For 'all'
   *  hints, only link species-neutral ('all') articles. */
  articleId?: string;
  ru: string;
  en: string;
}

/** Milestones are one-shot; everything else cycles when exhausted. */
export const ONE_SHOT_TRIGGERS: EventHintTrigger[] = ['milestone_90', 'milestone_180'];

export const EVENT_HINTS: EventHintContent[] = [
  // ---------------------------------------------------------------- hypo ---
  {
    id: 'ev_hypo_1',
    trigger: 'hypo_logged',
    category: 'medical_fact',
    ru: 'Показание ниже целевого диапазона. Понаблюдайте за питомцем пару часов: вялость, шаткая походка, дрожь — повод сразу позвонить ветеринару.',
    en: 'This reading is below the target range. Watch your pet for a couple of hours: lethargy, wobbliness or trembling are reasons to call your vet right away.',
  },
  {
    id: 'ev_hypo_2',
    trigger: 'hypo_logged',
    category: 'practical',
    ru: 'После низкого показания — спокойный режим: доступ к еде и воде, без активных игр. Повторите замер через 1–2 часа.',
    en: 'After a low reading, keep things calm: food and water available, no vigorous play. Re-check glucose in 1–2 hours.',
  },
  {
    id: 'ev_hypo_3',
    trigger: 'hypo_logged',
    category: 'practical',
    ru: 'Запишите, когда был последний укол: пара «время укола — низкий замер» очень поможет врачу понять, куда смещать терапию.',
    en: 'Note when the last injection was given: the "injection time vs low reading" pair helps your vet understand how to adjust therapy.',
  },
  {
    id: 'ev_hypo_4',
    trigger: 'hypo_logged',
    category: 'medical_fact',
    ru: 'Если низкие значения повторяются несколько дней подряд — не снижайте дозу сами. Покажите дневник ветеринару: коррекция дозы — его решение.',
    en: "If low readings repeat over several days, don't reduce the dose yourself. Show the diary to your vet — dose changes are their call.",
  },
  {
    id: 'ev_hypo_5',
    trigger: 'hypo_logged',
    category: 'practical',
    ru: 'Держите под рукой мёд или глюкозный гель: при явных признаках гипогликемии их наносят на дёсны. Пошаговый план — в разделе SOS.',
    en: 'Keep honey or glucose gel handy: with clear hypoglycemia signs it goes on the gums. The step-by-step plan is in the SOS section.',
  },

  // --------------------------------------------------------------- hyper ---
  {
    id: 'ev_hyper_1',
    trigger: 'hyper_logged',
    category: 'practical',
    ru: 'Высокое показание. Проверьте: был ли укол вовремя, не было ли внепланового перекуса. Одна цифра — ещё не тренд, но запись поможет увидеть закономерность.',
    en: "A high reading. Check: was the injection on time, was there an unplanned snack? One number isn't a trend yet, but the record helps reveal patterns.",
  },
  {
    id: 'ev_hyper_2',
    trigger: 'hyper_logged',
    category: 'practical',
    ru: 'При высокой глюкозе питомец пьёт больше — следите, чтобы миска с водой была всегда полной.',
    en: 'With high glucose your pet drinks more — make sure the water bowl is always full.',
  },
  {
    id: 'ev_hyper_3',
    trigger: 'hyper_logged',
    category: 'medical_fact',
    ru: 'Высокие значения несколько дней подряд — повод позвонить ветеринару и, возможно, снять глюкозную кривую. Не повышайте дозу самостоятельно.',
    en: "Several days of high readings are a reason to call your vet and possibly run a glucose curve. Don't raise the dose on your own.",
  },
  {
    id: 'ev_hyper_4',
    trigger: 'hyper_logged',
    category: 'medical_fact',
    species: 'cat',
    articleId: 'stress-hyperglycemia',
    ru: 'Стресс заметно поднимает глюкозу у кошек: замер после поездки, гостей или другого волнения может быть выше обычного. Учитывайте контекст.',
    en: 'Stress raises glucose noticeably in cats: a reading after a car ride, visitors or other excitement can run higher than usual. Consider the context.',
  },
  {
    id: 'ev_hyper_5',
    trigger: 'hyper_logged',
    category: 'medical_fact',
    species: 'dog',
    articleId: 'dog-spay-diestrus',
    ru: 'У собак глюкоза может подниматься после активных игр, стресса или у сук в определённые фазы цикла. Учитывайте контекст замера.',
    en: 'In dogs, glucose can rise after vigorous play, stress, or in intact females at certain cycle phases. Consider the context of the reading.',
  },

  // ------------------------------------------------------------ new food ---
  {
    id: 'ev_food_1',
    trigger: 'new_food',
    category: 'practical',
    ru: 'Новый корм? Переводите постепенно, за 7–10 дней увеличивая его долю. Резкая смена рациона может качнуть глюкозу.',
    en: 'A new food? Transition gradually over 7–10 days, increasing its share step by step. An abrupt diet change can swing glucose.',
  },
  {
    id: 'ev_food_2',
    trigger: 'new_food',
    category: 'medical_fact',
    ru: 'После смены корма первые 3–5 дней измеряйте глюкозу чуть чаще: другой состав может изменить потребность в инсулине. Сильные отклонения — повод для звонка врачу.',
    en: 'For the first 3–5 days after a food change, check glucose a bit more often: a different formula can change insulin needs. Big deviations are worth a call to your vet.',
  },
  {
    id: 'ev_food_3',
    trigger: 'new_food',
    category: 'practical',
    ru: 'Новый корм уже в дневнике кормлений — отлично. Так проще связать изменения глюкозы с рационом на приёме у врача.',
    en: 'The new food is now in the feeding diary — great. That makes it easier to link glucose changes to the diet at your next vet visit.',
  },

  // -------------------------------------------------------- milestone 90 ---
  {
    id: 'ev_m90_1',
    trigger: 'milestone_90',
    category: 'medical_fact',
    ru: 'Вы ведёте дневник уже 3 месяца! Хороший момент спросить ветеринара про анализ на фруктозамин — он показывает средний уровень глюкозы за последние 2–3 недели.',
    en: "You've been keeping the diary for 3 months! A good moment to ask your vet about a fructosamine test — it reflects average glucose over the past 2–3 weeks.",
  },
  {
    id: 'ev_m90_2',
    trigger: 'milestone_90',
    category: 'medical_fact',
    ru: '3 месяца контроля позади. Плановый осмотр раз в 3–6 месяцев помогает вовремя скорректировать терапию — даже когда всё стабильно.',
    en: '3 months of control behind you. A routine check-up every 3–6 months helps adjust therapy in time — even when things look stable.',
  },

  // ------------------------------------------------------- milestone 180 ---
  {
    id: 'ev_m180_1',
    trigger: 'milestone_180',
    category: 'support',
    ru: 'Полгода заботы! Стабильному диабетику достаточно планового контроля: осмотр, вес, при необходимости фруктозамин. Вы отлично справляетесь.',
    en: 'Half a year of care! A stable diabetic needs routine control: check-ups, weight, fructosamine when needed. You are doing great.',
  },

  // ---------------------------------------------------- return after gap ---
  {
    id: 'ev_gap_1',
    trigger: 'return_after_gap',
    category: 'support',
    ru: 'С возвращением! Пропуск записей — это нормально, жизнь бывает разной. Просто продолжайте с сегодняшнего дня — дневник снова начнёт помогать.',
    en: 'Welcome back! Gaps in the diary are normal — life happens. Just pick it up again today, and the diary will start helping again.',
  },
  {
    id: 'ev_gap_2',
    trigger: 'return_after_gap',
    category: 'support',
    ru: 'Рады видеть снова. Начните с одного замера сегодня — этого достаточно, чтобы вернуться в ритм.',
    en: 'Good to see you again. Start with one reading today — that is enough to get back into rhythm.',
  },

  // ---------------------------------------------- ongoing post-30 rotation ---
  {
    id: 'ev_ong_1',
    trigger: 'ongoing',
    category: 'medical_fact',
    species: 'cat',
    articleId: 'remission',
    ru: 'У кошек диабет может уйти в ремиссию. В энциклопедии есть статья о том, какие факторы повышают шансы — загляните.',
    en: 'Feline diabetes can go into remission. The encyclopedia has an article on the factors that improve the odds — take a look.',
  },
  {
    id: 'ev_ong_1d',
    trigger: 'ongoing',
    category: 'support',
    species: 'dog',
    articleId: 'dog-life-expectancy',
    ru: 'Диабет у собак обычно пожизненный, но с налаженной рутиной собаки живут полноценной и активной жизнью. В энциклопедии есть статьи о долгосрочном контроле.',
    en: 'Canine diabetes is usually lifelong, but with a solid routine dogs live full, active lives. The encyclopedia has articles on long-term control.',
  },
  {
    id: 'ev_ong_2',
    trigger: 'ongoing',
    category: 'practical',
    articleId: 'insulin-storage',
    ru: 'Открытый флакон инсулина не хранится вечно. Статья о хранении инсулина в энциклопедии напомнит, когда пора менять флакон.',
    en: 'An opened insulin vial does not last forever. The insulin storage article in the encyclopedia will remind you when to replace it.',
  },
  {
    id: 'ev_ong_3',
    trigger: 'ongoing',
    category: 'practical',
    ru: 'Чередуйте зоны уколов (холка, бока) — это снижает риск уплотнений кожи. Подробнее — в статье об инъекциях.',
    en: 'Rotate injection sites (scruff, flanks) — it lowers the risk of skin thickening. More in the injections article.',
  },
  {
    id: 'ev_ong_4',
    trigger: 'ongoing',
    category: 'practical',
    ru: 'Раз в месяц записывайте вес питомца в DiaPet (профиль → вес): тренд веса скажет врачу больше, чем разовая цифра.',
    en: "Log your pet's weight in DiaPet once a month (profile → weight): the weight trend tells your vet more than a single number.",
  },
  {
    id: 'ev_ong_5',
    trigger: 'ongoing',
    category: 'practical',
    ru: 'Каталог кормов в гиде по питанию обновляется. Загляните — возможно, в вашем регионе появились новые подходящие позиции.',
    en: 'The food catalog in the feeding guide keeps updating. Check it — new suitable options may have appeared in your region.',
  },
  {
    id: 'ev_ong_6',
    trigger: 'ongoing',
    category: 'practical',
    ru: 'PDF-отчёт для ветеринара собирается в пару тапов из истории глюкозы. Возьмите его на следующий приём — врачи такое очень ценят.',
    en: 'The vet PDF report takes two taps from the glucose history. Bring it to your next visit — vets really appreciate it.',
  },
  {
    id: 'ev_ong_7',
    trigger: 'ongoing',
    category: 'medical_fact',
    ru: 'Анализатор в DiaPet считает время в целевом диапазоне (TIR) и тренды. За месяц данных там уже видны настоящие закономерности.',
    en: 'The DiaPet analyzer tracks time-in-range (TIR) and trends. With a month of data, real patterns are already visible there.',
  },
  {
    id: 'ev_ong_8',
    trigger: 'ongoing',
    category: 'practical',
    ru: 'Записывайте и симптомы: жажда, вялость, изменения аппетита. Пара записей в месяц делает картину для врача заметно полнее.',
    en: 'Log symptoms too: thirst, lethargy, appetite changes. A couple of entries a month makes the picture much clearer for your vet.',
  },
  {
    id: 'ev_ong_9',
    trigger: 'ongoing',
    category: 'practical',
    ru: 'В настройках есть напоминание о замере глюкозы — включите, чтобы не выпадать из ритма в загруженные дни.',
    en: 'Settings has a glucose check reminder — turn it on so busy days do not break your rhythm.',
  },
];
