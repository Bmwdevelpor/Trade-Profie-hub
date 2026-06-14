import { useState, useMemo } from "react";

interface CustomChartProps {
  data: number[];
  labels: string[];
  height?: number;
}

export default function MyCustomChart({ data, labels, height = 240 }: CustomChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = useMemo(() => {
    if (!data || data.length === 0) return [];
    const maxVal = Math.max(...data) || 1;
    const minVal = Math.min(...data) || 0;
    const range = maxVal - minVal || 1;

    // Pad margins inside chart
    const topMargin = height * 0.15;
    const bottomMargin = height * 0.15;
    const usableHeight = height - topMargin - bottomMargin;

    return data.map((val, idx) => {
      const x = (idx / (data.length - 1 || 1)) * 100; // in percentage
      const y = height - (bottomMargin + ((val - minVal) / range) * usableHeight);
      return { x, y, value: val, label: labels[idx] };
    });
  }, [data, labels, height]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, p, idx) => {
      const command = idx === 0 ? "M" : "L";
      return `${acc} ${command} ${p.x}% ${p.y}`;
    }, "");
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return "";
    const startPoint = `M 0% ${height}`;
    const pathContent = points.map((p) => `L ${p.x}% ${p.y}`).join(" ");
    const endPoint = `L 100% ${height} Z`;
    return `${startPoint} ${pathContent} ${endPoint}`;
  }, [points, height]);

  return (
    <div className="relative w-full overflow-hidden" id="custom-chart-container">
      {/* Chart Canvas */}
      <svg className="w-full overflow-visible" height={height} style={{ minWidth: "100%" }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="0%" y1={height * 0.2} x2="100%" y2={height * 0.2} stroke="#374151" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="0%" y1={height * 0.5} x2="100%" y2={height * 0.5} stroke="#374151" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="0%" y1={height * 0.8} x2="100%" y2={height * 0.8} stroke="#374151" strokeWidth="1" strokeDasharray="4,4" />

        {/* Fill Area */}
        {areaD && (
          <path
            d={areaD}
            fill="url(#chartGradient)"
            className="transition-all duration-300"
          />
        )}

        {/* Main Price Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}

        {/* Interactive Interactive Nodes */}
        {points.map((p, idx) => (
          <g key={idx}>
            {/* Extended invisible touch/hover targets */}
            <circle
              cx={`${p.x}%`}
              cy={p.y}
              r={14}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* Visual Dot */}
            <circle
              cx={`${p.x}%`}
              cy={p.y}
              r={hoveredIndex === idx ? 6 : 4}
              fill={hoveredIndex === idx ? "#10b981" : "#1f2937"}
              stroke="#10b981"
              strokeWidth="2"
              className="pointer-events-none transition-all duration-150"
            />
          </g>
        ))}
      </svg>

      {/* Dynamic Hover Tooltip Overlay */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800 text-xs text-gray-400 font-mono">
        <div>
          <span>Intervals: </span>
          <span className="text-white">Daily Profit Distributions</span>
        </div>
        <div>
          {hoveredIndex !== null ? (
            <div>
              <span className="text-gray-500 mr-2">[{points[hoveredIndex].label}]</span>
              <span className="text-emerald-400 font-bold font-display">+{points[hoveredIndex].value}%</span>
            </div>
          ) : (
            <span className="text-gray-500">Hover nodes to view rates</span>
          )}
        </div>
      </div>
    </div>
  );
}
