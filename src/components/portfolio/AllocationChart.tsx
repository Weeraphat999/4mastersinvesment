import { PortfolioHolding } from '../../data/types';
import { computePieSlices } from '../../utils/portfolioCalculations';

interface AllocationChartProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  // Handle full circle case
  if (endAngle - startAngle >= 359.99) {
    const mid = startAngle + 180;
    const start1 = polarToCartesian(cx, cy, r, startAngle);
    const mid1 = polarToCartesian(cx, cy, r, mid);
    return `M ${cx} ${cy} L ${start1.x} ${start1.y} A ${r} ${r} 0 1 1 ${mid1.x} ${mid1.y} A ${r} ${r} 0 1 1 ${start1.x} ${start1.y} Z`;
  }

  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function AllocationChart({ holdings, totalValue }: AllocationChartProps) {
  const slices = computePieSlices(holdings, totalValue);

  if (slices.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Allocation</h3>
        <p className="text-gray-400 text-center py-8">No data to display</p>
      </div>
    );
  }

  const cx = 100;
  const cy = 100;
  const r = 85;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">📊 Allocation</h3>

      <div className="flex justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {slices.map((slice, i) => (
            <path
              key={i}
              d={describeArc(cx, cy, r, slice.startAngle, slice.endAngle)}
              fill={slice.color}
              stroke="#1f2937"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: slice.color }} />
            <span className="text-gray-300 truncate">{slice.ticker}</span>
            <span className="text-gray-400 ml-auto">{slice.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
