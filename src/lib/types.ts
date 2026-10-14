export type Domain = "executing" | "influencing" | "relationship" | "strategic";

export interface ManagerGuide {
  tasks: string;
  motivation: string;
  control: string;
  demotivationTriggers: string;
}

export interface TalentItem {
  id: number;
  slug: string;
  nameRu: string;
  nameEn: string;
  domain: Domain;
  shortDescription: string;
  managerGuide: ManagerGuide;
}

export interface QuestionItem {
  id: number;
  orderIndex: number;
  statementA: string;
  talentAId: number;
  talentA?: TalentItem;
  statementB: string;
  talentBId: number;
  talentB?: TalentItem;
}

export interface ScoredTalent extends TalentItem {
  rank: number;
  score: number;
  rawScore: number;
  strongChoicesCount: number;
  avgResponseTimeMs: number;
  questionsCount: number;
}

export interface DomainScore {
  domain: Domain;
  nameRu: string;
  score: number;
  percentage: number;
  talentsInTop5: number;
}

export interface AssessmentResult {
  top5: ScoredTalent[];
  blindSpots: ScoredTalent[]; // Ranks 30..34
  allRanked: ScoredTalent[]; // All 34
  domains: DomainScore[];
  dominantDomain: Domain;
  completedAt: string;
  totalTimeMs: number;
  speedBonusHits: number;
}
