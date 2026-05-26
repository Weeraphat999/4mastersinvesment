import {
  DetailedAnalysis,
  BuffettAnalysis,
  MungerAnalysis,
  LynchAnalysis,
  RothschildAnalysis,
  TechnicalAnalysis,
  MoatFactor,
  FinancialMetric,
  FailureScenario,
  MentalModel,
  ContrarianSignal,
  EntryZone,
  TechnicalSignal,
} from './types';
import { hashString, seededRandom } from './generatePlaceholder';

function randomInRange(next: () => number, min: number, max: number): number {
  return min + next() * (max - min);
}

function randomInt(next: () => number, min: number, max: number): number {
  return Math.floor(randomInRange(next, min, max + 1));
}

function pick<T>(next: () => number, arr: T[]): T {
  return arr[randomInt(next, 0, arr.length - 1)];
}

// --- Predefined arrays for Buffett ---

const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Goods', 'Industrials', 'Real Estate', 'Telecommunications'];
const BUSINESS_DESCRIPTIONS = [
  'Develops enterprise software solutions for cloud-based data management and analytics.',
  'Manufactures semiconductor components for automotive and industrial applications.',
  'Operates a platform connecting consumers with on-demand services across multiple verticals.',
  'Provides subscription-based cybersecurity solutions for mid-market enterprises.',
  'Builds and operates renewable energy infrastructure including solar and wind farms.',
  'Develops AI-powered diagnostic tools for healthcare providers and hospitals.',
  'Operates a marketplace for financial products with embedded lending capabilities.',
  'Designs and sells consumer electronics with a focus on wearable health devices.',
];
const COMPLEXITIES: ('Simple' | 'Moderate' | 'Complex')[] = ['Simple', 'Moderate', 'Complex'];

const MOAT_FACTOR_NAMES = ['Network Effects', 'Switching Costs', 'Cost Advantages', 'Brand / Patents', 'Scale Advantages'];
const MOAT_FACTOR_DETAILS_PASS = [
  'Strong user network creates self-reinforcing value loops.',
  'Deep integration makes switching expensive and risky for customers.',
  'Scale-driven cost structure provides sustainable pricing advantage.',
  'Well-recognized brand with extensive IP portfolio.',
  'Market-leading position enables R&D investment competitors cannot match.',
];
const MOAT_FACTOR_DETAILS_CAUTION = [
  'Some network effects present but not yet dominant.',
  'Moderate switching costs; customers can migrate with effort.',
  'Cost advantages exist but are narrowing as competitors scale.',
  'Brand recognition growing but not yet a decisive moat.',
  'Scale benefits present but not insurmountable by well-funded rivals.',
];
const MOAT_FACTOR_DETAILS_FAIL = [
  'No meaningful network effects in current business model.',
  'Low switching costs; customers can easily move to alternatives.',
  'No structural cost advantage over competitors.',
  'Weak brand recognition in a crowded market.',
  'Insufficient scale to create barriers to entry.',
];

const FINANCIAL_METRIC_NAMES = ['Revenue Growth', 'Free Cash Flow', 'Return on Equity', 'Profit Margin', 'Debt/Equity'];

const CEO_DESCRIPTIONS = [
  'Experienced operator with 15+ years in the industry and strong execution track record.',
  'Founder-CEO with deep domain expertise but limited public company experience.',
  'Seasoned executive hired from a larger competitor; focused on operational efficiency.',
  'Technical founder transitioning to business leadership; strong vision but unproven at scale.',
  'Veteran leader with multiple successful exits; strong capital allocation skills.',
];

const INSIDER_BUYING_DESCRIPTIONS = [
  'Consistent insider buying over the past 6 months signals confidence.',
  'Minimal insider activity; mostly routine stock-based compensation exercises.',
  'Mixed signals — CFO sold shares while CEO purchased.',
  'No significant insider buying; management compensated primarily through RSUs.',
];

