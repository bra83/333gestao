
import React, { useState } from 'react';
import { StockItem } from '../types';

interface SpoolCardProps {
  item: StockItem;
  onUpdate: (id: string, updates: Partial<StockItem>) => void;
  onDelete: (id: string) => void;
}

export const SpoolCard: React.FC<SpoolCardProps> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<StockItem>({ ...item });

  const percentage = Math.min(100, (item.peso / 1000) * 100);
  const isLow = item.peso < 200;
  const filamentColor = item.cor || '#3b82f6';

  const handleSave = () => {
    onUpdate(item.id!, { ...editForm });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="jewelry-card p-5 bg-white border-2 border-sapphire-400 animate-in zoom-in-95 duration-200 shadow-2xl col-span-2">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Ajustar Gema</h4>
          <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-rose-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              className="w-full text-sm p-3 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-slate-900 outline-none focus:border-sapphire-500" 
              value={editForm.nome} 
              placeholder="Nome"
              onChange={e => setEditForm({...editForm, nome: e.target.value})}
            />
            <input 
              className="w-full text-sm p-3 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-slate-900 outline-none focus:border-sapphire-500" 
              value={editForm.marca} 
              placeholder="Marca"
              onChange={e => setEditForm({...editForm, marca: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <select 
              className="w-full text-sm p-3 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-slate-900 outline-none"
              value={editForm.tipo}
              onChange={e => setEditForm({...editForm, tipo: e.target.value})}
            >
              {['PLA', 'PETG', 'ABS', 'SILK', 'RESINA', 'TPU', 'ASA'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input 
              type="number"
              className="w-full text-sm p-3 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-slate-900 outline-none" 
              value={editForm.peso} 
              placeholder="Peso (g)"
              onChange={e => setEditForm({...editForm, peso: Number(e.target.value)})}
            />
            <input 
              type="number"
              className="w-full text-sm p-3 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-slate-900 outline-none" 
              value={editForm.preco} 
              placeholder="Preço R$"
              onChange={e => setEditForm({...editForm, preco: Number(e.target.value)})}
            />
          </div>

          <div className="flex gap-3 items-center">
             <div className="w-12 h-12 rounded-xl border-2 border-slate-200" style={{ backgroundColor: editForm.cor }}></div>
             <input 
                type="color" 
                className="w-12 h-12 rounded-xl border-0 cursor-pointer p-0 overflow-hidden bg-transparent"
                value={editForm.cor} 
                onChange={e => setEditForm({...editForm, cor: e.target.value})}
             />
             <input 
                className="flex-1 text-sm p-3 rounded-xl bg-slate-50 border-2 border-slate-200 font-mono font-bold text-slate-900 outline-none uppercase" 
                value={editForm.cor} 
                onChange={e => setEditForm({...editForm, cor: e.target.value})}
             />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 jewel-gradient-emerald text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Salvar Alterações</button>
            <button onClick={() => setIsEditing(false)} className="px-6 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl text-xs uppercase active:scale-95 transition-all">Sair</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`jewelry-card p-4 relative transition-all duration-300 ${isLow ? 'ring-2 ring-rose-500 bg-rose-50/50' : 'bg-white shadow-sm hover:shadow-md'}`}>
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button 
          onClick={() => setIsEditing(true)} 
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg active:scale-90 transition-transform"
        >
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <button 
          onClick={() => onDelete(item.id!)} 
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500 text-white shadow-lg active:scale-90 transition-transform"
        >
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex justify-center mb-4 pt-4">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
            <circle 
                cx="56" cy="56" r="46" 
                style={{ stroke: filamentColor }} 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={289} 
                strokeDashoffset={289 - (289 * percentage) / 100} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border-4 border-white" style={{ backgroundColor: filamentColor }}>
            <div className={`w-6 h-6 border-2 border-white/40 rounded-full ${isLow ? 'animate-ping' : 'animate-pulse'}`}></div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h4 className="font-extrabold text-sm text-slate-900 truncate px-1 uppercase tracking-tight">{item.nome}</h4>
        <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest mb-2 opacity-80">{item.tipo} • {item.marca}</p>
        
        <div className="mt-3 pt-4 border-t border-slate-200 flex justify-between items-center">
           <div className="text-left">
             <span className="text-[9px] text-slate-900 font-black uppercase tracking-tighter block leading-none mb-1 opacity-70">Carga</span>
             <span className={`text-base font-black tracking-tighter ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{item.peso}g</span>
           </div>
           <div className="text-right">
             <span className="text-[9px] text-slate-900 font-black uppercase tracking-tighter block leading-none mb-1 opacity-70">Custo</span>
             <span className="text-base font-black text-slate-900 tracking-tighter">R$ {item.preco}</span>
           </div>
        </div>
        
        {isLow && (
          <div className="mt-3 text-white text-[8px] font-black uppercase tracking-[0.2em] bg-rose-600 py-1.5 rounded-xl shadow-lg shadow-rose-200 animate-bounce">
            REPOR IMEDIATAMENTE
          </div>
        )}
      </div>
    </div>
  );
};
