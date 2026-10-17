import { AssessmentResult, Domain } from "../types";
import { TALENTS_DATA } from "./talents";

export type CountryCode = "uz" | "kz";

export type CoreRoleKey = "closer" | "hunter" | "trainer" | "hr" | "promoter" | "custom";

export interface RoleBenchmark {
  roleKey: CoreRoleKey;
  nameRu: string;
  badge: string;
  icon: string;
  headline: string;
  keyMotto: string;
  targetDomains: { domain: Domain; importance: "critical" | "high" | "medium" }[];
  primeTalents: { id: number; nameRu: string; reason: string }[];
  disfavoredTalents?: { id: number; nameRu: string; reason: string }[];
  targetMotivation: { primary: string; secondary: string; rationale: string };
  targetPsychotype: { primary: string; secondary: string; rationale: string };
  competencies: { name: string; priority: "critical" | "high"; description: string }[];
  behavioralModel: {
    title: string;
    items: string[];
  };
  ivanovaProfile?: {
    reference: string;
    motivationVector: string;
    processResult: string;
    proceduresOpportunities: string;
    activityReflectivity: string;
    teamRole: string;
  };
  redFlags: string[];
  managerAdvice: {
    interviewCheck: string;
    adaptationHint: string;
    kpiFocus: string;
  };
}

