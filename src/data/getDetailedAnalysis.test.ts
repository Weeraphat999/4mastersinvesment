import { describe, it, expect } from 'vitest';
import { getDetailedAnalysis } from './getDetailedAnalysis';
import { generatePlaceholderDetailedAnalysis } from './generateDetailedPlaceholder';
import { PREDEFINED_DETAILED_DATA } from './detailedMockData';

describe('getDetailedAnalysis', () => {
  describe('predefined tickers return predefined data', () => {
    it('returns predefined data for AAPL', () => {
      const result = getDetailedAnalysis('AAPL');
      expect(result).toBe(PREDEFINED_DETAILED_DATA['AAPL']);
    });

    it('returns predefined data for NVDA', () => {
      const result = getDetailedAnalysis('NVDA');
      expect(result).toBe(PREDEFINED_DETAILED_DATA['NVDA']);
    });

    it('returns predefined data for QTUM', () => {
      const result = getDetailedAnalysis('QTUM');
      expect(result).toBe(PREDEFINED_DETAILED_DATA['QTUM']);
    });
  });

  describe('case-insensitive matching', () => {
    it('"aapl" and "AAPL" return the same result', () => {
      const lower = getDetailedAnalysis('aapl');
      const upper = getDetailedAnalysis('AAPL');
      expect(lower).toEqual(upper);
    });

    it('"Nvda" and "NVDA" return the same result', () => {
      const mixed = getDetailedAnalysis('Nvda');
      const upper = getDetailedAnalysis('NVDA');
      expect(mixed).toEqual(upper);
    });
  });

  describe('unknown tickers return deterministic placeholder data', () => {
    it('calling twice with the same ticker gives identical results', () => {
      const first = getDetailedAnalysis('XYZA');
      const second = getDetailedAnalysis('XYZA');
      expect(first).toEqual(second);
    });

    it('different unknown tickers produce different results', () => {
      const a = getDetailedAnalysis('AAAA');
      const b = getDetailedAnalysis('ZZZZ');
      // They should differ in at least some field
      expect(a).not.toEqual(b);
    });
  });

  describe('all fields are populated with valid values', () => {
    it('buffettAnalysis has all required fields', () => {
      const result = getDetailedAnalysis('UNKNOWN');
      const { buffettAnalysis } = result;

      expect(buffettAnalysis.businessUnderstanding.sector).toBeTruthy();
      expect(buffettAnalysis.businessUnderstanding.description).toBeTruthy();
      expect(['Simple', 'Moderate', 'Complex']).toContain(buffettAnalysis.businessUnderstanding.complexity);

      expect(buffettAnalysis.competitiveMoat.moatScore).toBeGreaterThanOrEqual(0);
      expect(buffettAnalysis.competitiveMoat.factors.length).toBeGreaterThanOrEqual(1);
      buffettAnalysis.competitiveMoat.factors.forEach((factor) => {
        expect(factor.name).toBeTruthy();
        expect(['pass', 'caution', 'fail']).toContain(factor.status);
        expect(factor.detail).toBeTruthy();
      });

      expect(buffettAnalysis.financialQuality.length).toBeGreaterThanOrEqual(1);
      buffettAnalysis.financialQuality.forEach((metric) => {
        expect(metric.name).toBeTruthy();
        expect(metric.value).toBeTruthy();
        expect(['pass', 'caution', 'fail']).toContain(metric.status);
      });

      expect(buffettAnalysis.managementQuality.ceoTrackRecord).toBeTruthy();
      expect(buffettAnalysis.managementQuality.insiderBuying).toBeTruthy();
      expect(buffettAnalysis.managementQuality.stockCompensation).toBeTruthy();
      expect(typeof buffettAnalysis.managementQuality.capitalAllocation).toBe('number');

      expect(typeof buffettAnalysis.valuation.intrinsicValue).toBe('number');
      expect(typeof buffettAnalysis.valuation.currentPrice).toBe('number');
      expect(typeof buffettAnalysis.valuation.marginOfSafety).toBe('number');
      expect(typeof buffettAnalysis.valuation.peRatio).toBe('number');
      expect(typeof buffettAnalysis.valuation.psRatio).toBe('number');

      expect(buffettAnalysis.verdict).toBeTruthy();
    });

    it('mungerAnalysis has all required fields', () => {
      const result = getDetailedAnalysis('UNKNOWN');
      const { mungerAnalysis } = result;

      expect(mungerAnalysis.failureScenarios.length).toBeGreaterThanOrEqual(4);
      mungerAnalysis.failureScenarios.forEach((scenario) => {
        expect(scenario.name).toBeTruthy();
        expect(scenario.probability).toBeGreaterThanOrEqual(0);
        expect(scenario.probability).toBeLessThanOrEqual(100);
        expect(scenario.description).toBeTruthy();
        expect(scenario.mitigation).toBeTruthy();
        expect(['high', 'medium', 'low']).toContain(scenario.severity);
      });

      expect(mungerAnalysis.mentalModels.length).toBeGreaterThanOrEqual(6);
      mungerAnalysis.mentalModels.forEach((model) => {
        expect(model.name).toBeTruthy();
        expect(['pass', 'caution', 'fail']).toContain(model.status);
        expect(model.explanation).toBeTruthy();
      });

      expect(mungerAnalysis.multiDisciplinary.physics).toBeTruthy();
      expect(mungerAnalysis.multiDisciplinary.biology).toBeTruthy();
      expect(mungerAnalysis.multiDisciplinary.psychology).toBeTruthy();
      expect(mungerAnalysis.multiDisciplinary.economics).toBeTruthy();
      expect(mungerAnalysis.multiDisciplinary.history).toBeTruthy();
      expect(mungerAnalysis.multiDisciplinary.math).toBeTruthy();

      expect(mungerAnalysis.verdict).toBeTruthy();
    });

    it('lynchAnalysis has all required fields', () => {
      const result = getDetailedAnalysis('UNKNOWN');
      const { lynchAnalysis } = result;

      expect(lynchAnalysis.knowWhatYouOwn).toBeTruthy();

      expect(lynchAnalysis.industryGrowth.tam).toBeTruthy();
      expect(lynchAnalysis.industryGrowth.growthRate).toBeTruthy();
      expect(['Accelerating', 'Stable', 'Decelerating']).toContain(lynchAnalysis.industryGrowth.trend);

      expect(typeof lynchAnalysis.pegAnalysis.pe).toBe('number');
      expect(typeof lynchAnalysis.pegAnalysis.growthRate).toBe('number');
      expect(typeof lynchAnalysis.pegAnalysis.peg).toBe('number');
      expect(lynchAnalysis.pegAnalysis.assessment).toBeTruthy();

      expect(lynchAnalysis.tenBaggerPotential.checklist.length).toBeGreaterThanOrEqual(1);
      lynchAnalysis.tenBaggerPotential.checklist.forEach((item) => {
        expect(item.item).toBeTruthy();
        expect(typeof item.met).toBe('boolean');
      });
      expect(lynchAnalysis.tenBaggerPotential.path).toBeTruthy();
      expect(lynchAnalysis.tenBaggerPotential.probability).toBeTruthy();

      expect(lynchAnalysis.verdict).toBeTruthy();
    });

    it('rothschildAnalysis has all required fields', () => {
      const result = getDetailedAnalysis('UNKNOWN');
      const { rothschildAnalysis } = result;

      expect(typeof rothschildAnalysis.bloodInStreets.bloodLevel).toBe('number');
      expect(rothschildAnalysis.bloodInStreets.bloodLevel).toBeGreaterThanOrEqual(0);
      expect(rothschildAnalysis.bloodInStreets.bloodLevel).toBeLessThanOrEqual(100);
      expect(typeof rothschildAnalysis.bloodInStreets.vix).toBe('number');
      expect(rothschildAnalysis.bloodInStreets.sectorPerformance).toBeTruthy();
      expect(typeof rothschildAnalysis.bloodInStreets.socialSentiment).toBe('number');
      expect(typeof rothschildAnalysis.bloodInStreets.shortInterest).toBe('number');

      expect(rothschildAnalysis.contrarianSignals.length).toBe(4);
      rothschildAnalysis.contrarianSignals.forEach((signal) => {
        expect(signal.name).toBeTruthy();
        expect(typeof signal.triggered).toBe('boolean');
      });

      expect(typeof rothschildAnalysis.contrarianScore).toBe('number');

      expect(rothschildAnalysis.positionSizing.portfolioPercent).toBeTruthy();
      expect(rothschildAnalysis.positionSizing.maxLoss).toBeTruthy();
      expect(rothschildAnalysis.positionSizing.kellyCriterion).toBeTruthy();

      expect(rothschildAnalysis.entryZones.length).toBe(3);
      rothschildAnalysis.entryZones.forEach((zone) => {
        expect(['Best', 'Good', 'OK']).toContain(zone.label);
        expect(zone.priceRange).toBeTruthy();
        expect(zone.positionPercent).toBeTruthy();
      });

      expect(rothschildAnalysis.verdict).toBeTruthy();
    });

    it('technicalAnalysis has all required fields', () => {
      const result = getDetailedAnalysis('UNKNOWN');
      const { technicalAnalysis } = result;

      expect(typeof technicalAnalysis.timingScore).toBe('number');
      expect(technicalAnalysis.timingScore).toBeGreaterThanOrEqual(0);
      expect(technicalAnalysis.timingScore).toBeLessThanOrEqual(16);

      expect(['BUY NOW', 'WAIT', 'AVOID']).toContain(technicalAnalysis.timingVerdict.recommendation);
      expect(technicalAnalysis.timingVerdict.buyZone).toBeTruthy();
      expect(technicalAnalysis.timingVerdict.stopLoss).toBeTruthy();
      expect(technicalAnalysis.timingVerdict.takeProfit).toBeTruthy();

      expect(technicalAnalysis.signals.length).toBeGreaterThanOrEqual(1);
      technicalAnalysis.signals.forEach((signal) => {
        expect(signal.name).toBeTruthy();
        expect(signal.status).toBeTruthy();
        expect(typeof signal.score).toBe('number');
      });

      expect(technicalAnalysis.chartData.pricePoints.length).toBeGreaterThanOrEqual(1);
      expect(typeof technicalAnalysis.chartData.supportLevel).toBe('number');
      expect(typeof technicalAnalysis.chartData.resistanceLevel).toBe('number');
      expect(typeof technicalAnalysis.chartData.buyZone.low).toBe('number');
      expect(typeof technicalAnalysis.chartData.buyZone.high).toBe('number');

      expect(technicalAnalysis.entryStrategy.length).toBeGreaterThanOrEqual(1);
      technicalAnalysis.entryStrategy.forEach((entry) => {
        expect(entry.zone).toBeTruthy();
        expect(entry.action).toBeTruthy();
      });
    });
  });
});

