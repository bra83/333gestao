
import React from 'react';
import { AppData, ViewState } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardViewProps {
  data: AppData;
  onNavigate: (view: ViewState) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onNavigate }) => {
  const totalSales = data.vendas.reduce((acc, curr) => acc + curr.venda, 0);
  const totalExpenses = data.gastos.reduce((acc, curr) => acc + curr.valor, 0);
  const netProfit = data.vendas.reduce((acc, curr) => acc + curr.lucro, 0) - totalExpenses;
  const recentSales = data.vendas.slice(0, 5).reverse();

  // Helper para formatar moeda
  const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

  return (
    <div className="space-y-6">
      
      {/* CARD DO LUCRO (DIAMANTE) - O destaque principal */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-cyan-100 shadow-lg shadow-cyan-100/50 p-6 transition-all duration-300 hover:shadow-cyan-200">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           {/* Icone Diamante Gigante de Fundo */}
           <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-500">
             <path d="M12 2L2 7l10 15 10-15-10-5zM3.8 7L12 3.8 20.2 7 12 19.5 3.8 7z"/>
           </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-cyan-50 rounded-lg text-cyan-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/></svg>
            </div>
            <span className="text-cyan-600/70 text-xs font-bold uppercase tracking-wider">Resultado Líquido</span>
          </div>
          
          <div className={`text-4xl font-black tracking-tight ${netProfit >= 0 ? 'text-cyan-600' : 'text-rose-500'}`}>
            {fmt(netProfit)}
          </div>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            Seu tesouro acumulado (Lucro Real)
          </p>
        </div>
      </div>

      {/* GRID RECEITA E DESPESA */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* RECEITA (ESMERALDA) */}
        <div className="app-card p-4 border-l-4 border-emerald-400 hover:bg-emerald-50/10 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <svg className="text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-3 5h-6l3 5-3 5 9 5 9-5-3-5 3-5h-6z"/></svg>
            <span className="text-slate-400 text-[10px] font-bold uppercase">Entradas</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 truncate">{fmt(totalSales)}</div>
        </div>

        {/* DESPESAS (RUBI) */}
        <div className="app-card p-4 border-l-4 border-rose-500 hover:bg-rose-50/10 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <svg className="text-rose-500" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6 6 2-5 4 2 6-6-4-6 4 2-6-5-4 6-2z"/></svg>
            <span className="text-slate-400 text-[10px] font-bold uppercase">Saídas</span>
          </div>
          <div className="text-xl font-extrabold text-rose-500 truncate">- {fmt(totalExpenses)}</div>
        </div>
      </div>

      {/* GRÁFICO (AMETISTA) */}
      <div className="app-card p-5 border-t-4 border-t-violet-400">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-700 font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              Vendas Recentes
            </h3>
            <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-1 rounded-full font-bold">Histórico</span>
          </div>
          
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentSales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="item" 
                  tick={{fill: '#94a3b8', fontSize: 10}} 
                  axisLine={false} 
                  tickLine={false} 
                  interval={0}
                  tickFormatter={(val) => val.length > 8 ? val.substring(0,8)+'...' : val}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#0f172a'}}
                  itemStyle={{color: '#8b5cf6', fontWeight: 'bold'}}
                  formatter={(val: number) => [fmt(val), 'Venda']}
                  labelStyle={{color: '#64748b', fontSize: '12px', marginBottom: '4px'}}
                />
                <Bar 
                  dataKey="venda" 
                  fill="url(#colorUv)" 
                  radius={[6, 6, 6, 6]} 
                  barSize={24}
                >
                  {/* Gradiente Ametista para as barras */}
                </Bar>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* CTA ESTOQUE (TOPÁZIO/OURO) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-200">
        <div className="absolute -right-6 -bottom-6 opacity-20">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="4" /></svg>
        </div>
        
        <div className="p-6 relative z-10">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Gerenciar Estoque
          </h3>
          <p className="text-amber-100 text-xs mb-4">
            Você possui <strong className="text-white text-sm">{data.estoque.length}</strong> materiais preciosos cadastrados.
          </p>
          <button 
            onClick={() => onNavigate(ViewState.INVENTORY)}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white py-3 rounded-xl text-sm font-bold transition-all"
          >
            Abrir Inventário
          </button>
        </div>
      </div>

    </div>
  );
};
