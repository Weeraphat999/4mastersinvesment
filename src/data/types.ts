export interface AnalysisResult {
  ticker: string;
  companyName: string;
  price: number;
  priceChange: number; // percentage
  verdict: string;
  positionSize: string;
  entryStrategy: string;
  riskLevel: string;
  timeHorizon: string;
  masterScores: {
    buffett: number; // 0-10
    munger: number; // 0-10
    lynch: number; // 0-10
    rothschild: number; // 0-10
  };
  overallScore: number; // 0-10
  quickFacts: {
    marketCap: string;
    priceSales: string;
    cashRunway: string;
    sector: string;
    weekRange52: string;
    moat: string;
    profitMargin: string;
    debtEquity: string;
  };
}

export interface MoatFactor {
  name: string;
  status: 'pass' | 'caution' | 'fail';
  detail: string;
}

export interface FinancialMetric {
  name: string;
  value: string;
  status: 'pass' | 'caution' | 'fail';
}

export interface BuffettAnalysis {
  businessUnderstanding: {
    sector: string;
    description: string;
    complexity: 'Simple' | 'Moderate' | 'Complex';
  };
  competitiveMoat: {
    moatScore: number;
    factors: MoatFactor[];
  };
  financialQuality: FinancialMetric[];
  managementQuality: {
    ceoTrackRecord: string;
    insiderBuying: string;
    stockCompensation: string;
    capitalAllocation: number;
  };
  valuation: {
    intrinsicValue: number;
    currentPrice: number;
    marginOfSafety: number;
    peRatio: number;
    psRatio: number;
  };
  verdict: string;
}

export interface FailureScenario {
  name: string;
  probability: number;
  description: string;
  mitigation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface MentalModel {
  name: string;
  status: 'pass' | 'caution' | 'fail';
  explanation: string;
}

export interface MungerAnalysis {
  failureScenarios: FailureScenario[];
  mentalModels: MentalModel[];
  multiDisciplinary: {
    physics: string;
    biology: string;
    psychology: string;
    economics: string;
    history: string;
    math: string;
  };
  verdict: string;
}

export interface LynchAnalysis {
  knowWhatYouOwn: string;
  industryGrowth: {
    tam: string;
    growthRate: string;
    trend: 'Accelerating' | 'Stable' | 'Decelerating';
  };
  pegAnalysis: {
    pe: number;
    growthRate: number;
    peg: number;
    assessment: string;
  };
  tenBaggerPotential: {
    checklist: { item: string; met: boolean }[];
    path: string;
    probability: string;
  };
  verdict: string;
}

export interface ContrarianSignal {
  name: string;
  triggered: boolean;
}

export interface EntryZone {
  label: 'Best' | 'Good' | 'OK';
  priceRange: string;
  positionPercent: string;
}

export interface RothschildAnalysis {
  bloodInStreets: {
    bloodLevel: number;
    vix: number;
    sectorPerformance: string;
    socialSentiment: number;
    shortInterest: number;
  };
  contrarianSignals: ContrarianSignal[];
  contrarianScore: number;
  positionSizing: {
    portfolioPercent: string;
    maxLoss: string;
    kellyCriterion: string;
  };
  entryZones: EntryZone[];
  verdict: string;
}

export interface TechnicalSignal {
  name: string;
  status: string;
  score: number;
}

export interface TechnicalAnalysis {
  timingScore: number;
  timingVerdict: {
    recommendation: 'BUY NOW' | 'WAIT' | 'AVOID';
    buyZone: string;
    stopLoss: string;
    takeProfit: string;
  };
  signals: TechnicalSignal[];
  chartData: {
    pricePoints: number[];
    supportLevel: number;
    resistanceLevel: number;
    buyZone: { low: number; high: number };
  };
  entryStrategy: { zone: string; action: string }[];
}

export interface DetailedAnalysis {
  buffettAnalysis: BuffettAnalysis;
  mungerAnalysis: MungerAnalysis;
  lynchAnalysis: LynchAnalysis;
  rothschildAnalysis: RothschildAnalysis;
  technicalAnalysis: TechnicalAnalysis;
}

export interface DecisionEntry {
  id: string;
  date: string; // ISO 8601 timestamp
  ticker: string;
  companyName: string;
  decision: 'BUY' | 'PASS' | 'WATCHLIST';
  positionSizePercent: number;
  positionSizeAmount: number;
  entryPriceTarget: number;
  currentPrice: number;
  reasoning: string;
  expectedOutcome: string;
  exitPlan: string;
  reviewDates: string[]; // ISO date strings
  scores: {
    buffett: number;
    munger: number;
    lynch: number;
    rothschild: number;
    overall: number;
  };
  alertsSet: string[];
  status: 'active' | 'closed';
  actualOutcome: string;
  lessonsLearned: string;
}

export interface AlertPreferences {
  [alertId: string]: boolean;
}

export interface DCAScheduleRow {
  month: number;
  date: string; // ISO date string
  amount: number;
  estimatedPrice: number;
  estimatedShares: number;
}

export interface PositionSizingResult {
  allocationPercent: number;
  convictionLabel: 'High Conviction' | 'Standard' | 'Speculative';
  maxPositionDollars: number;
}

export interface PortfolioHolding {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  purchaseDate: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  notes: string;
}
