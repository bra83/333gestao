
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
  const totalSales = sales.reduce((acc, curr) => acc + curr.venda, 0);

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
    <div className="pb-20 space-y-6">
      
      <div className="flex bg-white rounded-2xl p-1 shadow-md border border-slate-100">
        <button onClick={() => setActiveTab('sales')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'bg-amethyst-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Vendas</button>
        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'expenses' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Gastos</button>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight">Histórico de Vendas</h3>
             <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">{sales.length} Registros</span>
          </div>

          <div className="jewelry-card p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
             <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Receita Total</span>
             <div className="text-3xl font-black text-emerald-700">{fmtMoney(totalSales)}</div>
          </div>

          {sales.slice().reverse().map((sale, idx) => (
            <div key={sale.id || idx} className="jewelry-card p-5 bg-white shadow-sm hover:shadow-md transition-all relative">
              <div className="flex justify-between items-start mb-3">
                 <div>
                    <div className="text-slate-900 font-bold text-base leading-tight">{sale.item}</div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-wide">{sale.data} • {sale.material}</div>
                 </div>
                 
                 {editingSaleId === sale.id ? (
                   <div className="text-right flex flex-col gap-2">
                     <button onClick={() => saveEditSale(sale.id)} className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Salvar</button>
                     <button onClick={() => setEditingSaleId(null)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Cancelar</button>
                   </div>
                 ) : (
                   <div className="flex gap-2">
                      <button onClick={() => startEditSale(sale)} className="text-slate-300 hover:text-sapphire-500 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                      <button onClick={() => confirmDeleteSale(sale.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                   </div>
                 )}
              </div>

              {editingSaleId === sale.id ? (
                <div className="flex gap-3 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Venda</label>
                    <input className="w-full bg-white border border-slate-200 p-2 rounded-lg text-sm font-bold text-slate-900" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} type="number" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Lucro</label>
                    <input className="w-full bg-white border border-slate-200 p-2 rounded-lg text-sm font-bold text-emerald-600" value={editSaleProfit} onChange={e => setEditSaleProfit(e.target.value)} type="number" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                  <div className="text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-3 py-1.5 rounded-lg">Lucro: {fmtMoney(sale.lucro)}</div>
                  <div className="text-slate-900 font-black text-lg tracking-tight">{fmtMoney(sale.venda)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="jewelry-card p-4 bg-gradient-to-br from-rose-50 to-white border-rose-100 text-center">
             <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Despesas Totais</span>
             <div className="text-3xl font-black text-rose-600 mt-1">{fmtMoney(totalExpenses)}</div>
          </div>

          <div className="jewelry-card p-5 bg-white shadow-lg">
             <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-4">Registrar Novo Gasto</h3>
             <div className="flex gap-3 mb-4">
                <input className="flex-[2] bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-rose-400" placeholder="Descrição (Ex: Manutenção)" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} />
                <input className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-rose-400" placeholder="R$" type="number" value={newExpVal} onChange={e => setNewExpVal(e.target.value)} />
             </div>
             <button onClick={submitNewExpense} className="w-full bg-rose-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95 transition-all">Adicionar</button>
          </div>

          {expenses.slice().reverse().map((exp, idx) => (
             <div key={exp.id || idx} className="jewelry-card p-4 bg-white flex justify-between items-center group relative border-l-4 border-rose-400">
                {editingExpId === exp.id ? (
                  <div className="w-full flex gap-2 items-center">
                     <div className="flex-1 space-y-2">
                        <input className="w-full bg-slate-50 border p-2 rounded-lg text-xs font-bold" value={editExpDesc} onChange={e => setEditExpDesc(e.target.value)} />
                        <input className="w-full bg-slate-50 border p-2 rounded-lg text-xs font-bold" type="number" value={editExpVal} onChange={e => setEditExpVal(e.target.value)} />
                     </div>
                     <div className="flex flex-col gap-2">
                        <button onClick={() => saveEditExpense(exp.id)} className="bg-emerald-500 text-white p-2 rounded-lg text-[10px] font-black">OK</button>
                        <button onClick={() => setEditingExpId(null)} className="bg-slate-200 text-slate-600 p-2 rounded-lg text-[10px] font-black">X</button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div>
                       <div className="text-slate-900 font-bold text-sm">{exp.descricao}</div>
                       <div className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">{exp.data}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-rose-500 font-black text-base">- {fmtMoney(exp.valor)}</div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                        <button onClick={() => startEditExpense(exp)} className="text-slate-300 hover:text-sapphire-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                        <button onClick={() => confirmDeleteExpense(exp.id)} className="text-slate-300 hover:text-rose-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
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
