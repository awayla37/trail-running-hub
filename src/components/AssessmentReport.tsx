'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft, Download, CheckCircle2, Flame, Gauge, Zap, VS } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function AssessmentReport({ race, gears, onBack }: { race: any, gears: any[], onBack: () => void }) {
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // 这里的 score 计算逻辑迁移到了组件内部，以便为每件装备独立计算
  const calculateIndividualScore = (gear: any) => {
    let base = 70;
    if (gear.category === 'shoes') {
      const lugBonus = (gear.specifications?.lug_depth || 4) * 2;
      const technicalImpact = race.technical_level * 5;
      base = gear.score_dimensions.grip + lugBonus - (5 - race.technical_level) * 2;
    }
    return Math.min(Math.max(base, 0), 100);
  };

  const exportAsImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0a0a0a', scale: 2 });
    const link = document.createElement('a');
    link.href = canvas.toDataURL("image/png");
    link.download = `TrailHub_VS_Report.png`;
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div ref={reportRef} className="p-6 bg-[#0a0a0a] rounded-[2.5rem] border border-gray-800 space-y-8">
        {/* 顶部标题 */}
        <div className="text-center space-y-1">
          <h2 className="text-white font-black italic uppercase tracking-tighter text-2xl">Gear Head-to-Head</h2>
          <p className="text-[10px] text-emerald-500 font-mono uppercase">{race.name} Analysis</p>
        </div>

        {/* 对比卡片区域 */}
        <div className="grid grid-cols-2 gap-4 relative">
          {/* 中间的 VS 装饰 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-emerald-600 text-black font-black italic text-[10px] px-2 py-1 rounded-sm skew-x-[-12deg] shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            VS
          </div>

          {gears.map((gear, idx) => {
            const gearScore = calculateIndividualScore(gear);
            return (
              <div key={gear.id} className={`p-4 rounded-2xl border ${idx === 0 ? 'bg-blue-500/5 border-blue-500/20' : 'bg-purple-500/5 border-purple-500/20'} space-y-4`}>
                <div className="text-center">
                  <span className={`text-[40px] font-black italic ${idx === 0 ? 'text-blue-400' : 'text-purple-400'}`}>
                    {gearScore}
                  </span>
                  <p className="text-[8px] text-gray-500 uppercase font-bold">Match Pts</p>
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-xs font-black text-white truncate uppercase italic">{gear.name}</p>
                  <p className="text-[9px] text-gray-600 uppercase">{gear.brand}</p>
                </div>

                {/* 核心参数对比条 */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-gray-500">
                      <span>Grip</span>
                      <span>{gear.score_dimensions.grip}%</span>
                    </div>
                    <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                      <div className={`h-full ${idx === 0 ? 'bg-blue-500' : 'bg-purple-500'}`} style={{ width: `${gear.score_dimensions.grip}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-gray-500">
                      <span>Lug</span>
                      <span>{gear.specifications?.lug_depth}mm</span>
                    </div>
                    <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                      <div className={`h-full ${idx === 0 ? 'bg-blue-400' : 'bg-purple-400'}`} style={{ width: `${(gear.specifications?.lug_depth / 8) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 专家建议 */}
        <div className="bg-white/5 p-4 rounded-xl border border-dashed border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">System Recommendation</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed italic">
            Based on {race.name}'s technical level ({race.technical_level}/5), the 
            <span className="text-white font-bold px-1">
              {calculateIndividualScore(gears[0]) >= calculateIndividualScore(gears[1] || gears[0]) ? gears[0].name : gears[1].name}
            </span> 
            provides superior traction stability for this specific terrain.
          </p>
        </div>

        <div className="text-center pt-2">
          <p className="text-[8px] text-gray-800 font-black uppercase tracking-[0.5em]">TRAIL HUB PRO ANALYTICS</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <button onClick={onBack} className="flex-1 py-4 bg-white/5 border border-gray-800 text-gray-500 font-bold uppercase text-[10px] rounded-2xl">Back</button>
        <button onClick={exportAsImage} disabled={isExporting} className="flex-[2] py-4 bg-emerald-600 text-white font-bold uppercase text-[10px] rounded-2xl flex items-center justify-center gap-2">
          {isExporting ? 'Exporting...' : <><Download size={14} /> Download VS Report</>}
        </button>
      </div>
    </div>
  );
}