export const ROLE_BENCHMARKS: Record<CoreRoleKey, Record<CountryCode, RoleBenchmark>> = {
  // ==========================================
  // 1. КЛОУЗЕР (CLOSER)
  // ==========================================
  closer: {
    kz: {
      roleKey: "closer",
      nameRu: "Клоузер (Менеджер закрытия сделок)",
      badge: "🎯 Продажи & Дожим",
      icon: "Target",
      headline: "Снайпер коммерческого результата, эксперт выявления скрытых потребностей и дожима сделок",
      keyMotto: "«30% говорит менеджер — 70% говорит клиент. Продаем ценность, а не цену»",
      targetDomains: [
        { domain: "influencing", importance: "critical" },
        { domain: "executing", importance: "critical" },
        { domain: "relationship", importance: "medium" },
      ],
      primeTalents: [
        { id: 11, nameRu: "Распорядитель (Command)", reason: "Смелость закрывать сделку, прямо называть цену и вести переговоры" },
        { id: 13, nameRu: "Конкуренция (Competition)", reason: "Азарт быть лидером в продажах и побеждать в рейтингах" },
        { id: 15, nameRu: "Уверенность (Self-Assurance)", reason: "Внутренний стержень и невозмутимость при отказах и возражениях" },
        { id: 1, nameRu: "Достижение (Achiever)", reason: "Голод к результату, фокус на выполнении дневного плана" },
        { id: 10, nameRu: "Катализатор (Activator)", reason: "Быстрый переход к действию, высокая скорость дожима" },
        { id: 7, nameRu: "Фокус (Focus)", reason: "Удержание внимания на главной цели — оплате и закрытии сделки" },
      ],
      disfavoredTalents: [
        { id: 22, nameRu: "Гармония (Harmony)", reason: "Избегание острых углов мешает отрабатывать жесткие возражения" },
        { id: 21, nameRu: "Эмпатия (Empathy)", reason: "Излишняя мягкость мешает уверенно называть цену и дожимать" },
        { id: 5, nameRu: "Осмотрительность (Deliberative)", reason: "Долгие раздумья снижают темп закрытия сделок" },
      ],
      targetMotivation: {
        primary: "Денежник 💰",
        secondary: "Результатник 🏆",
        rationale: "Главный двигатель — высокий личный доход, процент от продаж и преодоление рекордных планок смены.",
      },
      targetPsychotype: {
        primary: "Директив 🔴",
        secondary: "Экспрессив 🟡",
        rationale: "Супер-энергия, уверенность, нацеленность на результат, умение вести клиента вопросом выбора.",
      },
      competencies: [
        { name: "Слушать и выявлять потребность (30/70)", priority: "critical", description: "Задает вопросы, выявляет скрытые мотивы ('похудеть' = 'стесняюсь на пляже')" },
        { name: "Продажа ценности, а не цены", priority: "critical", description: "Называет цену только после того, как клиент понял ценность 35 минут 3 раза в неделю" },
        { name: "Отработка возражений и закрытие", priority: "critical", description: "Разбор 'подумаю', предложение следующего шага ('Оформляем? Сразу или в рассрочку?')" },
        { name: "Дисциплина CRM и дожимы", priority: "critical", description: "80% продаж после 3-5 касаний. Внятные задачи с датами, знание своих цифр" },
      ],
      behavioralModel: {
        title: "Поведение сильного Клоузера",
        items: [
          "Голод к результату: сам берет дополнительные лиды и остается в конце месяца",
          "Стрессоустойчивость: 70–80% отказов воспринимает как рабочую статистику",
          "Обучаемость: после разбора звонка сразу внедряет правку в следующий диалог",
          "Честность и забота: не дает ложных обещаний ради сиюминутного чека, продлевает LTV",
        ],
      },
      redFlags: [
        "Постоянно винит клиентов, трафик, рынок или руководство",
        "Не знает своих цифр (конверсий, чека, остатка до плана)",
        "Говорит 80% времени вместо того, чтобы задавать вопросы клиенту",
        "Боится прямо попросить оплату и отпускает клиента в 'подумаю'",
        "Токсичность и игра против коллег в отделе",
      ],
      managerAdvice: {
        interviewCheck: "Спросите: 'Сколько вы хотите зарабатывать?' и разыграйте возражение 'Я подумаю'. Сильный сразу спросит: 'Что именно хотите обдумать?'",
        adaptationHint: "Давать прозрачную калькуляцию бонусов и регулярную калибровку скриптов раз в неделю.",
        kpiFocus: "Конверсия из визита в продажу, средний чек, глубина дожимов (3-5 касаний).",
      },
    },
    uz: {
      roleKey: "closer",
      nameRu: "Клоузер (Менеджер закрытия сделок)",
      badge: "🎯 Скорость & Голод",
      icon: "Target",
      headline: "Голодный, шустрый, гибкий и стрессоустойчивый охотник за выручкой",
      keyMotto: "«1) Голодный, 2) Шустрый, 3) Гибкий, 4) Стрессоустойчивый»",
      targetDomains: [
        { domain: "influencing", importance: "critical" },
        { domain: "executing", importance: "critical" },
        { domain: "relationship", importance: "medium" },
      ],
      primeTalents: [
        { id: 11, nameRu: "Распорядитель (Command)", reason: "Стрессоустойчивость: уверенно держит удар и ведет к сделке" },
        { id: 13, nameRu: "Конкуренция (Competition)", reason: "Голод: драйв быть номером один по выручке и зарабатывать максимум" },
        { id: 15, nameRu: "Уверенность (Self-Assurance)", reason: "Хладнокровие при отказах и напор в переговорах" },
        { id: 1, nameRu: "Достижение (Achiever)", reason: "Постоянная неудовлетворенность средним результатом" },
        { id: 10, nameRu: "Катализатор (Activator)", reason: "Шустрость: мгновенно берет лид в работу без раскачки" },
        { id: 18, nameRu: "Адаптивность (Adaptability)", reason: "Гибкость: быстро меняет тактику под характер собеседника" },
      ],
      disfavoredTalents: [
        { id: 22, nameRu: "Гармония (Harmony)", reason: "Страх конфликта мешает настаивать на условиях сделки" },
        { id: 21, nameRu: "Эмпатия (Empathy)", reason: "Излишняя мягкость мешает дожимать оплату" },
        { id: 5, nameRu: "Осмотрительность (Deliberative)", reason: "Медлительность снижает динамику закрытия" },
      ],
      targetMotivation: {
        primary: "Денежник 💰",
        secondary: "Результатник 🏆",
        rationale: "Ориентация на заработок, бонусы от объема выручки и скорость закрытия.",
      },
      targetPsychotype: {
        primary: "Директив 🔴",
        secondary: "Экспрессив 🟡",
        rationale: "Быстрый темп, напор, обаяние, молниеносный переход от диалога к оплате.",
      },
      competencies: [
        { name: "Голод к деньгам и результату", priority: "critical", description: "Сам ищет возможность заработать больше, не ждет пинков" },
        { name: "Шустрость реакции", priority: "critical", description: "Мгновенный контакт по новой заявке, высокий темп дня" },
        { name: "Гибкость в диалоге", priority: "critical", description: "Чувствует собеседника, быстро меняет аргументацию" },
        { name: "Стрессоустойчивость", priority: "critical", description: "Хладнокровие при отказах и агрессии, фокус на цели" },
      ],
      behavioralModel: {
        title: "4 столпа идеального Клоузера",
        items: [
          "1. Голодный: постоянно стремится к перевыполнению плана и высокому чеку",
          "2. Шустрый: опережает сомнения клиента, мгновенно берет инициативу",
          "3. Гибкий: находит ключик к любому клиенту — от консерватора до эмоционала",
          "4. Стрессоустойчивый: отказы не сбивают настрой, сохраняет рабочий темп",
        ],
      },
      redFlags: [
        "Медлительность, долгие раздумья перед звонком",
        "Обидчивость при отказах, потеря энергии на полдня",
        "Жесткость, неумение подстроиться под гостя",
        "Довольствование минимальным окладом",
      ],
      managerAdvice: {
        interviewCheck: "Проверьте темп речи и реакцию на стресс в ролевой игре: жесткий отказ от абонемента.",
        adaptationHint: "С первых дней погружать в реальные лиды с опытным наставником и четким чек-листом.",
        kpiFocus: "Скорость ответа на заявку (< 5 минут), конверсия в продажу, личный доход.",
      },
    },
  },

  // ==========================================
  // 2. ХАНТЕР (HUNTER)
  // ==========================================
  hunter: {
    kz: {
      roleKey: "hunter",
      nameRu: "Хантер (Привлечение & Первичный контакт)",
      badge: "🏹 Трафик & Квалификация",
      icon: "Compass",
      headline: "Мастер первого впечатления клуба, привлекает новых участников и формирует высокое доверие",
      keyMotto: "«Просто. Безопасно. Эффективно. Первое впечатление решает всё»",
      targetDomains: [
        { domain: "relationship", importance: "critical" },
        { domain: "influencing", importance: "critical" },
        { domain: "executing", importance: "medium" },
      ],
      primeTalents: [
        { id: 17, nameRu: "Обаяние (Woo)", reason: "Мгновенное растапливание льда с незнакомыми людьми" },
        { id: 25, nameRu: "Позитивность (Positivity)", reason: "Заряжающая энергетика, искренняя доброжелательность" },
        { id: 12, nameRu: "Общительность (Communication)", reason: "Живой, увлекательный язык, умение разговорить любого человека" },
        { id: 23, nameRu: "Инклюзивность (Includer)", reason: "Умение радушно принять любого человека в круг общения" },
        { id: 10, nameRu: "Катализатор (Activator)", reason: "Инициатива первого шага, быстрая обработка потока обращений" },
        { id: 18, nameRu: "Адаптивность (Adaptability)", reason: "Легкое переключение между десятками новых диалогов за день" },
      ],
      disfavoredTalents: [
        { id: 27, nameRu: "Аналитик (Analytical)", reason: "Уход в сухие цифры и таблицы мешает теплому эмоциональному контакту" },
        { id: 5, nameRu: "Осмотрительность (Deliberative)", reason: "Закрытость и настороженность мешают быстрому знакомству" },
        { id: 32, nameRu: "Интеллект (Intellection)", reason: "Потребность в тишине и уединении быстро истощает на потоке звонков" },
      ],
      targetMotivation: {
        primary: "Романтик 🎨",
        secondary: "Результатник 🏆",
        rationale: "Драйв от живого общения с новыми людьми, создания яркого впечатления и выполнения плана по встречам.",
      },
      targetPsychotype: {
        primary: "Экспрессив 🟡",
        secondary: "Дружелюбный 🟢",
        rationale: "Теплый, открытый, контактный стиль общения, вызывающий естественное доверие с первых секунд.",
      },
      competencies: [
        { name: "Установление контакта без давления", priority: "critical", description: "Помогает почувствовать себя свободно, без заученных скриптов и фамильярности" },
        { name: "Глубокое выявление потребности", priority: "critical", description: "Задает открытые вопросы, проверяет понимание, не судит по внешности" },
        { name: "Презентация реальной ценности", priority: "critical", description: "Объясняет клуб простыми словами, не обещает нереального" },
        { name: "Работа с сомнениями и отказами", priority: "critical", description: "Сомнение — это диалог, уважает отказ, оставляет открытую дверь" },
      ],
      behavioralModel: {
        title: "Поведение идеального Хантера",
        items: [
          "Ответственность за первый контакт: доводит начатый диалог до понятного следующего шага",
          "Устойчивость к отказам: сохраняет доброжелательность даже после резких ответов",
          "CRM-дисциплина: четко фиксирует статус и договоренности по каждому человеку",
          "Командность: качественно передает информацию о лиде коллегам по смене",
        ],
      },
      redFlags: [
        "Навязчивость, манипуляции, создание ложной срочности",
        "Перебивание клиента и монолог вместо вопросов",
        "Бросание лида без фиксации в CRM и без согласованного follow-up",
        "Потеря вежливости при получении отказа",
      ],
      managerAdvice: {
        interviewCheck: "Попросите кандидата рассказать о клубе своими словами за 60 секунд человеку, который никогда не был в спортзале.",
        adaptationHint: "Научить задавать открытые вопросы и вести карточку CRM без пропусков.",
        kpiFocus: "Количество качественных контактов, явка на пробную тренировку/визит.",
      },
    },
    uz: {
      roleKey: "hunter",
      nameRu: "Хантер (Привлечение & Первичный контакт)",
      badge: "🏹 Трафик & Квалификация",
      icon: "Compass",
      headline: "Энергичный проводник новых гостей в мир 35 Health Clubs",
      keyMotto: "«Просто. Безопасно. Эффективно. Честность рождает доверие»",
      targetDomains: [
        { domain: "relationship", importance: "critical" },
        { domain: "influencing", importance: "critical" },
        { domain: "executing", importance: "medium" },
      ],
      primeTalents: [
        { id: 17, nameRu: "Обаяние (Woo)", reason: "Легкость знакомства, обаяние с первой секунды" },
        { id: 25, nameRu: "Позитивность (Positivity)", reason: "Гостеприимность, открытость и теплая энергетика" },
        { id: 12, nameRu: "Общительность (Communication)", reason: "Умение легко разговорить и расположить к себе незнакомого человека" },
        { id: 23, nameRu: "Инклюзивность (Includer)", reason: "Искреннее радушие и принятие каждого собеседника" },
        { id: 10, nameRu: "Катализатор (Activator)", reason: "Высокая скорость обработки входящих заявок" },
        { id: 18, nameRu: "Адаптивность (Adaptability)", reason: "Гибкое переключение между разными людьми в потоке" },
      ],
      disfavoredTalents: [
        { id: 27, nameRu: "Аналитик (Analytical)", reason: "Сухой расчетливый тон вместо теплого вовлечения" },
        { id: 5, nameRu: "Осмотрительность (Deliberative)", reason: "Излишняя осторожность тормозит первый контакт" },
        { id: 32, nameRu: "Интеллект (Intellection)", reason: "Склонность к уединенным размышлениям вместо активного общения" },
      ],
      targetMotivation: {
        primary: "Романтик 🎨",
        secondary: "Результатник 🏆",
        rationale: "Вдохновение от живого общения с людьми, радость от притока новых гостей и выполнения плана встреч.",
      },
      targetPsychotype: {
        primary: "Экспрессив 🟡",
        secondary: "Дружелюбный 🟢",
        rationale: "Теплота, уважение, позитив, умение слушать и располагать к себе.",
      },
      competencies: [
        { name: "Гостеприимный контакт", priority: "critical", description: "Создает искреннее ощущение заботы с первого слова" },
        { name: "Понимание целей человека", priority: "critical", description: "Выясняет личную историю гостя, не спешит называть цену" },
        { name: "Прозрачность условий", priority: "critical", description: "Говорит правду о клубе, не дает пустых гарантий" },
        { name: "Четкость в CRM", priority: "high", description: "Записывает детали разговора для передачи тренеру" },
      ],
      behavioralModel: {
        title: "Поведение идеального Хантера",
        items: [
          "Искренний интерес: встречает каждого гостя как дорогого гостя",
          "Уважение к границам: без панибратства и навязчивости",
          "Скорость связи: не оставляет заявки ждать часами",
          "Поддержка команды: передает теплых гостей в надежные руки тренеров",
        ],
      },
      redFlags: [
        "Сухость и безразличие в голосе",
        "Обещание 'минус 20 кг за месяц' ради галочки",
        "Игнорирование базы обращений",
      ],
      managerAdvice: {
        interviewCheck: "Оцените доброжелательность, улыбку в голосе и готовность слушать собеседника.",
        adaptationHint: "Дать четкое понимание уникальности формата 35-минутных круговых тренировок.",
        kpiFocus: "Конверсия из заявки в первый ознакомительный визит.",
      },
    },
  },

  // ==========================================
  // 3. ТРЕНЕР (TRAINER)
  // ==========================================
  trainer: {
    kz: {
      roleKey: "trainer",
      nameRu: "Тренер 35’ Health Clubs",
      badge: "🏋️‍♂️ Сервис & Экспертиза",
      icon: "Dumbbell",
      headline: "Эксперт по здоровью, специалист сервиса, наставник и главный хранитель ретеншена клуба",
      keyMotto: "«Просто. Безопасно. Эффективно. Человек может прийти в любом состоянии и знать: здесь помогут, а не осудят»",
      targetDomains: [
        { domain: "relationship", importance: "critical" },
        { domain: "executing", importance: "critical" },
        { domain: "strategic", importance: "medium" },
      ],
      primeTalents: [
        { id: 20, nameRu: "Развитие (Developer)", reason: "Видит потенциал в каждом, терпеливо обучает и радуется прогрессу подопечного" },
        { id: 21, nameRu: "Эмпатия (Empathy)", reason: "Тонко чувствует усталость, страх новичка или физический дискомфорт" },
        { id: 9, nameRu: "Восстановление (Restorative)", reason: "Бережно помогает устранить проблему, вернуть человеку тонус и здоровье" },
        { id: 6, nameRu: "Дисциплина (Discipline)", reason: "Строгое соблюдение методики, техники безопасности и порядка" },
        { id: 8, nameRu: "Ответственность (Responsibility)", reason: "Личная надежность, контроль безопасности и забота о людях" },
        { id: 22, nameRu: "Гармония (Harmony)", reason: "Спокойное урегулирование любых трений и создание безопасной среды" },
      ],
      disfavoredTalents: [
        { id: 11, nameRu: "Распорядитель (Command)", reason: "Жесткое давление и командный тон пугают новичков" },
        { id: 13, nameRu: "Конкуренция (Competition)", reason: "Сравнение людей между собой разрушает атмосферу безопасности" },
        { id: 16, nameRu: "Значимость (Significance)", reason: "Самолюбование мешает сосредоточиться на заботе о подопечном" },
      ],
      targetMotivation: {
        primary: "Романтик 🎨",
        secondary: "Бюджетник 🛡️",
        rationale: "Глубокая вовлеченность в помощь людям, ценность здоровья, безопасности и стабильного качества.",
      },
      targetPsychotype: {
        primary: "Дружелюбный 🟢",
        secondary: "Аналитик 🔵",
        rationale: "Теплый, поддерживающий, внимательный наставник, создающий безопасную среду и соблюдающий методику.",
      },
      competencies: [
        { name: "Знание физиологии и методики 35'", priority: "critical", description: "Понимает саркопению, энергообмен, инсулинорезистентность, границы компетенций (не врач)" },
        { name: "Персонализация без стереотипов", priority: "critical", description: "Помнит цели каждого по имени, адаптирует нагрузку, не стыдит за форму" },
        { name: "Внимательность в зале", priority: "critical", description: "Не сидит в телефоне! Контролирует технику, замечает дискомфорт участника" },
        { name: "Простота объяснений", priority: "critical", description: "Сложные вещи простыми словами: зачем тренажер, почему мышцы продлевают жизнь" },
        { name: "Алгоритм урегулирования конфликтов", priority: "high", description: "5 шагов: спокойствие -> выслушать -> факты -> готовность помочь -> решение" },
      ],
      behavioralModel: {
        title: "Поведение идеального Тренера",
        items: [
          "Приходит заранее, готовит зал и встречает резидентов с искренней улыбкой",
          "Постоянно владеет ситуацией в зале, не путает отсутствие жалоб с отсутствием проблем",
          "Работает с потерей мотивации: выясняет скрытую причину пропусков тренировок",
          "Соблюдает стандарты CRM: фото, диагностика, замеры — как часть сервиса",
          "Командность: с этим человеком смена становится сильнее и сплоченнее",
        ],
      },
      redFlags: [
        "Сидит в телефоне во время смены, пока люди тренируются",
        "Стыдит резидентов за лишний вес или слабую выносливость",
        "Ставит медицинские диагнозы и отменяет назначения врачей",
        "Высокомерие, сложные термины ради самолюбования",
        "Раздражительность, перенос личных проблем на гостей",
      ],
      managerAdvice: {
        interviewCheck: "Попросите объяснить за 1 минуту бабушке 65 лет, почему ей жизненно необходимо сохранить мышечную массу.",
        adaptationHint: "Сфокусировать на стандартах безопасности и культуре гостеприимства 35 Health Clubs.",
        kpiFocus: "Продлеваемость резидентов (LTV / Retention), заполняемость смен, NPS гостей.",
      },
    },
    uz: {
      roleKey: "trainer",
      nameRu: "Тренер 35’ Health Clubs",
      badge: "🏋️‍♂️ Сервис & Экспертиза",
      icon: "Dumbbell",
      headline: "Заботливый наставник по здоровью и амбассадор активного долголетия",
      keyMotto: "«Просто. Безопасно. Эффективно. С заботой к каждому гостю»",
      targetDomains: [
        { domain: "relationship", importance: "critical" },
        { domain: "executing", importance: "critical" },
        { domain: "strategic", importance: "medium" },
      ],
      primeTalents: [
        { id: 20, nameRu: "Развитие (Developer)", reason: "Искренняя гордость за каждый шаг подопечного к здоровью" },
        { id: 21, nameRu: "Эмпатия (Empathy)", reason: "Чуткость к эмоциональному состоянию и страхам новичков" },
        { id: 9, nameRu: "Восстановление (Restorative)", reason: "Внимательное решение проблем с самочувствием и техникой" },
        { id: 6, nameRu: "Дисциплина (Discipline)", reason: "Строгое следование регламентам и порядку" },
        { id: 8, nameRu: "Ответственность (Responsibility)", reason: "Надежность, безопасность и забота о каждом человеке" },
        { id: 22, nameRu: "Гармония (Harmony)", reason: "Создание доброжелательной, бесконфликтной атмосферы" },
      ],
      disfavoredTalents: [
        { id: 11, nameRu: "Распорядитель (Command)", reason: "Резкость и давление отталкивают подопечных" },
        { id: 13, nameRu: "Конкуренция (Competition)", reason: "Соревновательность вредит бережному наставничеству" },
        { id: 16, nameRu: "Значимость (Significance)", reason: "Фокус на собственном эго вместо внимания к людям" },
      ],
      targetMotivation: {
        primary: "Романтик 🎨",
        secondary: "Бюджетник 🛡️",
        rationale: "Желание помогать людям быть здоровыми, соблюдение стандартов безопасности и уважение в коллективе.",
      },
      targetPsychotype: {
        primary: "Дружелюбный 🟢",
        secondary: "Аналитик 🔵",
        rationale: "Забота, уважение к старшим, деликатность и аккуратность в методике.",
      },
      competencies: [
        { name: "Безопасность и методика", priority: "critical", description: "Контроль пульса, суставов, правильности дыхания" },
        { name: "Уважительная поддержка", priority: "critical", description: "Создание атмосферы, где не стыдно спросить о помощи" },
        { name: "Контроль зала без отвлечений", priority: "critical", description: "Фокус 100% на людях, телефон в шкафчике" },
        { name: "Забота при пропусках", priority: "high", description: "Теплый контакт с теми, кто перестал посещать зал" },
      ],
      behavioralModel: {
        title: "Поведение идеального Тренера",
        items: [
          "Истинное гостеприимство: помнит каждого гостя по имени",
          "Постоянное внимание: подходит первым, помогает настроить тренажер",
          "Уважение к границам: профессиональная дистанция без фамильярности",
          "Честность: если не знает ответа — консультируется со старшим тренером",
        ],
      },
      redFlags: [
        "Отвлечение на телефон и посторонние разговоры в зале",
        "Сравнение результатов людей между собой",
        "Опоздания и небрежный внешний вид",
      ],
      managerAdvice: {
        interviewCheck: "Проверьте эмпатию и отношение к клиентам с избыточным весом или пожилым людям.",
        adaptationHint: "Обучить стандартам 35-минутного кругового тренинга и работе с CRM.",
        kpiFocus: "Посещаемость смен, удовлетворенность гостей, процент продлений.",
      },
    },
  },

  // ==========================================
  // 4. HR (РЕКРУТЕР МАССОВОГО НАЙМА)
  // ==========================================
  hr: {
    kz: {
      roleKey: "hr",
      nameRu: "HR-Рекрутер (Массовый подбор)",
      badge: "👥 Воронка & Скорость найма",
      icon: "UserCheck",
      headline: "Системный и результативный архитектор массовой воронки найма промоутеров, тренеров и КЦ",
      keyMotto: "«Инициативность + результативность + системность + высокая скорость работы»",
      targetDomains: [
        { domain: "executing", importance: "critical" },
        { domain: "strategic", importance: "critical" },
        { domain: "relationship", importance: "high" },
      ],
      primeTalents: [
        { id: 24, nameRu: "Индивидуализация (Individualization)", reason: "Точное считывание мотивов, психотипа и сильных сторон каждого соискателя" },
        { id: 2, nameRu: "Организатор (Arranger)", reason: "Системное управление воронкой, потоками собеседований и координацией групп" },
        { id: 27, nameRu: "Аналитик (Analytical)", reason: "Анализ конверсий этапов воронки и оценка людей по фактам, а не симпатиям" },
        { id: 1, nameRu: "Достижение (Achiever)", reason: "Фокус на конечном плане выходов сотрудников, а не на процессе звонков" },
        { id: 8, nameRu: "Ответственность (Responsibility)", reason: "Выполнение обязательств по срокам и качеству закрытия вакансий" },
        { id: 5, nameRu: "Осмотрительность (Deliberative)", reason: "Проницательность на интервью, выявление рисков и неискренности кандидатов" },
      ],
      disfavoredTalents: [
        { id: 18, nameRu: "Адаптивность (Adaptability)", reason: "Работа по настроению без системного контроля воронки ведет к срыву плана найма" },
        { id: 20, nameRu: "Развитие (Developer)", reason: "Склонность долго перевоспитывать неподходящих людей вместо точного отбора" },
      ],
      targetMotivation: {
        primary: "Результатник 🏆",
        secondary: "Бюджетник 🛡️",
        rationale: "Ориентация на фактические выходы сотрудников, системный порядок в воронке и выполнение плана найма.",
      },
      targetPsychotype: {
        primary: "Аналитик 🔵",
        secondary: "Директив 🔴",
        rationale: "Структурный, проницательный, результативный подход к воронке и объективной оценке кандидатов.",
      },
      competencies: [
        { name: "Ориентация на результат и план найма", priority: "critical", description: "Оценивает себя по выходам на работу, а не по количеству звонков" },
        { name: "Управление воронкой и конверсиями", priority: "critical", description: "Самостоятельно анализирует причины потерь кандидатов и чинит этапы" },
        { name: "Быстрый контакт и интерес к вакансии", priority: "critical", description: "Умеет зажечь кандидата условиями 35 Health Clubs" },
        { name: "Владение CRM, таблицами и цифрами", priority: "high", description: "Аккуратная база, знание конверсий назначения в явку и в выход" },
      ],
      behavioralModel: {
        title: "Поведение идеального HR-Рекрутера",
        items: [
          "При большом потоке: расставляет приоритеты, не теряет кандидатов, контролирует этапы",
          "При низкой доходимости: анализирует воронку, тестирует новые точки касания",
          "При невыполнении плана: не ищет оправданий в откликах, а предлагает конкретные меры",
          "В отсутствие руководителя: автономно ведет процесс и держит согласованный темп",
        ],
      },
      ivanovaProfile: {
        reference: "Смешанный с преобладанием внутренней (самостоятельно принимает решения, не ждет одобрения)",
        motivationVector: "Преобладание стремления (к целям и рекордам, а не бегство от замечаний)",
        processResult: "Преимущественно Результат (важен факт выхода качественного сотрудника)",
        proceduresOpportunities: "Смешанный с уклоном в возможности (предлагает новые каналы и форматы найма)",
        activityReflectivity: "Преимущественная активность (быстрый переход от проблемы к тестам и действиям)",
        teamRole: "Самостоятельный командный игрок (ведет свои вакансии автономно, помогает РОПам)",
      },
      redFlags: [
        "Позиция 'я сделала 100 звонков, откликов нет — я не виновата'",
        "Беспорядок в базе соискателей, потеря кандидатов",
        "Неспособность анализировать цифры и этапы воронки",
        "Оценка кандидатов 'по интуиции/нравится', а не по фактам",
        "Неуважительная коммуникация и скрытие ошибок от руководства",
      ],
      managerAdvice: {
        interviewCheck: "Попросите кандидата назвать конверсию из отклика в выход на прошлом месте и что он делал, когда доходимость упала в 2 раза.",
        adaptationHint: "С первых дней дать четкие плановые нормативы отдельно по промоутерам, тренерам и колл-центру.",
        kpiFocus: "Количество фактически вышедших сотрудников, сохранность после испытательного срока, стоимость найма.",
      },
    },
    uz: {
      roleKey: "hr",
      nameRu: "HR-Рекрутер (Массовый подбор)",
      badge: "👥 Команда & Отбор",
      icon: "UserCheck",
      headline: "Инициативный создатель сильной команды 35 Health Clubs",
      keyMotto: "«Качественные сотрудники в срок и снижение ранней текучести»",
      targetDomains: [
        { domain: "executing", importance: "critical" },
        { domain: "strategic", importance: "critical" },
        { domain: "relationship", importance: "high" },
      ],
      primeTalents: [
        { id: 24, nameRu: "Индивидуализация (Individualization)", reason: "Точная оценка мотивов, характера и сильных сторон каждого кандидата" },
        { id: 2, nameRu: "Организатор (Arranger)", reason: "Четкая координация потоков кандидатов, этапов отбора и расписаний" },
        { id: 27, nameRu: "Аналитик (Analytical)", reason: "Решения на основе фактов, цифр воронки и объективных критериев" },
        { id: 1, nameRu: "Достижение (Achiever)", reason: "Ответственность за своевременное закрытие вакансий до результата" },
        { id: 8, nameRu: "Ответственность (Responsibility)", reason: "Дисциплина, честность и ответственность за выход людей" },
        { id: 5, nameRu: "Осмотрительность (Deliberative)", reason: "Тщательный фильтр рисков и проверка надежности кандидатов" },
      ],
      disfavoredTalents: [
        { id: 18, nameRu: "Адаптивность (Adaptability)", reason: "Отсутствие системности и структуры в ведении базы кандидатов" },
        { id: 20, nameRu: "Развитие (Developer)", reason: "Попытки тянуть слабых кандидатов вместо жесткого соблюдения критериев отбора" },
      ],
      targetMotivation: {
        primary: "Результатник 🏆",
        secondary: "Бюджетник 🛡️",
        rationale: "Ориентация на выполнение плана закрытия вакансий и системное качество отбора.",
      },
      targetPsychotype: {
        primary: "Аналитик 🔵",
        secondary: "Директив 🔴",
        rationale: "Объективность к профессиональным критериям в сочетании с четким управлением воронкой.",
      },
      competencies: [
        { name: "Самостоятельность в подборе", priority: "critical", description: "Не ждет указаний, сам тестирует каналы в Telegram, OLX, HeadHunter" },
        { name: "Оценка мотивации кандидата", priority: "critical", description: "Выявляет истинные финансовые ожидания и готовность работать в темпе" },
        { name: "Контроль воронки до адаптации", priority: "critical", description: "Сопровождает нового сотрудника до успешного завершения обучения" },
        { name: "Решения на основе фактов", priority: "high", description: "Отказ от субъективщины в пользу измеримых навыков" },
      ],
      behavioralModel: {
        title: "Поведение идеального HR-Рекрутера",
        items: [
          "Самостоятельно планирует рабочий день и использует разные источники поиска",
          "При сложностях с закрытием не разводит руками, а предлагает конкретные решения",
          "Взаимодействует с управляющими клубов и быстро собирает обратную связь",
          "Обеспечивает выход сотрудников, которые остаются работать надолго",
        ],
      },
      redFlags: [
        "Ожидание указаний руководителя по каждому шагу",
        "Наем людей 'лишь бы закрыть дыру в смене'",
        "Игнорирование фактов ранней текучести",
      ],
      managerAdvice: {
        interviewCheck: "Узнайте, как кандидат проверяет благонадежность и мотивацию потенциального тренера или промоутера.",
        adaptationHint: "Синхронизировать портрет идеального кандидата с управляющими локаций.",
        kpiFocus: "Срок закрытия вакансии, процент прохождения испытательного срока.",
      },
    },
  },

  // ==========================================
  // 5. ПРОМОУТЕР (В РАЗРАБОТКЕ / РЕЗЕРВ)
  // ==========================================
  promoter: {
    kz: {
      roleKey: "promoter",
      nameRu: "Промоутер (Входящий поток)",
      badge: "📢 Активность на локации",
      icon: "Megaphone",
      headline: "Энергичный двигатель первичного трафика и уличной коммуникации",
      keyMotto: "«Энергия, позитив и смелость первого шага»",
      targetDomains: [
        { domain: "influencing", importance: "critical" },
        { domain: "relationship", importance: "high" },
      ],
      primeTalents: [
        { id: 17, nameRu: "Обаяние (Woo)", reason: "Легкость контакта на улице и в ТЦ" },
        { id: 25, nameRu: "Позитивность (Positivity)", reason: "Неиссякаемый запас энергии" },
        { id: 10, nameRu: "Катализатор (Activator)", reason: "Высокая динамика действий" },
      ],
      targetMotivation: { primary: "Денежник 💰", secondary: "Результатник 🏆", rationale: "Оплата за каждый собранный лид." },
      targetPsychotype: { primary: "Экспрессив 🟡", secondary: "Директив 🔴", rationale: "Яркость и напор." },
      competencies: [{ name: "Активность", priority: "critical", description: "Сбор контактов" }],
      behavioralModel: { title: "Профиль промоутера", items: ["Энергия", "Смелость"] },
      redFlags: ["Стеснительность", "Пассивность"],
      managerAdvice: { interviewCheck: "Проверка активности", adaptationHint: "Бонус за результат", kpiFocus: "Лиды" },
    },
    uz: {
      roleKey: "promoter",
      nameRu: "Промоутер (Входящий поток)",
      badge: "📢 Активность на локации",
      icon: "Megaphone",
      headline: "Энергичный двигатель первичного трафика и уличной коммуникации",
      keyMotto: "«Энергия, позитив и смелость первого шага»",
      targetDomains: [
        { domain: "influencing", importance: "critical" },
        { domain: "relationship", importance: "high" },
      ],
      primeTalents: [
        { id: 17, nameRu: "Обаяние (Woo)", reason: "Легкость контакта на улице и в ТЦ" },
        { id: 25, nameRu: "Позитивность (Positivity)", reason: "Неиссякаемый запас энергии" },
        { id: 10, nameRu: "Катализатор (Activator)", reason: "Высокая динамика действий" },
      ],
      targetMotivation: { primary: "Денежник 💰", secondary: "Результатник 🏆", rationale: "Оплата за каждый собранный лид." },
      targetPsychotype: { primary: "Экспрессив 🟡", secondary: "Директив 🔴", rationale: "Яркость и напор." },
      competencies: [{ name: "Активность", priority: "critical", description: "Сбор контактов" }],
      behavioralModel: { title: "Профиль промоутера", items: ["Энергия", "Смелость"] },
      redFlags: ["Стеснительность", "Пассивность"],
      managerAdvice: { interviewCheck: "Проверка активности", adaptationHint: "Бонус за результат", kpiFocus: "Лиды" },
    },
  },

  custom: {
    kz: {
      roleKey: "custom",
      nameRu: "Сотрудник компании",
      badge: "⭐ Команда 35",
      icon: "User",
      headline: "Универсальный профиль сотрудника 35 Health Clubs",
      keyMotto: "«Просто. Безопасно. Эффективно»",
      targetDomains: [{ domain: "executing", importance: "high" }, { domain: "relationship", importance: "high" }],
      primeTalents: [{ id: 1, nameRu: "Достижение", reason: "Результативность" }, { id: 8, nameRu: "Ответственность", reason: "Надежность" }],
      targetMotivation: { primary: "Результатник 🏆", secondary: "Денежник 💰", rationale: "Баланс дохода и дела." },
      targetPsychotype: { primary: "Дружелюбный 🟢", secondary: "Директив 🔴", rationale: "Командность и порядок." },
      competencies: [{ name: "Ответственность", priority: "critical", description: "Качество работы" }],
      behavioralModel: { title: "Базовые стандарты", items: ["Честность", "Клиентоориентированность"] },
      redFlags: ["Безответственность"],
      managerAdvice: { interviewCheck: "Оценка лояльности", adaptationHint: "Стандарты сервиса", kpiFocus: "Качество" },
    },
    uz: {
      roleKey: "custom",
      nameRu: "Сотрудник компании",
      badge: "⭐ Команда 35",
      icon: "User",
      headline: "Универсальный профиль сотрудника 35 Health Clubs",
      keyMotto: "«Просто. Безопасно. Эффективно»",
      targetDomains: [{ domain: "executing", importance: "high" }, { domain: "relationship", importance: "high" }],
      primeTalents: [{ id: 1, nameRu: "Достижение", reason: "Результативность" }, { id: 8, nameRu: "Ответственность", reason: "Надежность" }],
      targetMotivation: { primary: "Результатник 🏆", secondary: "Денежник 💰", rationale: "Баланс дохода и дела." },
      targetPsychotype: { primary: "Дружелюбный 🟢", secondary: "Директив 🔴", rationale: "Командность и порядок." },
      competencies: [{ name: "Ответственность", priority: "critical", description: "Качество работы" }],
      behavioralModel: { title: "Базовые стандарты", items: ["Честность", "Клиентоориентированность"] },
      redFlags: ["Безответственность"],
      managerAdvice: { interviewCheck: "Оценка лояльности", adaptationHint: "Стандарты сервиса", kpiFocus: "Качество" },
    },
  },
};

