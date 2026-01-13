
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
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDesc, setEditExpDesc] = useState('');
  const [editExpVal, setEditExpVal] = useState('');
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.valor, 0);

  const fmtMoney = (val: number) => {
    if (!isFinite(val) || isNaN(val)) return "R$ 0,00";
    return `R$ ${val.toFixed(2)}`;
  };

  const startEditSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setEditSalePrice(sale.venda.toString());
    setEditSaleProfit(sale.lucro.toString());
  };
  const saveEditSale = (id: string) => {
    onUpdateSale(id, Number(editSalePrice), Number(editSaleProfit));
    setEditingSaleId(null);
  };
  const confirmDeleteSale = (id: string) => {
    if (window.confirm('Apagar este registro?')) onDeleteSale(id);
  };
  const submitNewExpense = () => {
    if (!newExpDesc || !newExpVal) return;
    const today = new Date().toISOString().split('T')[0];
    onAddExpense(newExpDesc, Number(newExpVal), today);
    setNewExpDesc('');
    setNewExpVal('');
  };
  const startEditExpense = (exp: Expense) => {
    setEditingExpId(exp.id);
    setEditExpDesc(exp.descricao);
    setEditExpVal(exp.valor.toString());
  };
  const saveEditExpense = (id: string) => {
    onUpdateExpense(id, editExpDesc, Number(editExpVal));
    setEditingExpId(null);
  };
  const confirmDeleteExpense = (id: string) => {
    if (window.confirm('Apagar esta despesa?')) onDeleteExpense(id);
  };

  return (
    <div>
      
      <div className="flex bg-slate-200 p-1 rounded-xl mb-6">
        <button type="button" onClick={() => setActiveTab('sales')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'sales' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Histórico de Vendas</button>
        <button type="button" onClick={() => setActiveTab('expenses')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'expenses' ? 'bg-white text-danger shadow-sm' : 'text-slate-500'}`}>Despesas</button>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-primary font-bold text-lg">Registros</h3>
             <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">{sales.length} Vendas</span>
          </div>

          {sales.map((sale, idx) => (
            <div key={sale.id || idx} className="app-card p-4 relative group hover:border-accent/30">
              <div className="flex justify-between items-start mb-2">
                 <div>
                    <div className="text-slate-800 font-bold text-base leading-tight">{sale.item}</div>
                    <div className="text-slate-400 text-xs mt-1">{sale.data} • {sale.material}</div>
                 </div>
                 
                 {editingSaleId === sale.id ? (
                   <div className="text-right flex flex-col gap-1">
                     <button onClick={() => saveEditSale(sale.id)} className="bg-primary text-white px-3 py-1 text-xs rounded font-bold">Salvar</button>
                     <button onClick={() => setEditingSaleId(null)} className="bg-slate-200 text-slate-600 px-3 py-1 text-xs rounded font-bold">Cancelar</button>
                   </div>
                 ) : (
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => startEditSale(sale)} className="text-accent hover:bg-blue-50 p-1 rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                      <button type="button" onClick={() => confirmDeleteSale(sale.id)} className="text-danger hover:bg-red-50 p-1 rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                   </div>
                 )}
              </div>

              {editingSaleId === sale.id ? (
                <div className="flex gap-3 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400">Valor</label><input className="app-input w-full p-1" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} type="number" /></div>
                  <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400">Lucro</label><input className="app-input w-full p-1" value={editSaleProfit} onChange={e => setEditSaleProfit(e.target.value)} type="number" /></div>
                </div>
              ) : (
                <div className="flex justify-between items-end border-t border-slate-50 pt-3 mt-2">
                  <div className="text-success text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">Lucro: {fmtMoney(sale.lucro)}</div>
                  <div className="text-primary font-extrabold text-xl">{fmtMoney(sale.venda)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-danger text-white rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-lg shadow-red-200">
             <span className="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">Total de Gastos</span>
             <span className="text-3xl font-black">{fmtMoney(totalExpenses)}</span>
          </div>

          <div className="app-card p-5">
             <h3 className="text-primary font-bold text-sm uppercase tracking-wide mb-3">Nova Despesa</h3>
             <div className="flex gap-3 mb-3">
                <input className="app-input flex-[2]" placeholder="Descrição" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} />
                <input className="app-input flex-1" placeholder="R$" type="number" value={newExpVal} onChange={e => setNewExpVal(e.target.value)} />
             </div>
             <button type="button" onClick={submitNewExpense} className="app-btn w-full bg-slate-800 text-white py-3 shadow-lg hover:bg-slate-700">Adicionar</button>
          </div>

          {expenses.map((exp, idx) => (
             <div key={exp.id || idx} className="app-card p-4 flex justify-between items-center group relative hover:bg-slate-50">
                {editingExpId === exp.id ? (
                  <div className="w-full flex gap-2 items-center">
                     <div className="flex-1 space-y-1">
                        <input className="app-input w-full p-1 text-xs" value={editExpDesc} onChange={e => setEditExpDesc(e.target.value)} />
                        <input className="app-input w-full p-1 text-xs" type="number" value={editExpVal} onChange={e => setEditExpVal(e.target.value)} />
                     </div>
                     <div className="flex flex-col gap-1">
                        <button type="button" onClick={() => saveEditExpense(exp.id)} className="bg-primary text-white p-1 text-[10px] rounded font-bold">OK</button>
                        <button type="button" onClick={() => setEditingExpId(null)} className="bg-slate-200 text-slate-600 p-1 text-[10px] rounded font-bold">X</button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div>
                       <div className="text-slate-800 font-bold text-sm">{exp.descricao}</div>
                       <div className="text-slate-400 text-xs">{exp.data}</div>
                    </div>
                    <div className="text-right pr-6">
                       <div className="text-danger font-bold text-base">- {fmtMoney(exp.valor)}</div>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => startEditExpense(exp)} className="text-accent hover:bg-blue-100 p-1 rounded-full"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                        <button type="button" onClick={() => confirmDeleteExpense(exp.id)} className="text-danger hover:bg-red-100 p-1 rounded-full"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                    </div>
                  </>
                )}
             </div>
          ))}
        </div>
      )}
    </div>
  );
};
