import { QUESTIONS_DATA, QuestionSeed, QuestionCategory } from "./data/questions";
import { TALENTS_DATA } from "./data/talents";
import { Domain, TalentItem } from "./types";

export interface AdaptiveResponse {
  questionId: number;
  choice: number | null; // -2, -1, 0, 1, 2, or null
  responseTimeMs: number;
}

export interface TalentTally {
  score: number;
  appearances: number;
  strongPicks: number;
}

export const ADAPTIVE_TOTAL_QUESTIONS = 50;

/**
 * Calculates tentative scores for all 34 talents based on current response history.
 */
export function computeTentativeScores(
  responses: AdaptiveResponse[],
  questionBank: QuestionSeed[] = QUESTIONS_DATA
): Record<number, TalentTally> {
  const tally: Record<number, TalentTally> = {};
  for (let i = 1; i <= 34; i++) {
    tally[i] = { score: 0, appearances: 0, strongPicks: 0 };
  }

  for (const resp of responses) {
    const q = questionBank.find((item) => item.orderIndex === resp.questionId);
    if (!q) continue;

    const { talentAId, talentBId } = q;
    tally[talentAId].appearances++;
    tally[talentBId].appearances++;

    if (resp.choice === null) continue;

    if (resp.choice === -2) {
      tally[talentAId].score += 2.0;
      tally[talentAId].strongPicks++;
    } else if (resp.choice === -1) {
      tally[talentAId].score += 1.0;
    } else if (resp.choice === 0) {
      tally[talentAId].score += 0.3;
      tally[talentBId].score += 0.3;
    } else if (resp.choice === 1) {
      tally[talentBId].score += 1.0;
    } else if (resp.choice === 2) {
      tally[talentBId].score += 2.0;
      tally[talentBId].strongPicks++;
    }
  }

  return tally;
}

/**
 * Core Adaptive Computerized Testing (CAT) algorithm:
 * Selects the mathematically optimal next question based on the candidate's real-time answers.
 */
