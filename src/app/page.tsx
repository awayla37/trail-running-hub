import RaceRecommendationWidget from "../components/RaceRecommendationWidget";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black mb-5">Trail Hub 装备推荐中心</h1>
        <p className="mb-5 text-slate-400">基于赛道地形与你的装备库存，给出Top推荐。</p>
        <RaceRecommendationWidget />
      </div>
    </main>
  );
}
