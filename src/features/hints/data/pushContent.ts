export interface PushHintContent {
  id: string;
  ru: string;
  en: string;
  mentionsPremium: boolean;
}

export const PUSH_HINTS: PushHintContent[] = [
  {
    id: 'push_01',
    ru: 'Надеюсь, котейка сегодня в хорошем настроении и радует тебя своим аппетитом.',
    en: 'Hope your cat is in good spirits today and giving you a healthy appetite to smile about.',
    mentionsPremium: false,
  },
  {
    id: 'push_02',
    ru: 'Не забывай: 10–15 минут игры в день снижают стресс у диабетической кошки — и у тебя тоже.',
    en: 'Remember: 10–15 minutes of play a day reduces stress for a diabetic cat — and for you too.',
    mentionsPremium: false,
  },
  {
    id: 'push_03',
    ru: 'Сегодня хороший день, чтобы проверить запас инсулина и игл. Лучше не ждать, пока закончится.',
    en: 'Today\'s a good day to check your insulin and needle supply. Better not to wait until you run out.',
    mentionsPremium: false,
  },
  {
    id: 'push_04',
    ru: 'Кот замечает твоё спокойствие. Даже если внутри всё непросто — твоя уверенность передаётся ему.',
    en: 'Your cat notices your calm. Even when things feel difficult inside — your confidence passes on to them.',
    mentionsPremium: false,
  },
  {
    id: 'push_05',
    ru: 'Как давно ты чесал кота за ухом просто так, без всяких уколов? Иногда это важно для вас обоих.',
    en: 'When did you last scratch your cat behind the ears just for the sake of it, no injections involved? Sometimes that matters for both of you.',
    mentionsPremium: false,
  },
  {
    id: 'push_06',
    ru: 'Небольшое напоминание: кошки чувствуют наш стресс. Сделай глубокий вдох перед следующим уколом.',
    en: 'A small reminder: cats feel our stress. Take a slow breath before the next injection.',
    mentionsPremium: false,
  },
  {
    id: 'push_07',
    ru: 'Если сегодня всё прошло гладко — это не случайность. Это твоя работа.',
    en: 'If things went smoothly today — that\'s not luck. That\'s your work.',
    mentionsPremium: false,
  },
  {
    id: 'push_08',
    ru: 'Тёплое место для сна, миска в нужное время, укол без спешки — это и есть хорошая жизнь для твоего кота.',
    en: 'A warm spot to sleep, a bowl at the right time, an injection without rushing — that\'s a good life for your cat.',
    mentionsPremium: false,
  },
  {
    id: 'push_09',
    ru: 'Замечал ли ты, как кот реагирует на твоё появление с едой? Это маленькая, но настоящая радость.',
    en: 'Have you noticed how your cat reacts when you appear with food? That\'s a small but real joy.',
    mentionsPremium: false,
  },
  {
    id: 'push_10',
    ru: 'Диабет у кошки — это марафон, а не спринт. Ты уже бежишь его. Просто продолжай в своём темпе.',
    en: 'Feline diabetes is a marathon, not a sprint. You\'re already running it. Just keep going at your pace.',
    mentionsPremium: false,
  },
  {
    id: 'push_11',
    ru: 'Сегодняшний укол — это вклад в здоровье кота, который он почувствует, даже если ты этого не увидишь.',
    en: 'Today\'s injection is an investment in your cat\'s health that they\'ll feel, even if you don\'t see it.',
    mentionsPremium: false,
  },
  {
    id: 'push_12',
    ru: 'Если что-то беспокоит — лучше записать вопрос для ветеринара, чем держать в голове. Так ничего не потеряется.',
    en: 'If something worries you, write down a question for the vet rather than keeping it in your head. That way nothing gets lost.',
    mentionsPremium: false,
  },
  {
    id: 'push_13',
    ru: 'Хороший знак — кот сам приходит к миске вовремя. Это значит, что расписание стало для него понятным.',
    en: 'A good sign: your cat coming to the bowl on time by themselves. It means the schedule has become clear to them.',
    mentionsPremium: false,
  },
  {
    id: 'push_14',
    ru: 'Не забывай об уходе за собой тоже. Уставший хозяин хуже справляется с уколами. Ты важен не меньше кота.',
    en: 'Don\'t forget to take care of yourself too. A tired owner gives worse injections. You matter just as much as your cat.',
    mentionsPremium: false,
  },
  {
    id: 'push_15',
    ru: 'Если сегодня что-то пошло не так — это не провал. Это просто один день из многих.',
    en: 'If something went wrong today — that\'s not a failure. It\'s just one day among many.',
    mentionsPremium: false,
  },
  {
    id: 'push_16',
    ru: 'Ты, наверное, уже знаешь своего кота лучше, чем когда-либо. Диабет даёт неожиданную близость.',
    en: 'You probably know your cat better now than you ever did. Diabetes brings an unexpected closeness.',
    mentionsPremium: false,
  },
  {
    id: 'push_17',
    ru: 'Сегодня хороший день, чтобы просто посидеть рядом с котом, не делая ничего. Иногда это и есть лечение.',
    en: 'Today\'s a good day to just sit with your cat, doing nothing. Sometimes that\'s the treatment.',
    mentionsPremium: false,
  },
  {
    id: 'push_18',
    ru: 'Небольшое наблюдение: если кот активнее обычного — это хороший признак, что глюкоза движется в нужную сторону.',
    en: 'A small observation: if your cat is more active than usual, that\'s a good sign that glucose is heading in the right direction.',
    mentionsPremium: false,
  },
  {
    id: 'push_19',
    ru: 'Можешь ли ты сегодня найти 5 минут и просто понаблюдать за котом — как он двигается, ест, дышит? Это лучший мониторинг.',
    en: 'Can you find 5 minutes today to just watch your cat — how they move, eat, breathe? That\'s the best monitoring.',
    mentionsPremium: false,
  },
  {
    id: 'push_20',
    ru: 'В нашем приложении есть ИИ-ассистент, который знает историю твоего кота и может ответить на вопросы в любое время. Доступно в DiaPet Pro.',
    en: 'Our app has an AI assistant that knows your cat\'s history and can answer questions any time. Available in DiaPet Pro.',
    mentionsPremium: true,
  },
  {
    id: 'push_21',
    ru: 'Если у тебя накопились вопросы о диабете кота, но до ветеринара далеко — в DiaPet Pro есть ИИ-помощник, который разбирается в теме.',
    en: 'If you have questions about your cat\'s diabetes but the vet isn\'t available — DiaPet Pro has an AI assistant that knows the subject.',
    mentionsPremium: true,
  },
  {
    id: 'push_22',
    ru: 'Знаешь, что помогает многим хозяевам диабетических кошек? Возможность задать вопрос в любой момент. Именно для этого в DiaPet Pro есть ИИ-ассистент.',
    en: 'Know what helps many owners of diabetic cats? Being able to ask a question at any moment. That\'s exactly what the AI assistant in DiaPet Pro is for.',
    mentionsPremium: true,
  },
  {
    id: 'push_23',
    ru: 'Вечером, когда все вопросы всплывают в голове, а ветеринар недоступен — ИИ-помощник в DiaPet Pro может спокойно помочь разобраться.',
    en: 'In the evening, when questions surface in your head and the vet is unavailable — the AI assistant in DiaPet Pro can help you work through them calmly.',
    mentionsPremium: true,
  },
  {
    id: 'push_24',
    ru: 'Ты уже многому научился. Продолжай вести журнал — паттерны, которые ты заметишь через месяц, могут быть очень важны.',
    en: 'You\'ve already learned so much. Keep logging — the patterns you notice a month from now could be very important.',
    mentionsPremium: false,
  },
  {
    id: 'push_25',
    ru: 'Маленькое напоминание: даже если всё идёт по плану и кот чувствует себя хорошо — плановые визиты к ветеринару остаются важными.',
    en: 'A small reminder: even when everything is going to plan and your cat feels well — routine vet check-ups still matter.',
    mentionsPremium: false,
  },
];
