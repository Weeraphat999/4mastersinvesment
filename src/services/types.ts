import type { AnalysisResult, DetailedAnalysis } from '../data/types';

// Cache entry wrapper
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Data source tracking
export interface DataSourceInfo {
  quoteSource: 'live' | 'cached' | 'fallback';
  historicalSource: 'live' | 'cached' | 'fallback';
  financialsSource: 'live' | 'cached' | 'fallback';
  indicatorsComputed: boolean;
  aiSource?: 'gemini' | 'fallback';
}

// Analysis orchestration
export interface AnalysisStage {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'success' | 'warning';
}

// Error handling
export type ApiErrorType = 'NOT_FOUND' | 'NETWORK' | 'RATE_LIMIT' | 'TIMEOUT' | 'UNKNOWN';

export interface ApiError {
  type: ApiErrorType;
  message: string;
  technical: string;
}

export interface AnalysisProgress {
  stages: AnalysisStage[];
  currentStageIndex: number;
}

export interface AnalysisOrchestratorResult {
  analysisResult: AnalysisResult;
  detailedAnalysis: DetailedAnalysis;
  dataSource: DataSourceInfo;
}
