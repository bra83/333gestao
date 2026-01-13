
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

  const lowStockCount = useMemo(() => stock.filter(item => item.peso < 200).length, [stock]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
         <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Cofre de Gemas</h3>
            <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest">{stock.length} MATERIAIS ATIVOS</p>
         </div>
         <button onClick={() => setShowForm(!showForm)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${showForm ? 'bg-rose-500 text-white rotate-45' : 'bg-emerald-500 text-white'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
         </button>
      </div>

      {showForm && (
        <div className="jewelry-card p-6 bg-white shadow-2xl border-2 border-emerald-200 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-900 mb-1 ml-1 tracking-widest block">Nome</label>
                <input className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-900 mb-1 ml-1 tracking-widest block">Marca</label>
                <input className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl text-sm font-bold text-slate-900 outline-none" value={newItemBrand} onChange={e => setNewItemBrand(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-900 mb-1 ml-1 tracking-widest block">Tipo</label>
                <select className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl text-sm font-bold text-slate-900 outline-none" value={newItemType} onChange={e => setNewItemType(e.target.value)}>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-900 mb-1 ml-1 tracking-widest block">Peso (g)</label>
                <input type="number" className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl text-sm font-bold text-slate-900 outline-none" value={newItemWeight} onChange={e => setNewItemWeight(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-900 mb-1 ml-1 tracking-widest block">Preço (R$)</label>
                <input type="number" className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl text-sm font-bold text-slate-900 outline-none" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-900 mb-1 ml-1 tracking-widest block">Escolha a Cor</label>
                <div className="flex gap-2">
                  <div className="w-14 h-14 rounded-2xl shadow-xl border-4 border-white" style={{ backgroundColor: newItemColor }}></div>
                  <input type="color" className="w-14 h-14 rounded-2xl border-0 cursor-pointer p-0 bg-transparent" value={newItemColor} onChange={e => setNewItemColor(e.target.value)} />
                  <input className="flex-1 bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl text-sm font-mono font-bold uppercase text-slate-900 outline-none" value={newItemColor} onChange={e => setNewItemColor(e.target.value)} />
                </div>
              </div>
          </div>
          <button onClick={submitStock} className="w-full jewel-gradient-emerald text-white py-5 mt-8 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
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
      </div>
    </div>
  );
};
