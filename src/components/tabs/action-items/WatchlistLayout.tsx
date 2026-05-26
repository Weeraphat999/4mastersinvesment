import { AnalysisResult } from '../../../data/types';
import WatchlistCard from './WatchlistCard';
import { PriceAlertsCard } from './PriceAlertsCard';
import CatalystChecklist from './CatalystChecklist';
import { RevisitDateCard } from './RevisitDateCard';
import { WisdomQuoteCard } from './WisdomQuoteCard';

interface WatchlistLayoutProps {
  analysisResult: AnalysisResult;
}

export default function WatchlistLayout({ analysisResult }: WatchlistLayoutProps) {
  const { ticker, companyName, price, verdict } = analysisResult;
  const targetPrice = price * 0.7;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">⏸️ WATCHLIST ACTIONS</h1>
      <p className="text-gray-400 mb-8">Not buying now, but worth watching</p>

      <WatchlistCard ticker={ticker} companyName={companyName} />
      <PriceAlertsCard ticker={ticker} currentPrice={price} />
      <CatalystChecklist ticker={ticker} verdict={verdict} />
      <RevisitDateCard />
      <WisdomQuoteCard currentPrice={price} targetPrice={targetPrice} />
    </div>
  );
}
