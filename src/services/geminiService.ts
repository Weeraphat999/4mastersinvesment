/**
 * Gemini AI Service — calls Google Gemini API to generate investment analysis
 * from the perspective of 4 master investors.
 * Falls back gracefully when API key is missing or request fails.
 */

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// --- Types ---

export interface GeminiAnalysisResult {
  // Overall
  verdict: 'STRONG BUY' | 'BUY' | 'HOLD' | 'AVOID' | 'STRONG AVOID';
  overallScore: number;
  positionSize: string;
  entryStrategy: string;
  riskLevel: string;
  timeHorizon: string;

  // Master scores
  masterScores: {
    buffett: number;
    munger: number;
    lynch: number;
    rothschild: number;
  };

  // Buffett
  buffettAnalysis: {
    sector: string;
    description: string;
    complexity: string;
    moatScore: number;
    moatFactors: Array<{ name: string; status: 'pass' | 'caution' | 'fail'; detail: string }>;
    managementQuality: {
      ceoTrackRecord: string;
      insiderBuying: string;
      stockCompensation: string;
      capitalAllocation: number;
    };
    intrinsicValue: number;
    marginOfSafety: number;
    verdict: string;
  };

  // Munger
  mungerAnalysis: {
    failureScenarios: Array<{
      name: string;
      probability: number;
      severity: 'high' | 'medium' | 'low';
      description: string;
      mitigation: string;
    }>;
    mentalModels: Array<{
      name: string;
      status: 'pass' | 'caution' | 'fail';
      explanation: string;
    }>;
    verdict: string;
  };

  // Lynch
  lynchAnalysis: {
    knowWhatYouOwn: string;
    industryGrowth: { tam: string; growthRate: string; trend: string };
    tenBaggerPotential: {
      checklist: Array<{ item: string; met: boolean }>;
      path: string;
      probability: string;
    };
    verdict: string;
  };

  // Rothschild
  rothschildAnalysis: {
    bloodLevel: number;
    vix: number;
    sectorPerformance: string;
    socialSentiment: number;
    shortInterest: number;
    contrarianSignals: Array<{ name: string; triggered: boolean }>;
    contrarianScore: number;
    verdict: string;
  };
}

// --- Helpers ---

/**
 * Returns the Gemini API key from environment variables, or null if not configured.
 */
function getGeminiApiKey(): string | null {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') {
    return null;
  }
  return key as string;
}

/**
 * Strips markdown code fences from a response string.
 * Gemini sometimes wraps JSON in ```json ... ``` blocks.
 */
function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  // Remove opening code fence (```json or ```)
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    if (firstNewline !== -1) {
      cleaned = cleaned.substring(firstNewline + 1);
    }
  }
  // Remove closing code fence
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3).trim();
  }
  return cleaned;
}

/**
 * Builds the analysis prompt for Gemini.
 */
