'use client';

import React from 'react';
import { Mountain, Map, Activity, ChevronLeft } from 'lucide-react';

export default function RaceDetailView({ race, onBack }: { race: any, onBack: () => void }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 cursor-pointer transition-all" onClick={onBack}>
        <ChevronLeft size={16} /> <span className="text-xs font-bold uppercase">返回赛事列表</span>
      </div>

      <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-xl">
        <h3 className="text-2xl font-black italic uppercase text-emerald-500">{race.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{race.location}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 p-4 rounded-lg border border-gray-800 text-center">
          <Map className="mx-auto mb-2 text-gray-500" size={20} />
          <p className="text-[10px] text-gray-500 uppercase">距离</p>
          <p className="text-lg font-mono font-bold">{race.distance}k</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-gray-800 text-center">
          <Mountain className="mx-auto mb-2 text-gray-500" size={20} />
          <p className="text-[10px] text-gray-500 uppercase">爬升</p>
          <p className="text-lg font-mono font-bold">{race.elevation}m</p>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-gray-800 text-center">
          <Activity className="mx-auto mb-2 text-gray-500" size={20} />
          <p className="text-[10px] text-gray-500 uppercase">技术难度</p>
          <p className="text-lg font-mono font-bold">LV.{race.technical_level}</p>
        </div>
      </div>

      <div className="p-4 bg-white/5 rounded-lg border border-gray-800">
        <h4 className="text-xs font-bold text-emerald-500 uppercase mb-3">100分制评估建议</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">抓地力需求 (Grip Weight)</span>
            <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${race.technical_level * 20}%` }}></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">轻量化需求 (Weight Priority)</span>
            <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${race.distance > 100 ? '90%' : '50%'}` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
