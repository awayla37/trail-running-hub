import RaceRecommendationWidget from '@/components/RaceRecommendationWidget';
import './globals.css';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans antialiased">
      <div className="h-1 bg-emerald-500 w-full" />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12 border-l-4 border-emerald-500 pl-6">
          <h1 className="text-4xl font-black tracking-tight uppercase italic">
            Trail Hub <span className="text-emerald-500 text-2xl">Engine</span>
          </h1>
          <p className="mt-2 text-gray-400 font-medium tracking-wide">
            基于地理数据的越野跑装备智能匹配系统
          </p>
        </header>

        <section className="grid gap-8">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-1 shadow-2xl">
            <RaceRecommendationWidget />
          </div>
        </section>

        <footer className="mt-20 py-8 border-t border-gray-900 flex justify-between items-center text-[10px] text-gray-600 tracking-[0.2em] uppercase">
          <p>© 2026 Trail Running Hub</p>
          <p>Keep Learning • Stay Determined</p>
        </footer>
      </div>
    </main>
  );
}
