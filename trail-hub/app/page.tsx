"use client";

import { useState } from 'react';
import routes from '../data/routes.json';
import initialGearList from '../data/gear.json';

interface Route {
  id: string; name: string; location: string; country: string;
  distance_km: number; elevation_gain_m: number; difficulty: 'easy' | 'hard'; 
  features: string[]; elevation_profile: number[]; 
  weather: { temp: string; condition: string; wind: string };
  cut_off_hours: number; 
  terrain_distribution?: { paved: number; dirt: number; single_track: number; technical: number }; 
}

interface Gear {
  id: string; brand: string; model: string; weight_g: number; 
  grip_level: number; cushioning: number; protection: number; drop_mm: number; image: string;
}

export default function Home() {
  const [gearList] = useState<Gear[]>(initialGearList);
  const [activeTab, setActiveTab] = useState<'race' | 'gear'>('race');
  const [currentView, setCurrentView] = useState<'main' | 'route_detail' | 'assessment'>('main');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedGear, setSelectedGear] = useState<Gear | null>(null);

  const renderElevationChart = (profile: number[]) => {
    const max = Math.max(...profile);
    const min = Math.min(...profile);
    const range = max - min || 1;
    const points = profile.map((p, i) => {
      const x = (i / (profile.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 80; 
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-32 overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#166534" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#166534" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#grad)" />
        <polyline fill="none" stroke="#166534" strokeWidth="2.5" points={points} vectorEffect="non-scaling-stroke" />
      </svg>
    );
  };

  const renderStatBlocks = (value: number, max: number = 5) => {
    return (
      <div className="flex gap-[2px]">
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-sm ${i < value ? 'bg-green-800' : 'bg-stone-200'}`}></div>
        ))}
      </div>
    );
  };

  // ================= 视图 A: 主控制台 =================
  if (currentView === 'main') {
    return (
      <main className="min-h-screen font-sans pb-24">
        <header className="px-6 pt-12 pb-6">
          <div className="border-l-[4px] border-green-800 pl-3 mb-2">
            <h1 className="text-3xl font-black italic tracking-wider text-stone-900 uppercase">
              TRAIL HUB <span className="text-green-800">ENGINE</span>
            </h1>
          </div>
          <p className="text-sm text-stone-500 tracking-widest font-medium">环境同步与装备决策终端</p>
        </header>

        <div className="max-w-md mx-auto px-4">
          <div className="bg-white border border-stone-200 p-1.5 rounded-2xl flex items-center mb-8 shadow-sm sticky top-6 z-40">
            <button onClick={() => setActiveTab('race')} className={`flex-1 py-3 text-sm font-bold tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'race' ? 'bg-green-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}>ROUTES</button>
            <button onClick={() => setActiveTab('gear')} className={`flex-1 py-3 text-sm font-bold tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'gear' ? 'bg-green-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}>GEAR LAB</button>
          </div>

          {activeTab === 'race' && (
            <div className="space-y-3">
              <h3 className="text-center text-xs font-bold text-stone-400 tracking-[0.2em] mb-4">中国越野跑路线数据库</h3>
              {routes.map((route) => (
                <div key={route.id} onClick={() => { setSelectedRoute(route as Route); setCurrentView('route_detail'); }} className="p-5 bg-white border border-stone-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-green-800 hover:shadow-md transition-all group">
                  <div>
                    <h4 className="text-lg font-bold mb-1 text-stone-900">{route.name}</h4>
                    <span className="text-stone-500 text-[10px] font-bold tracking-wider">{route.location.toUpperCase()} // {route.distance_km}KM</span>
                  </div>
                  <div className="text-stone-300 group-hover:text-green-800 transition-colors">❯</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'gear' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {gearList.map((gear) => (
                  <div key={gear.id} onClick={() => setSelectedGear(gear)} className={`p-4 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all aspect-square relative bg-white ${selectedGear?.id === gear.id ? 'border-2 border-green-800 shadow-md bg-stone-50' : 'border border-stone-200 hover:border-green-800/50 hover:shadow-sm'}`}>
                    {selectedGear?.id === gear.id && <span className="absolute top-3 right-3 text-green-800 text-xs">✅</span>}
                    <div className="w-16 h-16 rounded-xl overflow-hidden mb-2 border border-stone-200 bg-stone-100">
                      <img src={gear.image} alt={gear.model} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <h3 className="text-xs font-extrabold text-stone-900 text-center tracking-wider line-clamp-1">{gear.brand}</h3>
                    <p className="text-[10px] text-stone-500 font-bold mt-0.5 mb-3 text-center truncate w-full px-2">{gear.model.toUpperCase()}</p>
                    
                    <div className="flex justify-between w-full px-1 gap-1">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-stone-400 font-bold">G 抓地</span>
                        {renderStatBlocks(gear.grip_level)}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-stone-400 font-bold">C 缓震</span>
                        {renderStatBlocks(gear.cushioning)}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-stone-400 font-bold">P 防护</span>
                        {renderStatBlocks(gear.protection)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedGear && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-stone-200 z-50 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                  <div className="max-w-md w-full">
                    {!selectedRoute ? (
                      <div className="p-3 text-center text-xs text-stone-500 border border-stone-200 rounded-xl bg-stone-50 font-medium">请先在 ROUTES 面板选择一条目标赛道进行比对</div>
                    ) : (
                      <button onClick={() => setCurrentView('assessment')} className="w-full bg-green-800 text-white font-black py-4 rounded-xl tracking-widest hover:bg-green-700 transition flex justify-between items-center px-6 shadow-lg shadow-green-900/20">
                        ANALYZE MATCH <span>⚡</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ================= 视图 B: 赛事详情页 (高级双语排版) =================
  if (currentView === 'route_detail' && selectedRoute) {
    const td = selectedRoute.terrain_distribution;
    return (
      <main className="min-h-screen font-sans pb-24 bg-stone-100">
        <div className="max-w-md mx-auto px-4 pt-8">
          <button onClick={() => setCurrentView('main')} className="text-stone-500 text-sm font-bold tracking-widest mb-6 flex items-center gap-2 hover:text-green-800 transition">❮ 返回引擎控制台</button>
          
          <h1 className="text-4xl font-black text-stone-900 italic tracking-tight uppercase mb-2">{selectedRoute.name}</h1>
          <div className="flex gap-4 text-green-800 font-mono text-sm mb-8 border-b border-stone-200 pb-4">
            <span className="font-bold">{selectedRoute.distance_km} KM</span>
            <span className="font-bold">+{selectedRoute.elevation_gain_m} M</span>
            <span className="text-stone-500 ml-auto font-medium text-xs flex items-center gap-1">
              CUT-OFF / 关门: <span className="font-bold text-stone-700">{selectedRoute.cut_off_hours || '--'}H</span>
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-6 mb-6 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 tracking-[0.2em] mb-4">
              ELEVATION PROFILE <span className="text-stone-900 ml-1">/ 海拔剖面</span>
            </h3>
            <div className="relative border-b border-stone-100 pb-2">
              <span className="absolute top-0 right-0 text-green-800 text-[10px] font-mono font-bold">MAX: {Math.max(...(selectedRoute.elevation_profile || [0]))}m</span>
              {renderElevationChart(selectedRoute.elevation_profile || [0, 0])}
            </div>
          </div>

          {td && (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 mb-6 shadow-sm">
              <h3 className="text-xs font-bold text-stone-400 tracking-[0.2em] mb-4">
                TERRAIN DISTRIBUTION <span className="text-stone-900 ml-1">/ 路况分布</span>
              </h3>
              <div className="flex h-3 w-full rounded-full overflow-hidden mb-4 border border-stone-200">
                <div style={{ width: `${td.paved}%` }} className="bg-stone-400"></div>
                <div style={{ width: `${td.dirt}%` }} className="bg-orange-700"></div>
                <div style={{ width: `${td.single_track}%` }} className="bg-green-600"></div>
                <div style={{ width: `${td.technical}%` }} className="bg-stone-800"></div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 text-[10px] font-bold tracking-wider text-stone-600">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-stone-400"></span> PAVED 硬化路: {td.paved}%</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-orange-700"></span> DIRT 机耕土路: {td.dirt}%</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-green-600"></span> SINGLE 小径: {td.single_track}%</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-stone-800"></span> TECH 技术岩石: {td.technical}%</div>
              </div>
            </div>
          )}

          <div className="bg-white border border-stone-200 rounded-3xl p-6 mb-8 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 tracking-[0.2em] mb-4">
              ENVIRONMENTAL DATA <span className="text-stone-900 ml-1">/ 环境气象</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 block mb-1 font-bold">TEMP 温度</span>
                <span className="text-lg font-black text-stone-800 font-mono">{selectedRoute.weather?.temp}</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 block mb-1 font-bold">WIND 风速</span>
                <span className="text-lg font-black text-stone-800 font-mono">{selectedRoute.weather?.wind}</span>
              </div>
              <div className="col-span-2 bg-stone-50 p-4 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 block mb-1 font-bold">CONDITIONS 实时天气</span>
                <span className="text-base font-black text-green-800">{selectedRoute.weather?.condition}</span>
              </div>
            </div>
          </div>

          <button onClick={() => { setActiveTab('gear'); setCurrentView('main'); }} className="w-full bg-stone-900 text-white font-black py-4 rounded-xl tracking-widest hover:bg-stone-800 transition-colors shadow-lg">为该赛事配置装备</button>
        </div>
      </main>
    );
  }

  // ================= 视图 C: 装备硬核测评页 =================
  if (currentView === 'assessment' && selectedGear && selectedRoute) {
    let matchScore = 70; 
    let analysisReports: { type: 'pos' | 'neg', msg: string }[] = [];

    const techPercent = selectedRoute.terrain_distribution?.technical || 0;
    const pavedPercent = selectedRoute.terrain_distribution?.paved || 0;

    if (selectedRoute.difficulty === 'hard' && selectedGear.grip_level >= 4) {
      matchScore += 10; analysisReports.push({ type: 'pos', msg: '抓地力优异，胜任高难度技术地形' });
    }
    if (techPercent > 20 && selectedGear.protection >= 4) {
      matchScore += 10; analysisReports.push({ type: 'pos', msg: `充足防护，应对 ${techPercent}% 技术路段` });
    }
    if (selectedRoute.distance_km > 50 && selectedGear.cushioning >= 4) {
      matchScore += 10; analysisReports.push({ type: 'pos', msg: '顶级缓震，保障长距离续航' });
    }
    if (pavedPercent > 15 && selectedGear.cushioning < 3) {
      matchScore -= 10; analysisReports.push({ type: 'neg', msg: `硬化路面达 ${pavedPercent}%，缓震可能不足` });
    }
    if (selectedRoute.features?.includes("竹林湿滑") && selectedGear.grip_level < 4) {
      matchScore -= 15; analysisReports.push({ type: 'neg', msg: '警告：抓地力不足以应对竹林湿滑路面' });
    }
    if (selectedRoute.features?.includes("高海拔挑战") && selectedGear.weight_g < 260) {
      matchScore += 5; analysisReports.push({ type: 'pos', msg: '极致轻量化，降低高海拔攀登负担' });
    }

    matchScore = Math.min(99, Math.max(10, matchScore));

    return (
      <main className="min-h-screen bg-stone-100 font-sans pb-24">
        <div className="max-w-md mx-auto px-4 pt-8">
          <button onClick={() => setCurrentView('main')} className="text-stone-500 text-sm font-bold tracking-widest mb-6 flex items-center gap-2 hover:text-green-800 transition">❮ 返回引擎控制台</button>
          
          <div className="bg-white border border-stone-200 rounded-3xl p-6 relative overflow-hidden mb-6 shadow-sm">
            <h2 className="text-xs font-bold text-green-800 tracking-[0.2em] mb-1">
              COMPATIBILITY MATCH <span className="text-stone-900 ml-1">/ 适配度计算</span>
            </h2>
            <h1 className="text-2xl font-black text-stone-900 italic tracking-tight uppercase mb-6">{selectedGear.brand} {selectedGear.model} <br/><span className="text-stone-400 text-xl font-medium">VS</span> <br/>{selectedRoute.name}</h1>
            
            <div className="flex items-end gap-3 mb-8">
              <span className={`text-6xl font-black italic tracking-tighter ${matchScore > 80 ? 'text-green-700' : matchScore > 60 ? 'text-orange-500' : 'text-red-600'}`}>{matchScore}%</span>
              <span className="text-stone-400 font-bold tracking-widest mb-2">SYNERGY<br/>综合评分</span>
            </div>

            <div className="mb-6 space-y-2">
              <h3 className="text-[10px] font-bold text-stone-400 tracking-wider mb-2 border-b border-stone-100 pb-2">
                AI ENGINE ANALYSIS <span className="text-stone-800 ml-1">/ 智能分析报告:</span>
              </h3>
              {analysisReports.length > 0 ? analysisReports.map((report, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg text-xs font-bold border ${report.type === 'pos' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-orange-50 text-orange-800 border-orange-200'}`}>
                  {report.type === 'pos' ? '✓ ' : '⚠ '} {report.msg}
                </div>
              )) : (
                <div className="p-2.5 rounded-lg text-xs font-bold bg-stone-50 text-stone-500 border border-stone-200">符合基础参数，无极端风险或显著优势。</div>
              )}
            </div>

            <div className="space-y-4 border-t border-stone-100 pt-6">
              {[{ label: 'GRIP 抓地力', val: selectedGear.grip_level, max: 5 }, { label: 'CUSHION 缓震', val: selectedGear.cushioning, max: 5 }, { label: 'PROTECT 防护', val: selectedGear.protection, max: 5 }].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-[10px] font-bold tracking-wider mb-1.5"><span className="text-stone-500">{stat.label}</span><span className="text-green-800">{stat.val} / {stat.max}</span></div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-green-800 transition-all duration-1000" style={{ width: `${(stat.val / stat.max) * 100}%` }}></div></div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-stone-100 mt-2">
                <div className="text-[10px] font-bold tracking-wider text-stone-500">WEIGHT 重量: <span className="text-stone-900 text-sm ml-1">{selectedGear.weight_g}G</span></div>
                <div className="text-[10px] font-bold tracking-wider text-stone-500">DROP 落差: <span className="text-stone-900 text-sm ml-1">{selectedGear.drop_mm}MM</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
