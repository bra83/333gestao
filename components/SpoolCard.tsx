
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
    <div className={`jewelry-card p-4 relative group transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl ${isLow ? 'ring-2 ring-rose-400 bg-rose-50/20' : ''}`}>
      {/* Botões de Ação */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button onClick={() => setIsEditing(!isEditing)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-sapphire-500 shadow-lg border border-slate-100">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <button onClick={() => onDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-rose-500 shadow-lg border border-slate-100">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex justify-center mb-4 pt-2">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Barra Circular com a Cor do Filamento */}
          <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(0,0,0,0.05)]">
            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
            <circle 
                cx="48" cy="48" r="40" 
                stroke={filamentColor} 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={251} 
                strokeDashoffset={251 - (251 * percentage) / 100} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute w-14 h-14 rounded-full shadow-inner flex items-center justify-center" style={{ backgroundColor: filamentColor }}>
            <div className={`w-7 h-7 border-2 border-white/40 rounded-full ${isLow ? 'animate-ping' : 'animate-pulse'}`}></div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h4 className="font-extrabold text-sm text-slate-800 truncate px-1 uppercase tracking-tight">{item.nome}</h4>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">{item.tipo} • {item.marca}</p>
        
        {isEditing ? (
          <div className="mt-3 flex gap-1 animate-in zoom-in-95">
            <input 
              type="number" 
              className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 ring-sapphire-100" 
              value={editWeight} 
              onChange={e => setEditWeight(e.target.value)}
              autoFocus
            />
            <button onClick={handleSave} className="bg-emerald-500 text-white p-2 rounded-lg shadow-lg shadow-emerald-200"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg></button>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
             <div className="text-left">
               <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter block leading-none mb-1">Carga</span>
               <span className={`text-sm font-black tracking-tighter ${isLow ? 'text-rose-500' : 'text-slate-800'}`}>{item.peso}g</span>
             </div>
             {isLow && (
               <div className="bg-rose-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm animate-pulse uppercase tracking-tighter">Baixo</div>
             )}
             <div className="text-right">
               <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter block leading-none mb-1">Gema</span>
               <span className="text-sm font-black text-slate-800 tracking-tighter">R$ {item.preco}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
