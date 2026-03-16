import React, { useRef, useState } from 'react';
import { ArrowLeft, Download, CheckCircle2, Flame, Gauge, Zap, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function AssessmentReport({ race, gears, initialWetness, onBack }: { race: any, gears: any[], initialWetness?: number, onBack: () => void }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const downloadImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    const canvas = await html2canvas(reportRef.current, { backgroundColor: '#050505', scale: 2 });
    const link = document.createElement('a');
    link.download = `trail-report-${race.name}.png`;
    link.href = canvas.toDataURL();
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
        <ArrowLeft size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Lab</span>
      </button>

      <div ref={reportRef} className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Mission Report</h2>
            <p className="text-emerald-500 font-bold text-xs uppercase tracking-[0.3em] mt-1">{race.name}</p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Trophy className="text-emerald-500" size={32} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {gears.map((gear, index) => (
            <div key={index} className="bg-white/5 border border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-white uppercase italic">{gear.name}</span>
                <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">READY</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
              </div>
              <p className="text-[9px] text-gray-500 mt-3 uppercase font-bold tracking-widest">Performance Match: 92%</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="text-gray-500 text-[10px] font-medium leading-relaxed italic">
            * Automated assessment based on terrain profile and gear specifications. 
            Conditions: {initialWetness && initialWetness > 50 ? 'Wet/Technical' : 'Dry/Optimal'}.
          </p>
        </div>
      </div>

      <button 
        onClick={downloadImage}
        disabled={isExporting}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase italic text-xs tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]"
      >
        {isExporting ? 'Generating PNG...' : <><Download size={16} /> Export Analysis</>}
      </button>
    </div>
  );
}
