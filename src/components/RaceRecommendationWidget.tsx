"use client";

import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  ChevronRight, 
  Zap, 
  Mountain, 
  AlertTriangle 
} from 'lucide-react';

// --- 类型定义 ---
interface Race {
  raceId: string;
  name: string;
  distance_km: number;
  terrain_profile: {
    mud: number;
    technical_rock: number;
    hard_packed: number;
  };
  climb_m: number;
}

interface Shoe {
  id: string;
  model: string;
  brand: string;
  lug_depth_mm: number;
  outsole_tech: string;
  weight_g: number;
}

// --- 模拟数据 (在实际开发中可改为从 src/data 读取) ---
const RACES: Race[] = [
  {
    raceId: "nh100",
    name: "宁海 UTMB",
    distance_km: 105,
    terrain_profile: { mud: 0.2, technical_rock: 0.4, hard_packed: 0.4 },
    climb_m: 4500
  },
  {
    raceId: "hk100",
    name: "香港 100",
    distance_km: 103,
    terrain_profile: { mud: 0.1, technical_rock: 0.2, hard_packed: 0.7 },
    climb_m: 5300
  }
];

const MY_SHOES: Shoe[] = [
  { id: "1", brand: "Hoka", model: "Speedgoat 6", lug_depth_mm: 5, outsole_tech: "Vibram Megagrip", weight_g: 278 },
  { id: "2", brand: "Altra", model: "Lone Peak 8", lug_depth_mm: 4, outsole_tech: "Maxtrac", weight_g: 300 }
];

export default function RaceRecommendationWidget() {
  const [selectedRaceId, setSelectedRaceId] = useState(RACES[0].raceId);

  // 获取当前选中的赛事对象
  const currentRace = useMemo(() => 
    RACES.find(r => r.raceId === selectedRaceId) || RACES[0], 
  [selectedRaceId]);

  // --- 核心评分逻辑 (百分制) ---
  const calculateScore = (shoe: Shoe, race: Race) => {
    let score = 65; // 基础起步分

    // 1. 抓地力匹配
    if (race.terrain_profile.mud > 0.15 && shoe.lug_depth_mm >= 5) score += 15;
    if (race.terrain_profile.technical_rock > 0.3 && shoe.outsole_tech.includes('Vibram')) score += 15;

    // 2. 重量奖励 (高爬升赛事)
    if (race.climb_m > 4000 && shoe.weight_g < 280) score += 5;

    // 3. 负分项
    if (race.terrain_profile.mud > 0.2 && shoe.lug_depth_mm < 4) score -= 20;

    return Math.min(Math.max(score, 0), 100);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl">
      {/* 头部：赛事选择 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="text-amber-500 w-5 h-5" />
            赛道装备匹配
          </h2>
          <p className="text-xs text-slate-400 mt-1">根据地形自动分析推荐</p>
        </div>
        <select 
          value={selectedRaceId}
          onChange={(e) => setSelectedRaceId(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {RACES.map(race => (
            <option key={race.raceId} value={race.raceId}>{race.name}</option>
          ))}
        </select>
      </div>

      {/* 核心展示区 */}
      <div className="space-y-4">
        {MY_SHOES.map(shoe => {
          const score = calculateScore(shoe, currentRace);
          return (
            <div key={shoe.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{shoe.brand} {shoe.model}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                      {shoe.lug_depth_mm}mm 齿深
                    </span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                      {shoe.outsole_tech}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black ${score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {score}<span className="text-xs ml-0.5 opacity-70">分</span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Match Rate</p>
                </div>
              </div>

              {/* 评分条 */}
              <div className="mt-4 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
        <Zap className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-emerald-100/80 leading-relaxed">
          <strong>专家建议：</strong>针对 {currentRace.name} 的技术路段，建议选择抓地力强且带有防石板的鞋款。
        </p>
      </div>
    </div>
  );
}
