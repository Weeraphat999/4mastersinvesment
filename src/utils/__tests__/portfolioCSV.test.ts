import { describe, it, expect } from 'vitest';
import { generatePortfolioCSV } from '../portfolioCSV';
import { PortfolioHolding } from '../../data/types';

describe('generatePortfolioCSV', () => {
  const mockHoldings: PortfolioHolding[] = [
    {
      id: '1',
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      shares: 10,
      avgCost: 150,
      currentPrice: 175,
      purchaseDate: '2024-01-15',
      category: 'Technology',
      riskLevel: 'low',
      notes: '',
    },
    {
      id: '2',
      ticker: 'TSLA',
      companyName: 'Tesla Inc.',
      shares: 5,
      avgCost: 200,
      currentPrice: 180,
      purchaseDate: '2024-03-01',
      category: 'Automotive',
      riskLevel: 'high',
      notes: '',
    },
  ];

  it('should produce a header row followed by one data row per holding', () => {
    const totalValue = 10 * 175 + 5 * 180; // 1750 + 900 = 2650
    const csv = generatePortfolioCSV(mockHoldings, totalValue);
    const lines = csv.split('\n');

    expect(lines.length).toBe(3); // header + 2 data rows
    expect(lines[0]).toBe(
      'Ticker,Company,Shares,Avg Cost,Current Price,Gain/Loss,Portfolio %,Purchase Date,Category,Risk Level'
    );
  });

  it('should compute gain/loss as (currentPrice - avgCost) * shares', () => {
    const totalValue = 2650;
    const csv = generatePortfolioCSV(mockHoldings, totalValue);
    const lines = csv.split('\n');

    // AAPL: (175 - 150) * 10 = 250
    expect(lines[1]).toContain('250.00');
    // TSLA: (180 - 200) * 5 = -100
    expect(lines[2]).toContain('-100.00');
  });

  it('should compute portfolio % as (shares * currentPrice) / totalValue * 100', () => {
    const totalValue = 2650;
    const csv = generatePortfolioCSV(mockHoldings, totalValue);
    const lines = csv.split('\n');

    // AAPL: (10 * 175) / 2650 * 100 = 66.04%
    expect(lines[1]).toContain('66.04');
    // TSLA: (5 * 180) / 2650 * 100 = 33.96%
    expect(lines[2]).toContain('33.96');
  });

  it('should handle empty holdings array', () => {
    const csv = generatePortfolioCSV([], 0);
    const lines = csv.split('\n');

    expect(lines.length).toBe(1); // header only
    expect(lines[0]).toBe(
      'Ticker,Company,Shares,Avg Cost,Current Price,Gain/Loss,Portfolio %,Purchase Date,Category,Risk Level'
    );
  });

  it('should handle totalValue of 0 without division error', () => {
    const csv = generatePortfolioCSV(mockHoldings, 0);
    const lines = csv.split('\n');

    // Portfolio % should be 0.00 when totalValue is 0
    expect(lines[1]).toContain('0.00');
    expect(lines[2]).toContain('0.00');
  });

  it('should preserve ticker, shares, avgCost, currentPrice, purchaseDate, category, riskLevel', () => {
    const totalValue = 2650;
    const csv = generatePortfolioCSV(mockHoldings, totalValue);
    const lines = csv.split('\n');
    const fields = lines[1].split(',');

    expect(fields[0]).toBe('AAPL');
    expect(fields[1]).toBe('Apple Inc.');
    expect(fields[2]).toBe('10');
    expect(fields[3]).toBe('150');
    expect(fields[4]).toBe('175');
    expect(fields[7]).toBe('2024-01-15');
    expect(fields[8]).toBe('Technology');
    expect(fields[9]).toBe('low');
  });
});
