'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Package, ChevronRight, CheckCircle, Circle, Footprints, Loader2, MapPin, CloudRain, Sun } from 'lucide-react';
import GearEntryForm from './GearEntryForm';
import RaceDetailView from './RaceDetailView';
import AssessmentReport from './AssessmentReport';
import { calculateMatchScore } from '../logic/scoring-engine';
import { fetchRaceWeather } from '../services/weather';
import raceData from '../data/races.json';

export default function RaceRecommendationWidget() {
  const [activeTab, setActiveTab] = useState<'race' | 'gear'>('race');
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [gears, setGears] = useState<any[]>([]);
  const [selectedGearIds, setSelectedGearIds] = useState<string[]>([]);
  
  // 天气相关状态
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);

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

  // 当选择赛事时，自动抓取天气
  useEffect(() => {
    if (selectedRace && selectedRace.lat) {
      setWeatherLoading(true);
      fetchRaceWeather(selectedRace.lat, selectedRace.lon).then(data => {
        setWeatherData(data);
        setWeatherLoading(false);
      });
    }
  }, [selectedRace]);

  const handleSaveGear = (newGear: any) => {
    const updatedGears = [...gears, newGear];
    setGears(updatedGears);
    localStorage.setItem('trail_hub_gears', JSON.stringify(updatedGears));
    setShowEntryForm(false);
  };

  const handleStartAssessment = () => {
    if (selectedGearIds.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowReport(true);
    }, 1200);
  };

  if (showReport) {
    return (
      <div className="p-8 bg-[#0a0a0a] border border-gray-800 rounded-[2rem]">
        <AssessmentReport 
          race={selectedRace} 
          gears={gears.filter(g => selectedGearIds.includes(g.id))} 
          initialWetness={weatherData?.isWet ? 80 : 10}
          onBack={() => setShowReport(false)} 
        />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
      {!selectedRace && !showEntryForm && (
        <div className="flex p-2 gap-2 bg-white/5 m-4 rounded-2xl">
          <button onClick={() => setActiveTab('race')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'race' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Events</button>
          <button onClick={() => setActiveTab('gear')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'gear' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Inventory</button>
        </div>
      )}

      <div className="p-8 pt-4">
        {activeTab === 'race' && (
          selectedRace ? (
            <div className="space-y-6">
              <RaceDetailView race={selectedRace} onBack={() => { setSelectedRace(null); setWeatherData(null); }} />
              
              {/* 天气看板 */}
              <div className="bg-white/5 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Live Conditions</p>
                  {weatherLoading ? (
                    <div className="flex items-center gap-2 mt-1 text-emerald-500 text-xs italic"><Loader2 className="animate-spin" size={12} /> Syncing satellites...</div>
                  ) : weatherData ? (
                    <p className="text-white font-bold mt-1 text-sm">{weatherData.isWet ? 'Wet & Technical' : 'Dry & Fast'}</p>
                  ) : <p className="text-gray-600 text-xs mt-1">Weather data unavailable</p>}
                </div>
                {weatherData?.isWet ? <CloudRain className="text-blue-500" /> : <Sun className="text-yellow-500" />}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-white text-xl font-black italic uppercase">Select Race</h3>
              <div className="grid gap-3">
                {raceData.map(race => (
                  <div key={race.id} onClick={() => setSelectedRace(race)} className="p-4 bg-white/5 border border-gray-800 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all group">
                    <p className="font-bold text-gray-200 group-hover:text-emerald-500">{race.name}</p>
                    <p className="text-[10px] text-gray-600 uppercase mt-1">Lat: {race.lat} / Lon: {race.lon}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {activeTab === 'gear' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end px-1">
              <h3 className="text-white text-xl font-black italic uppercase">Closet</h3>
              <button onClick={() => setShowEntryForm(!showEntryForm)} className="text-[10px] font-bold uppercase bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                {showEntryForm ? 'Back' : 'Add New'}
              </button>
            </div>
            {showEntryForm ? <GearEntryForm onSave={handleSaveGear} /> : (
              <div className="grid grid-cols-2 gap-4">
                {gears.map(item => {
                  const isSelected = selectedGearIds.includes(item.id);
                  return (
                    <div key={item.id} onClick={() => {
                      if (!isSelected && selectedGearIds.length >= 2) return;
                      setSelectedGearIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                    }} className={`p-5 border-2 rounded-[1.5rem] flex flex-col items-center cursor-pointer transition-all ${isSelected ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-800 bg-white/5'}`}>
                      <Footprints className={`mb-3 ${isSelected ? 'text-emerald-500' : 'text-gray-700'}`} size={28} />
                      <p className="text-[10px] font-black uppercase italic text-center text-gray-400">{item.name}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedRace && !showEntryForm && (
        <div className="px-8 pb-8">
          <button 
            disabled={isGenerating || selectedGearIds.length === 0}
            onClick={handleStartAssessment}
            className={`w-full py-5 rounded-2xl font-black italic uppercase text-xs flex items-center justify-center gap-3 transition-all ${selectedGearIds.length > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-700'}`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : `Analyze with Live Weather (${selectedGearIds.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
