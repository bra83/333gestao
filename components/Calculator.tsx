
import React, { useState, useEffect } from 'react';
import { Settings, StockItem } from '../types';

interface CalculatorProps {
  settings: Settings;
  stock: StockItem[];
  onSaveSale: (item: string, material: string, weight: number, price: number, profit: number, stockId?: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ settings, stock, onSaveSale }) => {
  const [selectedFilamentIdx, setSelectedFilamentIdx] = useState<number>(0);
  const [itemName, setItemName] = useState<string>('');
  const [weight, setWeight] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [paintingType, setPaintingType] = useState<'none' | 'simple' | 'medium' | 'pro'>('none');
  
  const [costs, setCosts] = useState({
    materialTotal: 0, energyTotal: 0, machineTotal: 0, laborTotal: 0, fixedTotal: 0, servicesTotal: 0, totalCost: 0, finalPrice: 0, profit: 0
  });

  // Função de segurança para garantir que sempre teremos um número válido
  const n = (val: any): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (!stock || stock.length === 0) return;
    const filament = stock[selectedFilamentIdx] || stock[0];
    if (!filament) return;

    // Constantes das configurações com fallback de segurança
    const kwh = n(settings.kwh) || 0.95;
    const vidaUtilH = n(settings.vidaUtilHoras) || 8000;
    const horasTrabMes = n(settings.horasTrab) || 160;
    const precoMaq = n(settings.precoMaq) || 3000;
    const valorHora = n(settings.valorHoraTrabalho) || 20;
    const markup = n(settings.markup) || 3;
    const potencia = n(settings.potencia) || 350;

    // 1. Custo Material (Peso em g / 1000 * preço do rolo)
    const materialTotal = (n(weight) / 1000) * n(filament.preco) * (1 + n(settings.perdaMaterial)/100);

    // 2. Custo Energia
    const energyTotal = ((potencia / 1000) * n(hours) / (n(settings.eficienciaFonte) || 0.9)) * kwh;

    // 3. Máquina (Depreciação + Manutenção)
    const machineTotal = ((precoMaq / vidaUtilH) + (n(settings.manutencaoMensal) / horasTrabMes)) * n(hours);

    // 4. Mão de Obra
    const laborMinutes = n(settings.tempoPreparacao) + n(settings.tempoPosProcessamento) + n(settings.tempoAtendimento);
    const laborTotal = (laborMinutes / 60) * valorHora;

    // 5. Custos Fixos
    const totalFixed = n(settings.aluguel) + n(settings.mei) + n(settings.softwares) + n(settings.ecommerce) + n(settings.publicidade) + n(settings.condominio);
    const fixedTotal = (totalFixed / horasTrabMes) * n(hours);

    // 6. Serviços
    let paintCost = 0;
    if (paintingType === 'simple') paintCost = n(settings.pintSimples);
    if (paintingType === 'medium') paintCost = n(settings.pintMedia);
    if (paintingType === 'pro') paintCost = n(settings.pintProf);
    const servicesTotal = n(settings.embalagem) + paintCost;

    const subtotal = materialTotal + energyTotal + machineTotal + laborTotal + fixedTotal + servicesTotal;
    const totalCost = subtotal * (1 + n(settings.risco)/100);
    const finalPrice = totalCost * markup;
    const profit = finalPrice - totalCost;

    setCosts({
      materialTotal, energyTotal, machineTotal, laborTotal, fixedTotal, servicesTotal, totalCost, finalPrice, profit
    });

  }, [weight, hours, paintingType, selectedFilamentIdx, settings, stock]);

  const handleSave = () => {
    if (!itemName) return alert('Dê um nome ao seu tesouro!');
    const filament = stock[selectedFilamentIdx] || stock[0];
    onSaveSale(itemName, filament.nome, n(weight), costs.finalPrice, costs.profit, filament.id);
    setItemName(''); setWeight(0); setHours(0);
  };

  if (!stock || stock.length === 0) {
    return (
      <div className="jewelry-card p-10 text-center bg-white border-2 border-dashed border-slate-200">
        <div className="text-4xl mb-4">💎</div>
        <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">Cofre Vazio</h3>
        <p className="text-slate-400 text-[10px] font-bold mt-2">Cadastre seus filamentos na aba "Gemas" primeiro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="jewelry-card p-6 bg-white shadow-xl border border-slate-100">
        <h2 className="text-slate-900 font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <span className="w-2 h-6 jewel-gradient-sapphire rounded-full"></span>
          Orçamento de Luxo
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 block">Nome do Projeto</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-sapphire-500 focus:bg-white transition-all"
              placeholder="Ex: Anel de Saturno"
              value={itemName} 
              onChange={e => setItemName(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 block">Gema (Material)</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-sapphire-500 appearance-none"
                value={selectedFilamentIdx} 
                onChange={e => setSelectedFilamentIdx(Number(e.target.value))}
              >
                {stock.map((item, idx) => (
                  <option key={item.id || idx} value={idx}>{item.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 block">Acabamento</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-sapphire-500 appearance-none"
                value={paintingType} 
                onChange={e => setPaintingType(e.target.value as any)}
              >
                <option value="none">Bruto</option>
                <option value="simple">Polimento</option>
                <option value="medium">Banho Simples</option>
                <option value="pro">Joalheria</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 block">Massa (g)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-black text-xl outline-none focus:border-sapphire-500"
                  value={weight || ''} 
                  onChange={e => setWeight(n(e.target.value))} 
                />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 block">Tempo (h)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-black text-xl outline-none focus:border-sapphire-500"
                  value={hours || ''} 
                  onChange={e => setHours(n(e.target.value))} 
                />
             </div>
          </div>
        </div>
      </div>

      <div className="jewelry-card overflow-hidden bg-slate-900 shadow-2xl">
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Custo Operacional</span>
            <span className="text-white">R$ {(costs.totalCost - costs.materialTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Matéria Prima</span>
            <span className="text-white">R$ {costs.materialTotal.toFixed(2)}</span>
          </div>
          
          <div className="h-px bg-slate-800 my-4"></div>
          
          <div className="text-center py-4">
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] block mb-2">Valor de Mercado</span>
            <div className="text-5xl font-black text-white tracking-tighter">
              R$ {costs.finalPrice.toFixed(2)}
            </div>
            <span className="text-emerald-400/60 text-[10px] font-bold uppercase mt-2 block">
              Lucro Estimado: R$ {costs.profit.toFixed(2)}
            </span>
          </div>

          <button 
            onClick={handleSave} 
            className="w-full jewel-gradient-emerald text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/40 active:scale-95 transition-all mt-4"
          >
            Vender Obra
          </button>
        </div>
      </div>

      <div className="px-4 text-center">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Cálculo baseado em depreciação de {settings.vidaUtilHoras || 8000}h <br/> 
          e markup de {settings.markup}x
        </p>
      </div>
    </div>
  );
};
