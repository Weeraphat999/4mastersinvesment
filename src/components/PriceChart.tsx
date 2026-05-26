import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

interface PriceChartProps {
  pricePoints: number[];
  supportLevel: number;
  resistanceLevel: number;
  buyZone: { low: number; high: number };
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PriceChart: React.FC<PriceChartProps> = ({
  pricePoints,
  supportLevel,
  resistanceLevel,
  buyZone,
}) => {
  const chartData = useMemo(() => {
    if (pricePoints.length === 0) return [];

    // Generate approximate month labels based on data points
    // Assume data spans ~12 months
    const totalPoints = pricePoints.length;
    const now = new Date();
    const startMonth = now.getMonth() - 11; // 12 months ago

    return pricePoints.map((price, index) => {
      const monthOffset = Math.floor((index / totalPoints) * 12);
      const monthIndex = ((startMonth + monthOffset) % 12 + 12) % 12;
      return {
        date: MONTH_LABELS[monthIndex],
        price: Math.round(price * 100) / 100,
        index,
      };
    });
  }, [pricePoints]);

  if (pricePoints.length === 0) {
    return <div className="text-gray-400">No price data available</div>;
  }

  // Only show a subset of X-axis labels to avoid crowding
  const tickInterval = Math.max(1, Math.floor(chartData.length / 12));

  const formatYAxis = (value: number) => `$${value.toFixed(0)}`;

  const formatTooltip = (value: number) => [`$${value.toFixed(2)}`, 'Price'];

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4" role="img" aria-label="Price chart with support and resistance levels">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#4b5563' }}
            interval={tickInterval}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#4b5563' }}
            tickFormatter={formatYAxis}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={formatTooltip}
            labelFormatter={(label) => `Date: ${label}`}
          />

          {/* Buy zone as semi-transparent green rectangle */}
          <ReferenceArea
            y1={buyZone.low}
            y2={buyZone.high}
            fill="#22c55e"
            fillOpacity={0.15}
            stroke="none"
          />

          {/* Support level - dashed green line */}
          <ReferenceLine
            y={supportLevel}
            stroke="#22c55e"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: `Support $${supportLevel.toFixed(2)}`,
              position: 'right',
              fill: '#22c55e',
              fontSize: 11,
            }}
          />

          {/* Resistance level - dashed red line */}
          <ReferenceLine
            y={resistanceLevel}
            stroke="#ef4444"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: `Resist $${resistanceLevel.toFixed(2)}`,
              position: 'right',
              fill: '#ef4444',
              fontSize: 11,
            }}
          />

          {/* Price area with gradient fill */}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1f2937', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
