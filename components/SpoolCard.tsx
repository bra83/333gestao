import React, { useState } from 'react';
import { StockItem } from '../types';

export const SpoolCard: React.FC<{ item: StockItem; onUpdate: any; onDelete: any }> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Garantir que peso seja um nÃºmero vÃ¡lido para evitar NaN%
  const currentWeight = Number(item.peso) || 0;
  const percentage = Math.min(100, Math.max(0, (currentWeight / 1000) * 100));
  const isLow = currentWeight < 200;
  
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  if (isEditing) {
    return (
      <div className="jewelry-card p-3 col-span-2 bg-black/95 space-y-3 z-20">
        <div className="flex justify-between items-center border-b border-vault-amber pb-1">
          <h4 className="text-[10px] font-black uppercase">RECALIBRAR MATERIAL</h4>
          <button onClick={()=>setIsEditing(false)} className="text-[10px] bg-vault-amber text-black px-2 font-bold">X</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-[8px] opacity-50 uppercase ml-1">NOME</label>
            <input className="text-[10px] !p-1" value={item.nome} onChange={e=>onUpdate(item.id, {nome: e.target.value})} />
          </div>
          <div className="flex flex-col">
            <label className="text-[8px] opacity-50 uppercase ml-1">PESO (G)</label>
            <input className="text-[10px] !p-1" type="number" value={item.peso} onChange={e=>onUpdate(item.id, {peso: Number(e.target.value)})} />
          </div>
          <div className="flex flex-col">
            <label className="text-[8px] opacity-50 uppercase ml-1">PREÃ‡O KG</label>
            <input className="text-[10px] !p-1" type="number" value={item.preco} onChange={e=>onUpdate(item.id, {preco: Number(e.target.value)})} />
          </div>
          <div className="flex flex-col">
            <label className="text-[8px] opacity-50 uppercase ml-1">COR</label>
            <input className="text-[10px] !h-8 !p-0" type="color" value={item.cor || '#ffb642'} onChange={e=>onUpdate(item.id, {cor: e.target.value})} />
          </div>
        </div>
        <button onClick={()=>setIsEditing(false)} className="w-full bg-vault-amber text-black font-black p-2 uppercase text-[10px] active:scale-95 transition-transform">CONCLUIR</button>
      </div>
    );
  }

  return (
    <div className={`jewelry-card p-2 relative flex flex-col justify-between h-44 group transition-all ${isLow ? 'border-vault-low border-dashed' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="28" cy="28" r={radius} stroke="rgba(255,182,66,0.05)" strokeWidth="4" fill="transparent" />
            <circle
              cx="28" cy="28" r={radius}
              stroke={item.cor || '#ffb642'}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[8px] font-black leading-none">{Math.round(percentage)}%</span>
          </div>
        </div>
        <button onClick={()=>onDelete(item.id)} className="text-vault-low opacity-20 hover:opacity-100 p-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      
      <div className="flex-1 mt-1 cursor-pointer" onClick={()=>setIsEditing(true)}>
        <h4 className="font-black text-[10px] uppercase glow-text leading-tight truncate">{item.nome}</h4>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.cor }}></div>
          <p className="text-[6px] opacity-40 uppercase tracking-widest truncate">{item.marca || 'VAULT'}</p>
        </div>
      </div>

      <div className="mt-auto pt-1 border-t border-vault-amber/10 flex justify-between items-end">
        <div>
          <span className="text-[6px] opacity-40 block uppercase leading-none">RESTANTE</span>
          <span className={`text-sm font-black leading-none ${isLow ? 'text-vault-low' : 'text-vault-amber'}`}>{currentWeight}G</span>
        </div>
        <span className="text-[7px] font-black border border-vault-amber/30 px-1 uppercase">{item.tipo}</span>
      </div>
    </div>
  );
};
