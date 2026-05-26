import { useState } from 'react';
import { AnalysisResult, TechnicalAnalysis } from '../../../data/types';
import { calculatePositionSizing } from '../../../utils/positionSizing';
import { PositionSizingCard } from './PositionSizingCard';
import { PortfolioCalculatorModal } from './PortfolioCalculatorModal';
import { DCAScheduleCard } from './DCAScheduleCard';
import AlertsChecklist from './AlertsChecklist';
import ReviewScheduleCard from './ReviewScheduleCard';
import { ExitCriteriaCard } from './ExitCriteriaCard';
import { NextStepsButtons } from './NextStepsButtons';

interface BuyLayoutProps {
  analysisResult: AnalysisResult;
  technicalAnalysis: TechnicalAnalysis;
}

export function BuyLayout({ analysisResult, technicalAnalysis }: BuyLayoutProps) {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const { riskLevel, overallScore, price: currentPrice, ticker } = analysisResult;

  const { allocationPercent } = calculatePositionSizing(riskLevel, overallScore);

  // Calculate total amount for DCA using default $100,000 portfolio
  const defaultPortfolio = 100000;
  const totalAmount = (defaultPortfolio * allocationPercent) / 100;

  const handleOpenCalculator = () => setIsCalculatorOpen(true);
  const handleCloseCalculator = () => setIsCalculatorOpen(false);

  const handleSaveToJournal = () => {
    const journalSection = document.getElementById('decision-journal');
    if (journalSection) {
      journalSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExportPlan = () => {
    const planText = [
      `Investment Action Plan - ${ticker}`,
      `================================`,
      ``,
      `Position Sizing: ${allocationPercent}% allocation`,
      `Total DCA Amount: $${totalAmount.toLocaleString()}`,
      `Current Price: $${currentPrice}`,
      `Risk Level: ${riskLevel}`,
      ``,
      `DCA Schedule: ${technicalAnalysis.timingVerdict.recommendation === 'WAIT' ? '6' : '4'} months`,
      ``,
      `Exit Criteria: Review if thesis invalidated`,
      ``,
      `Alerts: Set price and fundamental alerts`,
    ].join('\n');

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticker}_action_plan.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetAlerts = () => {
    const alertsSection = document.getElementById('alerts-checklist');
    if (alertsSection) {
      alertsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">⚡ RECOMMENDED ACTIONS</h1>
      <p className="text-gray-400 mb-8">Based on BUY recommendation</p>

      <PositionSizingCard
        riskLevel={riskLevel}
        overallScore={overallScore}
        currentPrice={currentPrice}
        onOpenCalculator={handleOpenCalculator}
      />

      <PortfolioCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={handleCloseCalculator}
        allocationPercent={allocationPercent}
      />

      <DCAScheduleCard
        ticker={ticker}
        totalAmount={totalAmount}
        currentPrice={currentPrice}
        technicalScore={technicalAnalysis.timingScore}
        timingVerdict={technicalAnalysis.timingVerdict.recommendation}
      />

      <div id="alerts-checklist">
        <AlertsChecklist ticker={ticker} />
      </div>

      <ReviewScheduleCard ticker={ticker} />

      <ExitCriteriaCard riskLevel={riskLevel} />

      <NextStepsButtons
        onSaveToJournal={handleSaveToJournal}
        onExportPlan={handleExportPlan}
        onSetAlerts={handleSetAlerts}
      />
    </div>
  );
}

export default BuyLayout;
