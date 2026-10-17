import { QUESTIONS_DATA, QuestionSeed } from "./data/questions";
import { TALENTS_DATA } from "./data/talents";
import { Domain } from "./types";

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
 * Includes slight negative adjustment (-0.35) when a statement is strongly rejected,
 * ensuring rejected talents don't accumulate artificial ties.
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
      tally[talentBId].score = Math.max(0, tally[talentBId].score - 0.35);
    } else if (resp.choice === -1) {
      tally[talentAId].score += 1.1;
      tally[talentBId].score = Math.max(0, tally[talentBId].score - 0.15);
    } else if (resp.choice === 0) {
      tally[talentAId].score += 0.3;
      tally[talentBId].score += 0.3;
    } else if (resp.choice === 1) {
      tally[talentBId].score += 1.1;
      tally[talentAId].score = Math.max(0, tally[talentAId].score - 0.15);
    } else if (resp.choice === 2) {
      tally[talentBId].score += 2.0;
      tally[talentBId].strongPicks++;
      tally[talentAId].score = Math.max(0, tally[talentAId].score - 0.35);
    }
  }

  return tally;
}

/**
 * Core Adaptive Computerized Testing (CAT) 3.0 algorithm:
 * 1. Phase 1 (Steps 1-17): Full-Spectrum Calibration — guarantees all 34 talents are tested once.
 * 2. Phase 2 (Steps 18-38): Balanced Adaptive Branching — tests emerging leaders while capping appearances at 4 to prevent starvation.
 * 3. Phase 3 (Steps 39-50): Top-Contender & Role-Boundary Resolution — pits top 10 contenders against each other to lock in exact Top 5 and role fit.
 */