export interface RoleMatchResult {
  matchPercentage: number;
  grade: "ideal" | "recommended" | "conditional" | "low";
  gradeTitle: string;
  gradeColor: string;
  matchedPrimeTalents: { id: number; nameRu: string; rank: number }[];
  missingPrimeTalents: { id: number; nameRu: string }[];
  domainAlignmentScore: number;
  motivationMatch: boolean;
  psychotypeMatch: boolean;
  benchmark: RoleBenchmark;
  verdict: string;
}

/**
 * Orthogonal Role-Matching Engine 3.0:
 * Evaluates candidate fit (0-100%) using:
 * 1. Core Signature Talents (first 3 in primeTalents, 1.5x weight) + Supporting Prime Talents (1.0x weight)
 * 2. Core Gatekeeper verification (penalizes roles where candidate lacks all 3 defining core signature talents)
 * 3. Anti-Marker / Disfavored Talents penalty (subtracts points if opposing traits are in candidate's Top 8)
 * 4. Domain Alignment, Motivation Vector & Psychotype Synergy
 */
export function calculateRoleMatch(
  results: AssessmentResult,
  roleKey: CoreRoleKey,
  country: CountryCode = "kz"
): RoleMatchResult {
  const benchmarkGroup = ROLE_BENCHMARKS[roleKey] || ROLE_BENCHMARKS.closer;
  const benchmark = benchmarkGroup[country] || benchmarkGroup.kz;

  const top5Ids = (results.top5 || []).map((t) => t.id);
  const top10Ids = (results.allRanked || []).slice(0, 10).map((t) => t.id);
  const top15Ids = (results.allRanked || []).slice(0, 15).map((t) => t.id);

  // 1. Prime Talents Match with Core Signature Weighting
  let talentPoints = 0;
  let coreHitsInTop7 = 0;
  let coreHitsInTop12 = 0;

  const matchedPrimeTalents: { id: number; nameRu: string; rank: number }[] = [];
  const missingPrimeTalents: { id: number; nameRu: string }[] = [];

  benchmark.primeTalents.forEach((pt, idx) => {
    const isCoreSignature = idx < 3; // First 3 talents are the role's unique DNA signature
    const weight = isCoreSignature ? 1.55 : 1.0;

    const foundRankIndex = (results.allRanked || []).findIndex((t) => {
      if (t.id === pt.id) return true;
      if (t.slug && pt.nameRu.toLowerCase().includes(t.slug.toLowerCase())) return true;
      const cleanPt = pt.nameRu.split(" ")[0].toLowerCase();
      if (t.nameRu && t.nameRu.toLowerCase().startsWith(cleanPt.slice(0, 4))) return true;
      return false;
    });

    const rank = foundRankIndex !== -1 ? foundRankIndex + 1 : 34;
    const realTalentId = foundRankIndex !== -1 ? results.allRanked[foundRankIndex].id : pt.id;
    const realTalentName = foundRankIndex !== -1 ? results.allRanked[foundRankIndex].nameRu : pt.nameRu;

    if (isCoreSignature) {
      if (rank <= 7) coreHitsInTop7++;
      if (rank <= 12) coreHitsInTop12++;
    }

    if (top5Ids.includes(realTalentId) || rank <= 5) {
      talentPoints += (rank <= 3 ? 15 : 13) * weight;
      matchedPrimeTalents.push({ id: realTalentId, nameRu: realTalentName, rank });
    } else if (top10Ids.includes(realTalentId) || rank <= 10) {
      talentPoints += 9.5 * weight;
      matchedPrimeTalents.push({ id: realTalentId, nameRu: realTalentName, rank });
    } else if (top15Ids.includes(realTalentId) || rank <= 15) {
      talentPoints += 5.5 * weight;
      matchedPrimeTalents.push({ id: realTalentId, nameRu: realTalentName, rank });
    } else if (rank <= 20) {
      talentPoints += 2.5 * weight;
    } else {
      missingPrimeTalents.push({ id: realTalentId, nameRu: realTalentName });
    }
  });

  // Realistic maximum target for talents (50 points weight)
  const maxRealisticTalentPts = Math.min(benchmark.primeTalents.length * 10.5, 56);
  const talentRatio = maxRealisticTalentPts > 0 ? Math.min(1, talentPoints / maxRealisticTalentPts) : 0.7;

  // 2. Anti-Marker / Disfavored Talents Penalty & Core Gatekeeper Adjustment
  let roleSpecificAdjustment = 0;

  if (benchmark.disfavoredTalents && benchmark.disfavoredTalents.length > 0) {
    for (const dt of benchmark.disfavoredTalents) {
      const foundIdx = (results.allRanked || []).findIndex((t) => t.id === dt.id);
      const rank = foundIdx !== -1 ? foundIdx + 1 : 34;
      if (rank <= 3) {
        roleSpecificAdjustment -= 6.5;
      } else if (rank <= 5) {
        roleSpecificAdjustment -= 4.5;
      } else if (rank <= 8) {
        roleSpecificAdjustment -= 2.5;
      }
    }
  }

  // Core Gatekeeper check for the 4 specialized roles
  if (benchmark.primeTalents.length >= 5) {
    if (coreHitsInTop12 === 0) {
      // Candidate has 0 of the 3 defining Core Signature talents in their Top 12
      roleSpecificAdjustment -= 14;
    } else if (coreHitsInTop7 === 0) {
      // Candidate has 0 of the 3 defining Core Signature talents in their Top 7
      roleSpecificAdjustment -= 6;
    } else if (coreHitsInTop7 >= 2) {
      // Candidate has 2 or all 3 of the role's Core Signature talents in their Top 7
      roleSpecificAdjustment += 5;
    }
  }

  // 3. Domain Alignment (up to 25 points)
  const targetDomainKeys = benchmark.targetDomains.map((d) => d.domain);
  const top5InTargetDomains = (results.top5 || []).filter((t) => targetDomainKeys.includes(t.domain)).length;

  const domPointsTotal = (results.domains || []).reduce((acc, d) => {
    if (targetDomainKeys.includes(d.domain)) {
      const weight = benchmark.targetDomains.find((td) => td.domain === d.domain)?.importance === "critical" ? 1.4 : 1.0;
      return acc + d.percentage * weight;
    }
    return acc;
  }, 0);

  const isDominantTarget = targetDomainKeys.includes(results.dominantDomain);
  const targetTop5Share = top5InTargetDomains / 5;

  const domainRatio = Math.min(
    1,
    Math.max(0.35, (domPointsTotal / 52) * 0.5 + targetTop5Share * 0.3 + (isDominantTarget ? 0.2 : 0.05))
  );

  // 4. Motivation Match (up to 15 points)
  let motivationPoints = 6;
  const primMotiv = (results.motivation?.dominant?.nameRu || "").toLowerCase();
  const secMotiv = (results.motivation?.all?.[1]?.nameRu || "").toLowerCase();
  const targetPrimMotiv = benchmark.targetMotivation.primary.slice(0, 4).toLowerCase();
  const targetSecMotiv = benchmark.targetMotivation.secondary.slice(0, 4).toLowerCase();

  const motivationMatch = primMotiv.includes(targetPrimMotiv);

  if (motivationMatch) {
    motivationPoints = 15;
  } else if (secMotiv.includes(targetPrimMotiv)) {
    motivationPoints = 12;
  } else if (primMotiv.includes(targetSecMotiv)) {
    motivationPoints = 11;
  } else if (secMotiv.includes(targetSecMotiv)) {
    motivationPoints = 9;
  }

  // 5. Psychotype Match (up to 10 points)
  let psychotypePoints = 4;
  const primPsycho = (results.psychotype?.dominant?.nameRu || "").toLowerCase();
  const secPsycho = (results.psychotype?.all?.[1]?.nameRu || "").toLowerCase();
  const targetPrimPsycho = benchmark.targetPsychotype.primary.slice(0, 4).toLowerCase();
  const targetSecPsycho = benchmark.targetPsychotype.secondary.slice(0, 4).toLowerCase();

  const psychotypeMatch = primPsycho.includes(targetPrimPsycho);

  if (psychotypeMatch) {
    psychotypePoints = 10;
  } else if (secPsycho.includes(targetPrimPsycho)) {
    psychotypePoints = 8;
  } else if (primPsycho.includes(targetSecPsycho)) {
    psychotypePoints = 7;
  } else if (secPsycho.includes(targetSecPsycho)) {
    psychotypePoints = 6;
  }

  // Calculate Total Percentage (Weighted + Orthogonal Adjustments)
  const totalRaw =
    talentRatio * 50 +
    domainRatio * 25 +
    motivationPoints +
    psychotypePoints +
    roleSpecificAdjustment;
  const matchPercentage = Math.round(Math.min(98, Math.max(32, totalRaw)));

  let grade: "ideal" | "recommended" | "conditional" | "low" = "recommended";
  let gradeTitle = "Высокая совместимость (A)";
  let gradeColor = "text-teal-700 bg-teal-50 border-teal-300";
  let verdict = `Кандидат обладает хорошим потенциалом для роли «${benchmark.nameRu}». Ключевые суперсилы гармонично поддерживают рабочие задачи.`;

  if (matchPercentage >= 85) {
    grade = "ideal";
    gradeTitle = "Идеальное попадание (A+)";
    gradeColor = "text-emerald-700 bg-emerald-50 border-emerald-300";
    verdict = `Прирожденный специалист для позиции «${benchmark.nameRu}»! Высочайшая концентрация ключевых талантов, врожденный драйвер и психотип полностью соответствуют эталону.`;
  } else if (matchPercentage >= 72) {
    grade = "recommended";
    gradeTitle = "Высокая совместимость (A)";
    gradeColor = "text-teal-700 bg-teal-50 border-teal-300";
    verdict = `Рекомендуется на должность «${benchmark.nameRu}». Сильный природный фундамент; после быстрой адаптации и изучения регламентов выйдет на плановые KPI.`;
  } else if (matchPercentage >= 60) {
    grade = "conditional";
    gradeTitle = "Хороший потенциал (B)";
    gradeColor = "text-amber-700 bg-amber-50 border-amber-300";
    verdict = `Хороший потенциал для роли «${benchmark.nameRu}». Развитые сильные стороны частично перекрывают задачи; рекомендуется опытное наставничество в период адаптации.`;
  } else {
    grade = "low";
    gradeTitle = "Альтернативный профиль (C)";
    gradeColor = "text-slate-700 bg-slate-100 border-slate-300";
    verdict = `Профиль сотрудника больше ориентирован на другие векторы компании. Рекомендуется обратить внимание на более подходящую для него роль, где его суперсилы принесут максимальный результат.`;
  }

  return {
    matchPercentage,
    grade,
    gradeTitle,
    gradeColor,
    matchedPrimeTalents,
    missingPrimeTalents,
    domainAlignmentScore: Math.round(domainRatio * 100),
    motivationMatch,
    psychotypeMatch,
    benchmark,
    verdict,
  };
}

