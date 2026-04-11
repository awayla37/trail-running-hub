"use client";

// ================= [BLOCK_START: IMPORTS_AND_INTERFACES] =================
import { useState, useRef, useEffect } from 'react';
import eventsData from '../data/routes.json'; 
import initialGearList from '../data/gear.json';
import commentsData from '../data/comments.json';

interface Edition { id: string; year: string; status: 'upcoming' | 'active' | 'archived'; tag: string; name?: string; distance_km: number; elevation_gain_m: number; difficulty?: 'easy' | 'hard'; features?: string[]; elevation_profile?: number[]; weather?: { temp: string; condition: string; wind: string }; cut_off_hours?: number; terrain_distribution?: { paved: number; dirt: number; single_track: number; technical: number }; }
interface Event { event_id: string; event_name: string; location: string; editions: Edition[]; }

interface Gear { 
  id: string; brand: string; model: string; category: 'shoe' | 'apparel' | 'pack'; weight_g: number; image: string; 
  grip_level?: number; cushioning?: number; protection?: number; drop_mm?: number;
  features?: string[];
  pro_review?: string;
}
// ================= [BLOCK_END: IMPORTS_AND_INTERFACES] =================

// ================= [BLOCK_START: MOCK_DATA] =================
const mockPosts = [
  { id: 'p1', author: 'VerticalLimit', tag: '装备求助', title: '雨战泥地，某 Vibram 大底型号到底稳不稳？', excerpt: '周末可能有大雨，担心这种地形下抓地力不足，求跑过类似赛段的大神给个反馈。', upvotes: 42, comments: 15, time: '2小时前' },
  { id: 'p2', author: 'TrailMaster', tag: '赛道情报', title: '某赛事 CP2 到 CP3 段路况实测更新', excerpt: '今天去探路了，路段由于近期施工变得比较硬且碎石较多，建议增加脚部防护。', upvotes: 128, comments: 34, time: '5小时前' },
  { id: 'p3', author: 'WildRunner', tag: '赛事吐槽', title: '今年某百公里赛事的补给站简直是灾难', excerpt: '我不点名了，但在 35 公里处断水断粮，只有切了一半的小番茄，这也太对不起报名费了吧。', upvotes: 89, comments: 56, time: '1天前' }
];

const availableDamageTags = ['右脚滑跟', '下坡顶脚趾', '湿地打滑', '缓震衰减', '闷热排汗差', '包裹感不足'];
// ================= [BLOCK_END: MOCK_DATA] =================

// ================= [BLOCK_START: UTILS_AND_STATE] =================
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

const computeSynergyScore = (route: Edition | null, shoe: Gear | null, apparel: Gear | null, pack: Gear | null) => {
  if (!route || !shoe) return 0;
  let score = 70;
  const tech = route.terrain_distribution?.technical || 0;
  if (route.difficulty === 'hard' && (shoe.grip_level || 0) >= 4) score += 10;
  if (tech > 20 && (shoe.protection || 0) >= 4) score += 8;
  if (route.distance_km > 40 && (shoe.cushioning || 0) >= 4) score += 7;
  if (apparel) score += 2;
  if (pack) score += 3;
  return Math.min(99, score);
};

