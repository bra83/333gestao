
import React, { useState } from 'react';
import { StockItem } from '../types';

export const SpoolCard: React.FC<{ item: StockItem; onUpdate: any; onDelete: any }> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const percentage = Math.min(100, (item.peso / 1000) * 100);
  const isLow = item.peso < 200;

  if (isEditing) {
    return (
      <div className="jewelry-card p-4 col-span-2 bg-black">
        <h4 className="text-[10px] font-black uppercase mb-4 border-b border-vault-amber pb-2">Editando Holotape</h4>
        <div className="grid grid-cols-2 gap-2">
          <input className="text-xs" value={item.nome} onChange={e=>onUpdate(item.id, {nome: e.target.value})} placeholder="NOME" />
          <input className="text-xs" type="number" value={item.peso} onChange={e=>onUpdate(item.id, {peso: Number(e.target.value)})} placeholder="PESO" />
          <button onClick={()=>setIsEditing(false)} className="col-span-2 bg-vault-amber text-black font-black p-2 uppercase text-[10px]">Confirmar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`jewelry-card p-3 relative bg-vault-panel ${isLow ? 'border-vault-low border-dashed' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="w-12 h-1 bg-vault-amber/20 overflow-hidden">
            <div className="h-full bg-vault-amber" style={{ width: `${percentage}%` }}></div>
        </div>
        <button onClick={()=>onDelete(item.id)} className="text-vault-low opacity-50 hover:opacity-100"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>
      
      <div className="mt-2" onClick={()=>setIsEditing(true)}>
        <h4 className="font-black text-[11px] truncate uppercase text-vault-amber glow-text">{item.nome}</h4>
        <div className="flex justify-between items-end mt-2">
          <div>
            <span className="text-[8px] opacity-60 block uppercase">CARGA</span>
            <span className={`text-sm font-black ${isLow ? 'text-vault-low animate-pulse' : ''}`}>{item.peso}G</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] opacity-60 block uppercase">TIPO</span>
            <span className="text-[10px] font-black">{item.tipo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