const STOCK_COMP_DESCRIPTIONS = [
  'Moderate — aligned with industry norms and tied to performance metrics.',
  'High — stock-based compensation dilutes shareholders by 3-5% annually.',
  'Low — management takes below-market compensation, aligned with shareholders.',
  'Elevated — represents 25%+ of revenue equivalent, concerning dilution.',
];

// --- Predefined arrays for Munger ---

const FAILURE_SCENARIO_NAMES = [
  'Market Share Erosion', 'Regulatory Disruption', 'Technology Obsolescence',
  'Funding Crisis', 'Key Customer Loss', 'Management Missteps',
  'Macroeconomic Downturn', 'Supply Chain Disruption', 'Competitive Price War',
];
const FAILURE_DESCRIPTIONS = [
  'Competitors gain ground with superior products or lower pricing, eroding market position.',
  'New regulations impose significant compliance costs or restrict core business activities.',
  'Emerging technology renders current product offering less relevant or obsolete.',
  'Inability to raise capital at favorable terms during a critical growth phase.',
  'Loss of a top-3 customer representing significant revenue concentration.',
  'Strategic missteps or execution failures by leadership team.',
  'Broad economic slowdown reduces customer spending and lengthens sales cycles.',
  'Critical supply chain dependencies create vulnerability to disruption.',
  'Aggressive competitor pricing forces margin compression across the industry.',
];
const FAILURE_MITIGATIONS = [
  'Diversified product portfolio reduces single-point-of-failure risk.',
  'Proactive regulatory engagement and compliance infrastructure in place.',
  'Continuous R&D investment in next-generation technology platforms.',
  'Strong balance sheet with multiple years of cash runway.',
  'Broad customer base with no single customer exceeding 15% of revenue.',
  'Strong board oversight and succession planning in place.',
  'Counter-cyclical revenue streams provide partial hedge.',
  'Multi-sourcing strategy and inventory buffers mitigate supply risk.',
  'Differentiated value proposition reduces pure price competition.',
];

const MENTAL_MODEL_NAMES = [
  'Circle of Competence', 'Margin of Safety', 'Inversion',
  'Second-Order Thinking', 'Opportunity Cost', 'Survivorship Bias',
  'Incentive Analysis', 'Lollapalooza Effect',
];
const MENTAL_MODEL_EXPLANATIONS_PASS = [
  'Business model is straightforward and within most investors\' ability to evaluate.',
  'Current valuation provides adequate downside protection relative to intrinsic value.',
  'Few plausible scenarios would permanently destroy business value.',
  'Positive feedback loops create compounding advantages over time.',
  'Expected returns justify capital allocation versus alternatives.',
  'Company\'s success is structural, not merely a product of favorable conditions.',
  'Management incentives are well-aligned with long-term shareholder value.',
  'Multiple reinforcing factors create a powerful combined effect.',
];
const MENTAL_MODEL_EXPLANATIONS_CAUTION = [
  'Business has some complexity that requires specialized knowledge to evaluate fully.',
  'Margin of safety is thin at current prices; a pullback would improve risk/reward.',
  'Some failure scenarios are plausible though not highly probable.',
  'Second-order effects are mixed — some positive, some potentially negative.',
  'Returns are acceptable but not clearly superior to simpler alternatives.',
  'Some element of favorable timing contributed to current success.',
  'Incentive alignment is adequate but not perfectly structured.',
  'Some reinforcing factors present but not yet creating a dominant effect.',
];