describe('generatePlaceholderDetailedAnalysis', () => {
  it('produces deterministic output for the same ticker', () => {
    const first = generatePlaceholderDetailedAnalysis('TESTTICKER');
    const second = generatePlaceholderDetailedAnalysis('TESTTICKER');
    expect(first).toEqual(second);
  });

  it('produces different output for different tickers', () => {
    const a = generatePlaceholderDetailedAnalysis('ALPHA');
    const b = generatePlaceholderDetailedAnalysis('BETA');
    expect(a).not.toEqual(b);
  });

  it('generates buffettAnalysis.competitiveMoat.factors with items', () => {
    const result = generatePlaceholderDetailedAnalysis('MOATTEST');
    expect(result.buffettAnalysis.competitiveMoat.factors.length).toBeGreaterThanOrEqual(1);
    result.buffettAnalysis.competitiveMoat.factors.forEach((factor) => {
      expect(factor.name).toBeTruthy();
      expect(['pass', 'caution', 'fail']).toContain(factor.status);
      expect(factor.detail).toBeTruthy();
    });
  });

  it('generates technicalAnalysis.signals as an array', () => {
    const result = generatePlaceholderDetailedAnalysis('SIGTEST');
    expect(Array.isArray(result.technicalAnalysis.signals)).toBe(true);
    expect(result.technicalAnalysis.signals.length).toBeGreaterThanOrEqual(1);
  });
});
