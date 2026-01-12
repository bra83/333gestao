import React from 'react';
import { AppData, ViewState } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardViewProps {
  data: AppData;
  onNavigate: (view: ViewState) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onNavigate }) => {
  const totalSales = data.vendas.reduce((acc, curr) => acc + curr.venda, 0);
  const grossProfit = data.vendas.reduce((acc, curr) => acc + curr.lucro, 0);
  const totalExpenses = data.gastos.reduce((acc, curr) => acc + curr.valor, 0);
  
  // NET PROFIT = Gross Profit (from sales) - Expenses
  const netProfit = grossProfit - totalExpenses;
  
  const recentSales = data.vendas.slice(0, 5).reverse();

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-secondary text-xs font-bold uppercase tracking-wider">Faturamento</span>
          <div className="text-2xl font-black text-slate-700 mt-1">R$ {totalSales.toFixed(2)}</div>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Gastos Totais</span>
          <div className="text-2xl font-black text-red-500 mt-1">- R$ {totalExpenses.toFixed(2)}</div>
        </div>
      </div>

      {/* Net Profit Highlight */}
      <div className={`p-6 rounded-2xl shadow-md border transition-all ${netProfit >= 0 ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200' : 'bg-gradient-to-br from-red-50 to-white border-red-200'}`}>
        <div className="flex justify-between items-center mb-1">
           <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Lucro Líquido Real</span>
           {netProfit >= 0 ? (
             <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">POSITIVO</span>
           ) : (
             <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">NEGATIVO</span>
           )}
        </div>
        <div className={`text-4xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          R$ {netProfit.toFixed(2)}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          (Lucro das Vendas - Despesas Operacionais)
        </p>
      </div>

      {/* Chart */}
      <div className="bg-surface p-5 rounded-2xl border border-emerald-100 shadow-sm h-64">
          <h3 className="text-slate-700 mb-4 font-bold">Últimas Vendas</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recentSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="item" tick={{fill: '#94a3b8', fontSize: 10}} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#ecfdf5'}}
                contentStyle={{backgroundColor: '#fff', borderColor: '#a7f3d0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#334155'}}
                itemStyle={{color: '#10b981', fontWeight: 'bold'}}
              />
              <Bar dataKey="venda" fill="#10b981" radius={[6, 6, 6, 6]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
      </div>

      {/* Inventory CTA */}
      <div className="bg-surface p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <h3 className="text-slate-700 mb-2 font-bold">Resumo do Estoque</h3>
        <p className="text-secondary text-sm mb-5">
          Você tem <strong className="text-primary">{data.estoque.length}</strong> rolos registrados.
        </p>
        <button 
          onClick={() => onNavigate(ViewState.INVENTORY)}
          className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
        >
          Gerenciar Estoque
        </button>
      </div>
    </div>
  );
};