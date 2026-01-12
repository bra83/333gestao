
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
    const pct = Math.min(100, Math.max(0, (item.peso / 1000) * 100));
    return { color: extractedColor, percentage: pct, type: matType, isLowStock: item.peso < 200 };
  }, [item]);

  const handleSave = () => {
    if (item.id) {
        onUpdate(item.id, {
            nome: editName, marca: editBrand, peso: Number(editWeight), preco: Number(editPrice), cor: editColor, tipo: editType
        });
    }
    setIsEditing(false);
  };

  if (isEditing) {
      return (
        <div className="retro-box p-3 bg-white relative z-30 flex flex-col gap-2">
            <h4 className="text-secondary text-xs font-pixel uppercase">Modificar Item</h4>
            <input className="border-2 border-secondary/30 p-1 text-xs w-full bg-[#f9f9f9]" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Nome" />
            <div className="flex gap-1">
              <input type="number" className="border-2 border-secondary/30 p-1 text-xs w-full bg-[#f9f9f9]" value={editWeight} onChange={e=>setEditWeight(e.target.value)} />
              <input type="color" className="w-8 h-8 border-none" value={editColor} onChange={e=>setEditColor(e.target.value)} />
            </div>
            <div className="flex gap-1 mt-1">
                <button onClick={handleSave} className="flex-1 bg-primary text-white text-[10px] py-1 font-pixel uppercase border border-bgDark">Save</button>
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-secondary text-white text-[10px] py-1 font-pixel uppercase border border-bgDark">Cancel</button>
            </div>
        </div>
      )
  }

  return (
    <div className={`retro-box p-3 relative group transition-all hover:bg-[#fffdf5] ${isLowStock ? 'border-heart bg-heart/5' : 'bg-white'}`}>
      
      {/* Edit Overlay */}
      <div className="absolute top-1 right-1 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="bg-white border-2 border-magic text-magic w-6 h-6 flex items-center justify-center hover:bg-magic hover:text-white">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <button onClick={() => item.id && onDelete(item.id)} className="bg-white border-2 border-heart text-heart w-6 h-6 flex items-center justify-center hover:bg-heart hover:text-white">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Type Badge */}
      <div className="absolute top-2 left-2 z-20">
        <span className="bg-bgDark text-accent text-[8px] font-pixel px-1.5 py-0.5 border border-secondary uppercase">
          {type}
        </span>
      </div>

      {/* Circle Graph */}
      <div className="flex justify-center my-2">
          <div className="relative w-20 h-20 rounded-full border-4 border-secondary bg-[#e5e5e5] overflow-hidden shadow-inner">
            <div 
              className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-in-out"
              style={{ height: `${percentage}%`, backgroundColor: color }}
            />
            {/* Pixel shine */}
            <div className="absolute top-2 right-4 w-2 h-2 bg-white/40"></div>
          </div>
      </div>

      {/* Details */}
      <div className="text-center">
        <h3 className="text-bgDark font-bold text-sm leading-tight truncate" title={item.nome}>
          {item.nome.replace(/"[^"]+"/g, '').trim()}
        </h3>
        <span className="text-[10px] text-secondary/70 uppercase font-pixel tracking-wide block mb-2">
          {item.marca || 'Unknown'}
        </span>
        
        <div className="border-t-2 border-secondary/20 pt-1 flex justify-between items-center">
             <span className={`font-pixel text-sm ${isLowStock ? 'text-heart animate-pulse' : 'text-secondary'}`}>{item.peso}g</span>
             <span className="text-[10px] font-bold text-bgDark bg-accent/20 px-1 rounded">R${item.preco}</span>
        </div>
      </div>
    </div>
  );
};
