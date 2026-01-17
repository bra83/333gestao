import React, { useState } from 'react';
import { Sale, Expense } from '../types';

interface TransactionsViewProps {
  sales: Sale[];
  expenses: Expense[];
  onUpdateSale: (id: string, newVal: number, newProfit: number) => void;
  onDeleteSale: (id: string) => void;
  onAddExpense: (desc: string, val: number, date: string) => void;
  onUpdateExpense: (id: string, desc: string, val: number) => void;
  onDeleteExpense: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ 
  sales, expenses, onUpdateSale, onDeleteSale,
  onAddExpense, onUpdateExpense, onDeleteExpense
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpVal, setNewExpVal] = useState('');
  const [editingExp, setEditingExp] = useState<string | null>(null);

  const fmtMoney = (val: number) => `R$ ${(val || 0).toFixed(2)}`;

  return (
    <div className="space-y-4">
      <div className="flex border-2 border-vault-amber p-0.5">
        <button onClick={() => setActiveTab('sales')} className={`flex-1 py-2 text-[10px] font-black uppercase transition-all ${activeTab === 'sales' ? 'bg-vault-amber text-black' : 'text-vault-amber opacity-40'}`}>VENDAS</button>
        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-2 text-[10px] font-black uppercase transition-all ${activeTab === 'expenses' ? 'bg-vault-amber text-black' : 'text-vault-amber opacity-40'}`}>GASTOS</button>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-2">
          {sales.slice().reverse().map((sale, idx) => (
            <div key={sale.id || idx} className="jewelry-card p-3 relative bg-black/40 border-l-4 border-l-vault-amber">
              <div className="flex justify-between items-center pr-6">
                 <div>
                    <div className="text-vault-amber font-black text-xs uppercase leading-none glow-text">{sale.item}</div>
                    <div className="text-vault-amber/40 text-[7px] mt-1">{sale.data} â€¢ {sale.material}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-vault-amber font-black text-sm leading-none">{fmtMoney(sale.venda)}</div>
                    <div className="text-vault-green text-[7px] font-black uppercase">L: {fmtMoney(sale.lucro)}</div>
                 </div>
              </div>
              <button onClick={() => onDeleteSale(sale.id)} className="absolute top-1 right-1 text-vault-low opacity-20 hover:opacity-100 p-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="jewelry-card p-3 bg-vault-low/5 border-vault-low/20">
             <h3 className="text-vault-amber font-black text-[8px] uppercase mb-2">NOVO DÃ‰BITO</h3>
             <div className="flex gap-2">
                <input className="flex-1 text-[10px] !p-1.5" placeholder="DESCRIÃ‡ÃƒO" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} />
                <input className="w-16 text-[10px] !p-1.5" placeholder="R$" type="number" value={newExpVal} onChange={e => setNewExpVal(e.target.value)} />
                <button onClick={() => {
                  if(!newExpDesc || !newExpVal) return;
                  onAddExpense(newExpDesc, Number(newExpVal), new Date().toISOString().split('T')[0]);
                  setNewExpDesc(''); setNewExpVal('');
                }} className="bg-vault-low text-black font-black uppercase p-1.5 text-[8px]">ADD</button>
             </div>
          </div>

          <div className="space-y-2">
            {expenses.slice().reverse().map((exp, idx) => (
               <div key={exp.id || idx} className="jewelry-card p-2 flex justify-between items-center border-l-4 border-l-vault-low">
                  {editingExp === exp.id ? (
                    <div className="flex gap-2 w-full items-center">
                      <input className="flex-1 text-[9px] !p-1" value={exp.descricao} onChange={e => onUpdateExpense(exp.id, e.target.value, exp.valor)} />
                      <input className="w-12 text-[9px] !p-1" type="number" value={exp.valor} onChange={e => onUpdateExpense(exp.id, exp.descricao, Number(e.target.value))} />
                      <button onClick={()=>setEditingExp(null)} className="text-vault-green text-[8px] font-bold">OK</button>
                    </div>
                  ) : (
                    <>
                      <div onClick={()=>setEditingExp(exp.id)} className="flex-1 cursor-pointer">
                        <div className="text-vault-amber font-black text-[10px] uppercase leading-none">{exp.descricao}</div>
                        <div className="text-vault-amber/40 text-[7px] mt-0.5">{exp.data}</div>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="text-vault-low font-black text-xs">-{fmtMoney(exp.valor)}</div>
                         <button onClick={() => onDeleteExpense(exp.id)} className="text-vault-low opacity-20 hover:opacity-100">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12"/></svg>
                         </button>
                      </div>
                    </>
                  )}
               </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