/**
 * Normalizes user free-text or selected role to CoreRoleKey
 */
export function normalizeRoleKey(roleString?: string): CoreRoleKey {
  if (!roleString) return "custom";
  const r = roleString.toLowerCase();
  if (r.includes("клоуз") || r.includes("close") || r.includes("продаж") || r.includes("дожим")) return "closer";
  if (r.includes("хант") || r.includes("hunt") || r.includes("первич") || r.includes("квалифик")) return "hunter";
  if (r.includes("трен") || r.includes("инструкт") || r.includes("coach") || r.includes("спорт")) return "trainer";
  if (r.includes("hr") || r.includes("рекрут") || r.includes("кадр") || r.includes("найм")) return "hr";
  if (r.includes("промо") || r.includes("лидоген")) return "promoter";
  return "custom";
}

export interface BestRoleRecommendation {
  bestMatch: RoleMatchResult;
  allMatches: RoleMatchResult[];
  chosenRoleMatch?: RoleMatchResult;
  whySuitable: {
    headline: string;
    summary: string;
    strengthsBreakdown: string[];
    motivationReason: string;
    psychotypeReason: string;
    domainReason: string;
    growthAdvice: string;
  };
  discrepancyNote?: string;
}

/**
 * Evaluates candidate against all core 35 Health Clubs roles and returns ranked matches
 * with in-depth explanations on why the #1 role is the candidate's natural calling.
 */
