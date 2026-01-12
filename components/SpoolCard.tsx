import React, { useMemo, useState } from 'react';
import { StockItem } from '../types';

interface SpoolCardProps {
  item: StockItem;
  onUpdate: (id: string, updates: Partial<StockItem>) => void;
  onDelete: (id: string) => void;
}

const MATERIAL_TYPES = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'SILK', 'RESINA', 'NYLON', 'OUTRO'];

export const SpoolCard: React.FC<SpoolCardProps> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Edit State
  const [editName, setEditName] = useState(item.nome);
  const [editBrand, setEditBrand] = useState(item.marca || '');
  const [editWeight, setEditWeight] = useState(item.peso.toString());
  const [editPrice, setEditPrice] = useState(item.preco.toString());
  const [editColor, setEditColor] = useState(item.cor || '#3b82f6');
  const [editType, setEditType] = useState(item.tipo || 'PLA');

  const { color, percentage, type, isLowStock } = useMemo(() => {
    let extractedColor = item.cor || '#3b82f6';
    if (!item.cor) {
       const match = item.nome.match(/"([^"]+)"/);
       const colorMap: Record<string, string> = {
          preto: '#1e293b', black: '#1e293b',
          branco: '#f8fafc', white: '#f8fafc',
          vermelho: '#ef4444', red: '#ef4444',
          azul: '#3b82f6', blue: '#3b82f6',
          verde: '#22c55e', green: '#22c55e',
          amarelo: '#eab308', yellow: '#eab308',
          laranja: '#f97316', orange: '#f97316',
          cinza: '#94a3b8', grey: '#94a3b8',
          roxo: '#a855f7', purple: '#a855f7',
       };
       if (match && match[1] && colorMap[match[1].toLowerCase()]) {
         extractedColor = colorMap[match[1].toLowerCase()];
       }
    }
    
    let matType = item.tipo || 'PLA';
    if (!item.tipo) {
       if (item.nome.toUpperCase().includes('PETG')) matType = 'PETG';
       if (item.nome.toUpperCase().includes('ABS')) matType = 'ABS';
    }

    const pct = Math.min(100, Math.max(0, (item.peso / 1000) * 100));
    return { color: extractedColor, percentage: pct, type: matType, isLowStock: item.peso < 200 };
  }, [item]);

  const handleSave = () => {
    if (item.id) {
        onUpdate(item.id, {
            nome: editName,
            marca: editBrand,
            peso: Number(editWeight),
            preco: Number(editPrice),
            cor: editColor,
            tipo: editType
        });
    }
    setIsEditing(false);
  };

  if (isEditing) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-lg flex flex-col gap-2 border border-emerald-200 relative z-30">
            <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Editar</h4>
            <div className="flex gap-2">
                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Nome" />
                <input type="color" className="w-8 h-8 p-0 rounded border-none" value={editColor} onChange={e=>setEditColor(e.target.value)} />
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editType} onChange={e=>setEditType(e.target.value)}>
                {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editBrand} onChange={e=>setEditBrand(e.target.value)} placeholder="Marca" />
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-[10px] text-slate-400">Peso (g)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editWeight} onChange={e=>setEditWeight(e.target.value)} />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] text-slate-400">Preço</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editPrice} onChange={e=>setEditPrice(e.target.value)} />
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={handleSave} className="flex-1 bg-green-500 text-white py-1 rounded-lg text-xs font-bold shadow-sm">Salvar</button>
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-600 py-1 rounded-lg text-xs">Cancelar</button>
            </div>
        </div>
      )
  }

  return (
    <div className={`bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center relative overflow-hidden group border-2 transition-all hover:shadow-md ${isLowStock ? 'border-red-200 bg-red-50/50' : 'border-white hover:border-emerald-100'}`}>
      
      {/* Edit/Delete Overlay */}
      <div className="absolute top-2 left-2 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="bg-white/90 text-blue-400 p-1.5 rounded-full hover:bg-blue-50 border border-blue-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <button onClick={() => item.id && onDelete(item.id)} className="bg-white/90 text-red-400 p-1.5 rounded-full hover:bg-red-50 border border-red-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>

      {/* Type Tag */}
      <div className="absolute top-2 left-2 z-20 group-hover:opacity-0 transition-opacity">
        <span className="bg-white/80 backdrop-blur text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-100 shadow-sm uppercase">
          {type}
        </span>
      </div>

      {/* Percentage */}
      <div className={`absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${isLowStock ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
        {isLowStock && (
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        )}
        {Math.round(percentage)}%
      </div>

      {/* Spool Visual */}
      <div className="relative w-28 h-28 rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden mb-3 shadow-inner">
        <div 
          className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-in-out"
          style={{ height: `${percentage}%`, backgroundColor: color, opacity: 0.9 }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border border-slate-200 z-10 flex items-center justify-center shadow-sm"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent to-white opacity-20 rounded-full pointer-events-none"></div>
      </div>
      

      {/* Info */}
      <h3 className="text-slate-800 font-bold text-base text-center leading-tight mb-0 truncate w-full" title={item.nome}>
        {item.nome.replace(/"[^"]+"/g, '').trim()}
      </h3>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3 truncate max-w-full">
        {item.marca || 'Genérico'}
      </span>

      <div className="w-full flex justify-between items-center text-xs font-bold text-slate-500 mt-auto border-t border-slate-100 pt-2">
        <span className={isLowStock ? 'text-red-400' : ''}>{item.peso}g</span>
        <span className="bg-slate-50 px-2 py-0.5 rounded-lg text-slate-600">R$ {item.preco}</span>
      </div>
    </div>
  );
};
