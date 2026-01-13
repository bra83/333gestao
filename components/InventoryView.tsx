
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
  const [newItemWeight, setNewItemWeight] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemColor, setNewItemColor] = useState('#10b981');
  const [newItemType, setNewItemType] = useState('PLA');

  const submitStock = () => {
    if(!newItemName || !newItemWeight || !newItemPrice) return;
    onAddStock(newItemName, newItemBrand, Number(newItemWeight), Number(newItemPrice), newItemColor, newItemType);
    setNewItemName(''); setNewItemBrand(''); setNewItemWeight(''); setNewItemPrice(''); setNewItemColor('#10b981');
    setShowForm(false);
  };

  const lowStockItems = useMemo(() => stock.filter(item => item.peso < 200), [stock]);

  return (
    <div className="space-y-6">
      
      {lowStockItems.length > 0 && (
        <div className="jewelry-card p-5 bg-rose-50/50 border-rose-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center animate-bounce shadow-lg shadow-rose-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
                <strong className="text-rose-600 font-black text-sm uppercase tracking-tight block">Saúde Crítica!</strong>
                <span className="text-[10px] text-rose-400 font-bold uppercase">{lowStockItems.length} gema(s) acabando no cofre.</span>
            </div>
        </div>
      )}

      <div className="flex justify-between items-center px-2">
         <h3 className="text-xl font-black text-slate-800 tracking-tighter">COFRE DE GEMAS</h3>
         <button onClick={() => setShowForm(!showForm)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${showForm ? 'bg-rose-500 text-white rotate-45' : 'bg-emerald-500 text-white'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
         </button>
      </div>

      {showForm && (
        <div className="jewelry-card p-6 bg-white/90 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Nome da Gema</label>
                <input className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold focus:ring-2 ring-emerald-500/20 outline-none" placeholder='Ex: Ametista Deep' value={newItemName} onChange={e => setNewItemName(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Marca</label>
                <input className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold outline-none" placeholder='Voolt3D' value={newItemBrand} onChange={e => setNewItemBrand(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Tipo</label>
                <select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold outline-none" value={newItemType} onChange={e => setNewItemType(e.target.value)}>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Peso (g)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold outline-none" placeholder='1000' value={newItemWeight} onChange={e => setNewItemWeight(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Preço (R$)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-bold outline-none" placeholder='120' value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Cor Hexadecimal</label>
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-xl shadow-inner border border-white" style={{ backgroundColor: newItemColor }}></div>
                  <input className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm font-mono font-bold uppercase outline-none" placeholder='#10b981' value={newItemColor} onChange={e => setNewItemColor(e.target.value)} />
                  <input type="color" className="w-12 h-12 opacity-0 absolute pointer-events-none" id="colorPicker" value={newItemColor} onChange={e => setNewItemColor(e.target.value)} />
                  <button onClick={() => document.getElementById('colorPicker')?.click()} className="px-4 bg-slate-100 rounded-xl text-[10px] font-bold uppercase">Escolher</button>
                </div>
              </div>
          </div>
          <button onClick={submitStock} className="w-full jewel-gradient-emerald text-white py-4 mt-6 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
            LAPIDAR GEMA (Salvar)
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
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
