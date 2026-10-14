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

export interface MotivationScore {
  typeId: "money" | "status" | "result" | "budget" | "romantic";
  nameRu: string;
  badge: string;
  score: number;
  percentage: number;
}

export interface MotivationProfile {
  dominant: MotivationScore;
  all: MotivationScore[];
  kpiRecommendations: string;
  howToWork: string[];
  whatNotToDo: string[];
}

export interface PsychotypeScore {
  id: "directive" | "expressive" | "amiable" | "analytical";
  colorName: string;
  nameRu: string;
  badge: string;
  score: number;
  percentage: number;
}

export interface PsychotypeProfile {
  dominant: PsychotypeScore;
  all: PsychotypeScore[];
  mainValue: string;
  keyQuestion: string;
  speechStyle: string;
  howToCommunicate: string;
}

export interface SalesProfile {
  bestClientMatch: {
    color: "yellow" | "blue" | "green" | "red";
    nameRu: string;
    badge: string;
    whyMatch: string;
    howToSell: string[];
  };
  challengingClientMatch: {
    color: "yellow" | "blue" | "green" | "red";
    nameRu: string;
    badge: string;
    whyChallenge: string;
    recommendedTactics: string[];
  };
  resultOrientationPercent: number; // 0..100%
  orientationLabel: "Результатник" | "Процессник" | "Сбалансированный";
  crocBrainTactic: string;
  aroSkillDescription: string;
  closingMethod: string;
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
  
  // Extended 2.0 Factors
  motivation?: MotivationProfile;
  psychotype?: PsychotypeProfile;
  salesProfile?: SalesProfile;
}