// const DISCIPLINES = ['physics', 'biology', 'psychology', 'economics', 'history', 'math'] as const;
const DISCIPLINE_INSIGHTS = {
  physics: [
    'System operates with high energy efficiency, converting inputs to outputs with minimal waste.',
    'Network topology creates resilient distributed architecture resistant to single-point failures.',
    'Momentum in market position creates inertia that competitors must overcome with significant force.',
  ],
  biology: [
    'Business ecosystem exhibits symbiotic relationships with partners that strengthen over time.',
    'Company is in a growth phase with strong adaptive capacity to environmental changes.',
    'Competitive dynamics resemble predator-prey relationships with cyclical market share shifts.',
  ],
  psychology: [
    'Brand creates strong emotional attachment and identity signaling among customers.',
    'Switching costs exploit loss aversion — customers fear losing accumulated value.',
    'Product design leverages habit formation and variable reward schedules for engagement.',
  ],
  economics: [
    'Platform economics create increasing returns to scale with each new participant.',
    'Pricing power demonstrates inelastic demand within the core customer segment.',
    'Network effects create winner-take-most dynamics favoring the market leader.',
  ],
  history: [
    'Historical parallels suggest dominant platforms maintain leadership for 15-20 years before disruption.',
    'Previous industry transitions show incumbents can adapt when they invest early in new paradigms.',
    'Market cycles suggest current valuation is consistent with mid-cycle growth expectations.',
  ],
  math: [
    'Compound growth at current rates doubles the business value every 4-5 years.',
    'Expected value calculation favors investment given probability-weighted outcomes.',
    'Kelly criterion suggests moderate position sizing given the confidence level and edge.',
  ],
};

// --- Predefined arrays for Lynch ---

const KNOW_WHAT_YOU_OWN_TEMPLATES = [
  'This company makes products/services that solve a clear problem for its customers. You can explain what they do in one sentence to anyone at a dinner party.',
  'The business model is straightforward: they sell a product people need and charge enough to make a profit. No PhD required to understand the value proposition.',
  'Think of this as a company that found a niche and dominates it. They do one thing well and customers keep coming back because alternatives are worse or more expensive.',
  'This company operates in a space where demand is growing naturally. They don\'t need to convince people to want their product — the market is pulling them forward.',
];

const TAM_VALUES = ['$50B by 2028', '$120B by 2030', '$200B by 2027', '$80B by 2029', '$300B by 2030', '$45B by 2026'];
const GROWTH_RATES = ['12% CAGR', '18% CAGR', '25% CAGR', '8% CAGR', '15% CAGR', '30% CAGR'];
const TRENDS: ('Accelerating' | 'Stable' | 'Decelerating')[] = ['Accelerating', 'Stable', 'Decelerating'];

const PEG_ASSESSMENTS = [
  'PEG ratio suggests the stock is fairly valued relative to its growth rate.',
  'PEG below 1.0 indicates potential undervaluation — growth is not fully priced in.',
  'PEG above 2.0 suggests the market is pricing in optimistic growth assumptions.',
  'PEG ratio is reasonable for a company at this stage of its growth cycle.',
];

const CHECKLIST_ITEMS = [
  'Small/mid-cap with room to grow',
  'In a fast-growing industry',
  'Strong earnings growth trajectory',
  'Low institutional ownership',
  'Insiders buying shares',
  'Simple, understandable business',
];

const TEN_BAGGER_PATHS = [
  'If the company captures 10% of its addressable market and maintains margins, revenue could support a 5-8x valuation increase over 5 years.',
  'Expansion into adjacent markets combined with operating leverage could drive earnings growth of 30%+ annually for the next 3-5 years.',
  'Market leadership in a winner-take-most industry could drive disproportionate value capture as the market matures.',
  'International expansion represents a largely untapped opportunity that could double the addressable market.',
];

const TEN_BAGGER_PROBABILITIES = ['25-35%', '15-25%', '10-15%', '30-40%', '5-10%', '20-30%'];

// --- Predefined arrays for Rothschild ---

const SECTOR_PERFORMANCES = [
  '+8% sector YTD', '-15% sector YTD', '-28% sector YTD',
  '+3% sector YTD', '-5% sector YTD', '+18% sector YTD',
  '-35% sector YTD', '-10% sector YTD',
];