export default function Home() {
  // 🌟 核心修复：重新声明 gearList，读取你的 data/gear.json
  const [gearList] = useState<Gear[]>(initialGearList as Gear[]);
  
  const [localTracks, setLocalTracks] = useState<Edition[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'race' | 'gear' | 'community' | 'profile'>('profile');
  const [currentView, setCurrentView] = useState<'main' | 'route_detail' | 'gear_detail' | 'upload_gpx' | 'assessment'>('main');
  
  const [selectedRoute, setSelectedRoute] = useState<Edition | null>(null);
  const [viewingGear, setViewingGear] = useState<Gear | null>(null);
  const [equippedLoadout, setEquippedLoadout] = useState<{shoe: Gear | null, apparel: Gear | null, pack: Gear | null}>({shoe: null, apparel: null, pack: null});
  
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [gearSearchQuery, setGearSearchQuery] = useState('');

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postStep, setPostStep] = useState<'edit' | 'generated'>('edit');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postDamageTags, setPostDamageTags] = useState<string[]>([]);

  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('trailhub_local_tracks');
    if (saved) { try { setLocalTracks(JSON.parse(saved)); } catch (e) { console.error(e); } }
  }, []);

  const handleGPXUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string; const parser = new DOMParser(); const xmlDoc = parser.parseFromString(text, "text/xml");
        const trackPoints = xmlDoc.getElementsByTagName("trkpt"); let totalDist = 0; let totalEleGain = 0; let elevations: number[] = [];
        for(let i = 0; i < trackPoints.length; i++) {
           const pt = trackPoints[i]; const lat = parseFloat(pt.getAttribute("lat") || "0"); const lon = parseFloat(pt.getAttribute("lon") || "0");
           const ele = parseFloat(pt.getElementsByTagName("ele")[0]?.textContent || "0"); elevations.push(ele);
           if(i > 0) {
              const prevPt = trackPoints[i-1]; totalDist += calculateDistance(parseFloat(prevPt.getAttribute("lat")||"0"), parseFloat(prevPt.getAttribute("lon")||"0"), lat, lon);
              if (ele > elevations[elevations.length-2]) totalEleGain += (ele - elevations[elevations.length-2]);
           }
        }
        const newTrack: Edition = { id: `gpx-${Date.now()}`, year: "LOCAL", status: "active", tag: file.name.replace('.gpx', '').toUpperCase(), distance_km: Math.round(totalDist * 10) / 10, elevation_gain_m: Math.round(totalEleGain), features: ["个人上传轨迹"], elevation_profile: elevations.slice(0, 30), weather: { temp: "--", condition: "未知", wind: "--" }, terrain_distribution: { paved: 10, dirt: 40, single_track: 40, technical: 10 } };
        const updatedTracks = [newTrack, ...localTracks]; setLocalTracks(updatedTracks); localStorage.setItem('trailhub_local_tracks', JSON.stringify(updatedTracks)); setCurrentView('main');
      } catch (err) { alert("GPX 解析失败"); } finally { setIsParsing(false); }
    }; reader.readAsText(file);
  };

  const renderElevationChart = (profile: number[]) => {
    const max = Math.max(...profile); const min = Math.min(...profile); const range = max - min || 1;
    const points = profile.map((p, i) => `${(i / (profile.length - 1)) * 100},${100 - ((p - min) / range) * 80}`).join(' ');
    return (
      <svg viewBox="0 0 100 100" className="w-full h-32 overflow-visible" preserveAspectRatio="none"><defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#166534" stopOpacity="0.15"/><stop offset="100%" stopColor="#166534" stopOpacity="0"/></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#grad)" /><polyline fill="none" stroke="#166534" strokeWidth="2.5" points={points} vectorEffect="non-scaling-stroke" /></svg>
    );
  };

  const filteredEvents = (eventsData as Event[]).filter(e => e.event_name.toLowerCase().includes(routeSearchQuery.toLowerCase()) || e.location.toLowerCase().includes(routeSearchQuery.toLowerCase()));
  
  // 🌟 修复：直接用 gearList 过滤
  const filteredGear = gearList.filter(g => g.brand.toLowerCase().includes(gearSearchQuery.toLowerCase()) || g.model.toLowerCase().includes(gearSearchQuery.toLowerCase()));

  const currentSynergyScore = computeSynergyScore(selectedRoute, equippedLoadout.shoe, equippedLoadout.apparel, equippedLoadout.pack);
// ================= [BLOCK_END: UTILS_AND_STATE] =================

