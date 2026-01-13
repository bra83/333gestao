
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
        <div className="jewelry-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 jewel-gradient-sapphire opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receita</span>
          <div className="text-2xl font-black text-slate-800 mt-1">R$ {totalSales.toLocaleString()}</div>
        </div>
        <div className="jewelry-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 jewel-gradient-amethyst opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custos</span>
          <div className="text-2xl font-black text-rose-500 mt-1">R$ {totalExpenses.toLocaleString()}</div>
        </div>
      </div>

      <div className="jewelry-card p-8 bg-gradient-to-br from-white/80 to-slate-50/50 border-white/60 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 jewel-gradient-emerald opacity-20 blur-3xl"></div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Lucro Líquido</span>
          <span className="bg-emerald-500/10 text-emerald-600 text-[10px] px-3 py-1 rounded-full font-bold">Safira Pura</span>
        </div>
        <div className="text-5xl font-black text-slate-900 mt-2 tracking-tighter">
          R$ {netProfit.toLocaleString()}
        </div>
      </div>

      <div className="jewelry-card p-6 h-64 border-white/40">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Fluxo de Pedras</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={recentSales}>
              <XAxis dataKey="item" hide />
              <Tooltip 
                cursor={{fill: 'rgba(0,0,0,0.02)'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="venda" fill="#a855f7" radius={[10, 10, 10, 10]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
      </div>

      <div className="jewelry-card p-6 flex justify-between items-center group cursor-pointer active:scale-95 transition-transform" onClick={() => onNavigate(ViewState.INVENTORY)}>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Cofre de Materiais</h3>
          <p className="text-xs text-slate-400">{data.estoque.length} gemas cadastradas</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-amethyst-500 group-hover:bg-amethyst-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"/></svg>
        </div>
      </div>
    </div>
  );
};
