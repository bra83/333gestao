
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
  const netProfit = grossProfit - totalExpenses;
  const recentSales = data.vendas.slice(0, 5).reverse();

  return (
    <div className="space-y-6 pb-20">
      
      <div className="grid grid-cols-2 gap-4">
        <div className="retro-box p-4 bg-white hover:-translate-y-1 transition-transform">
          <span className="text-secondary text-xs font-pixel uppercase tracking-widest block mb-1">Total Gold</span>
          <div className="text-2xl font-pixel text-secondary truncate">R$ {totalSales.toFixed(2)}</div>
        </div>
        <div className="retro-box p-4 bg-white hover:-translate-y-1 transition-transform border-heart">
          <span className="text-heart text-xs font-pixel uppercase tracking-widest block mb-1">Damage</span>
          <div className="text-2xl font-pixel text-heart truncate">- R$ {totalExpenses.toFixed(2)}</div>
        </div>
      </div>

      <div className={`retro-box p-6 transition-all ${netProfit >= 0 ? 'bg-primary/5 border-primary' : 'bg-heart/5 border-heart'}`}>
        <div className="flex justify-between items-center mb-2">
           <span className="text-secondary text-xs font-bold uppercase tracking-widest">Lucro Líquido</span>
           {netProfit >= 0 ? (
             <span className="bg-primary text-white text-[10px] font-pixel px-2 py-1 uppercase">Level Up!</span>
           ) : (
             <span className="bg-heart text-white text-[10px] font-pixel px-2 py-1 uppercase">Danger</span>
           )}
        </div>
        <div className={`text-5xl font-pixel mt-1 tracking-tighter ${netProfit >= 0 ? 'text-primary' : 'text-heart'}`}>
          R$ {netProfit.toFixed(2)}
        </div>
        <p className="text-[10px] text-secondary/60 mt-2 font-pixel uppercase">
          (Vendas - Custos Operacionais)
        </p>
      </div>

      <div className="retro-box p-4 h-64 bg-white">
          <h3 className="text-secondary mb-4 font-pixel uppercase text-lg border-b-2 border-secondary/20 pb-1">Battle Log (Vendas)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={recentSales}>
              <CartesianGrid strokeDasharray="0" stroke="#eee" vertical={false} />
              <XAxis dataKey="item" tick={{fill: '#8b5a2b', fontSize: 10, fontFamily: 'VT323'}} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#8b5a2b', fontSize: 12, fontFamily: 'VT323'}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#fcf9ee'}}
                contentStyle={{backgroundColor: '#fff', border: '2px solid #8b5a2b', borderRadius: '0', fontFamily: 'VT323', color: '#8b5a2b'}}
                itemStyle={{color: '#009b48'}}
              />
              <Bar dataKey="venda" fill="#009b48" radius={[2, 2, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
      </div>

      <div className="retro-box p-5 bg-white">
        <h3 className="text-secondary mb-2 font-pixel text-lg uppercase">Inventário</h3>
        <p className="text-secondary text-sm mb-4">
          <strong className="text-primary font-pixel text-xl">{data.estoque.length}</strong> itens na mochila.
        </p>
        <button 
          onClick={() => onNavigate(ViewState.INVENTORY)}
          className="retro-btn w-full bg-secondary text-bgPaper py-3 text-sm font-pixel uppercase border-2 border-bgDark shadow-[2px_2px_0_#292420]"
        >
          Abrir Mochila
        </button>
      </div>
    </div>
  );
};