const CONTRARIAN_SIGNAL_NAMES = [
  'Sector in deep drawdown (>30%)',
  'Extreme negative sentiment',
  'High short interest (>15%)',
  'Insider buying at lows',
];

// --- Predefined arrays for Technical ---

const SIGNAL_NAMES = ['Trend (200 EMA)', 'EMA Crossover', 'RSI (14)', 'MACD', 'Volume', 'Wyckoff Phase'];
const SIGNAL_STATUSES_BULLISH = [
  'Above — Bullish', '50 above 200 — Golden Cross', '55 — Neutral-Bullish',
  'Bullish crossover', 'Above average on up days', 'Markup phase',
];
const SIGNAL_STATUSES_BEARISH = [
  'Below — Bearish', '50 below 200 — Death Cross', '35 — Approaching oversold',
  'Bearish divergence', 'Declining on rallies', 'Distribution phase',
];
const SIGNAL_STATUSES_NEUTRAL = [
  'Flat — Neutral', 'Converging — No clear signal', '50 — Neutral',
  'Flat histogram', 'Average volume', 'Accumulation possible',
];

const ENTRY_ZONE_ACTIONS = [
  'Buy 1/3 position if support holds with volume confirmation',
  'Buy 1/3 position on pullback to moving average',
  'Buy 1/3 position at current levels if momentum continues',
  'Scale in with 1/4 position on any 5% dip',
  'Add to position if price breaks above resistance with volume',
];

// --- Verdict templates ---

const BUFFETT_VERDICTS = [
  'A solid business with reasonable economics, though current valuation requires patience. Wait for a margin of safety before committing significant capital.',
  'The competitive position is strong and management is capable. At the right price, this would be a core holding. Current price demands near-perfect execution.',
  'Business quality is above average with growing competitive advantages. The moat is developing but not yet impregnable. A fair price for a good company.',
  'Fundamentals are sound but not exceptional. This is a "fair company at a fair price" — acceptable but not exciting from a value perspective.',
];

const MUNGER_VERDICTS = [
  'The mental models paint a mixed picture. Business quality is adequate but multiple failure modes exist. Position sizing should reflect the uncertainty.',
  'Several reinforcing factors support the investment thesis, but valuation leaves little room for error. Discipline requires waiting for better odds.',
  'The multi-disciplinary analysis reveals both strengths and vulnerabilities. A small position is justified but conviction is insufficient for a large allocation.',
  'Incentives are aligned and the business model is sound, but the market has already priced in much of the upside. Patience is the intelligent approach.',
];

const LYNCH_VERDICTS = [
  'This is a growth story you can understand and explain simply. The PEG ratio and industry dynamics support ownership, but position size should match your conviction level.',
  'Lynch would appreciate the simplicity and growth trajectory. The 10-bagger potential exists but requires multiple things to go right. A starter position makes sense.',
  'The business passes the "cocktail party test" — you can explain it in one sentence. Growth is real and the valuation is not unreasonable for the opportunity.',
  'A classic growth-at-a-reasonable-price candidate. The industry tailwinds are real and the company is well-positioned. Add on weakness.',
];

const ROTHSCHILD_VERDICTS = [
  'Sentiment is mixed but not at extreme fear levels. This is not a classic "blood in the streets" opportunity, but selective accumulation on weakness is warranted.',
  'Contrarian signals are firing — fear is elevated and the crowd is pessimistic. History rewards those who buy when others are fearful. Size appropriately.',
  'No significant contrarian opportunity at current levels. The crowd is neither euphoric nor panicked. Wait for a sentiment extreme before acting aggressively.',
  'Some blood is visible but not flowing freely. A partial position is justified for those with conviction, but the best entry may still be ahead.',
];

// --- Generator functions ---

