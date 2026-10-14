import { Domain, ScoredTalent, AssessmentResult, DomainScore, TalentItem } from "./types";

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
  const SPEED_BONUS_MULTIPLIER = 1.15;

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
      // Timeout: 0 points to both
      continue;
    }

    const isFast = responseTimeMs < SPEED_THRESHOLD_MS;
    const eligibleForSpeedBonus = isFast && choice !== 0;

    let pointsA = 0;
    let pointsB = 0;

    if (choice === -2) {
      // Definitely A
      pointsA = 2.0;
      stats[talentAId].strongChoicesCount++;
      stats[talentAId].chosenTimesMs.push(responseTimeMs);
    } else if (choice === -1) {
      // Likely A
      pointsA = 1.0;
      stats[talentAId].chosenTimesMs.push(responseTimeMs);
    } else if (choice === 0) {
      // Neutral / Both
      pointsA = 0.3;
      pointsB = 0.3;
      // Neutral choices don't count towards specific talent chosen times for tie-breaker
    } else if (choice === 1) {
      // Likely B
      pointsB = 1.0;
      stats[talentBId].chosenTimesMs.push(responseTimeMs);
    } else if (choice === 2) {
      // Definitely B
      pointsB = 2.0;
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

  // Compile scored talents
  const scoredList: ScoredTalent[] = talents.map((t) => {
    const s = stats[t.id];
    const avgResponseTimeMs =
      s.chosenTimesMs.length > 0
        ? Math.round(s.chosenTimesMs.reduce((a, b) => a + b, 0) / s.chosenTimesMs.length)
        : 999999;

    return {
      ...t,
      rank: 0,
      score: Number(s.score.toFixed(2)),
      rawScore: Number(s.rawScore.toFixed(2)),
      strongChoicesCount: s.strongChoicesCount,
      avgResponseTimeMs,
      questionsCount: s.questionsCount,
    };
  });

  // Sort with Tie-Breaker
  // 1) Score descending
  // 2) Strong choices count descending
  // 3) Avg response time ascending (faster wins)
  // 4) Talent ID stable
  scoredList.sort((a, b) => {
    // 1. Score
    if (Math.abs(b.score - a.score) > 0.001) {
      return b.score - a.score;
    }
    // 2. Strong choices
    if (b.strongChoicesCount !== a.strongChoicesCount) {
      return b.strongChoicesCount - a.strongChoicesCount;
    }
    // 3. Avg response time (faster = lower ms)
    if (a.avgResponseTimeMs !== b.avgResponseTimeMs) {
      return a.avgResponseTimeMs - b.avgResponseTimeMs;
    }
    // 4. Stable ID
    return a.id - b.id;
  });

  // Assign strict ranks 1..34
  scoredList.forEach((item, index) => {
    item.rank = index + 1;
  });

  const top5 = scoredList.slice(0, 5);
  const blindSpots = scoredList.slice(29, 34); // ranks 30 to 34

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

  // Determine dominant domain
  let dominantDomain: Domain = "executing";
  let maxDomainScore = -1;
  for (const d of domainList) {
    if (d.score > maxDomainScore) {
      maxDomainScore = d.score;
      dominantDomain = d.domain;
    }
  }

  return {
    top5,
    blindSpots,
    allRanked: scoredList,
    domains: domainList,
    dominantDomain,
    completedAt: new Date().toISOString(),
    totalTimeMs,
    speedBonusHits,
  };
}