export function getNextAdaptiveQuestion(
  answeredQuestionIds: number[],
  responses: AdaptiveResponse[],
  questionBank: QuestionSeed[] = QUESTIONS_DATA,
  targetTotal: number = ADAPTIVE_TOTAL_QUESTIONS
): QuestionSeed {
  // 1. Available pool of unasked questions
  const available = questionBank.filter(
    (q) => !answeredQuestionIds.includes(q.orderIndex)
  );

  if (available.length === 0) {
    // If pool exhausted, fallback to first question
    return questionBank[0];
  }

  const currentStep = answeredQuestionIds.length + 1; // 1 to 50

  // Question 1: Always start with the diagnostic anchor (Focus vs Activator)
  if (currentStep === 1 || responses.length === 0) {
    const q1 = available.find((q) => q.orderIndex === 1);
    return q1 || available[0];
  }

  // 2. Compute current talent tallies and domain weights
  const tally = computeTentativeScores(responses, questionBank);

  // Map talent to domain
  const talentDomainMap = new Map<number, Domain>();
  for (const t of TALENTS_DATA) {
    talentDomainMap.set(t.id, t.domain as Domain);
  }

  const domainScores: Record<Domain, number> = {
    executing: 0,
    influencing: 0,
    relationship: 0,
    strategic: 0,
  };

  const domainCounts: Record<Domain, number> = {
    executing: 0,
    influencing: 0,
    relationship: 0,
    strategic: 0,
  };

  for (let i = 1; i <= 34; i++) {
    const d = talentDomainMap.get(i) || "executing";
    domainScores[d] += tally[i].score;
    domainCounts[d] += tally[i].appearances;
  }

  const lastResp = responses[responses.length - 1];
  const lastQ = questionBank.find((q) => q.orderIndex === lastResp?.questionId);

  // -------------------------------------------------------------
  // PHASE 1: EXPLORATORY CALIBRATION (Steps 2 to 10)
  // Ensure baseline distribution across all 4 domains & diverse categories
  // -------------------------------------------------------------
  if (currentStep <= 10) {
    // Find the domain with the fewest tests so far
    const sortedDomains = (Object.keys(domainCounts) as Domain[]).sort(
      (a, b) => domainCounts[a] - domainCounts[b]
    );
    const leastTestedDomain = sortedDomains[0];

    // Find questions featuring this domain
    const domainQuestions = available.filter((q) => {
      const domA = talentDomainMap.get(q.talentAId);
      const domB = talentDomainMap.get(q.talentBId);
      return domA === leastTestedDomain || domB === leastTestedDomain;
    });

    if (domainQuestions.length > 0) {
      // Pick the one with the lowest total talent appearances
      domainQuestions.sort((a, b) => {
        const sumA = tally[a.talentAId].appearances + tally[a.talentBId].appearances;
        const sumB = tally[b.talentAId].appearances + tally[b.talentBId].appearances;
        return sumA - sumB;
      });
      return domainQuestions[0];
    }
  }

  // -------------------------------------------------------------
  // PHASE 2: ADAPTIVE BRANCHING (Steps 11 to 38)
  // Branch deeply based on immediate response + leader differentiation
  // -------------------------------------------------------------
  if (currentStep <= 38 && lastQ && lastResp) {
    const isStrongA = lastResp.choice === -2;
    const isModerateA = lastResp.choice === -1;
    const isNeutral = lastResp.choice === 0 || lastResp.choice === null;
    const isModerateB = lastResp.choice === 1;
    const isStrongB = lastResp.choice === 2;

    const favoredTalentId = isStrongA || isModerateA
      ? lastQ.talentAId
      : isStrongB || isModerateB
      ? lastQ.talentBId
      : null;

    if (favoredTalentId !== null) {
      // User favored a talent! Find rival questions to differentiate
      // Look for candidate questions containing the favored talent
      const favoredQuestions = available.filter(
        (q) => q.talentAId === favoredTalentId || q.talentBId === favoredTalentId
      );

      if (favoredQuestions.length > 0) {
        // Sort questions so that the opposing talent has a high tentative score
        // (to resolve who is truly the #1 or #2 leader)
        favoredQuestions.sort((a, b) => {
          const rivalA = a.talentAId === favoredTalentId ? a.talentBId : a.talentAId;
          const rivalB = b.talentAId === favoredTalentId ? b.talentBId : b.talentAId;
          
          // Prefer rivals with high score but low appearance count
          const valueA = tally[rivalA].score - tally[rivalA].appearances * 0.5;
          const valueB = tally[rivalB].score - tally[rivalB].appearances * 0.5;
          return valueB - valueA;
        });

        return favoredQuestions[0];
      }
    } else if (isNeutral) {
      // User was indifferent or timed out: test an alternative under-measured pair
      available.sort((a, b) => {
        const appA = tally[a.talentAId].appearances + tally[a.talentBId].appearances;
        const appB = tally[b.talentAId].appearances + tally[b.talentBId].appearances;
        return appA - appB;
      });
      return available[0];
    }
  }

  // -------------------------------------------------------------
  // PHASE 3: TOP-5 & BOUNDARY POLISHING (Steps 39 to 50)
  // Differentiate boundary talents (Ranks 4-7 for Top 5, Ranks 28-32 for Blind Spots)
  // -------------------------------------------------------------
  // Rank talents currently
  const rankedTalents = Object.keys(tally)
    .map((idStr) => ({ id: Number(idStr), ...tally[Number(idStr)] }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.strongPicks !== a.strongPicks) return b.strongPicks - a.strongPicks;
      return a.appearances - b.appearances;
    });

  // Top boundary targets: talents ranked 3 to 8 (indices 2 to 7)
  const topBoundaryTalentIds = new Set(
    rankedTalents.slice(2, 8).map((t) => t.id)
  );

  // Find questions that pit boundary talents against each other
  const boundaryQuestions = available.filter((q) => {
    return (
      (topBoundaryTalentIds.has(q.talentAId) && topBoundaryTalentIds.has(q.talentBId)) ||
      topBoundaryTalentIds.has(q.talentAId) ||
      topBoundaryTalentIds.has(q.talentBId)
    );
  });

  if (boundaryQuestions.length > 0) {
    boundaryQuestions.sort((a, b) => {
      const aBoth = topBoundaryTalentIds.has(a.talentAId) && topBoundaryTalentIds.has(a.talentBId) ? 1 : 0;
      const bBoth = topBoundaryTalentIds.has(b.talentAId) && topBoundaryTalentIds.has(b.talentBId) ? 1 : 0;
      if (bBoth !== aBoth) return bBoth - aBoth;

      // Minimize total appearances to ensure broad fairness
      const appA = tally[a.talentAId].appearances + tally[a.talentBId].appearances;
      const appB = tally[b.talentAId].appearances + tally[b.talentBId].appearances;
      return appA - appB;
    });

    return boundaryQuestions[0];
  }

  // Final fallback: Pick available question with lowest total appearances
  available.sort((a, b) => {
    const appA = tally[a.talentAId].appearances + tally[a.talentBId].appearances;
    const appB = tally[b.talentAId].appearances + tally[b.talentBId].appearances;
    return appA - appB;
  });

  return available[0];
}