function generateBuffettAnalysis(next: () => number, _ticker: string): BuffettAnalysis {
  const sector = pick(next, SECTORS);
  const description = pick(next, BUSINESS_DESCRIPTIONS);
  const complexity = pick(next, COMPLEXITIES);
  const moatScore = Math.round(randomInRange(next, 2, 9) * 10) / 10;

  const factors: MoatFactor[] = MOAT_FACTOR_NAMES.map((name, i) => {
    const roll = next();
    const status: 'pass' | 'caution' | 'fail' = roll < 0.4 ? 'pass' : roll < 0.7 ? 'caution' : 'fail';
    const detail = status === 'pass'
      ? MOAT_FACTOR_DETAILS_PASS[i]
      : status === 'caution'
        ? MOAT_FACTOR_DETAILS_CAUTION[i]
        : MOAT_FACTOR_DETAILS_FAIL[i];
    return { name, status, detail };
  });

  const financialQuality: FinancialMetric[] = FINANCIAL_METRIC_NAMES.map((name) => {
    const roll = next();
    const status: 'pass' | 'caution' | 'fail' = roll < 0.45 ? 'pass' : roll < 0.75 ? 'caution' : 'fail';
    let value: string;
    switch (name) {
      case 'Revenue Growth': value = `${Math.round(randomInRange(next, -5, 80))}% YoY`; break;
      case 'Free Cash Flow': value = `$${Math.round(randomInRange(next, -50, 200))}M annually`; break;
      case 'Return on Equity': value = `${Math.round(randomInRange(next, -20, 80))}%`; break;
      case 'Profit Margin': value = `${Math.round(randomInRange(next, -10, 45) * 10) / 10}% net margin`; break;
      case 'Debt/Equity': value = `${Math.round(randomInRange(next, 0, 3) * 10) / 10}`; break;
      default: value = 'N/A';
    }
    return { name, value, status };
  });

  const currentPrice = Math.round(randomInRange(next, 20, 400) * 100) / 100;
  const intrinsicValue = Math.round(currentPrice * randomInRange(next, 0.6, 1.8) * 100) / 100;
  const marginOfSafety = Math.round(((intrinsicValue - currentPrice) / intrinsicValue) * 100);
  const peRatio = Math.round(randomInRange(next, 8, 80));
  const psRatio = Math.round(randomInRange(next, 1, 40) * 10) / 10;
  const capitalAllocation = Math.round(randomInRange(next, 3, 9));

  return {
    businessUnderstanding: { sector, description, complexity },
    competitiveMoat: { moatScore, factors },
    financialQuality,
    managementQuality: {
      ceoTrackRecord: pick(next, CEO_DESCRIPTIONS),
      insiderBuying: pick(next, INSIDER_BUYING_DESCRIPTIONS),
      stockCompensation: pick(next, STOCK_COMP_DESCRIPTIONS),
      capitalAllocation,
    },
    valuation: { intrinsicValue, currentPrice, marginOfSafety, peRatio, psRatio },
    verdict: pick(next, BUFFETT_VERDICTS),
  };
}

function generateMungerAnalysis(next: () => number): MungerAnalysis {
  const numScenarios = randomInt(next, 4, 5);
  const failureScenarios: FailureScenario[] = [];
  for (let i = 0; i < numScenarios; i++) {
    const severity: 'high' | 'medium' | 'low' = next() < 0.3 ? 'high' : next() < 0.6 ? 'medium' : 'low';
    failureScenarios.push({
      name: FAILURE_SCENARIO_NAMES[i % FAILURE_SCENARIO_NAMES.length],
      probability: Math.round(randomInRange(next, 5, 50)),
      description: FAILURE_DESCRIPTIONS[i % FAILURE_DESCRIPTIONS.length],
      mitigation: FAILURE_MITIGATIONS[i % FAILURE_MITIGATIONS.length],
      severity,
    });
  }

  const mentalModels: MentalModel[] = MENTAL_MODEL_NAMES.map((name, i) => {
    const roll = next();
    const status: 'pass' | 'caution' | 'fail' = roll < 0.4 ? 'pass' : roll < 0.75 ? 'caution' : 'fail';
    const explanation = status === 'pass'
      ? MENTAL_MODEL_EXPLANATIONS_PASS[i]
      : MENTAL_MODEL_EXPLANATIONS_CAUTION[i];
    return { name, status, explanation };
  });

  const multiDisciplinary: MungerAnalysis['multiDisciplinary'] = {
    physics: pick(next, DISCIPLINE_INSIGHTS.physics),
    biology: pick(next, DISCIPLINE_INSIGHTS.biology),
    psychology: pick(next, DISCIPLINE_INSIGHTS.psychology),
    economics: pick(next, DISCIPLINE_INSIGHTS.economics),
    history: pick(next, DISCIPLINE_INSIGHTS.history),
    math: pick(next, DISCIPLINE_INSIGHTS.math),
  };

  return {
    failureScenarios,
    mentalModels,
    multiDisciplinary,
    verdict: pick(next, MUNGER_VERDICTS),
  };
}