export function getNextAdaptiveQuestion(
  answeredQuestionIds: number[],
  responses: AdaptiveResponse[],
  questionBank: QuestionSeed[] = QUESTIONS_DATA,
  targetTotal: number = ADAPTIVE_TOTAL_QUESTIONS
): QuestionSeed {
  const available = questionBank.filter(
    (q) => !answeredQuestionIds.includes(q.orderIndex)
  );

  if (available.length === 0) {
    return questionBank[0];
  }

  const currentStep = answeredQuestionIds.length + 1; // 1 to 50

  // -------------------------------------------------------------
  // PHASE 1: FULL-SPECTRUM CALIBRATION (Steps 1 to 17)
  // Questions 1..17 form a strict disjoint cover of all 34 talents (17 * 2 = 34).
  // Serving them first guarantees 0 blind spots before adaptive branching begins.
  // -------------------------------------------------------------
  if (currentStep <= 17) {
    const calibrationPool = available
      .filter((q) => q.orderIndex <= 17)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    if (calibrationPool.length > 0) {
      return calibrationPool[0];
    }
  }

  // Compute current talent tallies
  const tally = computeTentativeScores(responses, questionBank);

  // Map talent to domain for balanced tie-breaking
  const talentDomainMap = new Map<number, Domain>();
  for (const t of TALENTS_DATA) {
    talentDomainMap.set(t.id, t.domain as Domain);
  }

  const lastResp = responses[responses.length - 1];
  const lastQ = questionBank.find((q) => q.orderIndex === lastResp?.questionId);

  // Helper: Effective win rate of a talent
  const getRate = (id: number) =>
    tally[id].appearances > 0 ? tally[id].score / tally[id].appearances : 0;

  // -------------------------------------------------------------
  // PHASE 2: BALANCED ADAPTIVE BRANCHING (Steps 18 to 38)
  // Branch on favored talents while strictly preventing over-sampling (> 4 appearances)
  // and ensuring every talent gets at least 2-3 appearances.
  // -------------------------------------------------------------
  if (currentStep <= 38 && lastQ && lastResp) {
    // First, check if any talents still have < 2 appearances by step 26+
    if (currentStep >= 24) {
      const underTested = available.filter(
        (q) =>
          tally[q.talentAId].appearances < 2 ||
          tally[q.talentBId].appearances < 2
      );
      if (underTested.length > 0) {
        underTested.sort((a, b) => {
          const minAppA = Math.min(tally[a.talentAId].appearances, tally[a.talentBId].appearances);
          const minAppB = Math.min(tally[b.talentAId].appearances, tally[b.talentBId].appearances);
          if (minAppA !== minAppB) return minAppA - minAppB;
          const sumA = tally[a.talentAId].appearances + tally[a.talentBId].appearances;
          const sumB = tally[b.talentAId].appearances + tally[b.talentBId].appearances;
          return sumA - sumB;
        });
        return underTested[0];
      }
    }

    const favoredTalentId =
      lastResp.choice !== null && lastResp.choice < 0
        ? lastQ.talentAId
        : lastResp.choice !== null && lastResp.choice > 0
        ? lastQ.talentBId
        : null;

    if (favoredTalentId !== null && tally[favoredTalentId].appearances < 4) {
      // Find questions containing favoredTalentId where rival is also not over-sampled
      const favoredQuestions = available.filter((q) => {
        const isA = q.talentAId === favoredTalentId;
        const isB = q.talentBId === favoredTalentId;
        if (!isA && !isB) return false;
        const rivalId = isA ? q.talentBId : q.talentAId;
        return tally[rivalId].appearances < 4;
      });

      if (favoredQuestions.length > 0) {
        favoredQuestions.sort((a, b) => {
          const rivalA = a.talentAId === favoredTalentId ? a.talentBId : a.talentAId;
          const rivalB = b.talentAId === favoredTalentId ? b.talentBId : b.talentAId;

          // Pit favored talent against strong, under-tested rivals
          const valueA = getRate(rivalA) * 2.0 - tally[rivalA].appearances * 0.6;
          const valueB = getRate(rivalB) * 2.0 - tally[rivalB].appearances * 0.6;
          return valueB - valueA;
        });

        return favoredQuestions[0];
      }
    }

    // Otherwise, pick a question pairing two promising but under-sampled talents
    const balancedPool = available.filter(
      (q) => tally[q.talentAId].appearances < 4 && tally[q.talentBId].appearances < 4
    );
    const poolToUse = balancedPool.length > 0 ? balancedPool : available;

    poolToUse.sort((a, b) => {
      const scoreA =
        (getRate(a.talentAId) + getRate(a.talentBId)) -
        (tally[a.talentAId].appearances + tally[a.talentBId].appearances) * 0.45;
      const scoreB =
        (getRate(b.talentAId) + getRate(b.talentBId)) -
        (tally[b.talentAId].appearances + tally[b.talentBId].appearances) * 0.45;
      return scoreB - scoreA;
    });

    return poolToUse[0];
  }

  // -------------------------------------------------------------
  // PHASE 3: TOP-10 & ROLE-BOUNDARY RESOLUTION (Steps 39 to 50)
  // Pits top contenders (Ranks 1 to 10) against each other to sharply separate Top 5
  // -------------------------------------------------------------
  const rankedTalents = Object.keys(tally)
    .map((idStr) => {
      const id = Number(idStr);
      return {
        id,
        ...tally[id],
        rate: getRate(id),
      };
    })
    .sort((a, b) => {
      const compositeA = a.score * 0.5 + a.rate * 3.5;
      const compositeB = b.score * 0.5 + b.rate * 3.5;
      if (Math.abs(compositeB - compositeA) > 0.01) return compositeB - compositeA;
      if (b.strongPicks !== a.strongPicks) return b.strongPicks - a.strongPicks;
      return a.appearances - b.appearances;
    });

  const topContenderIds = new Set(
    rankedTalents.slice(0, 10).map((t) => t.id)
  );

  const boundaryQuestions = available.filter((q) => {
    const aIn = topContenderIds.has(q.talentAId);
    const bIn = topContenderIds.has(q.talentBId);
    return aIn || bIn;
  });

  if (boundaryQuestions.length > 0) {
    boundaryQuestions.sort((a, b) => {
      const aBoth = topContenderIds.has(a.talentAId) && topContenderIds.has(a.talentBId) ? 1 : 0;
      const bBoth = topContenderIds.has(b.talentAId) && topContenderIds.has(b.talentBId) ? 1 : 0;
      if (bBoth !== aBoth) return bBoth - aBoth;

      const appA = tally[a.talentAId].appearances + tally[a.talentBId].appearances;
      const appB = tally[b.talentAId].appearances + tally[b.talentBId].appearances;
      return appA - appB;
    });

    return boundaryQuestions[0];
  }

  // Final fallback: lowest total appearances
  available.sort((a, b) => {
    const appA = tally[a.talentAId].appearances + tally[a.talentBId].appearances;
    const appB = tally[b.talentAId].appearances + tally[b.talentBId].appearances;
    return appA - appB;
  });

  return available[0];
}
