
import React, { useState } from 'react';
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
  const [n, setN] = useState('');
  const [m, setM] = useState('');
  const [p, setP] = useState('1000');
  const [pr, setPr] = useState('');
  const [c, setC] = useState('#ffb642');
  const [t, setT] = useState('PLA');

  const submit = () => {
    if(!n || !p || !pr) return;
    onAddStock(n, m, Number(p), Number(pr), c, t);
    setN(''); setM(''); setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b-2 border-vault-amber pb-4">
         <div>
            <h3 className="text-2xl font-black glow-text uppercase leading-none">DATABASE</h3>
            <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-widest">{stock.length} HOLOTAPES ATIVOS</p>
         </div>
         <button onClick={() => setShowForm(!showForm)} className={`p-4 border-2 border-vault-amber transition-all ${showForm ? 'bg-vault-amber text-black rotate-45' : 'text-vault-amber'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
         </button>
      </div>

      {showForm && (
        <div className="jewelry-card p-6 bg-black/40 space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">IDENTIFICAÃ‡ÃƒO</label>
                <input className="w-full" value={n} onChange={e => setN(e.target.value)} placeholder="NAME" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">MARCA</label>
                <input className="w-full" value={m} onChange={e => setM(e.target.value)} placeholder="BRAND" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">TIPO</label>
                <select className="w-full" value={t} onChange={e => setT(e.target.value)}>
                  {MATERIAL_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">PESO (G)</label>
                <input type="number" className="w-full" value={p} onChange={e => setP(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase opacity-60 mb-1 block">PREÃ‡O (R$)</label>
                <input type="number" className="w-full" value={pr} onChange={e => setPr(e.target.value)} />
              </div>
          </div>
          <button onClick={submit} className="w-full bg-vault-amber text-black py-4 font-black text-xs uppercase tracking-widest">
            REGISTRAR NO COFRE
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {stock.map((item, idx) => (
          <SpoolCard key={item.id || idx} item={item} onUpdate={onUpdateStock} onDelete={onDeleteStock} />
        ))}
      </div>
    </div>
  );
};
