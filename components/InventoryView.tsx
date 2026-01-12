
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
  const [newItemColor, setNewItemColor] = useState('#3b82f6');
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
        <div className="bg-heart/10 border-2 border-heart p-4 shadow-sm flex items-center gap-3">
            <div className="animate-pulse text-heart">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div>
                <strong className="text-heart font-pixel text-lg uppercase block">Low Health!</strong>
                <span className="text-xs text-heart uppercase">Recarregue: {lowStockItems.map(i => i.nome).join(', ')}</span>
            </div>
        </div>
      )}

      <div className="retro-box p-5 bg-white">
        <h3 className="text-secondary font-pixel text-lg uppercase mb-4 border-b-2 border-secondary/20 pb-2">Loot Encontrado</h3>
        <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-2">
               <input 
                className="bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-bgDark text-sm focus:border-primary focus:bg-white focus:outline-none font-bold" 
                placeholder='Item (Ex: Preto)' 
                value={newItemName} 
                onChange={e => setNewItemName(e.target.value)} 
              />
              <select 
                 className="bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-bgDark text-sm focus:border-primary focus:outline-none font-bold"
                 value={newItemType}
                 onChange={e => setNewItemType(e.target.value)}
              >
                {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input 
                className="bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-bgDark text-sm focus:border-primary focus:outline-none font-bold" 
                placeholder='Marca' 
                value={newItemBrand} 
                onChange={e => setNewItemBrand(e.target.value)} 
              />
              <div className="w-12 h-full border-2 border-[#ccc] bg-[#f0f0f0] relative">
                <input 
                  type="color" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  value={newItemColor} 
                  onChange={e => setNewItemColor(e.target.value)}
                />
                <div className="w-full h-full" style={{backgroundColor: newItemColor}}></div>
              </div>
            </div>

            <div className="flex gap-2">
              <input type="number" className="bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-bgDark w-1/2 text-sm focus:border-primary focus:outline-none font-pixel text-lg" placeholder='Peso (g)' value={newItemWeight} onChange={e => setNewItemWeight(e.target.value)} />
              <input type="number" className="bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-bgDark w-1/2 text-sm focus:border-primary focus:outline-none font-pixel text-lg" placeholder='Preço' value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
            </div>
            
            <button onClick={submitStock} className="retro-btn bg-primary text-white py-3 mt-2 text-sm font-pixel uppercase border-2 border-bgDark shadow-[2px_2px_0_#004d24]">
              Guardar na Mochila
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
