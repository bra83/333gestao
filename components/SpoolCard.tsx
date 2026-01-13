
import React, { useMemo } from 'react';
import { StockItem } from '../types';

export const SpoolCard: React.FC<{ item: StockItem; onUpdate: any; onDelete: any }> = ({ item, onDelete }) => {
  const percentage = Math.min(100, (item.peso / 1000) * 100);
  const isLow = item.peso < 200;

  return (
    <div className={`jewelry-card p-4 relative group transition-all hover:shadow-xl ${isLow ? 'ring-2 ring-rose-200 bg-rose-50/30' : ''}`}>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-rose-500 shadow-md">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex justify-center mb-4">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={213} strokeDashoffset={213 - (213 * percentage) / 100} strokeLinecap="round" className={isLow ? 'text-rose-500' : 'text-emerald-500'} />
          </svg>
          <div className="absolute w-12 h-12 rounded-full shadow-inner flex items-center justify-center" style={{ backgroundColor: item.cor || '#eee' }}>
            <div className="w-6 h-6 border-2 border-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h4 className="font-bold text-sm text-slate-800 truncate px-2">{item.nome}</h4>
        <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">{item.tipo} • {item.marca}</p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
           <span className={`font-bold ${isLow ? 'text-rose-500' : 'text-slate-500'}`}>{item.peso}g</span>
           <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">R$ {item.preco}</span>
        </div>
      </div>
    </div>
  );
};
