import { AnalysisResult, DetailedAnalysis } from '../../data/types';
import { isBuyVerdict } from '../../utils/verdictUtils';
import BuyLayout from './action-items/BuyLayout';
import WatchlistLayout from './action-items/WatchlistLayout';
import DecisionJournal from './action-items/DecisionJournal';

interface ActionItemsTabProps {
  analysisResult: AnalysisResult;
  detailedAnalysis: DetailedAnalysis;
}

export default function ActionItemsTab({ analysisResult, detailedAnalysis }: ActionItemsTabProps) {
  const isBuy = isBuyVerdict(analysisResult.verdict);

  return (
    <div>
      {isBuy ? (
        <BuyLayout
          analysisResult={analysisResult}
          technicalAnalysis={detailedAnalysis.technicalAnalysis}
        />
      ) : (
        <WatchlistLayout analysisResult={analysisResult} />
      )}

      <div id="decision-journal">
        <DecisionJournal
          ticker={analysisResult.ticker}
          companyName={analysisResult.companyName}
          currentPrice={analysisResult.price}
          overallScore={analysisResult.overallScore}
          masterScores={analysisResult.masterScores}
          alertsSet={[]}
        />
      </div>
    </div>
  );
}