function buildPrompt(
  ticker: string,
  companyName: string,
  price: number,
  priceChange: number,
  financialData: { revenue?: string; netIncome?: string; totalAssets?: string; totalLiabilities?: string; operatingCashflow?: string } | null,
  overviewData: { sector?: string; peRatio?: string; profitMargin?: string; pegRatio?: string; debtToEquity?: string; marketCap?: string } | null,
  historicalPrices: number[] | null,
  companyDescription?: string
): string {
  let context = `Stock: ${ticker} (${companyName})\nCurrent Price: $${price.toFixed(2)}\nPrice Change: ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%\n`;

  if (companyDescription) {
    context += `\nCompany Description:\n${companyDescription}\n`;
  }

  if (overviewData) {
    context += `\nCompany Overview:\n`;
    if (overviewData.sector) context += `- Sector: ${overviewData.sector}\n`;
    if (overviewData.marketCap) context += `- Market Cap: ${overviewData.marketCap}\n`;
    if (overviewData.peRatio) context += `- P/E Ratio: ${overviewData.peRatio}\n`;
    if (overviewData.profitMargin) context += `- Profit Margin: ${overviewData.profitMargin}\n`;
    if (overviewData.pegRatio) context += `- PEG Ratio: ${overviewData.pegRatio}\n`;
    if (overviewData.debtToEquity) context += `- Debt/Equity: ${overviewData.debtToEquity}\n`;
  }

  if (financialData) {
    context += `\nFinancial Data (Most Recent Annual):\n`;
    if (financialData.revenue) context += `- Revenue: $${financialData.revenue}\n`;
    if (financialData.netIncome) context += `- Net Income: $${financialData.netIncome}\n`;
    if (financialData.totalAssets) context += `- Total Assets: $${financialData.totalAssets}\n`;
    if (financialData.totalLiabilities) context += `- Total Liabilities: $${financialData.totalLiabilities}\n`;
    if (financialData.operatingCashflow) context += `- Operating Cashflow: $${financialData.operatingCashflow}\n`;
  }

  if (historicalPrices && historicalPrices.length > 0) {
    const high = Math.max(...historicalPrices);
    const low = Math.min(...historicalPrices);
    const avg = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
    const recent = historicalPrices.slice(-5);
    context += `\nHistorical Price Data (12 months):\n`;
    context += `- 52-Week High: $${high.toFixed(2)}\n`;
    context += `- 52-Week Low: $${low.toFixed(2)}\n`;
    context += `- Average Price: $${avg.toFixed(2)}\n`;
    context += `- Recent 5 closes: ${recent.map(p => `$${p.toFixed(2)}`).join(', ')}\n`;
    context += `- Total data points: ${historicalPrices.length}\n`;
  }

  const prompt = `You are an expert investment analyst. Analyze the following stock from the perspective of 4 legendary investors. Use the provided financial data to justify your scores.

COMPANY: ${companyName} (Ticker: ${ticker})
${context}

CRITICAL INSTRUCTIONS:
- Your business description MUST accurately describe what ${companyName} (${ticker}) actually does. Use the company name and sector provided. Do NOT guess or make up what the company does.
- All price-related recommendations (entry levels, stop loss, take profit) MUST be based on the current price of $${price.toFixed(2)}. Entry levels should be within 20% of current price.
- If Buffett score is 0, the moat score should also be low (0-3). Scores must be internally consistent. A company cannot have a 0/10 Buffett score but 6/10 moat.
- Ensure scores are internally consistent. If overall Buffett score is low, individual components (moat, management) should also reflect that.
- The Rothschild optimal entry levels MUST be relative to the current stock price of $${price.toFixed(2)}. Best entry should be 10-20% below current price, Good entry 5-10% below, OK entry near current price.
- INTRINSIC VALUE RULES: Use a conservative DCF or earnings-based valuation. For profitable companies, use P/E * earnings or DCF with 10% discount rate. For unprofitable companies (negative net income or P/E = 0), use revenue-based multiples (1-5x revenue/shares) capped at a MAXIMUM of 2x current price. NEVER estimate intrinsic value more than 3x the current stock price. If the company has no earnings, intrinsic value should typically be BELOW or near the current price.
- MARGIN OF SAFETY: Calculate as ((intrinsicValue - currentPrice) / intrinsicValue) * 100. If intrinsic value is below current price, margin of safety must be NEGATIVE.

Analyze this stock from these 4 perspectives:

1. **Warren Buffett** (Value & Quality): Look for economic moats, consistent earnings, low debt, high ROE, simple business model, margin of safety. Score 0-10.

2. **Charlie Munger** (Risk & Mental Models): Invert — think about what could go wrong. Apply mental models (circle of competence, incentives, second-order effects). Identify failure scenarios. Score 0-10.

3. **Peter Lynch** (Growth at Reasonable Price): Can you explain this business simply? Look at PEG ratio, industry growth, ten-bagger potential. Score 0-10.

4. **Baron Rothschild** (Contrarian/Blood in Streets): Is there fear? Look at price drawdown from highs, sentiment, short interest. Contrarian opportunities. Score 0-10.

Respond ONLY with valid JSON (no markdown, no explanation outside JSON) matching this exact structure:
{
  "verdict": "STRONG BUY" | "BUY" | "HOLD" | "AVOID" | "STRONG AVOID",
  "overallScore": <number 0-10>,
  "positionSize": "<string e.g. '3-5% core position'>",
  "entryStrategy": "<string e.g. 'DCA over 3 months'>",
  "riskLevel": "<LOW|MEDIUM|HIGH>",
  "timeHorizon": "<string e.g. '5-7 years'>",
  "masterScores": { "buffett": <0-10>, "munger": <0-10>, "lynch": <0-10>, "rothschild": <0-10> },
  "buffettAnalysis": {
    "sector": "<string>",
    "description": "<1-2 sentence business description>",
    "complexity": "Simple" | "Moderate" | "Complex",
    "moatScore": <0-10>,
    "moatFactors": [{ "name": "<factor>", "status": "pass"|"caution"|"fail", "detail": "<explanation>" }],
    "managementQuality": { "ceoTrackRecord": "<string>", "insiderBuying": "<string>", "stockCompensation": "<string>", "capitalAllocation": <0-10> },
    "intrinsicValue": <number estimated fair value>,
    "marginOfSafety": <number percentage>,
    "verdict": "<What Buffett would say about this stock>"
  },
  "mungerAnalysis": {
    "failureScenarios": [{ "name": "<scenario>", "probability": <0-100>, "severity": "high"|"medium"|"low", "description": "<detail>", "mitigation": "<how to mitigate>" }],
    "mentalModels": [{ "name": "<model name>", "status": "pass"|"caution"|"fail", "explanation": "<how it applies>" }],
    "verdict": "<What Munger would say>"
  },
  "lynchAnalysis": {
    "knowWhatYouOwn": "<Simple explanation of what the company does>",
    "industryGrowth": { "tam": "<total addressable market>", "growthRate": "<growth rate>", "trend": "Accelerating"|"Stable"|"Decelerating" },
    "tenBaggerPotential": { "checklist": [{ "item": "<criterion>", "met": true|false }], "path": "<path to 10x>", "probability": "<Low|Medium|High>" },
    "verdict": "<What Lynch would say>"
  },
  "rothschildAnalysis": {
    "bloodLevel": <0-100 how much fear/blood in streets>,
    "vix": <estimated VIX level>,
    "sectorPerformance": "<sector performance description>",
    "socialSentiment": <0-100 social media sentiment>,
    "shortInterest": <percentage short interest estimate>,
    "contrarianSignals": [{ "name": "<signal>", "triggered": true|false }],
    "contrarianScore": <0-4 number of triggered signals>,
    "verdict": "<What Rothschild would say>"
  }
}

Important: All scores must be justified by the actual financial data provided. Be realistic and data-driven. If data is limited, note that in your analysis but still provide your best estimate. Remember: this is ${companyName} (${ticker}) — ensure your description matches this specific company. All price targets must be anchored to the current price of $${price.toFixed(2)}.`;

  return prompt;
}

