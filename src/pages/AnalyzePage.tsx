import { useState, useEffect, useRef } from 'react';
import SearchAutocomplete from '../components/SearchAutocomplete';
import ExampleButtons from '../components/ExampleButtons';
import CompanyHeader from '../components/CompanyHeader';
import VerdictCard from '../components/VerdictCard';
import MasterScoresCard from '../components/MasterScoresCard';
import QuickFactsCard from '../components/QuickFactsCard';
import NewSearchButton from '../components/NewSearchButton';
import AnalysisTabs from '../components/AnalysisTabs';
import LoadingProgress from '../components/LoadingProgress';
import RateLimitBanner from '../components/RateLimitBanner';
import FallbackIndicator from '../components/FallbackIndicator';
import { analyzeStock } from '../services/analysisOrchestrator';
import type { AnalysisProgress, DataSourceInfo } from '../services/types';
import type { AnalysisResult, DetailedAnalysis } from '../data/types';

function AnalyzePage() {
  const [view, setView] = useState<'search' | 'loading' | 'results'>('search');
  const [searchValue, setSearchValue] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [detailedAnalysisData, setDetailedAnalysisData] = useState<DetailedAnalysis | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [dataSource, setDataSource] = useState<DataSourceInfo | null>(null);
  const [rateLimitVisible, setRateLimitVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (ticker: string) => {
    const normalized = ticker.trim().toUpperCase();
    if (!normalized) return;

    setSearchValue(ticker);
    setIsAnalyzing(true);
    setView('loading');
    setProgress(null);
    setDataSource(null);
    setRateLimitVisible(false);

    // Force scroll to top immediately
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    try {
      const result = await analyzeStock(normalized, (progressUpdate) => {
        setProgress(progressUpdate);
      });

      setAnalysisData(result.analysisResult);
      setDetailedAnalysisData(result.detailedAnalysis);
      setDataSource(result.dataSource);

      // Show rate limit banner when financials data is from fallback
      if (result.dataSource.financialsSource === 'fallback') {
        setRateLimitVisible(true);
      }

      setView('results');
    } catch {
      // Even if something unexpected happens, the orchestrator should never throw,
      // but just in case, fall back gracefully
      setView('search');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewSearch = () => {
    setAnalysisData(null);
    setDetailedAnalysisData(null);
    setDataSource(null);
    setProgress(null);
    setSearchValue('');
    setRateLimitVisible(false);
    setView('search');
  };

  // No auto-scroll — let user scroll manually
  // Force stay at top when view changes to results
  useEffect(() => {
    if (view === 'loading' || view === 'results') {
      // Use requestAnimationFrame to ensure DOM has updated before scrolling
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    }
  }, [view]);

  return (
    <>
      <RateLimitBanner
        visible={rateLimitVisible}
        onDismiss={() => setRateLimitVisible(false)}
      />

      {/* Search bar always visible at top */}
      <div className="w-full pt-6 pb-4 p-6">
        <div className="w-full max-w-2xl mx-auto space-y-4">
          <SearchAutocomplete
            value={searchValue}
            onChange={(val) => {
              setSearchValue(val);
              // Hide old results when user starts typing new search
              if (view === 'results') {
                setView('search');
              }
            }}
            onSearch={handleSearch}
          />
          {view === 'search' && (
            <div className="flex justify-center">
              <ExampleButtons onSelect={handleSearch} />
            </div>
          )}
        </div>
      </div>

      {view === 'loading' && isAnalyzing && (
        <main className="flex flex-col items-center justify-center min-h-[40vh] p-6">
          <div className="w-full max-w-sm space-y-4">
            <h2 className="text-xl font-semibold text-white text-center mb-4">
              Analyzing {searchValue.toUpperCase()}...
            </h2>
            {progress && (
              <LoadingProgress
                stages={progress.stages}
                currentStageIndex={progress.currentStageIndex}
              />
            )}
          </div>
        </main>
      )}

      {view === 'results' && analysisData && (
        <main
          ref={resultsRef}
          className="p-5 max-w-4xl mx-auto animate-fade-in"
        >
          {dataSource && (
            <section className="mb-4 flex justify-end">
              <FallbackIndicator dataSource={dataSource} />
            </section>
          )}

          <section className="mb-5">
            <CompanyHeader
              ticker={analysisData.ticker}
              companyName={analysisData.companyName}
              price={analysisData.price}
              priceChange={analysisData.priceChange}
            />
          </section>

          <section className="mb-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VerdictCard
              verdict={analysisData.verdict}
              positionSize={analysisData.positionSize}
              entryStrategy={analysisData.entryStrategy}
              riskLevel={analysisData.riskLevel}
              timeHorizon={analysisData.timeHorizon}
              overallScore={analysisData.overallScore}
            />
            <MasterScoresCard
              scores={[
                { name: 'Buffett', score: analysisData.masterScores.buffett, color: 'bg-blue-500' },
                { name: 'Munger', score: analysisData.masterScores.munger, color: 'bg-purple-500' },
                { name: 'Lynch', score: analysisData.masterScores.lynch, color: 'bg-green-500' },
                { name: 'Rothschild', score: analysisData.masterScores.rothschild, color: 'bg-yellow-500' },
              ]}
              overallScore={analysisData.overallScore}
            />
          </section>

          <section className="mb-5">
            <QuickFactsCard
              facts={[
                { label: 'Market Cap', value: analysisData.quickFacts.marketCap },
                { label: 'Price/Sales', value: analysisData.quickFacts.priceSales },
                { label: 'Cash Runway', value: analysisData.quickFacts.cashRunway },
                { label: 'Sector', value: analysisData.quickFacts.sector },
                { label: '52-Week Range', value: analysisData.quickFacts.weekRange52 },
                { label: 'Moat', value: analysisData.quickFacts.moat },
                { label: 'Profit Margin', value: analysisData.quickFacts.profitMargin },
                { label: 'Debt/Equity', value: analysisData.quickFacts.debtEquity },
              ]}
            />
          </section>

          {detailedAnalysisData && (
            <section className="mb-5">
              <AnalysisTabs
                data={detailedAnalysisData}
                masterScores={analysisData.masterScores}
                analysisResult={analysisData}
              />
            </section>
          )}
        </main>
      )}
    </>
  );
}

export default AnalyzePage;
