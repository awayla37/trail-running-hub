import React from 'react';

interface Props {
  points: number[];
  color?: string;
}

export default function ElevationChart({ points, color = "#10b981" }: Props) {
  const max = Math.max(...points);
  const width = 400;
  const height = 100;
  
  // 将高度数据转化为 SVG 路径坐标
  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - (p / max) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M0,${height} L${svgPoints} L${width},${height} Z`;
  const linePath = `M${svgPoints}`;

  return (
    <div className="w-full mt-4 bg-white/5 p-4 rounded-2xl border border-white/5 relative group">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Elevation Profile</span>
        <span className="text-[10px] font-bold text-emerald-500 italic">MAX: {max}m</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
        {/* 填充阴影 */}
        <path d={areaPath} fill={`url(#gradient-${color})`} fillOpacity="0.2" />
        {/* 核心曲线 */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      {/* 底部装饰线 */}
      <div className="flex justify-between mt-2 px-1">
        <div className="h-1 w-1 bg-white/20 rounded-full"></div>
        <div className="h-1 w-1 bg-white/20 rounded-full"></div>
        <div className="h-1 w-1 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
}
