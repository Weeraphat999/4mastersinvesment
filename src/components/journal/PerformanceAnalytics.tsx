import type { DecisionEntry } from '../../data/types';
import type { PerformanceMetrics } from '../../utils/journalCalculations';
import {
  computeMonthlyReturns,
  computeDecisionBreakdown,
  computeOutcomeDistribution,
} from '../../utils/journalCalculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface PerformanceAnalyticsProps {
  decisions: DecisionEntry[];
  metrics: PerformanceMetrics;
  hasEnoughData: boolean;
}

const DECISION_COLORS: Record<string, string> = {
  BUY: '#10B981',
  PASS: '#F59E0B',
  WATCHLIST: '#3B82F6',
};

const OUTCOME_COLORS = {
  Wins: '#10B981',
  Losses: '#EF4444',
};

export default function PerformanceAnalytics({ decisions, metrics, hasEnoughData }: PerformanceAnalyticsProps) {
  if (!hasEnoughData) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">📈 Performance Analytics</h3>
        <p className="text-gray-400 text-center py-8">
          Insufficient data for charts. Need at least 2 closed decisions.
        </p>
      </div>
    );
  }

  const monthlyReturns = computeMonthlyReturns(decisions);
  const decisionBreakdown = computeDecisionBreakdown(decisions);
  const outcomeDistribution = computeOutcomeDistribution(decisions);

  const outcomeData = [
    { name: 'Wins', value: outcomeDistribution.wins },
    { name: 'Losses', value: outcomeDistribution.losses },
  ];

  const streakLabel = `${metrics.currentStreak.count}${metrics.currentStreak.type === 'win' ? 'W' : 'L'}`;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-6">📈 Performance Analytics</h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase">Win Rate</p>
          <p className="text-white text-xl font-bold">{metrics.winRate.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase">Avg Win</p>
          <p className="text-green-400 text-xl font-bold">+{metrics.avgWinPercent.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase">Avg Loss</p>
          <p className="text-red-400 text-xl font-bold">{metrics.avgLossPercent.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase">Profit Factor</p>
          <p className="text-white text-xl font-bold">
            {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs uppercase">Streak</p>
          <p className={`text-xl font-bold ${metrics.currentStreak.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
            {streakLabel}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Returns Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Monthly Returns</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Bar dataKey="returnPct" name="Return %">
                {monthlyReturns.map((entry, index) => (
                  <Cell key={index} fill={entry.returnPct >= 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Decision Breakdown Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Decision Breakdown</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={decisionBreakdown}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {decisionBreakdown.map((entry, index) => (
                  <Cell key={index} fill={DECISION_COLORS[entry.type]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Outcome Distribution Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Outcome Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={outcomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#F9FAFB' }}
              />
              <Bar dataKey="value" name="Count">
                {outcomeData.map((entry, index) => (
                  <Cell key={index} fill={OUTCOME_COLORS[entry.name as keyof typeof OUTCOME_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