export function analyzeBestRoleFit(
  results: AssessmentResult,
  chosenRoleString?: string,
  country: CountryCode = "kz"
): BestRoleRecommendation {
  const candidateRoleKeys: CoreRoleKey[] = ["closer", "hunter", "trainer", "hr"];
  const allMatches: RoleMatchResult[] = candidateRoleKeys
    .map((rk) => calculateRoleMatch(results, rk, country))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  const bestMatch = allMatches[0];
  const chosenKey = normalizeRoleKey(chosenRoleString);
  const chosenRoleMatch = chosenRoleString
    ? calculateRoleMatch(results, chosenKey, country)
    : undefined;

  const topTalentNames = (results.top5 || []).map((t) => t.nameRu).slice(0, 3).join(", ");
  const domName =
    results.dominantDomain === "influencing"
      ? "Влияние (Лидерство и Продажи)"
      : results.dominantDomain === "executing"
      ? "Исполнение (Дисциплина и Доведение до конца)"
      : results.dominantDomain === "relationship"
      ? "Построение отношений (Сервис и Доверие)"
      : "Стратегическое мышление (Аналитика и Планирование)";

  const motivName = results.motivation?.dominant?.nameRu || "Результативность";
  const psychoName = results.psychotype?.dominant?.nameRu || "Коммуникативный";

  let headline = "";
  let summary = "";
  let strengthsBreakdown: string[] = [];
  let motivationReason = "";
  let psychotypeReason = "";
  let domainReason = "";
  let growthAdvice = "";

  switch (bestMatch.benchmark.roleKey) {
    case "closer":
      headline = "Природный переговорщик, снайпер закрытия сделок и дожима результата";
      summary = `На основе комплексного аудита 34 талантов Gallup и мотивационного профиля, ваша наиболее гармоничная и сверхрезультативная роль в 35 Health Clubs — «${bestMatch.benchmark.nameRu}» (${bestMatch.matchPercentage}% совпадения). Вы обладаете врожденной смелостью называть цену, управлять ходом переговоров и дожимать сделки там, где другие сдаются.`;
      strengthsBreakdown = [
        `Ключевые таланты (${topTalentNames}) дают вам психологическое преимущество: вы не боитесь прямого диалога об оплате и естественно берете инициативу в свои руки.`,
        `Врожденный драйв к достижению целей заставляет вас ежедневно отслеживать цифры личного плана и искать новые возможности для закрытия сделок.`,
        `Вы способны доносить истинную ценность клубного абонемента выше его цены, не скатываясь в скидки и уступки.`
      ];
      motivationReason = `Ваш тип мотивации («${motivName}») идеально накладывается на систему премирования Клоузера: прозрачная бонусная шкала от выручки дает вам максимальный стимул выкладываться на полную мощность.`;
      psychotypeReason = `Ваш психотип («${psychoName}») позволяет уверенно удерживать рамку диалога (правило 30/70), считывать сомнения клиента и закрывать сделку альтернативным вопросом.`;
      domainReason = `Доминирующий домен («${domName}») обеспечивает колоссальную стрессоустойчивость к отказам — вы воспринимаете возражения не как личную обиду, а как рабочий шаг к согласию.`;
      growthAdvice = "Внедрите жесткую дисциплину ведения CRM и WhatsApp: делайте от 3 до 5 контрольных касаний по зависшим лидам в первые 24 часа.";
      break;

    case "hunter":
      headline = "Мастер открытия потребностей, первого контакта и вовлечения трафика";
      summary = `Ваш психопрофиль максимально раскрывается в роли «${bestMatch.benchmark.nameRu}» (${bestMatch.matchPercentage}% совпадения). Вы обладаете редким талантом вызывать доверие с первых 15 секунд диалога, мастерски задавать открытые вопросы и вовлекать новых людей в клубное сообщество 35 Health Clubs.`;
      strengthsBreakdown = [
        `Ваши ведущие таланты (${topTalentNames}) позволяют быстро сонастраиваться с абсолютно любым человеком, снимая барьеры настороженности и недоверия.`,
        `Вы не продаете «в лоб», а мастерски выявляете истинные глубинные боли клиента (усталость, боли в спине, нехватка тонуса) и создаете мощную ценность первого визита.`,
        `Высокая скорость реакции и контактность обеспечивают идеальную отработку входящего потока без потери лидов.`
      ];
      motivationReason = `Ваш мотивационный профиль («${motivName}») черпает энергию от постоянного притока новых людей, динамики общения и чувства первой победы при назначении встречи.`;
      psychotypeReason = `Стиль коммуникации («${psychoName}») формирует безопасную доверительную среду, где клиент с удовольствием раскрывает свои реальные фитнес-цели.`;
      domainReason = `Доминирующий домен («${domName}») помогает поддерживать высокий темп коммуникаций без эмоционального спада на протяжении всего рабочего дня.`;
      growthAdvice = "Категорически избегайте ценового демпинга и ложной спешки при первом контакте. Продавайте следующий шаг (визит в клуб на диагностику), а не контракт в трубку.";
      break;

    case "trainer":
      headline = "Проводник к здоровью, сервисный лидер и эксперт заботы о теле";
      summary = `Ваше истинное призвание — «${bestMatch.benchmark.nameRu}» (${bestMatch.matchPercentage}% совпадения). Ваш психологический рисунок основан на искреннем желании помогать людям, бережном отношении к телу и принципах клуба: «Просто. Безопасно. Эффективно».`;
      strengthsBreakdown = [
        `Таланты (${topTalentNames}) дают вам глубокое сопереживание и терпение в работе с клиентами любого уровня подготовки и возраста.`,
        `Вы никогда не используете чувство стыда или вины за лишний вес — ваш подход базируется на уважении, позитивном подкреплении и физиологической безопасности.`,
        `Способность доступно объяснять биомеханику и профилактику саркопении делает каждую тренировку понятной и комфортной для резидента.`
      ];
      motivationReason = `Ваша мотивация («${motivName}») раскрывается через благодарность клиентов, их избавление от болей в спине и видимый физический прогресс от тренировок.`;
      psychotypeReason = `Стиль («${psychoName}») мгновенно деэскалирует напряжение и создает атмосферу абсолютного психологического комфорта в тренажерном зале.`;
      domainReason = `Доминирующий домен («${domName}») обеспечивает надежность, пунктуальность и высочайший уровень сервисной культуры.`;
      growthAdvice = "При возникновении любых претензий используйте фирменный протокол 35 Health Clubs: Внимательно выслушать ➔ Признать чувства ➔ Предложить решение без спора.";
      break;

    case "hr":
      headline = "Архитектор сильной команды, эксперт оценки и управления воронкой найма";
      summary = `Ваш потенциал на 100% соответствует роли «${bestMatch.benchmark.nameRu}» (${bestMatch.matchPercentage}% совпадения). Вы обладаете развитым чутьем на потенциал людей, системным мышлением и моделью поведения Светланы Ивановой: внутренняя референция, ориентация на результат выходов и постоянный поиск новых возможностей.`;
      strengthsBreakdown = [
        `Ключевые таланты (${topTalentNames}) позволяют сканировать истинную мотивацию кандидатов и видеть за резюме реальный рабочий потенциал.`,
        `Вы не останавливаетесь на формальных отчетах («я сделала 100 звонков»), а держите фокус на ключевом показателе — фактическом выходе сильных сотрудников на стажировку.`,
        `Инициативность и скорость: при снижении доходимости вы самостоятельно тестируете новые каналы и скрипты привлечения.`
      ];
      motivationReason = `Ваш тип («${motivName}») подпитывается масштабом влияния: каждый нанятый вами сильный тренер или клоузер делает компанию сильнее и успешнее.`;
      psychotypeReason = `Стиль («${psychoName}») обеспечивает баланс дружелюбия и твердости: вы располагаете соискателя, но глубоко калибруете его на стрессоустойчивость и ценности.`;
      domainReason = `Доминирующий домен («${domName}») гарантирует аналитическую строгость и системный порядок в воронке кандидатов.`;
      growthAdvice = "Управляйте не только воронкой найма, но и первыми 14 днями адаптации сотрудников, минимизируя раннюю текучесть кадров.";
      break;

    default:
      headline = `Оптимальная роль: ${bestMatch.benchmark.nameRu}`;
      summary = `Ваши сильные стороны максимально эффективно раскрываются на позиции «${bestMatch.benchmark.nameRu}» (${bestMatch.matchPercentage}% совместимости).`;
      strengthsBreakdown = [
        `Ваши таланты (${topTalentNames}) создают сильный рабочий фундамент для этой профессии.`
      ];
      motivationReason = `Тип мотивации («${motivName}») обеспечивает устойчивый интерес к задачам роли.`;
      psychotypeReason = `Психотип («${psychoName}») помогает гармонично взаимодействовать с коллегами и клиентами.`;
      domainReason = `Домен («${domName}») гарантирует надежность выполнения функциональных обязанностей.`;
      growthAdvice = "Развивайте сильные стороны и опирайтесь на синергию с коллегами в менее развитых зонах.";
      break;
  }

  let discrepancyNote: string | undefined = undefined;
  if (chosenRoleString && chosenKey !== "custom" && chosenKey !== bestMatch.benchmark.roleKey) {
    const chosenPercent = chosenRoleMatch?.matchPercentage || 0;
    const bestPercent = bestMatch.matchPercentage;
    const diff = bestPercent - chosenPercent;

    if (diff >= 5) {
      discrepancyNote = `Вы указали роль «${chosenRoleMatch?.benchmark.nameRu || chosenRoleString}» (совместимость ${chosenPercent}%), однако ваш природный психологический профиль показал наивысший потенциал для роли «${bestMatch.benchmark.nameRu}» (${bestPercent}%). В этой роли вы раскроетесь гораздо легче и достигнете более высоких результатов без эмоционального выгорания!`;
    }
  }

  return {
    bestMatch,
    allMatches,
    chosenRoleMatch,
    whySuitable: {
      headline,
      summary,
      strengthsBreakdown,
      motivationReason,
      psychotypeReason,
      domainReason,
      growthAdvice,
    },
    discrepancyNote,
  };
}
