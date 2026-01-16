
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
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editSaleProfit, setEditSaleProfit] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpVal, setNewExpVal] = useState('');
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.valor, 0);

  const fmtMoney = (val: number) => `R$ ${val.toFixed(2)}`;

  return (
    <div className="pb-24 space-y-6">
      <div className="flex bg-slate-200 p-1.5 rounded-[28px] shadow-inner">
        <button onClick={() => setActiveTab('sales')} className={`flex-1 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>Vendas</button>
        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>Despesas</button>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-slate-900 font-black text-xl uppercase tracking-tighter">Histórico de Vendas</h3>
             <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">{sales.length} Entradas</span>
          </div>

          <div className="space-y-3">
            {sales.map((sale, idx) => (
              <div key={sale.id || idx} className="jewelry-card p-6 bg-white relative overflow-hidden group hover:border-amethyst-200 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full jewel-gradient-amethyst opacity-40"></div>
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <div className="text-slate-900 font-black text-lg tracking-tight leading-none">{sale.item}</div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{sale.data} • {sale.material}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-slate-900 font-black text-2xl tracking-tighter">{fmtMoney(sale.venda)}</div>
                      <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Lucro: {fmtMoney(sale.lucro)}</div>
                   </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDeleteSale(sale.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="jewelry-card overflow-hidden bg-rose-500 border-0 shadow-xl shadow-rose-200">
             <div className="p-8 flex flex-col items-center justify-center text-center text-white">
                <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total de Saídas</span>
                <span className="text-5xl font-black tracking-tighter">{fmtMoney(totalExpenses)}</span>
             </div>
          </div>

          <div className="jewelry-card p-6 border-slate-200">
             <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-6">Registrar Novo Gasto</h3>
             <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Descrição</label>
                  <input className="w-full bg-transparent border-none p-0 text-slate-900 font-bold focus:ring-0 focus:outline-none" placeholder="Ex: Conta de Luz Jan" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} />
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Valor (R$)</label>
                  <input className="w-full bg-transparent border-none p-0 text-slate-900 font-bold focus:ring-0 focus:outline-none" placeholder="0.00" type="number" value={newExpVal} onChange={e => setNewExpVal(e.target.value)} />
                </div>
                <button onClick={() => {
                  if(!newExpDesc || !newExpVal) return;
                  onAddExpense(newExpDesc, Number(newExpVal), new Date().toISOString().split('T')[0]);
                  setNewExpDesc(''); setNewExpVal('');
                }} className="w-full bg-rose-500 text-white font-black uppercase py-5 rounded-[24px] text-xs tracking-widest shadow-lg shadow-rose-100 active:scale-95 transition-all">Registrar Gasto</button>
             </div>
          </div>

          <div className="space-y-3">
            {expenses.slice().reverse().map((exp, idx) => (
               <div key={exp.id || idx} className="jewelry-card p-5 bg-white flex justify-between items-center group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-20"></div>
                  <div>
                     <div className="text-slate-900 font-black text-base leading-none mb-1">{exp.descricao}</div>
                     <div className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{exp.data}</div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-rose-500 font-black text-xl tracking-tighter">- {fmtMoney(exp.valor)}</div>
                     <button onClick={() => onDeleteExpense(exp.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                     </button>
                  </div>
               </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
