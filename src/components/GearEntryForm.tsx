'use client';

import React, { useState } from 'react';
import { Save, Info } from 'lucide-react';

export default function GearEntryForm({ onSave }: { onSave: (gear: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'shoes',
    lug_depth: 4,
    sections: 3,
    grip: 80,
    durability: 80
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: Date.now().toString(),
      ...formData,
      specifications: { lug_depth: formData.lug_depth, sections: formData.sections },
      score_dimensions: { grip: formData.grip, durability: formData.durability }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-4 rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-2 gap-3">
        <input required placeholder="Model Name" className="bg-black border border-gray-800 p-2 rounded-lg text-xs" 
          onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required placeholder="Brand" className="bg-black border border-gray-800 p-2 rounded-lg text-xs" 
          onChange={e => setFormData({...formData, brand: e.target.value})} />
      </div>

      <select className="w-full bg-black border border-gray-800 p-2 rounded-lg text-xs text-gray-400"
        onChange={e => setFormData({...formData, category: e.target.value})}>
        <option value="shoes">Running Shoes</option>
        <option value="poles">Trekking Poles</option>
      </select>

      <div className="space-y-3 p-3 bg-black/40 rounded-xl border border-white/5">
        <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-black">
          <span>{formData.category === 'shoes' ? 'Lug Depth (mm)' : 'Sections'}</span>
          <span className="text-emerald-500">{formData.category === 'shoes' ? formData.lug_depth : formData.sections}</span>
        </div>
        <input type="range" min="1" max={formData.category === 'shoes' ? "8" : "4"} step="1" className="w-full accent-emerald-500" 
          onChange={e => setFormData({...formData, [formData.category === 'shoes' ? 'lug_depth' : 'sections']: parseInt(e.target.value)})} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] text-gray-600 uppercase font-bold">Grip / Strength</label>
          <input type="number" defaultValue="80" className="w-full bg-black border border-gray-800 p-2 rounded-lg text-xs"
            onChange={e => setFormData({...formData, grip: parseInt(e.target.value)})} />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] text-gray-600 uppercase font-bold">Durability</label>
          <input type="number" defaultValue="80" className="w-full bg-black border border-gray-800 p-2 rounded-lg text-xs"
            onChange={e => setFormData({...formData, durability: parseInt(e.target.value)})} />
        </div>
      </div>

      <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black italic uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all">
        <Save size={14} /> Register to Vault
      </button>
    </form>
  );
}
