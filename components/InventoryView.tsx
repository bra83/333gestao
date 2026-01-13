
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
  const [newItemColor, setNewItemColor] = useState('#10b981');
  const [newItemType, setNewItemType] = useState('PLA');

  const submitStock = () => {
    if(!newItemName || !newItemWeight || !newItemPrice) return;
    onAddStock(newItemName, newItemBrand, Number(newItemWeight), Number(newItemPrice), newItemColor, newItemType);
    setNewItemName(''); setNewItemBrand(''); setNewItemWeight('1000'); setNewItemPrice(''); setNewItemColor('#10b981');
    setShowForm(false);
  };

  const lowStockCount = useMemo(() => stock.filter(item => item.peso < 200).length, [stock]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
         <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">COFRE DE GEMAS</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stock.length} FILAMENTOS NO COFRE</p>
         </div>
         <button onClick={() => setShowForm(!showForm)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${showForm ? 'bg-rose-500 text-white rotate-45' : 'bg-emerald-500 text-white'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
         </button>
      </div>

      {lowStockCount > 0 && (
        <div className="jewelry-card p-4 bg-rose-50 border-rose-200 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div>
            <p className="text-rose-600 font-black text-xs uppercase tracking-tight">Gemas em Escassez!</p>
            <p className="text-[9px] text-rose-400 font-bold uppercase">{lowStockCount} itens precisam de reposição.</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="jewelry-card p-6 bg-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 jewel-gradient-emerald opacity-50"></div>
          <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Nome da Gema</label>
                <input className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-100 outline-none" placeholder='Ex: Ametista Transparente' value={newItemName} onChange={e => setNewItemName(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Marca</label>
                <input className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold outline-none" placeholder='Voolt3D' value={newItemBrand} onChange={e => setNewItemBrand(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Tipo</label>
                <select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold outline-none appearance-none" value={newItemType} onChange={e => setNewItemType(e.target.value)}>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Peso (g)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold outline-none" value={newItemWeight} onChange={e => setNewItemWeight(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Preço (R$)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold outline-none" placeholder='120' value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Cor da Gema (Hex)</label>
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-2xl shadow-inner border-2 border-white" style={{ backgroundColor: newItemColor }}></div>
                  <input className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-mono font-bold uppercase outline-none" value={newItemColor} onChange={e => setNewItemColor(e.target.value)} />
                  <input type="color" className="sr-only" id="gemColor" value={newItemColor} onChange={e => setNewItemColor(e.target.value)} />
                  <button onClick={() => document.getElementById('gemColor')?.click()} className="px-4 bg-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Pick</button>
                </div>
              </div>
          </div>
          <button onClick={submitStock} className="w-full jewel-gradient-emerald text-white py-5 mt-8 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 active:scale-95 transition-all">
            LAPIDAR E SALVAR
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