// --- Main export ---

/**
 * Calls the Gemini API to analyze a stock from 4 master investor perspectives.
 * Returns null if the API key is not configured or if the request fails.
 */
export async function analyzeWithGemini(
  ticker: string,
  companyName: string,
  price: number,
  priceChange: number,
  financialData: { revenue?: string; netIncome?: string; totalAssets?: string; totalLiabilities?: string; operatingCashflow?: string } | null,
  overviewData: { sector?: string; peRatio?: string; profitMargin?: string; pegRatio?: string; debtToEquity?: string; marketCap?: string } | null,
  historicalPrices: number[] | null,
  companyDescription?: string
): Promise<GeminiAnalysisResult | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn('[GeminiService] API key not configured. Skipping AI analysis.');
    return null;
  }

  const prompt = buildPrompt(ticker, companyName, price, priceChange, financialData, overviewData, historicalPrices, companyDescription);

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[GeminiService] API returned HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Extract text content from Gemini response
    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      console.error('[GeminiService] No text content in Gemini response');
      return null;
    }

    // Parse JSON from response (strip code fences if present)
    const cleanedJson = stripCodeFences(textContent);
    const parsed = JSON.parse(cleanedJson) as GeminiAnalysisResult;

    // Basic validation
    if (!parsed.verdict || typeof parsed.overallScore !== 'number' || !parsed.masterScores) {
      console.error('[GeminiService] Parsed response missing required fields');
      return null;
    }

    // Clamp scores to valid ranges
    parsed.overallScore = Math.max(0, Math.min(10, parsed.overallScore));
    parsed.masterScores.buffett = Math.max(0, Math.min(10, parsed.masterScores.buffett));
    parsed.masterScores.munger = Math.max(0, Math.min(10, parsed.masterScores.munger));
    parsed.masterScores.lynch = Math.max(0, Math.min(10, parsed.masterScores.lynch));
    parsed.masterScores.rothschild = Math.max(0, Math.min(10, parsed.masterScores.rothschild));

    return parsed;
  } catch (error) {
    console.error('[GeminiService] Error calling Gemini API:', error);
    return null;
  }
}
