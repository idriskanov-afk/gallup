import { 
  Domain, 
  ScoredTalent, 
  AssessmentResult, 
  DomainScore, 
  TalentItem,
  MotivationScore,
  MotivationProfile,
  PsychotypeScore,
  PsychotypeProfile,
  SalesProfile
} from "./types";
import { MOTIVATION_TYPES, PSYCHOTYPES, CLIENT_COLORS } from "./data/sales-frameworks";

export interface ResponseRecord {
  questionId: number;
  talentAId: number;
  talentBId: number;
  choice: number | null; // -2, -1, 0, 1, 2, or null
  responseTimeMs: number;
}

export function calculateAssessment(
  talents: TalentItem[],
  responses: ResponseRecord[]
): AssessmentResult {
  const SPEED_THRESHOLD_MS = 8000;
  const SPEED_BONUS_MULTIPLIER = 1.12;

  let speedBonusHits = 0;
  let totalTimeMs = 0;

  // Track accumulator per talent
  const stats: Record<
    number,
    {
      score: number;
      rawScore: number;
      strongChoicesCount: number;
      chosenTimesMs: number[];
      questionsCount: number;
    }
  > = {};

  for (const t of talents) {
    stats[t.id] = {
      score: 0,
      rawScore: 0,
      strongChoicesCount: 0,
      chosenTimesMs: [],
      questionsCount: 0,
    };
  }

  for (const resp of responses) {
    totalTimeMs += resp.responseTimeMs || 0;
    const { talentAId, talentBId, choice, responseTimeMs } = resp;

    if (stats[talentAId]) stats[talentAId].questionsCount++;
    if (stats[talentBId]) stats[talentBId].questionsCount++;

    if (choice === null) {
      continue;
    }

    const isFast = responseTimeMs > 0 && responseTimeMs < SPEED_THRESHOLD_MS;
    const eligibleForSpeedBonus = isFast && choice !== 0;

    let pointsA = 0;
    let pointsB = 0;

    if (choice === -2) {
      pointsA = 2.0;
      pointsB = -0.35;
      stats[talentAId].strongChoicesCount++;
      stats[talentAId].chosenTimesMs.push(responseTimeMs);
    } else if (choice === -1) {
      pointsA = 1.1;
      pointsB = -0.15;
      stats[talentAId].chosenTimesMs.push(responseTimeMs);
    } else if (choice === 0) {
      pointsA = 0.25;
      pointsB = 0.25;
    } else if (choice === 1) {
      pointsB = 1.1;
      pointsA = -0.15;
      stats[talentBId].chosenTimesMs.push(responseTimeMs);
    } else if (choice === 2) {
      pointsB = 2.0;
      pointsA = -0.35;
      stats[talentBId].strongChoicesCount++;
      stats[talentBId].chosenTimesMs.push(responseTimeMs);
    }

    stats[talentAId].rawScore += pointsA;
    stats[talentBId].rawScore += pointsB;

    let finalPointsA = pointsA;
    let finalPointsB = pointsB;

    if (eligibleForSpeedBonus) {
      speedBonusHits++;
      if (pointsA > 0) finalPointsA = pointsA * SPEED_BONUS_MULTIPLIER;
      if (pointsB > 0) finalPointsB = pointsB * SPEED_BONUS_MULTIPLIER;
    }

    stats[talentAId].score += finalPointsA;
    stats[talentBId].score += finalPointsB;
  }

  // Compile scored talents with Empirical Bayes win-rate normalization
  // so talents asked 3 times with 100% win rate beat talents asked 5 times with mediocre choices.
  const scoredList: ScoredTalent[] = talents.map((t) => {
    const s = stats[t.id];
    const avgResponseTimeMs =
      s.chosenTimesMs.length > 0
        ? Math.round(s.chosenTimesMs.reduce((a, b) => a + b, 0) / s.chosenTimesMs.length)
        : 999999;

    const clampedRaw = Math.max(0, s.rawScore);
    const clampedScore = Math.max(0, s.score);
    const effectiveDenom = Math.max(2.2, s.questionsCount);
    const winRateScore = (clampedScore / effectiveDenom) * 3.2;
    const normalizedScore = clampedScore * 0.55 + winRateScore * 0.45;

    return {
      ...t,
      rank: 0,
      score: Number(normalizedScore.toFixed(2)),
      rawScore: Number(clampedRaw.toFixed(2)),
      strongChoicesCount: s.strongChoicesCount,
      avgResponseTimeMs,
      questionsCount: s.questionsCount,
    };
  });

  // Sort with Tie-Breaker
  scoredList.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.001) {
      return b.score - a.score;
    }
    if (b.strongChoicesCount !== a.strongChoicesCount) {
      return b.strongChoicesCount - a.strongChoicesCount;
    }
    if (a.avgResponseTimeMs !== b.avgResponseTimeMs) {
      return a.avgResponseTimeMs - b.avgResponseTimeMs;
    }
    return a.id - b.id;
  });

  scoredList.forEach((item, index) => {
    item.rank = index + 1;
  });

  const top5 = scoredList.slice(0, 5);
  const blindSpots = scoredList.slice(29, 34);

  // Domain aggregations
  const domainTotals: Record<Domain, number> = {
    executing: 0,
    influencing: 0,
    relationship: 0,
    strategic: 0,
  };

  const domainTop5Counts: Record<Domain, number> = {
    executing: 0,
    influencing: 0,
    relationship: 0,
    strategic: 0,
  };

  for (const item of scoredList) {
    domainTotals[item.domain] += item.score;
  }

  for (const item of top5) {
    domainTop5Counts[item.domain]++;
  }

  const grandTotalScore = Object.values(domainTotals).reduce((a, b) => a + b, 0) || 1;

  const domainNamesRu: Record<Domain, string> = {
    executing: "Исполнение",
    influencing: "Влияние",
    relationship: "Отношения",
    strategic: "Мышление",
  };

  const domainList: DomainScore[] = (
    ["executing", "influencing", "relationship", "strategic"] as Domain[]
  ).map((dom) => ({
    domain: dom,
    nameRu: domainNamesRu[dom],
    score: Number(domainTotals[dom].toFixed(2)),
    percentage: Math.round((domainTotals[dom] / grandTotalScore) * 100),
    talentsInTop5: domainTop5Counts[dom],
  }));

  let dominantDomain: Domain = "executing";
  let maxDomainScore = -1;
  for (const d of domainList) {
    // Combine overall domain score and Top-5 presence so dominant domain accurately reflects top strengths
    const weightedDom = d.score + d.talentsInTop5 * 2.5;
    if (weightedDom > maxDomainScore) {
      maxDomainScore = weightedDom;
      dominantDomain = d.domain;
    }
  }

  // Helper map by slug
  const scoreMap: Record<string, number> = {};
  for (const t of scoredList) {
    scoreMap[t.slug] = t.score;
  }
  const getScore = (slug: string) => scoreMap[slug] || 0;

  // --------------------------------------------------------------------------
  // EXTENDED 2.0 ENGINE: 1. MOTIVATION TYPE (5 TYPES)
  // --------------------------------------------------------------------------
  const rawMotivationScores: Record<"money" | "status" | "result" | "budget" | "romantic", number> = {
    money:
      getScore("competition") * 1.6 +
      getScore("command") * 1.3 +
      getScore("self_assurance") * 1.2 +
      getScore("maximizer") * 1.1 +
      getScore("achiever") * 1.0,
    status:
      getScore("significance") * 1.6 +
      getScore("self_assurance") * 1.3 +
      getScore("command") * 1.2 +
      getScore("woo") * 1.0,
    result:
      getScore("achiever") * 1.5 +
      getScore("arranger") * 1.4 +
      getScore("focus") * 1.3 +
      getScore("responsibility") * 1.2 +
      getScore("activator") * 1.1 +
      getScore("strategic") * 1.1,
    budget:
      getScore("discipline") * 1.6 +
      getScore("consistency") * 1.5 +
      getScore("deliberative") * 1.3 +
      getScore("responsibility") * 1.1,
    romantic:
      getScore("developer") * 1.5 +
      getScore("empathy") * 1.4 +
      getScore("positivity") * 1.4 +
      getScore("ideation") * 1.2 +
      getScore("restorative") * 1.1,
  };

  const totalMotiv = Object.values(rawMotivationScores).reduce((a, b) => a + b, 0) || 1;

  const motivationList: MotivationScore[] = (
    ["money", "status", "result", "budget", "romantic"] as Array<"money" | "status" | "result" | "budget" | "romantic">
  ).map((typeId) => ({
    typeId,
    nameRu: MOTIVATION_TYPES[typeId].nameRu,
    badge: MOTIVATION_TYPES[typeId].badge,
    score: Number(rawMotivationScores[typeId].toFixed(2)),
    percentage: Math.round((rawMotivationScores[typeId] / totalMotiv) * 100),
  })).sort((a, b) => b.score - a.score);

  const dominantMotivation = motivationList[0];
  const motivInfo = MOTIVATION_TYPES[dominantMotivation.typeId];

  const motivationProfile: MotivationProfile = {
    dominant: dominantMotivation,
    all: motivationList,
    kpiRecommendations: motivInfo.kpiRecommendations,
    howToWork: motivInfo.howToWork,
    whatNotToDo: motivInfo.whatNotToDo,
  };

  // --------------------------------------------------------------------------
  // EXTENDED 2.0 ENGINE: 2. COMMUNICATION PSYCHOTYPE (DISC / 4 COLORS)
  // --------------------------------------------------------------------------
  const rawPsychoScores: Record<"directive" | "expressive" | "amiable" | "analytical", number> = {
    directive:
      getScore("command") * 1.6 +
      getScore("competition") * 1.5 +
      getScore("self_assurance") * 1.4 +
      getScore("focus") * 1.1 +
      getScore("activator") * 0.9,
    expressive:
      getScore("woo") * 1.6 +
      getScore("communication") * 1.5 +
      getScore("positivity") * 1.4 +
      getScore("includer") * 1.2 +
      getScore("adaptability") * 0.9,
    amiable:
      getScore("empathy") * 1.5 +
      getScore("developer") * 1.5 +
      getScore("harmony") * 1.4 +
      getScore("relator") * 1.2 +
      getScore("restorative") * 1.1,
    analytical:
      getScore("analytical") * 1.6 +
      getScore("deliberative") * 1.4 +
      getScore("arranger") * 1.3 +
      getScore("individualization") * 1.2 +
      getScore("strategic") * 1.1 +
      getScore("discipline") * 1.0,
  };

  const totalPsycho = Object.values(rawPsychoScores).reduce((a, b) => a + b, 0) || 1;

  const psychotypeList: PsychotypeScore[] = (
    ["directive", "expressive", "amiable", "analytical"] as Array<"directive" | "expressive" | "amiable" | "analytical">
  ).map((id) => ({
    id,
    colorName: PSYCHOTYPES[id].colorName,
    nameRu: PSYCHOTYPES[id].nameRu,
    badge: PSYCHOTYPES[id].badge,
    score: Number(rawPsychoScores[id].toFixed(2)),
    percentage: Math.round((rawPsychoScores[id] / totalPsycho) * 100),
  })).sort((a, b) => b.score - a.score);

  const dominantPsycho = psychotypeList[0];
  const psychoInfo = PSYCHOTYPES[dominantPsycho.id];

  const psychotypeProfile: PsychotypeProfile = {
    dominant: dominantPsycho,
    all: psychotypeList,
    mainValue: psychoInfo.mainValue,
    keyQuestion: psychoInfo.keyQuestion,
    speechStyle: psychoInfo.speechStyle,
    howToCommunicate: psychoInfo.howToCommunicate,
  };

  // --------------------------------------------------------------------------
  // EXTENDED 2.0 ENGINE: 3. SALES MATRIX & CLIENT COMPATIBILITY
  // --------------------------------------------------------------------------
  // Result vs Process Orientation
  const executingAndInfluencing = domainTotals.executing + domainTotals.influencing;
  const relationshipAndStrategic = domainTotals.relationship + domainTotals.strategic;
  const grandTotal = executingAndInfluencing + relationshipAndStrategic || 1;
  const resultOrientationPercent = Math.min(100, Math.max(0, Math.round((executingAndInfluencing / grandTotal) * 100)));

  let orientationLabel: "Результатник" | "Процессник" | "Сбалансированный" = "Сбалансированный";
  if (resultOrientationPercent >= 55) {
    orientationLabel = "Результатник";
  } else if (resultOrientationPercent <= 45) {
    orientationLabel = "Процессник";
  }

  // Client Compatibility based on dominant psychotype & talents
  let bestColor: "yellow" | "blue" | "green" | "red" = "yellow";
  let challengeColor: "yellow" | "blue" | "green" | "red" = "blue";
  let whyMatch = "";
  let whyChallenge = "";

  if (dominantPsycho.id === "directive") {
    bestColor = "red";
    whyMatch = "Вы общаетесь на равных, без 'воды' и лишних эмоций. Уверенно держите удар, говорите цифрами и закрываете максимальные чеки.";
    challengeColor = "blue";
    whyChallenge = "Болтливые клиенты могут вызывать у вас сильное раздражение нехваткой конкретики. Важно не обрывать их грубо, а мягко программировать тайминг диалога.";
  } else if (dominantPsycho.id === "expressive") {
    bestColor = "yellow";
    whyMatch = "Вы мгновенно заражаете позитивом, делаете яркие эмоциональные презентации и легко закрываете сделку на подъеме энергии.";
    challengeColor = "red";
    whyChallenge = "Строгие доминантные клиенты могут воспринять вашу яркость как легкомыслие. С ними нужно отложить эмоции и говорить фактами.";
  } else if (dominantPsycho.id === "amiable") {
    bestColor = "green";
    whyMatch = "Вы искренне слышите страхи сомневающегося клиента, окружаете заботой, формируете глубокое доверие и снимаете любые возражения без давления.";
    challengeColor = "red";
    whyChallenge = "Жесткое доминантное поведение может выбивать вас из колеи. Важно помнить, что резкость клиента — это не личное отношение, а способ проверки вашей экспертности.";
  } else {
    // analytical
    bestColor = "green";
    whyMatch = "Вы предоставляете идеальные логические доказательства, расчеты окупаемости и сравнительные таблицы, что полностью убеждает осторожного клиента.";
    challengeColor = "yellow";
    whyChallenge = "Эмоциональные клиенты не любят перегруза сухими цифрами. Вам стоит добавить больше живых историй, легкости и улыбки.";
  }

  // Neuro-sales & closing method
  let crocBrainTactic = "С первых секунд давайте клиенту ощущение полной безопасности: спокойная уверенная речь, опрятный вид, отсутствие навязчивости.";
  let aroSkillDescription = "В треугольнике АРО вы превосходно создаете контакт через Общение и Реальность — используете понятные клиенту жизненные факты.";
  let closingMethod = "Метод гарантии и тест-драйва: 'Попробуйте наш продукт, оцените в деле — мы гарантируем результат'.";

  if (dominantDomain === "influencing" || dominantPsycho.id === "directive") {
    crocBrainTactic = "Подавайте информацию короткими контрастными блоками ('Было/Стало', 'С нашим решением / Без него'). Не заставляйте мозг клиента напрягаться.";
    aroSkillDescription = "В треугольнике АРО вы лидируете через Общение: быстро захватываете инициативу и удерживаете фокус внимания клиента.";
    closingMethod = "Метод дедлайна и ограниченной выгоды: 'Спецусловия фиксируются до конца дня, оформляем сейчас, чтобы сохранить за вами скидку'.";
  } else if (dominantDomain === "relationship") {
    crocBrainTactic = "Снятие настороженности через максимальную эмпатию и заботу. Клиент чувствует, что вы хотите решить его проблему, а не просто 'продать'.";
    aroSkillDescription = "В треугольнике АРО вы сильны в Аффинити (симпатия и притяжение): клиент быстро чувствует к вам теплоту и доверие.";
    closingMethod = "Метод выявления глубинной боли: связать решение проблемы с товаром так, чтобы клиент сам попросил оформить покупку.";
  } else if (dominantDomain === "strategic") {
    crocBrainTactic = "Подача выверенной, структурированной информации с визуальными схемами и понятными причинно-следственными связями.";
    aroSkillDescription = "В треугольнике АРО вы опираетесь на Реальность: говорите фактами, с которыми собеседник объективно не может поспорить.";
    closingMethod = "Метод дробления платежа / окупаемости: разложить общую сумму на ежедневную выгоду, показав финансовую логику решения.";
  }

  const salesProfile: SalesProfile = {
    bestClientMatch: {
      color: bestColor,
      nameRu: CLIENT_COLORS[bestColor].nameRu,
      badge: CLIENT_COLORS[bestColor].badge,
      whyMatch,
      howToSell: CLIENT_COLORS[bestColor].howToSell,
    },
    challengingClientMatch: {
      color: challengeColor,
      nameRu: CLIENT_COLORS[challengeColor].nameRu,
      badge: CLIENT_COLORS[challengeColor].badge,
      whyChallenge,
      recommendedTactics: CLIENT_COLORS[challengeColor].howToSell,
    },
    resultOrientationPercent,
    orientationLabel,
    crocBrainTactic,
    aroSkillDescription,
    closingMethod,
  };

  return {
    top5,
    blindSpots,
    allRanked: scoredList,
    domains: domainList,
    dominantDomain,
    completedAt: new Date().toISOString(),
    totalTimeMs,
    speedBonusHits,
    motivation: motivationProfile,
    psychotype: psychotypeProfile,
    salesProfile,
  };
}
