import React from 'react';
import { ArrowLeft, MapPin, Zap, TrendingUp } from 'lucide-react';
import ElevationChart from './ElevationChart';

interface Props {
  race: any;
  onBack: () => void;
}

export default function RaceDetailView({ race, onBack }: Props) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to List</span>
      </button>

      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/5 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">{race.name}</h2>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <MapPin size={12} className="text-emerald-500" /> Terrain: Technical
               </span>
               <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <TrendingUp size={12} className="text-emerald-500" /> Gain: {race.elevation}m
               </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-500 text-black rounded-full font-black text-xs italic">
            {race.distance}KM
          </div>
        </div>

        <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">
          {race.description || "No official data available for this sector. Advanced AI analysis recommended for personalized strategy."}
        </p>

        {/* 插入高度曲线组件 */}
        {race.elevation_points && (
          <ElevationChart points={race.elevation_points} />
        )}

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Tech Level</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < race.technical_level ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-right">
            <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Recommended Lugs</p>
            <p className="text-white font-black italic text-sm">4.5mm+</p>
          </div>
        </div>
      </div>
    </div>
  );
}
