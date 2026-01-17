
import React from 'react';
import { AppData, ViewState } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardView: React.FC<{ data: AppData; onNavigate: (v: ViewState) => void }> = ({ data, onNavigate }) => {
  const totalSales = data.vendas.reduce((acc, curr) => acc + curr.venda, 0);
  const grossProfit = data.vendas.reduce((acc, curr) => acc + curr.lucro, 0);
  const totalExpenses = data.gastos.reduce((acc, curr) => acc + curr.valor, 0);
  const netProfit = grossProfit - totalExpenses;
  const recentSales = data.vendas.slice(0, 5).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="jewelry-card p-5 bg-vault-panel">
          <span className="text-[10px] font-black text-vault-amber/60 uppercase tracking-widest block mb-1">CAPS TOTAL</span>
          <div className="text-2xl font-black text-vault-amber glow-text">R$ {totalSales.toLocaleString()}</div>
        </div>
        <div className="jewelry-card p-5 bg-vault-panel">
          <span className="text-[10px] font-black text-vault-amber/60 uppercase tracking-widest block mb-1">DESPESAS</span>
          <div className="text-2xl font-black text-vault-low">R$ {totalExpenses.toLocaleString()}</div>
        </div>
      </div>

      <div className="jewelry-card p-8 bg-black/40 border-4 border-double border-vault-amber">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-black text-vault-amber uppercase tracking-[.2em]">LUCRO LÃQUIDO VAULT</span>
        </div>
        <div className="text-5xl font-black text-vault-amber tracking-tighter glow-text">
          R$ {netProfit.toLocaleString()}
        </div>
      </div>

      <div className="jewelry-card p-4 h-64 bg-vault-panel">
          <h3 className="text-[10px] font-black text-vault-amber/60 uppercase tracking-widest mb-4">MÃ‰TRICAS DE PRODUÃ‡ÃƒO</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={recentSales}>
              <XAxis dataKey="item" hide />
              <Tooltip 
                cursor={{fill: 'rgba(255,182,66,0.1)'}}
                contentStyle={{ backgroundColor: '#111', border: '1px solid #ffb642', color: '#ffb642', fontSize: '10px' }}
              />
              <Bar dataKey="venda" fill="#ffb642" radius={[0, 0, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
      </div>

      <button onClick={() => onNavigate(ViewState.INVENTORY)} className="w-full jewelry-card p-6 flex justify-between items-center active:bg-vault-amber active:text-black transition-colors">
        <div className="text-left">
          <h3 className="text-sm font-black uppercase tracking-widest">Acessar InventÃ¡rio</h3>
          <p className="text-[10px] opacity-60 uppercase">{data.estoque.length} Registros no Banco de Dados</p>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>
      </button>
    </div>
  );
};
