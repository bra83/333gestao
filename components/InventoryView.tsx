
import React, { useState, useMemo } from 'react';
import { StockItem } from '../types';
import { SpoolCard } from './SpoolCard';

interface InventoryViewProps {
  stock: StockItem[];
  onAddStock: (nome: string, marca: string, peso: number, preco: number, cor: string, tipo: string) => void;
  onUpdateStock: (id: string, updates: Partial<StockItem>) => void;
  onDeleteStock: (id: string) => void;
}

const MATERIAL_TYPES = ['PLA', 'PETG', 'ABS', 'SILK', 'RESINA', 'TPU', 'ASA'];

export const InventoryView: React.FC<InventoryViewProps> = ({ stock, onAddStock, onUpdateStock, onDeleteStock }) => {
  const [showForm, setShowForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('1000');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemColor, setNewItemColor] = useState('#3b82f6');
  const [newItemType, setNewItemType] = useState('PLA');

  const submitStock = () => {
    if(!newItemName || !newItemWeight || !newItemPrice) return;
    onAddStock(newItemName, newItemBrand, Number(newItemWeight), Number(newItemPrice), newItemColor, newItemType);
    setNewItemName(''); setNewItemBrand(''); setNewItemWeight('1000'); setNewItemPrice(''); setNewItemColor('#3b82f6');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end px-1 pb-2">
         <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Cofre</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{stock.length} MATERIAIS ATIVOS</p>
            </div>
         </div>
         <button onClick={() => setShowForm(!showForm)} className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-300 shadow-xl ${showForm ? 'bg-slate-900 text-white rotate-45' : 'jewel-gradient-emerald text-white'}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
         </button>
      </div>

      {showForm && (
        <div className="jewelry-card p-8 bg-white shadow-2xl border-slate-200 animate-in slide-in-from-top-4 duration-300 relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 jewel-gradient-emerald"></div>
          <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest block">IdentificaÃ§Ã£o da Gema</label>
                <input className="w-full p-4 rounded-2xl text-sm font-bold text-slate-900" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Ex: Vermelho Rubi" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest block">Marca</label>
                <input className="w-full p-4 rounded-2xl text-sm font-bold text-slate-900" value={newItemBrand} onChange={e => setNewItemBrand(e.target.value)} placeholder="Voolt3D" />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest block">Tipo</label>
                <select className="w-full p-4 rounded-2xl text-sm font-bold text-slate-900" value={newItemType} onChange={e => setNewItemType(e.target.value)}>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest block">Peso (g)</label>
                <input type="number" className="w-full p-4 rounded-2xl text-sm font-bold text-slate-900" value={newItemWeight} onChange={e => setNewItemWeight(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest block">PreÃ§o (R$)</label>
                <input type="number" className="w-full p-4 rounded-2xl text-sm font-bold text-slate-900" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest block">Matiz Visual</label>
                <div className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 rounded-xl shadow-inner border-2 border-white" style={{ backgroundColor: newItemColor }}></div>
                  <div className="flex-1 space-y-2">
                    <input type="color" className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-none" value={newItemColor} onChange={e => setNewItemColor(e.target.value)} />
                    <input className="w-full bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase text-slate-600" value={newItemColor} onChange={e => setNewItemColor(e.target.value)} />
                  </div>
                </div>
              </div>
          </div>
          <button onClick={submitStock} className="w-full jewel-gradient-emerald text-white py-5 mt-8 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-lg active:scale-95 transition-all">
            ADICIONAR AO COFRE
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {stock.map((item, idx) => (
          <SpoolCard 
            key={item.id || idx} 
            item={item} 
            onUpdate={onUpdateStock}
            onDelete={onDeleteStock}
          />
        ))}
        {stock.length === 0 && !showForm && (
          <div className="col-span-2 py-20 text-center opacity-30">
            <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 16V8l-7-4-7 4v8l7 4z"/><path d="M7 8l7 4 7-4M14 12v8"/></svg>
            <p className="font-bold uppercase tracking-widest text-xs">Cofre Vazio</p>
          </div>
        )}
      </div>
    </div>
  );
};
