import React, { useState, useMemo } from 'react';
import { StockItem } from '../types';
import { SpoolCard } from './SpoolCard';

interface InventoryViewProps {
  stock: StockItem[];
  onAddStock: (nome: string, marca: string, peso: number, preco: number, cor: string, tipo: string) => void;
  onUpdateStock: (id: string, updates: Partial<StockItem>) => void;
  onDeleteStock: (id: string) => void;
}

const MATERIAL_TYPES = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'SILK', 'RESINA', 'NYLON', 'OUTRO'];

export const InventoryView: React.FC<InventoryViewProps> = ({ stock, onAddStock, onUpdateStock, onDeleteStock }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemColor, setNewItemColor] = useState('#3b82f6'); // Default Blue
  const [newItemType, setNewItemType] = useState('PLA');

  const submitStock = () => {
    if(!newItemName || !newItemWeight || !newItemPrice) return;
    onAddStock(
      newItemName, 
      newItemBrand, 
      Number(newItemWeight), 
      Number(newItemPrice),
      newItemColor,
      newItemType
    );
    setNewItemName('');
    setNewItemBrand('');
    setNewItemWeight('');
    setNewItemPrice('');
    setNewItemColor('#3b82f6');
  };

  const lowStockItems = useMemo(() => {
    return stock.filter(item => item.peso < 200);
  }, [stock]);

  return (
    <div className="space-y-6 pb-20">
      
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-500 font-bold mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Filamento Acabando!</span>
          </div>
          <ul className="list-disc list-inside text-sm text-red-400 pl-1">
            {lowStockItems.map((item, idx) => (
              <li key={idx}>{item.nome} ({item.peso}g)</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface p-5 rounded-2xl border border-emerald-100 shadow-sm">
        <h3 className="text-slate-700 font-bold mb-3">Novo Carretel</h3>
        <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-2">
               <input 
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-primary focus:outline-none" 
                placeholder='Nome (Ex: Preto Fosco)' 
                value={newItemName} 
                onChange={e => setNewItemName(e.target.value)} 
              />
              <select 
                 className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-primary focus:outline-none"
                 value={newItemType}
                 onChange={e => setNewItemType(e.target.value)}
              >
                {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input 
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-primary focus:outline-none" 
                placeholder='Marca (Ex: Voolt3D)' 
                value={newItemBrand} 
                onChange={e => setNewItemBrand(e.target.value)} 
              />
              <div className="relative overflow-hidden rounded-xl border border-slate-200 w-12 h-full">
                <input 
                  type="color" 
                  className="absolute -top-2 -left-2 w-16 h-16 p-0 border-none cursor-pointer" 
                  value={newItemColor} 
                  onChange={e => setNewItemColor(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <input type="number" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 w-1/2 text-sm focus:border-primary focus:outline-none" placeholder='Peso (g)' value={newItemWeight} onChange={e => setNewItemWeight(e.target.value)} />
              <input type="number" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 w-1/2 text-sm focus:border-primary focus:outline-none" placeholder='Preço (1kg)' value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
            </div>
            
            <button onClick={submitStock} className="bg-primary hover:bg-emerald-700 text-white py-3 rounded-xl font-bold mt-2 text-sm uppercase tracking-wide shadow-lg shadow-emerald-200 transition-all active:scale-95">
              Adicionar ao Estoque
            </button>
        </div>
      </div>

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