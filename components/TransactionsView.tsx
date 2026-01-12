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

  // Sales Editing
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editSaleProfit, setEditSaleProfit] = useState('');

  // Expenses Adding
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpVal, setNewExpVal] = useState('');
  
  // Expenses Editing
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDesc, setEditExpDesc] = useState('');
  const [editExpVal, setEditExpVal] = useState('');

  // Calculations
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.valor, 0);

  // --- SALES HELPERS ---
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
    if (window.confirm('Tem certeza que deseja apagar esta venda?')) onDeleteSale(id);
  };

  // --- EXPENSE HELPERS ---
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
    if (window.confirm('Tem certeza que deseja apagar este gasto?')) onDeleteExpense(id);
  };

  return (
    <div className="pb-20">
      
      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl mb-6 border border-emerald-100 shadow-sm">
        <button 
          onClick={() => setActiveTab('sales')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'sales' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Vendas 💰
        </button>
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'expenses' ? 'bg-red-400 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Gastos 💸
        </button>
      </div>

      {/* --- SALES TAB --- */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-slate-700 font-bold text-lg">Histórico</h3>
             <span className="text-xs text-primary font-bold bg-emerald-100 px-3 py-1 rounded-full">
                {sales.length} vendas
             </span>
          </div>

          {sales.length === 0 && (
             <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                Nenhuma venda registrada ainda.
                <br/>
                <span className="text-xs font-semibold mt-2 block">Use a Calculadora para gerar vendas.</span>
             </div>
          )}

          {sales.map((sale, idx) => (
            <div key={sale.id || idx} className="bg-white p-5 rounded-3xl border border-emerald-50 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                 <div>
                    <div className="text-slate-700 font-bold text-lg">{sale.item}</div>
                    <div className="text-slate-400 text-xs font-semibold">{sale.data} • {sale.material || 'N/A'} ({sale.peso || 0}g)</div>
                 </div>
                 
                 {editingSaleId === sale.id ? (
                   <div className="text-right flex flex-col gap-1">
                     <button onClick={() => saveEditSale(sale.id)} className="text-green-500 text-xs font-bold border border-green-200 bg-green-50 px-2 py-1 rounded-lg">SALVAR</button>
                     <button onClick={() => setEditingSaleId(null)} className="text-slate-400 text-xs px-2 py-1">CANCELAR</button>
                   </div>
                 ) : (
                   <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditSale(sale)} className="bg-slate-50 p-2 rounded-full text-blue-400 hover:bg-blue-50 border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button onClick={() => confirmDeleteSale(sale.id)} className="bg-slate-50 p-2 rounded-full text-red-400 hover:bg-red-50 border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                   </div>
                 )}
              </div>

              {editingSaleId === sale.id ? (
                <div className="flex gap-2 mt-3 bg-slate-50 p-3 rounded-xl">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 font-bold">Venda (R$)</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} type="number" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 font-bold">Lucro (R$)</label>
                    <input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm" value={editSaleProfit} onChange={e => setEditSaleProfit(e.target.value)} type="number" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-end border-t border-dashed border-slate-100 pt-3 mt-2">
                  <div className="text-green-600 text-xs font-bold bg-green-100 px-3 py-1 rounded-full">Lucro: R$ {sale.lucro.toFixed(2)}</div>
                  <div className="text-slate-700 font-black text-xl">R$ {sale.venda.toFixed(2)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- EXPENSES TAB --- */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          
          {/* TOTAL DEBTS HEADER */}
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
             <span className="text-red-400 text-xs font-black uppercase tracking-widest mb-1">Total de Débitos</span>
             <span className="text-3xl font-black text-red-500">R$ {totalExpenses.toFixed(2)}</span>
          </div>

          {/* Add Expense Form */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
             <h3 className="text-slate-700 font-bold mb-3">Novo Gasto</h3>
             <div className="flex gap-2 mb-3">
                <input 
                  className="flex-[2] bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-red-400 focus:outline-none"
                  placeholder="Descrição (ex: Acetona)"
                  value={newExpDesc}
                  onChange={e => setNewExpDesc(e.target.value)}
                />
                <input 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-red-400 focus:outline-none"
                  placeholder="R$"
                  type="number"
                  value={newExpVal}
                  onChange={e => setNewExpVal(e.target.value)}
                />
             </div>
             <button 
               onClick={submitNewExpense}
               className="w-full bg-red-400 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-sm uppercase shadow-lg shadow-red-100"
             >
               Registrar Gasto
             </button>
          </div>

          <h3 className="text-slate-700 font-bold px-2 text-lg">Saídas</h3>
          
          {expenses.length === 0 && (
             <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                Nenhum gasto registrado.
             </div>
          )}

          {expenses.slice().reverse().map((exp, idx) => (
             <div key={exp.id || idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group relative shadow-sm hover:shadow-md transition-all">
                
                {editingExpId === exp.id ? (
                  <div className="w-full flex gap-2 items-center">
                     <div className="flex-1 space-y-1">
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 text-xs" value={editExpDesc} onChange={e => setEditExpDesc(e.target.value)} placeholder="Descrição" />
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 text-xs" type="number" value={editExpVal} onChange={e => setEditExpVal(e.target.value)} placeholder="Valor" />
                     </div>
                     <div className="flex flex-col gap-1">
                        <button onClick={() => saveEditExpense(exp.id)} className="bg-green-500 text-white p-1 rounded-lg text-[10px] font-bold">OK</button>
                        <button onClick={() => setEditingExpId(null)} className="bg-slate-200 text-slate-600 p-1 rounded-lg text-[10px]">X</button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div>
                       <div className="text-slate-700 font-bold">{exp.descricao}</div>
                       <div className="text-slate-400 text-xs font-semibold">{exp.data}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-red-400 font-black text-lg">- R$ {exp.valor.toFixed(2)}</div>
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                        <button onClick={() => startEditExpense(exp)} className="bg-slate-50 p-1.5 rounded-lg text-blue-400 border border-slate-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button onClick={() => confirmDeleteExpense(exp.id)} className="bg-slate-50 p-1.5 rounded-lg text-red-400 border border-slate-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
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