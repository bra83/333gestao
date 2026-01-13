
import React, { useState } from 'react';
import { StockItem } from '../types';

export const SpoolCard: React.FC<{ item: StockItem; onUpdate: any; onDelete: any }> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState(item.peso.toString());
  
  const percentage = Math.min(100, (item.peso / 1000) * 100);
  const isLow = item.peso < 200;
  const filamentColor = item.cor || '#10b981';

  const handleSave = () => {
    onUpdate(item.id, { peso: Number(editWeight) });
    setIsEditing(false);
  };

  return (
    <div className={`jewelry-card p-4 relative transition-all duration-300 ${isLow ? 'ring-2 ring-rose-500 bg-rose-50/50' : 'bg-white'}`}>
      {/* Botões de Ação - Sempre visíveis para facilitar uso mobile */}
      <div className="absolute top-3 right-3 flex gap-2 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }} 
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 text-white shadow-lg active:scale-90 transition-transform"
        >
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500 text-white shadow-lg active:scale-90 transition-transform"
        >
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex justify-center mb-4 pt-4">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Barra Circular com style fixo para garantir a cor */}
          <svg className="w-full h-full -rotate-90 drop-shadow-md">
            <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
            <circle 
                cx="56" cy="56" r="48" 
                style={{ stroke: filamentColor }} 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={301.5} 
                strokeDashoffset={301.5 - (301.5 * percentage) / 100} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute w-14 h-14 rounded-full shadow-inner flex items-center justify-center border-4 border-white/50" style={{ backgroundColor: filamentColor }}>
            <div className={`w-8 h-8 border-2 border-white/30 rounded-full ${isLow ? 'animate-ping' : 'animate-pulse'}`}></div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h4 className="font-extrabold text-sm text-slate-900 truncate px-1 uppercase tracking-tight">{item.nome}</h4>
        <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-2">{item.tipo} • {item.marca}</p>
        
        {isEditing ? (
          <div className="mt-3 flex gap-1 animate-in zoom-in-95">
            <input 
              type="number" 
              className="w-full text-sm p-3 rounded-2xl bg-slate-100 border-2 border-slate-200 font-black text-slate-900 outline-none focus:border-sapphire-500" 
              value={editWeight} 
              onChange={e => setEditWeight(e.target.value)}
              autoFocus
            />
            <button onClick={handleSave} className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg></button>
          </div>
        ) : (
          <div className="mt-3 pt-4 border-t border-slate-200 flex justify-between items-center">
             <div className="text-left">
               <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter block leading-none mb-1">Disponível</span>
               <span className={`text-base font-black tracking-tighter ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{item.peso}g</span>
             </div>
             <div className="text-right">
               <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter block leading-none mb-1">Custo Un.</span>
               <span className="text-base font-black text-slate-900 tracking-tighter">R$ {item.preco}</span>
             </div>
          </div>
        )}
        
        {isLow && !isEditing && (
          <div className="mt-3 text-white text-[8px] font-black uppercase tracking-[0.2em] bg-rose-600 py-1.5 rounded-xl shadow-lg shadow-rose-200 animate-bounce">
            REPOR IMEDIATAMENTE
          </div>
        )}
      </div>
    </div>
  );
};
