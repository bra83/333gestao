
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
    if (window.confirm('Delete this record?')) onDeleteSale(id);
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
    if (window.confirm('Delete this expense?')) onDeleteExpense(id);
  };

  return (
    <div className="pb-20">
      
      <div className="flex bg-secondary p-1 border-2 border-bgDark mb-6">
        <button onClick={() => setActiveTab('sales')} className={`flex-1 py-3 text-sm font-pixel uppercase ${activeTab === 'sales' ? 'bg-primary text-white border border-white' : 'text-[#d6c7b2]'}`}>Sales Log</button>
        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-3 text-sm font-pixel uppercase ${activeTab === 'expenses' ? 'bg-heart text-white border border-white' : 'text-[#d6c7b2]'}`}>Expenses</button>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-secondary font-pixel text-lg uppercase">Quest Log</h3>
             <span className="text-xs text-bgDark font-pixel bg-accent px-2 py-1 border border-bgDark">{sales.length} Quests</span>
          </div>

          {sales.map((sale, idx) => (
            <div key={sale.id || idx} className="retro-box p-4 bg-white relative group">
              <div className="flex justify-between items-start mb-2">
                 <div>
                    <div className="text-bgDark font-bold text-lg leading-none">{sale.item}</div>
                    <div className="text-secondary/70 text-xs font-mono mt-1">{sale.data} • {sale.material}</div>
                 </div>
                 
                 {editingSaleId === sale.id ? (
                   <div className="text-right flex flex-col gap-1">
                     <button onClick={() => saveEditSale(sale.id)} className="bg-primary text-white px-2 py-1 text-[10px] font-pixel border border-bgDark">SAVE</button>
                     <button onClick={() => setEditingSaleId(null)} className="bg-secondary text-white px-2 py-1 text-[10px] font-pixel border border-bgDark">CANCEL</button>
                   </div>
                 ) : (
                   <div className="flex gap-2">
                      <button onClick={() => startEditSale(sale)} className="text-magic hover:scale-110"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                      <button onClick={() => confirmDeleteSale(sale.id)} className="text-heart hover:scale-110"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                   </div>
                 )}
              </div>

              {editingSaleId === sale.id ? (
                <div className="flex gap-2 mt-3 bg-[#f0f0f0] p-2 border border-secondary">
                  <div className="flex-1"><input className="w-full bg-white border border-secondary p-1" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} type="number" /></div>
                  <div className="flex-1"><input className="w-full bg-white border border-secondary p-1" value={editSaleProfit} onChange={e => setEditSaleProfit(e.target.value)} type="number" /></div>
                </div>
              ) : (
                <div className="flex justify-between items-end border-t-2 border-secondary/10 pt-2 mt-2">
                  <div className="text-primary text-xs font-pixel uppercase bg-[#e0f2e9] px-2 py-1 border border-primary/20">Profit: {fmtMoney(sale.lucro)}</div>
                  <div className="text-bgDark font-pixel text-xl">{fmtMoney(sale.venda)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-heart/10 border-2 border-heart p-4 flex flex-col items-center justify-center text-center">
             <span className="text-heart text-xs font-pixel uppercase mb-1">Total Damage</span>
             <span className="text-3xl font-pixel text-heart">{fmtMoney(totalExpenses)}</span>
          </div>

          <div className="retro-box p-4 bg-white">
             <h3 className="text-secondary font-pixel mb-3 uppercase">New Expense</h3>
             <div className="flex gap-2 mb-3">
                <input className="flex-[2] bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-xs" placeholder="Item Name" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} />
                <input className="flex-1 bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-xs" placeholder="R$" type="number" value={newExpVal} onChange={e => setNewExpVal(e.target.value)} />
             </div>
             <button onClick={submitNewExpense} className="retro-btn w-full bg-heart text-white font-pixel uppercase py-2 border-2 border-bgDark">Record Damage</button>
          </div>

          {expenses.slice().reverse().map((exp, idx) => (
             <div key={exp.id || idx} className="retro-box p-3 bg-white flex justify-between items-center group relative">
                {editingExpId === exp.id ? (
                  <div className="w-full flex gap-2 items-center">
                     <div className="flex-1 space-y-1">
                        <input className="w-full border p-1 text-xs" value={editExpDesc} onChange={e => setEditExpDesc(e.target.value)} />
                        <input className="w-full border p-1 text-xs" type="number" value={editExpVal} onChange={e => setEditExpVal(e.target.value)} />
                     </div>
                     <div className="flex flex-col gap-1">
                        <button onClick={() => saveEditExpense(exp.id)} className="bg-primary text-white p-1 text-[10px]">OK</button>
                        <button onClick={() => setEditingExpId(null)} className="bg-secondary text-white p-1 text-[10px]">X</button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div>
                       <div className="text-bgDark font-bold">{exp.descricao}</div>
                       <div className="text-secondary text-[10px] font-mono">{exp.data}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-heart font-pixel text-lg">- {fmtMoney(exp.valor)}</div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 bg-white pl-2">
                        <button onClick={() => startEditExpense(exp)} className="text-magic hover:scale-110"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                        <button onClick={() => confirmDeleteExpense(exp.id)} className="text-heart hover:scale-110"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
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