function generateLynchAnalysis(next: () => number): LynchAnalysis {
  const pe = Math.round(randomInRange(next, 10, 60));
  const growthRate = Math.round(randomInRange(next, 8, 45));
  const peg = Math.round((pe / growthRate) * 100) / 100;

  const numChecklist = randomInt(next, 5, 6);
  const checklist: { item: string; met: boolean }[] = [];
  for (let i = 0; i < numChecklist; i++) {
    checklist.push({
      item: CHECKLIST_ITEMS[i % CHECKLIST_ITEMS.length],
      met: next() < 0.55,
    });
  }

  return {
    knowWhatYouOwn: pick(next, KNOW_WHAT_YOU_OWN_TEMPLATES),
    industryGrowth: {
      tam: pick(next, TAM_VALUES),
      growthRate: pick(next, GROWTH_RATES),
      trend: pick(next, TRENDS),
    },
    pegAnalysis: {
      pe,
      growthRate,
      peg,
      assessment: pick(next, PEG_ASSESSMENTS),
    },
    tenBaggerPotential: {
      checklist,
      path: pick(next, TEN_BAGGER_PATHS),
      probability: pick(next, TEN_BAGGER_PROBABILITIES),
    },
    verdict: pick(next, LYNCH_VERDICTS),
  };
}

function generateRothschildAnalysis(next: () => number, currentPrice: number): RothschildAnalysis {
  const bloodLevel = Math.round(randomInRange(next, 0, 100));
  const vix = Math.round(randomInRange(next, 12, 45) * 10) / 10;
  const socialSentiment = Math.round(randomInRange(next, 10, 90));
  const shortInterest = Math.round(randomInRange(next, 1, 25) * 10) / 10;

  const contrarianSignals: ContrarianSignal[] = CONTRARIAN_SIGNAL_NAMES.map((name) => ({
    name,
    triggered: next() < 0.4,
  }));
  const contrarianScore = contrarianSignals.filter(s => s.triggered).length;

  const entryZones: EntryZone[] = [
    {
      label: 'Best' as const,
      priceRange: `$${Math.round(currentPrice * 0.7)} - $${Math.round(currentPrice * 0.8)}`,
      positionPercent: `${randomInt(next, 3, 5)}%`,
    },
    {
      label: 'Good' as const,
      priceRange: `$${Math.round(currentPrice * 0.8)} - $${Math.round(currentPrice * 0.9)}`,
      positionPercent: `${randomInt(next, 2, 4)}%`,
    },
    {
      label: 'OK' as const,
      priceRange: `$${Math.round(currentPrice * 0.9)} - $${Math.round(currentPrice * 0.98)}`,
      positionPercent: `${randomInt(next, 1, 3)}%`,
    },
  ];

  return {
    bloodInStreets: {
      bloodLevel,
      vix,
      sectorPerformance: pick(next, SECTOR_PERFORMANCES),
      socialSentiment,
      shortInterest,
    },
    contrarianSignals,
    contrarianScore,
    positionSizing: {
      portfolioPercent: `${randomInt(next, 2, 15)}% maximum`,
      maxLoss: `${randomInt(next, 15, 50)}% drawdown possible`,
      kellyCriterion: `${Math.round(randomInRange(next, 2, 20) * 10) / 10}%`,
    },
    entryZones,
    verdict: pick(next, ROTHSCHILD_VERDICTS),
  };
}

