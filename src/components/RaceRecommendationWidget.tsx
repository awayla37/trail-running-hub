'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Footprints, Loader2, CloudRain, Sun, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import GearEntryForm from './GearEntryForm';
import RaceDetailView from './RaceDetailView';
import AssessmentReport from './AssessmentReport';
import { parseTerrainDescription } from '../services/ai-service';
import raceData from '../data/races.json';

export default function RaceRecommendationWidget() {
  const [activeTab, setActiveTab] = useState<'race' | 'gear'>('race');
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [gears, setGears] = useState<any[]>([]);
  const [selectedGearIds, setSelectedGearIds] = useState<string[]>([]);
  
  const [weatherData, setWeatherData] = useState<any>(null);
  const [aiInput, setAiInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

  useEffect(() => {
    const savedGears = localStorage.getItem('trail_hub_gears');
    if (savedGears) {
      setGears(JSON.parse(savedGears));
    } else {
      setGears([
        { id: '1', name: 'Speedgoat 5', brand: 'Hoka', category: 'shoes', specifications: { lug_depth: 5 }, score_dimensions: { grip: 90, durability: 85 } },
        { id: '2', name: 'S-Lab Ultra', brand: 'Salomon', category: 'shoes', specifications: { lug_depth: 3 }, score_dimensions: { grip: 75, durability: 95 } }
      ]);
    }
  }, []);

  const handleAIParse = async () => {
    if (!aiInput) return;
    setIsParsing(true);
    setAiStatus("Scanning Neural Network...");
    
    const result = await parseTerrainDescription(aiInput);
    
    setWeatherData({
      isWet: result.wetness > 50,
      precipitation: result.wetness > 50 ? 5 : 0,
      humidity: result.wetness
    });
    
    setAiStatus(result.message);
    setIsParsing(false);
    setTimeout(() => setAiStatus(""), 4000);
  };

  if (showReport) {
    return (
      <div className="p-8 bg-[#050505] min-h-[600px] border border-white/5 rounded-[2.5rem] shadow-2xl">
        <AssessmentReport 
          race={selectedRace || { name: "Training Session", technical_level: 3 }} 
          gears={gears.filter(g => selectedGearIds.includes(g.id))} 
          initialWetness={weatherData?.isWet ? 80 : 10}
          onBack={() => setShowReport(false)} 
        />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] max-w-2xl mx-auto">
      {/* Tab Header */}
      <div className="flex p-1.5 gap-1.5 bg-white/[0.03] m-6 rounded-2xl border border-white/[0.05]">
        <button onClick={() => setActiveTab('race')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 ${activeTab === 'race' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}>Race & Route</button>
        <button onClick={() => setActiveTab('gear')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 ${activeTab === 'gear' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}>Gear Lab</button>
      </div>

      <div className="p-8 pt-2">
        {activeTab === 'race' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* AI Analyzer Panel */}
            {!selectedRace && (
              <div className="relative group p-[1px] rounded-[2rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 group-hover:via-emerald-400/30 transition-all duration-1000 animate-gradient-x"></div>
                <div className="relative bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <Sparkles size={14} className="text-emerald-500" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">Neural Parser</span>
                    </div>
                    {isParsing && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>}
                  </div>
                  <textarea 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="E.g. 'Wet rocks at Mount Tai, technical descent...'"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-gray-700 focus:border-emerald-500/30 focus:bg-white/[0.04] outline-none transition-all resize-none min-h-[90px]"
                  />
                  <button 
                    onClick={handleAIParse}
                    disabled={isParsing || !aiInput}
                    className="mt-4 w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-tighter rounded-xl hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    {isParsing ? <Loader2 className="animate-spin" size={14} /> : <><Zap size={14} fill="currentColor" /> Analyze Terrain</>}
                  </button>
                  {aiStatus && <div className="mt-4 text-center py-2 bg-emerald-500/10 rounded-lg text-[10px] text-emerald-400 font-bold uppercase tracking-wider animate-bounce">{aiStatus}</div>}
                </div>
              </div>
            )}

            {selectedRace ? (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <RaceDetailView race={selectedRace} onBack={() => { setSelectedRace(null); setWeatherData(null); setAiInput(""); }} />
                <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Environmental Sync</p>
                    <p className="text-white text-lg font-black italic uppercase">{weatherData?.isWet ? 'Wet & Technical' : 'Optimal & Dry'}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${weatherData?.isWet ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {weatherData?.isWet ? <CloudRain size={32} /> : <Sun size={32} />}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 px-2">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                   <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Official Database</h3>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                </div>
                <div className="grid gap-3">
                  {raceData.map(race => (
                    <div key={race.id} onClick={() => setSelectedRace(race)} className="group relative p-5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.05] hover:border-emerald-500/50 transition-all duration-300">
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <p className="font-bold text-gray-200 text-lg group-hover:text-emerald-400 transition-colors">{race.name}</p>
                          <div className="flex gap-4 mt-2">
                             <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1"><Zap size={10} className="text-emerald-500" /> Lv.{race.technical_level}</span>
                             <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gear' && (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-between items-end px-2">
              <h3 className="text-white text-2xl font-black italic uppercase tracking-tighter">Inventory <span className="text-emerald-500 text-sm">({gears.length})</span></h3>
              <button onClick={() => setShowEntryForm(!showEntryForm)} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/20 text-emerald-500 transition-all">
                {showEntryForm ? '[ Close ]' : '[ + Add Gear ]'}
              </button>
            </div>
            {showEntryForm ? <GearEntryForm onSave={(g) => { setGears([...gears, g]); setShowEntryForm(false); }} /> : (
              <div className="grid grid-cols-2 gap-4">
                {gears.map(item => (
                  <div key={item.id} onClick={() => setSelectedGearIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])} 
                    className={`group relative p-6 border rounded-[2rem] flex flex-col items-center cursor-pointer transition-all duration-500 ${selectedGearIds.includes(item.id) ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}>
                    <div className={`mb-4 p-4 rounded-2xl transition-all duration-500 ${selectedGearIds.includes(item.id) ? 'bg-emerald-500 text-black scale-110' : 'bg-white/5 text-gray-600 group-hover:text-gray-400'}`}>
                      <Footprints size={32} />
                    </div>
                    <p className={`text-[11px] font-black uppercase italic tracking-wider text-center ${selectedGearIds.includes(item.id) ? 'text-white' : 'text-gray-500'}`}>{item.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Persistent CTA */}
      {(selectedRace || selectedGearIds.length > 0) && !showEntryForm && (
        <div className="p-8 pt-0 animate-in slide-in-from-top-4 duration-500">
          <button 
            disabled={isGenerating || selectedGearIds.length === 0}
            onClick={() => { setIsGenerating(true); setTimeout(() => { setIsGenerating(false); setShowReport(true); }, 1200); }}
            className={`group w-full py-6 rounded-[2rem] font-black italic uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-4 transition-all duration-500 ${selectedGearIds.length > 0 ? 'bg-white text-black hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(52,211,153,0.3)]' : 'bg-white/5 text-gray-700 border border-white/5'}`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Start Assessment
                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