// ================= [BLOCK_START: MAIN_CONSOLE] =================
  if (currentView === 'main') {
    return (
      <main className="min-h-screen font-sans pb-40 bg-stone-50 text-stone-900">
        <header className="px-6 pt-12 pb-6 sticky top-0 bg-stone-50/90 backdrop-blur-md z-50">
          <div className="border-l-[4px] border-green-800 pl-3 mb-2 uppercase flex justify-between items-end"><h1 className="text-3xl font-black italic tracking-wider">TRAIL HUB</h1><span className="text-[10px] text-stone-400 font-bold tracking-[0.2em]">ENGINE</span></div>
        </header>

        <div className="max-w-md mx-auto px-4">
          <div className="bg-white border border-stone-200 p-1.5 rounded-2xl flex items-center mb-6 shadow-sm sticky top-24 z-40">
            {['race', 'gear', 'community', 'profile'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 text-[10px] font-bold tracking-wider rounded-xl uppercase transition-all ${activeTab === tab ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-700'}`}>{tab === 'race' ? 'Routes' : tab === 'gear' ? 'Gear Lab' : tab === 'community' ? 'Basecamp' : 'Armory'}</button>
            ))}
          </div>

          {/* ================= [BLOCK_START: TAB_ROUTES] ================= */}
          {activeTab === 'race' && (
            <div className="space-y-8">
              <div className="relative"><input type="text" placeholder="搜索赛事..." value={routeSearchQuery} onChange={e => setRouteSearchQuery(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold shadow-sm focus:outline-none focus:border-green-800" /><span className="absolute left-4 top-3.5 text-xs">🔍</span></div>
              <div className="space-y-4">
                {filteredEvents.map((event, idx) => (
                  <div key={`${event.event_id}-${idx}`} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                    <div onClick={() => setExpandedEventId(expandedEventId === event.event_id ? null : event.event_id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50">
                      <div><h4 className="text-lg font-bold">{event.event_name}</h4><span className="text-stone-400 text-[10px] font-bold uppercase">{event.location}</span></div>
                      <span className={`text-stone-300 transition-transform ${expandedEventId === event.event_id ? 'rotate-90' : ''}`}>❯</span>
                    </div>
                    {expandedEventId === event.event_id && (
                      <div className="bg-stone-50 border-t p-3 space-y-2">
                        {event.editions?.map(edition => (
                          <div key={edition.id} onClick={() => { if(edition.status !== 'upcoming') { setSelectedRoute({ ...edition, name: `${event.event_name} (${edition.year})` } as Edition); setCurrentView('route_detail'); }}} className={`p-3 rounded-xl flex items-center justify-between border transition-all ${edition.status === 'upcoming' ? 'bg-stone-100 border-dashed border-stone-300 opacity-60' : 'bg-white border-stone-200 cursor-pointer hover:border-green-800 shadow-sm'}`}>
                            <div className="flex items-center gap-3"><span className={`text-[10px] font-black px-2 py-1 rounded ${edition.status === 'upcoming' ? 'bg-stone-200 text-stone-500' : 'bg-green-800 text-white'}`}>{edition.year}</span><span className="text-sm font-bold text-stone-900">{edition.tag}</span></div>
                            {edition.status !== 'upcoming' && <div className="text-stone-300 text-xs">❯</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-2"><h3 className="text-[10px] font-bold text-stone-400 tracking-[0.2em] mb-4 uppercase pl-2 border-l-2 border-stone-300">My Lab / 本地轨迹实验室</h3>
                <div onClick={() => setCurrentView('upload_gpx')} className="bg-white rounded-2xl border border-stone-200 p-5 flex justify-between items-center cursor-pointer hover:border-green-800 transition-all shadow-sm">
                  <div><h3 className="text-sm font-black uppercase">Data Lab</h3><p className="text-[10px] text-stone-400 font-bold uppercase mt-1">上传 GPX 解析空间矩阵</p></div>
                  <button className="bg-stone-100 text-green-800 font-bold text-[10px] px-3 py-1.5 rounded-lg">+ UPLOAD</button>
                </div>
                <div className="space-y-3 mt-4">
                  {localTracks.map(track => (
                    <div key={track.id} onClick={() => { setSelectedRoute({ ...track, name: track.tag } as Edition); setCurrentView('route_detail'); }} className="p-4 bg-white border border-stone-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-green-800 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-stone-800 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">LOCAL</div>
                      <div><h4 className="text-sm font-bold">{track.tag}</h4><span className="text-stone-400 text-[10px] font-bold tracking-widest">{track.distance_km}KM // +{track.elevation_gain_m}M</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* ================= [BLOCK_END: TAB_ROUTES] ================= */}

          {/* ================= [BLOCK_START: TAB_GEAR_LAB] ================= */}
          {activeTab === 'gear' && (
            <div>
              <div className="mb-6 relative"><input type="text" placeholder="搜索品牌或型号..." value={gearSearchQuery} onChange={e => setGearSearchQuery(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold shadow-sm focus:outline-none focus:border-green-800" /><span className="absolute left-4 top-3.5 text-xs">🔍</span></div>

              {['shoe', 'apparel', 'pack'].map(cat => {
                const catGears = filteredGear.filter(g => g.category === cat);
                if(catGears.length === 0) return null;
                return (
                  <div key={cat} className="mb-8">
                    <h3 className="text-[10px] font-bold text-stone-400 tracking-[0.2em] mb-4 uppercase pl-2 border-l-2 border-stone-300">{cat === 'shoe' ? 'Footwear / 核心引擎' : cat === 'apparel' ? 'Apparel / 装甲外壳' : 'Packs / 底盘挂载'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {catGears.map(gear => {
                        const isEquipped = equippedLoadout[cat as keyof typeof equippedLoadout]?.id === gear.id;
                        return (
                          <div key={gear.id} className={`bg-white border rounded-3xl shadow-sm transition-all relative overflow-hidden flex flex-col ${isEquipped ? 'border-2 border-green-800 bg-green-50/30' : 'border-stone-200 hover:border-green-800/50'}`}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEquippedLoadout(prev => ({...prev, [cat]: prev[cat as keyof typeof prev]?.id === gear.id ? null : gear}));
                              }}
                              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm z-10 transition-all ${isEquipped ? 'bg-green-800 text-white shadow-md' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                            >
                              {isEquipped ? '✓' : '+'}
                            </button>
                            
                            <div onClick={() => { setViewingGear(gear); setCurrentView('gear_detail'); }} className="p-4 flex-1 flex flex-col items-center cursor-pointer mt-2">
                              <img src={gear.image} alt={gear.model} className="w-16 h-16 mb-3 object-contain mix-blend-multiply transition-transform hover:scale-110" />
                              <h3 className="text-[11px] font-extrabold text-stone-900 text-center uppercase tracking-wider line-clamp-1">{gear.brand}</h3>
                              <p className="text-[9px] text-stone-500 font-bold uppercase truncate w-full text-center mt-0.5">{gear.model}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {/* ================= [BLOCK_END: TAB_GEAR_LAB] ================= */}

          {/* ================= [BLOCK_START: RPG_HUD_BAR] ================= */}
          {activeTab === 'gear' && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-stone-200 z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
              <div className="max-w-md mx-auto flex flex-col">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Active Target</span>
                  <span className={`text-[10px] font-black uppercase ${selectedRoute ? 'text-stone-900' : 'text-red-500'}`}>{selectedRoute ? selectedRoute.name?.split(' ')[0] : 'NO ROUTE SELECTED'}</span>
                </div>
                
                {selectedRoute && equippedLoadout.shoe ? (
                  <div onClick={() => setCurrentView('assessment')} className="bg-stone-900 rounded-xl p-3 shadow-xl overflow-hidden relative cursor-pointer hover:bg-stone-800 transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 bg-green-800/30 transition-all duration-500" style={{width: `${currentSynergyScore}%`}}></div>
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <div className="text-white text-[10px] font-bold uppercase tracking-widest mb-0.5">Synergy Match</div>
                        <div className="flex gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${equippedLoadout.shoe ? 'bg-green-400' : 'bg-stone-600'}`}></span>
                          <span className={`w-1.5 h-1.5 rounded-full ${equippedLoadout.apparel ? 'bg-green-400' : 'bg-stone-600'}`}></span>
                          <span className={`w-1.5 h-1.5 rounded-full ${equippedLoadout.pack ? 'bg-green-400' : 'bg-stone-600'}`}></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-black italic text-green-400 tracking-tighter">{currentSynergyScore}<span className="text-sm">/100</span></div>
                        <div className="text-stone-500 text-xs">❯</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-stone-100 rounded-xl p-4 text-center border border-stone-200 border-dashed">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">请选择赛道并装配跑鞋以激活测算引擎</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ================= [BLOCK_END: RPG_HUD_BAR] ================= */}

          {/* ================= [BLOCK_START: TAB_BASECAMP] ================= */}
          {activeTab === 'community' && (
            <div className="pb-20 space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-xl font-black italic uppercase text-stone-900">The Basecamp</h2><p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">跑友情报枢纽</p></div>
                <button onClick={() => { setPostStep('edit'); setPostTitle(''); setPostContent(''); setPostDamageTags([]); setIsPostModalOpen(true); }} className="bg-stone-900 text-white text-[10px] font-bold px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-green-800 transition-all shadow-md">+ 录入情报</button>
              </div>
              {mockPosts.map(post => (
                <div key={post.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:border-green-800 transition-colors cursor-pointer flex gap-4">
                  <div className="flex flex-col items-center gap-1 text-xs font-bold text-stone-400">▲<span>{post.upvotes}</span></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="bg-stone-100 text-stone-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase">{post.tag}</span><span className="text-[9px] text-stone-400 uppercase">{post.author}</span></div>
                    <h3 className="text-sm font-black text-stone-900 mb-1 leading-snug">{post.title}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-medium">"{post.excerpt}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* ================= [BLOCK_END: TAB_BASECAMP] ================= */}

          {/* ================= [BLOCK_START: TAB_ARMORY] ================= */}
          {activeTab === 'profile' && (
            <div className="pb-20 space-y-6">
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-5 relative z-10 mb-6">
                  <div className="w-20 h-20 rounded-full bg-stone-100 border-2 border-green-800 flex items-center justify-center text-3xl shadow-inner">⚡</div>
                  <div><h2 className="text-2xl font-black italic uppercase tracking-tight text-stone-900">Ayla</h2><span className="text-[9px] bg-stone-900 text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest">PRO Profile</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-stone-100 pb-6 mb-6">
                  <div className="text-center"><span className="text-lg font-black block leading-none">128</span><span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-1 block">Following</span></div>
                  <div className="text-center border-x"><span className="text-lg font-black block leading-none">2.4k</span><span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-1 block">Followers</span></div>
                  <div className="text-center"><span className="text-lg font-black block leading-none">86</span><span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-1 block">Reports</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4 font-mono">
                  <div><span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Max Distance</span><span className="text-xl font-black text-green-800">24.23<span className="text-xs ml-1 uppercase">km</span></span></div>
                  <div><span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Total Ascent</span><span className="text-xl font-black text-stone-900">+1100<span className="text-xs ml-1 uppercase">m</span></span></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end px-2"><h3 className="text-sm font-black italic uppercase text-stone-900">Tactical Records</h3></div>
                
                <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex justify-between border-b border-stone-100 pb-4 mb-4">
                    <div>
                      <h4 className="text-lg font-black italic uppercase leading-none text-stone-900">Wild Snow Dual</h4>
                      <span className="text-[9px] font-bold text-stone-400 uppercase mt-1 block">March 2026</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-5 font-mono text-[10px]">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <span className="text-[8px] font-bold text-stone-400 block mb-1 uppercase">Engine</span>
                      <div className="font-black uppercase text-stone-900">NORDA 001</div>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <span className="text-[8px] font-bold text-stone-400 block mb-1 uppercase">Armor</span>
                      <div className="font-black uppercase text-stone-900">ALPHA 60</div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[8px] font-bold text-stone-400 block mb-2 uppercase tracking-widest">Field Intel / 避坑报告</span>
                    <div className="text-[11px] text-stone-600 italic bg-stone-50 p-4 rounded-xl border-dashed border border-stone-200 leading-relaxed font-medium">
                      "攀升阶段抓地力惊艳。排雷预警：在极陡坡度时，右脚后跟有明显的不跟脚（滑跟）现象，左脚则非常稳定，建议相同脚型的跑友微调右侧最后半个鞋带孔的锁定。"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ================= [BLOCK_END: TAB_ARMORY] ================= */}
        </div>

        {/* ================= [BLOCK_START: MODAL_POST_EDITOR] ================= */}
        {isPostModalOpen && (
          <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            {postStep === 'edit' && (
              <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                <div className="px-6 pt-8 pb-4 border-b border-stone-100">
                  <div className="flex justify-between items-center mb-1"><h2 className="text-xl font-black italic uppercase text-stone-900">Damage Report</h2><button onClick={() => setIsPostModalOpen(false)} className="text-stone-300 hover:text-stone-900 transition-colors text-xl">✕</button></div>
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">填写硬核战损报告，生成战术名片</p>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                       <span className="text-[8px] text-stone-400 font-bold uppercase block mb-1">Target Route</span>
                       <div className={`text-[10px] font-black uppercase ${selectedRoute ? 'text-green-800' : 'text-red-500'}`}>{selectedRoute ? selectedRoute.name : '未选择 (去主页选定)'}</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                       <span className="text-[8px] text-stone-400 font-bold uppercase block mb-1">Main Engine</span>
                       <div className={`text-[10px] font-black uppercase ${equippedLoadout.shoe ? 'text-green-800' : 'text-red-500'}`}>{equippedLoadout.shoe ? equippedLoadout.shoe.model : '未装配跑鞋'}</div>
                    </div>
                  </div>

                  <div>
                    <input type="text" placeholder="战役代号 (如: 崇礼雨战试鞋)..." value={postTitle} onChange={e => setPostTitle(e.target.value)} className="w-full text-lg font-black placeholder:text-stone-300 focus:outline-none mb-4 text-stone-900" />
                    <textarea placeholder="在这里记录详细实战体感..." value={postContent} onChange={e => setPostContent(e.target.value)} className="w-full h-20 text-sm font-medium leading-relaxed focus:outline-none placeholder:text-stone-300 resize-none text-stone-600" />
                  </div>

                  <div>
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Field Tags / 添加战损标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableDamageTags.map(tag => {
                        const isSelected = postDamageTags.includes(tag);
                        return (
                          <button 
                            key={tag}
                            onClick={() => setPostDamageTags(prev => isSelected ? prev.filter(t => t !== tag) : [...prev, tag])}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors border ${isSelected ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'}`}
                          >
                            {isSelected && '⚠ '} {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-stone-50 border-t border-stone-100">
                  <button 
                    onClick={() => {
                      if(!selectedRoute || !equippedLoadout.shoe || !postTitle) return alert("为了保证情报质量，请填写标题，并在控制台装配赛道与跑鞋！");
                      setPostStep('generated');
                    }} 
                    className="w-full bg-stone-900 text-white font-black py-4 rounded-xl uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-green-800 transition-colors"
                  >
                    Generate Tactical Card ⚡
                  </button>
                </div>
              </div>
            )}

            {postStep === 'generated' && (
              <div className="w-full h-full max-w-md flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                  <div className="text-green-400 text-3xl mb-2">⚡</div><h2 className="text-xl font-black italic text-white uppercase tracking-widest">Card Generated</h2>
                </div>
                
                <div className="bg-stone-50 w-full rounded-[2.5rem] p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-stone-200 rounded-bl-full opacity-50"></div>
                  
                  <div className="flex justify-between items-start border-b border-stone-200 pb-4 mb-5 relative z-10">
                    <div>
                      <span className="text-[8px] bg-stone-900 text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest mb-2 inline-block">Operation Report</span>
                      <h4 className="text-xl font-black italic uppercase leading-none text-stone-900">{postTitle}</h4>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 mb-6 font-mono relative z-10">
                    <div><span className="block text-[8px] text-stone-400 font-bold mb-0.5 tracking-widest uppercase">Target Area</span><span className="text-sm font-black text-stone-900 uppercase">{selectedRoute?.name || selectedRoute?.tag}</span></div>
                    <div><span className="block text-[8px] text-stone-400 font-bold mb-0.5 tracking-widest uppercase">Distance</span><span className="text-sm font-black text-green-800 uppercase">{selectedRoute?.distance_km} KM</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                    <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm"><span className="text-[8px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">Engine (Shoe)</span><div className="text-xs font-black uppercase text-stone-900">{equippedLoadout.shoe?.brand} {equippedLoadout.shoe?.model}</div></div>
                    {equippedLoadout.apparel && <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm"><span className="text-[8px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">Armor</span><div className="text-xs font-black uppercase text-stone-900">{equippedLoadout.apparel.model}</div></div>}
                  </div>
                  
                  <div className="relative z-10">
                    <span className="text-[8px] font-bold text-stone-400 block mb-2 uppercase tracking-widest">Field Intel / 战损与避坑报告</span>
                    {postDamageTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {postDamageTags.map(tag => (
                          <span key={tag} className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">⚠ {tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-stone-700 italic bg-white p-4 rounded-xl border-dashed border border-stone-300 leading-relaxed font-medium shadow-inner">
                      "{postContent || '无文字补充报告'}"
                    </div>
                  </div>
                </div>

                <button onClick={() => { setIsPostModalOpen(false); setActiveTab('profile'); }} className="mt-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold px-6 py-3 rounded-xl uppercase tracking-widest backdrop-blur-sm transition-all">
                  Close & View in Armory
                </button>
              </div>
            )}
          </div>
        )}
        {/* ================= [BLOCK_END: MODAL_POST_EDITOR] ================= */}
      </main>
    );
  }
// ================= [BLOCK_END: MAIN_CONSOLE] =================

// ================= [BLOCK_START: VIEW_UPLOAD_GPX] =================
  if (currentView === 'upload_gpx') {
    return (
      <main className="min-h-screen bg-stone-100 p-8 flex flex-col items-center">
        <button onClick={() => setCurrentView('main')} className="text-[10px] font-bold uppercase mb-12 self-start tracking-widest">❮ Back to Engine</button>
        <div className="w-full max-w-md bg-white p-12 rounded-[3rem] border border-stone-200 text-center cursor-pointer hover:border-green-800 transition-all shadow-sm" onClick={() => fileInputRef.current?.click()}>
          <div className="text-4xl mb-4">🗺️</div><h3 className="text-sm font-bold uppercase text-stone-900 mb-2">Matrix Upload</h3><p className="text-[10px] text-stone-400 font-bold uppercase">解析 GPX 空间矩阵</p>
          <input type="file" accept=".gpx" ref={fileInputRef} className="hidden" onChange={handleGPXUpload} />
        </div>
      </main>
    );
  }
// ================= [BLOCK_END: VIEW_UPLOAD_GPX] =================

// ================= [BLOCK_START: VIEW_ROUTE_DETAIL] =================
  if (currentView === 'route_detail' && selectedRoute) {
    const td = selectedRoute.terrain_distribution;
    const weather = selectedRoute.weather;
    return (
      <main className="min-h-screen bg-stone-100 pb-24 text-stone-900">
        <div className="max-w-md mx-auto px-4 pt-8">
          <button onClick={() => setCurrentView('main')} className="text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">❮ Back to Console</button>
          <h1 className="text-3xl font-black italic uppercase mb-2 leading-tight">{selectedRoute.name}</h1>
          <div className="flex gap-4 text-xs font-bold text-green-800 mb-8 pb-4 border-b border-stone-200">
            <span>{selectedRoute.distance_km} KM</span><span>+{selectedRoute.elevation_gain_m} M</span>
            <span className="ml-auto text-stone-400 uppercase text-[10px]">Cut-off: {selectedRoute.cut_off_hours || '--'}H</span>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-stone-200 mb-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase mb-4 tracking-widest">Elevation Profile / 海拔剖面</h3>
            <div className="relative"><span className="absolute top-0 right-0 text-green-800 text-[9px] font-black">MAX: {Math.max(...(selectedRoute.elevation_profile || [0]))}m</span>{renderElevationChart(selectedRoute.elevation_profile || [0,0])}</div>
          </div>

          {td && (
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 mb-6 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase mb-4 tracking-widest">Terrain Distribution / 路况分布</h3>
              <div className="flex h-3 rounded-full overflow-hidden bg-stone-100 mb-4 border border-stone-200">
                <div style={{ width: `${td.paved}%` }} className="bg-stone-400"></div><div style={{ width: `${td.dirt}%` }} className="bg-orange-700"></div>
                <div style={{ width: `${td.single_track}%` }} className="bg-green-600"></div><div style={{ width: `${td.technical}%` }} className="bg-stone-800"></div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 text-[10px] font-bold uppercase text-stone-600 tracking-wider">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-stone-400"></span> Paved 硬化路: {td.paved}%</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-orange-700"></span> Dirt 机耕土路: {td.dirt}%</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-green-600"></span> Single 小径: {td.single_track}%</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-stone-800"></span> Tech 技术岩石: {td.technical}%</div>
              </div>
            </div>
          )}

          {weather && (
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase mb-4 tracking-widest">Environmental / 环境气象</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <span className="text-[9px] text-stone-400 block mb-1 font-bold uppercase">Temp</span><span className="text-lg font-black text-stone-800">{weather.temp}</span>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <span className="text-[9px] text-stone-400 block mb-1 font-bold uppercase">Wind</span><span className="text-lg font-black text-stone-800">{weather.wind}</span>
                </div>
                <div className="col-span-2 bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <span className="text-[9px] text-stone-400 block mb-1 font-bold uppercase">Condition</span><span className="text-base font-black text-green-800">{weather.condition}</span>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => { setActiveTab('gear'); setCurrentView('main'); }} className="w-full mt-10 bg-stone-900 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest shadow-lg hover:bg-stone-800 transition-colors">Go to Gear Lab ⚡</button>
        </div>
      </main>
    );
  }
// ================= [BLOCK_END: VIEW_ROUTE_DETAIL] =================

// ================= [BLOCK_START: VIEW_GEAR_DETAIL] =================
  if (currentView === 'gear_detail' && viewingGear) {
    const isShoe = viewingGear.category === 'shoe';
    return (
      <main className="min-h-screen bg-stone-100 pb-28 text-stone-900">
        <div className="max-w-md mx-auto px-4 pt-8">
          <button onClick={() => { setViewingGear(null); setCurrentView('main'); }} className="text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">❮ BACK TO LAB</button>
          
          <div className="bg-white aspect-square rounded-[2.5rem] p-10 mb-6 flex items-center justify-center border border-stone-200 overflow-hidden shadow-sm">
            <img src={viewingGear.image} className="w-full h-full object-contain mix-blend-multiply scale-110" />
          </div>
          
          <h2 className="text-xs font-bold text-stone-400 uppercase mb-1 tracking-widest">{viewingGear.brand}</h2>
          <h1 className="text-4xl font-black italic uppercase mb-8 leading-none tracking-tight">{viewingGear.model}</h1>
          
          <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm mb-6">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase mb-5 tracking-widest">Core Specs / 核心参数</h3>
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-stone-100 font-mono">
               <div className="text-center"><span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Weight</span><span className="text-xl font-black">{viewingGear.weight_g}g</span></div>
               {isShoe ? (
                 <div className="text-center"><span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Drop</span><span className="text-xl font-black">{viewingGear.drop_mm}mm</span></div>
               ) : (
                 <div className="text-center"><span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Category</span><span className="text-sm font-black uppercase mt-1 block">{viewingGear.category}</span></div>
               )}
            </div>
            
            {isShoe ? (
              <div className="space-y-4">
                {[{ l: 'GRIP 抓地力', v: viewingGear.grip_level }, { l: 'CUSHION 缓震', v: viewingGear.cushioning }, { l: 'PROTECTION 防护', v: viewingGear.protection }].map(s => (
                  <div key={s.l}>
                    <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-wider"><span className="text-stone-500">{s.l}</span><span className="text-green-800">{s.v}/5</span></div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-100"><div className="h-full bg-green-800" style={{ width: `${(s.v || 0) * 20}%` }}></div></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {viewingGear.features?.map((f, i) => (
                  <span key={i} className="bg-stone-50 border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">{f}</span>
                ))}
              </div>
            )}
          </div>

          {viewingGear.pro_review && (
            <div className="bg-green-900 p-6 rounded-[2rem] text-white shadow-lg mb-8 relative overflow-hidden">
              <div className="absolute -top-4 -right-2 text-6xl text-white/10 italic font-serif">"</div>
              <h3 className="text-[9px] font-bold text-green-400 uppercase tracking-[0.2em] mb-3">Pro Insight</h3>
              <p className="text-xs leading-relaxed italic font-medium relative z-10">"{viewingGear.pro_review}"</p>
            </div>
          )}

          <button 
            onClick={() => { 
              setEquippedLoadout({...equippedLoadout, [viewingGear.category]: viewingGear}); 
              setCurrentView('main'); 
            }} 
            className="fixed bottom-6 left-6 right-6 max-w-md mx-auto bg-stone-900 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest shadow-2xl z-50 hover:bg-green-800 transition-colors"
          >
            Lock to Loadout ✅
          </button>
        </div>
      </main>
    );
  }
// ================= [BLOCK_END: VIEW_GEAR_DETAIL] =================

// ================= [BLOCK_START: VIEW_ASSESSMENT] =================
  if (currentView === 'assessment' && equippedLoadout.shoe && selectedRoute) {
    const shoe = equippedLoadout.shoe;
    const techPercent = selectedRoute.terrain_distribution?.technical || 0;
    let matchScore = 75;
    if (selectedRoute.difficulty === 'hard' && (shoe.grip_level || 0) >= 4) matchScore += 10;
    if (techPercent > 20 && (shoe.protection || 0) >= 4) matchScore += 10;
    if (selectedRoute.distance_km > 50 && (shoe.cushioning || 0) >= 4) matchScore += 10;
    matchScore = Math.min(99, matchScore);

    return (
      <main className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-stone-900">
        <div className="max-w-md w-full bg-white p-8 rounded-[3rem] border border-stone-200 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full"></div>
          <button onClick={() => setCurrentView('main')} className="text-[10px] font-bold uppercase mb-8 relative z-10 tracking-widest hover:text-green-800 transition-colors">❮ Back to Lab</button>
          <h2 className="text-[10px] font-bold text-green-800 uppercase mb-2 tracking-[0.2em] relative z-10">Synergy Analysis / 引擎适配度计算</h2>
          <h1 className="text-2xl font-black italic uppercase leading-tight mb-8 relative z-10">{shoe.model} <br/> <span className="text-stone-300 not-italic text-lg">vs</span> <br/> {selectedRoute.name}</h1>
          <div className="text-7xl font-black italic text-green-700 mb-6 relative z-10">{currentSynergyScore}<span className="text-2xl ml-1">%</span></div>
          
          {(equippedLoadout.apparel || equippedLoadout.pack) && (
            <div className="flex gap-2 mb-6 relative z-10">
              {equippedLoadout.apparel && <span className="bg-stone-100 text-[8px] font-bold px-2 py-1 rounded text-stone-500 uppercase border border-stone-200 shadow-sm">+ {equippedLoadout.apparel.brand} Armor</span>}
              {equippedLoadout.pack && <span className="bg-stone-100 text-[8px] font-bold px-2 py-1 rounded text-stone-500 uppercase border border-stone-200 shadow-sm">+ {equippedLoadout.pack.brand} Pack</span>}
            </div>
          )}

          <div className="bg-stone-50 p-5 rounded-2xl border border-dashed border-stone-300 text-xs italic text-stone-700 leading-relaxed font-medium relative z-10 shadow-inner">
             "针对该赛道路况，{shoe.brand} 的设计能够提供可靠的下坡保障。{equippedLoadout.apparel ? `同时，你装配的 ${equippedLoadout.apparel.model} 能有效对抗山地失温。` : ''} 综合配置合理，可以出战。"
          </div>
        </div>
      </main>
    );
  }
// ================= [BLOCK_END: VIEW_ASSESSMENT] =================

  return null;
}
