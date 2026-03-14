"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import raceProfiles from "../data/race-data.json";
import defaultGearInventory from "../data/gear-inventory.json";
import { recommendationForRace } from "../logic/race-recommender";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import type { TrailShoe } from "../logic/scoring-engine";

type RaceProfile = {
  raceId: string;
  name: string;
  distance_km: number;
  terrain: {
    mud: number;
    technical_rock: number;
    gravel: number;
    hardpack: number;
    elevation_gain_pct?: number;
  };
};

const races = raceProfiles as unknown as RaceProfile[];

export default function RaceRecommendationWidget() {
  const [raceId, setRaceId] = useState(races[0]?.raceId || "");
  const [minScore, setMinScore] = useState(0);
  const [brandFilter, setBrandFilter] = useState("");
  const [mudWeight, setMudWeight] = useState(1);
  const [technicalRockWeight, setTechnicalRockWeight] = useState(1);
  const [gravelWeight, setGravelWeight] = useState(1);
  const [hardpackWeight, setHardpackWeight] = useState(1);
  const [strategy, setStrategy] = useState<'balanced' | 'mud' | 'rock' | 'light'>('balanced');
  const [locale, setLocale] = useState<'zh' | 'en'>('zh');
  const [inventory, setInventory] = useState<TrailShoe[]>(defaultGearInventory as TrailShoe[]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const data = window.localStorage.getItem('trailHubGearInventory');
    if (data) {
      try {
        setInventory(JSON.parse(data));
      } catch {
        // Ignore parse errors
      }
    }
    const weightData = window.localStorage.getItem('trailHubTerrainWeights');
    if (weightData) {
      try {
        const payload = JSON.parse(weightData);
        setMudWeight(payload.mud ?? 1);
        setTechnicalRockWeight(payload.technical_rock ?? 1);
        setGravelWeight(payload.gravel ?? 1);
        setHardpackWeight(payload.hardpack ?? 1);
      } catch {
      }
    }
    const strategyData = window.localStorage.getItem('trailHubStrategy');
    if (strategyData) {
      try {
        setStrategy(strategyData as 'balanced' | 'mud' | 'rock' | 'light');
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('trailHubGearInventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('trailHubStrategy', strategy);
  }, [strategy]);

  const picked = useMemo(() => {
    if (!raceId) return null;
    try {
      const raw = recommendationForRace(inventory, raceId, 20, {
        terrainWeight: {
          mud: mudWeight,
          technical_rock: technicalRockWeight,
          gravel: gravelWeight,
          hardpack: hardpackWeight,
        },
      });
      const filtered = raw.recommendations.filter((item) => {
        const byScore = item.score.total >= minScore;
        const byBrand = brandFilter.trim() === "" || item.shoe.brand.toLowerCase().includes(brandFilter.trim().toLowerCase());
        return byScore && byBrand;
      });
      return {
        ...raw,
        recommendations: filtered,
      };
    } catch (e) {
      return null;
    }
  }, [raceId, minScore, brandFilter, mudWeight, technicalRockWeight, gravelWeight, hardpackWeight, inventory]);

  const radarData = useMemo(() => {
    if (!picked) return [];
    return picked.recommendations.slice(0, 4).map((item: any) => ({
      name: `${item.shoe.brand} ${item.shoe.model}`,
      traction: Number(item.score.traction.toFixed(1)),
      protection: Number(item.score.protection.toFixed(1)),
      cushioning: Number(item.score.cushioning.toFixed(1)),
      lightness: Number(item.score.lightness.toFixed(1)),
    }));
  }, [picked]);

  const handleSaveWeights = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'trailHubTerrainWeights',
      JSON.stringify({
        mud: mudWeight,
        technical_rock: technicalRockWeight,
        gravel: gravelWeight,
        hardpack: hardpackWeight,
      }),
    );
    alert(locale === 'zh' ? '权重已保存' : 'Weights saved');
  };

  const handleExportRecommendations = () => {
    if (!picked) return;
    const lines = [
      'brand,model,total,traction,protection,cushioning,lightness',
      ...picked.recommendations.map((item) =>
        [
          item.shoe.brand,
          item.shoe.model,
          item.score.total.toFixed(1),
          item.score.traction.toFixed(1),
          item.score.protection.toFixed(1),
          item.score.cushioning.toFixed(1),
          item.score.lightness.toFixed(1),
        ].join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trail-hub-recommendations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddShoe = () => {
    const brand = window.prompt(locale === 'zh' ? '输入品牌' : 'Brand', 'NewBrand');
    const model = window.prompt(locale === 'zh' ? '输入型号' : 'Model', 'NewModel');
    if (!brand || !model) return;
    setInventory((s: TrailShoe[]) => [
      ...s,
      {
        brand,
        model,
        weight_g: 260,
        drop_mm: 8,
        stack_height: '33/29mm',
        midsole_tech: 'EVA',
        outsole_tech: 'Vibram',
        lug_depth_mm: 5,
        rock_plate: false,
        upper_material: 'Mesh',
        performance_tags: {
          traction: 4,
          protection: 4,
          cushioning: 4,
          responsiveness: 4,
        },
      },
    ]);
  };

  const handleDeleteShoe = (index: number) => {
    setInventory((s: TrailShoe[]) => s.filter((_: TrailShoe, i: number) => i !== index));
  };

  return (
    <section className="p-4 bg-slate-900 text-slate-100 rounded-lg shadow-xl max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{locale === 'zh' ? '赛道装备推荐' : 'Trail Equipment Recommendation'}</h2>
        <button
          onClick={() => setLocale((prev) => (prev === 'zh' ? 'en' : 'zh'))}
          className="px-2 py-1 rounded bg-slate-800 border border-slate-700"
        >
          {locale === 'zh' ? 'English' : '中文'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={handleSaveWeights} className="px-3 py-1 bg-emerald-500 text-slate-900 rounded">
          {locale === 'zh' ? '保存权重' : 'Save Weights'}
        </button>
        <button onClick={handleExportRecommendations} className="px-3 py-1 bg-blue-500 rounded">
          {locale === 'zh' ? '导出推荐CSV' : 'Export CSV'}
        </button>
        <button onClick={handleAddShoe} className="px-3 py-1 bg-indigo-500 rounded">
          {locale === 'zh' ? '新增鞋子' : 'Add Shoe'}
        </button>
      </div>

      <div className="mb-4">
        <span className="text-sm text-slate-300 mr-2">{locale === 'zh' ? '策略' : 'Strategy'}:</span>
        {[
          { value: 'balanced', label: locale === 'zh' ? '均衡' : 'Balanced' },
          { value: 'mud', label: locale === 'zh' ? '泥地优先' : 'Mud Focus' },
          { value: 'rock', label: locale === 'zh' ? '岩石优先' : 'Rock Focus' },
          { value: 'light', label: locale === 'zh' ? '轻量优先' : 'Lightweight' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => {
              setStrategy(item.value as 'balanced' | 'mud' | 'rock' | 'light');
              const mapping = {
                balanced: { mud: 1, technical_rock: 1, gravel: 1, hardpack: 1 },
                mud: { mud: 1.5, technical_rock: 1, gravel: 0.8, hardpack: 0.8 },
                rock: { mud: 0.8, technical_rock: 1.5, gravel: 1, hardpack: 1 },
                light: { mud: 0.8, technical_rock: 1, gravel: 1, hardpack: 1.2 },
              };
              const weights = mapping[item.value as 'balanced' | 'mud' | 'rock' | 'light'];
              setMudWeight(weights.mud);
              setTechnicalRockWeight(weights.technical_rock);
              setGravelWeight(weights.gravel);
              setHardpackWeight(weights.hardpack);
            }}
            className={`px-2 py-1 rounded ${strategy === item.value ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-200'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <label className="block">
          <span className="text-sm text-slate-300">选择比赛：</span>
          <select
            value={raceId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setRaceId(event.target.value)}
            className="w-full mt-1 p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            {races.map((race) => (
              <option key={race.raceId} value={race.raceId}>
                {race.name} ({race.distance_km}km)
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">最低总分:</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setMinScore(Number(event.target.value))}
            className="w-full mt-1"
          />
          <div className="text-sm text-slate-300">{minScore}</div>
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">品牌筛选:</span>
          <input
            type="text"
            placeholder="例如 Salomon"
            value={brandFilter}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setBrandFilter(event.target.value)}
            className="w-full mt-1 p-2 rounded bg-slate-800 border border-slate-700 text-white"
          />
        </label>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "泥地权重", value: mudWeight, set: setMudWeight },
          { label: "岩石权重", value: technicalRockWeight, set: setTechnicalRockWeight },
          { label: "碎石权重", value: gravelWeight, set: setGravelWeight },
          { label: "硬地权重", value: hardpackWeight, set: setHardpackWeight },
        ].map((item) => (
          <label key={item.label} className="block">
            <span className="text-sm text-slate-300">{item.label}</span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={item.value}
              onChange={(event) => item.set(Number(event.target.value))}
              className="w-full mt-1"
            />
            <div className="text-sm text-slate-300">{item.value.toFixed(1)}</div>
          </label>
        ))}
      </div>

      <div className="mb-4 p-3 rounded border border-slate-700 bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-100">{locale === 'zh' ? '装备库存' : 'Gear Inventory'}</h3>
        <ul className="mt-2 text-xs text-slate-200 space-y-1">
          {inventory.map((shoe, index) => (
            <li key={`${shoe.brand}-${shoe.model}-${index}`} className="flex items-center justify-between gap-2">
              <span>{shoe.brand} {shoe.model} ({shoe.weight_g}g)</span>
              <button
                onClick={() => handleDeleteShoe(index)}
                className="text-rose-300 text-xs border border-rose-300 rounded px-2 py-0.5"
              >
                {locale === 'zh' ? '删除' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {picked ? (
        <>
          <div className="rounded border border-slate-700 bg-slate-800 p-3 mb-4">
            <p className="text-sm text-slate-300">当前地形：</p>
            <pre className="text-xs text-emerald-200">{JSON.stringify(picked.race.terrain, null, 2)}</pre>
          </div>

          <div className="rounded border border-slate-700 bg-slate-800 p-3 mb-4" style={{ height: 360 }}>
            <p className="text-sm text-slate-300 mb-2">Top 4 雷达对比</p>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#cbd5e1" }} />
                <PolarRadiusAxis angle={30} domain={[0, 40]} tick={{ fill: "#94a3b8" }} />
                <Radar dataKey="抓地" stroke="#34d399" fill="#34d399" fillOpacity={0.3} />
                <Radar dataKey="保护" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} />
                <Radar dataKey="缓震" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                <Radar dataKey="轻量" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {picked.recommendations.map((item, idx) => (
              <article key={`${item.shoe.brand}-${item.shoe.model}-${idx}`} className="rounded-lg border border-slate-700 p-4 bg-slate-800">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">
                    {idx + 1}. {item.shoe.brand} {item.shoe.model}
                  </h3>
                  <span className="text-sm font-bold text-emerald-300">{item.score.total.toFixed(1)} / 100</span>
                </div>

                <div className="mt-2 text-sm text-slate-300">
                  抓地：{item.score.traction.toFixed(1)} 保护：{item.score.protection.toFixed(1)} 缓震：{item.score.cushioning.toFixed(1)} 轻量：{item.score.lightness.toFixed(1)}
                </div>

                <div className="mt-2">
                  <p className="text-xs font-medium text-slate-400">推荐理由：</p>
                  <ul className="list-disc list-inside text-xs text-slate-300">
                    {item.score.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="text-slate-400">未能加载推荐，请检查 raceId 或数据。</p>
      )}
    </section>
  );
}