function generateTechnicalAnalysis(next: () => number, currentPrice: number): TechnicalAnalysis {
  const timingScore = randomInt(next, 0, 16);
  const recommendation: 'BUY NOW' | 'WAIT' | 'AVOID' =
    timingScore >= 10 ? 'BUY NOW' : timingScore >= 5 ? 'WAIT' : 'AVOID';

  const buyZoneLow = Math.round(currentPrice * randomInRange(next, 0.85, 0.95));
  const buyZoneHigh = Math.round(currentPrice * randomInRange(next, 0.95, 1.02));
  const stopLoss = Math.round(currentPrice * randomInRange(next, 0.75, 0.88));
  const takeProfit = Math.round(currentPrice * randomInRange(next, 1.2, 1.6));

  const signals: TechnicalSignal[] = SIGNAL_NAMES.map((name) => {
    const score = randomInt(next, 0, 2);
    const statusArr = score === 2 ? SIGNAL_STATUSES_BULLISH : score === 1 ? SIGNAL_STATUSES_NEUTRAL : SIGNAL_STATUSES_BEARISH;
    const idx = randomInt(next, 0, statusArr.length - 1);
    return { name, status: statusArr[idx], score };
  });

  // Generate 12 price points simulating recent price action
  const pricePoints: number[] = [];
  let p = currentPrice * randomInRange(next, 0.75, 0.9);
  for (let i = 0; i < 12; i++) {
    p = p * randomInRange(next, 0.95, 1.08);
    pricePoints.push(Math.round(p * 100) / 100);
  }

  const supportLevel = Math.round(currentPrice * randomInRange(next, 0.78, 0.9));
  const resistanceLevel = Math.round(currentPrice * randomInRange(next, 1.1, 1.4));

  const numStrategies = 3;
  const entryStrategy: { zone: string; action: string }[] = [];
  const zoneLabels = ['Aggressive Entry', 'Core Entry', 'Conservative Entry'];
  for (let i = 0; i < numStrategies; i++) {
    entryStrategy.push({
      zone: zoneLabels[i],
      action: pick(next, ENTRY_ZONE_ACTIONS),
    });
  }

  return {
    timingScore,
    timingVerdict: {
      recommendation,
      buyZone: `$${buyZoneLow} - $${buyZoneHigh}`,
      stopLoss: `$${stopLoss}`,
      takeProfit: `$${takeProfit}`,
    },
    signals,
    chartData: {
      pricePoints,
      supportLevel,
      resistanceLevel,
      buyZone: { low: buyZoneLow, high: buyZoneHigh },
    },
    entryStrategy,
  };
}

/**
 * Generates deterministic placeholder detailed analysis data for any ticker
 * not found in the predefined set. Uses a hash of the ticker string to seed
 * consistent values across all sub-analyses.
 */
export function generatePlaceholderDetailedAnalysis(ticker: string): DetailedAnalysis {
  const hash = hashString(ticker);
  const next = seededRandom(hash);

  const buffettAnalysis = generateBuffettAnalysis(next, ticker);
  const currentPrice = buffettAnalysis.valuation.currentPrice;
  const mungerAnalysis = generateMungerAnalysis(next);
  const lynchAnalysis = generateLynchAnalysis(next);
  const rothschildAnalysis = generateRothschildAnalysis(next, currentPrice);
  const technicalAnalysis = generateTechnicalAnalysis(next, currentPrice);

  return {
    buffettAnalysis,
    mungerAnalysis,
    lynchAnalysis,
    rothschildAnalysis,
    technicalAnalysis,
  };
}
