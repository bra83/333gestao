
import React, { useState } from 'react';
import { StockItem } from '../types';

export const SpoolCard: React.FC<{ item: StockItem; onUpdate: any; onDelete: any }> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const percentage = Math.min(100, (item.peso / 1000) * 100);
  const isLow = item.peso < 200;
  
  // ParÃ¢metros do CÃ­rculo
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  if (isEditing) {
    return (
      <div className="jewelry-card p-4 col-span-2 bg-black/80">
        <h4 className="text-[10px] font-black uppercase mb-4 border-b border-vault-amber pb-2 glow-text">RECALIBRANDO DADOS</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[8px] opacity-60 uppercase mb-1 block">NOME</label>
            <input className="text-xs !p-2" value={item.nome} onChange={e=>onUpdate(item.id, {nome: e.target.value})} />
          </div>
          <div>
            <label className="text-[8px] opacity-60 uppercase mb-1 block">MASSA (G)</label>
            <input className="text-xs !p-2" type="number" value={item.peso} onChange={e=>onUpdate(item.id, {peso: Number(e.target.value)})} />
          </div>
          <div>
            <label className="text-[8px] opacity-60 uppercase mb-1 block">PREÃ‡O (R$)</label>
            <input className="text-xs !p-2" type="number" value={item.preco} onChange={e=>onUpdate(item.id, {preco: Number(e.target.value)})} />
          </div>
          <div>
            <label className="text-[8px] opacity-60 uppercase mb-1 block">COR (HEX)</label>
            <input className="text-xs !p-2" type="color" value={item.cor || '#ffb642'} onChange={e=>onUpdate(item.id, {cor: e.target.value})} />
          </div>
          <button onClick={()=>setIsEditing(false)} className="col-span-2 bg-vault-amber text-black font-black p-3 uppercase text-[10px] mt-2 active:scale-95 shadow-lg">SALVAR NO DATABASE</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`jewelry-card p-4 relative flex flex-col justify-between h-52 group transition-all hover:scale-[1.02] ${isLow ? 'border-vault-low border-dashed animate-pulse' : ''}`}>
      <div className="flex justify-between items-start">
        {/* Gauge Circular */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            {/* Fundo do cÃ­rculo */}
            <circle
              cx="40" cy="40" r={radius}
              stroke="rgba(255,182,66,0.1)"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Barra de progresso com a cor do filamento */}
            <circle
              cx="40" cy="40" r={radius}
              stroke={item.cor || '#ffb642'}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black leading-none">{Math.round(percentage)}%</span>
            <span className="text-[6px] opacity-50 uppercase">Fuel</span>
          </div>
        </div>
        
        <button onClick={()=>onDelete(item.id)} className="text-vault-low opacity-20 group-hover:opacity-100 p-2 transition-opacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      
      <div className="flex-1 mt-2 cursor-pointer" onClick={()=>setIsEditing(true)}>
        <h4 className="font-black text-[13px] uppercase text-vault-amber glow-text leading-tight mb-1">{item.nome}</h4>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.cor }}></div>
          <p className="text-[8px] opacity-40 uppercase tracking-widest">{item.marca || 'GENERIC VAULT'}</p>
        </div>
      </div>

      <div className="mt-auto pt-2 border-t border-vault-amber/20 flex justify-between items-end">
        <div>
          <span className="text-[8px] opacity-40 block uppercase leading-none mb-1">DATA_LOG</span>
          <span className={`text-xl font-black leading-none ${isLow ? 'text-vault-low' : 'text-vault-amber'}`}>{item.peso}G</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] opacity-40 block uppercase leading-none mb-1">CLASS</span>
          <span className="text-[10px] font-black leading-none bg-vault-amber/10 px-1">{item.tipo}</span>
        </div>
      </div>

      {/* Overlay de SeleÃ§Ã£o Estilo Pip-Boy */}
      <div className="absolute inset-0 bg-vault-amber/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
    </div>
  );
};
