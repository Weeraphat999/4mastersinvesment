import React, { useState, useRef, useEffect } from 'react';
import TabBar, { TabId } from './TabBar';
import { AnalysisResult, DetailedAnalysis } from '../data/types';
import BuffettTab from './tabs/BuffettTab';
import MungerTab from './tabs/MungerTab';
import LynchTab from './tabs/LynchTab';
import RothschildTab from './tabs/RothschildTab';
import TechnicalTab from './tabs/TechnicalTab';
import ActionItemsTab from './tabs/ActionItemsTab';

interface AnalysisTabsProps {
  data: DetailedAnalysis;
  masterScores: { buffett: number; munger: number; lynch: number; rothschild: number };
  analysisResult: AnalysisResult;
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ data, masterScores, analysisResult }) => {
  const [activeTab, setActiveTab] = useState<TabId>('buffett');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'buffett':
        return <BuffettTab data={data.buffettAnalysis} score={masterScores.buffett} />;
      case 'munger':
        return <MungerTab data={data.mungerAnalysis} score={masterScores.munger} />;
      case 'lynch':
        return <LynchTab data={data.lynchAnalysis} score={masterScores.lynch} />;
      case 'rothschild':
        return <RothschildTab data={data.rothschildAnalysis} score={masterScores.rothschild} />;
      case 'technical':
        return <TechnicalTab data={data.technicalAnalysis} />;
      case 'actions':
        return <ActionItemsTab analysisResult={analysisResult} detailedAnalysis={data} />;
      default:
        return null;
    }
  };

  return (
    <div ref={contentRef}>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div key={activeTab} className="animate-fade-in">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AnalysisTabs;
