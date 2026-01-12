
import React, { useState } from 'react';
import { Settings } from '../types';

interface SettingsViewProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  apiUrl: string;
  onUrlChange: (url: string) => void;
  lastError?: string | null;
  onRetry?: () => void;
  onMaintenance?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, apiUrl, onUrlChange, lastError, onRetry, onMaintenance }) => {
  const [formData, setFormData] = useState<Settings>(settings);

  const handleChange = (key: keyof Settings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUrlChange(e.target.value);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* --- Connection --- */}
      <div className={`bg-white p-5 rounded-2xl border ${lastError ? 'border-red-200 shadow-red-50' : 'border-green-200 shadow-green-50'} shadow-sm`}>
        <div className="flex justify-between items-center mb-3">
          <label className="text-slate-500 text-xs font-bold uppercase tracking-wide">
            Integração Google Sheets
          </label>
          {lastError ? (
            <span className="text-xs bg-red-100 text-red-500 px-3 py-1 rounded-full font-bold">Desconectado</span>
          ) : (
            <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">Conectado</span>
          )}
        </div>
        
        <input 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-xs mb-3 font-mono" 
          value={apiUrl} 
          onChange={handleUrlChange}
          placeholder="https://script.google.com/macros/s/.../exec"
        />
        
        {lastError && (
          <div className="bg-red-50 p-3 rounded-xl text-xs text-red-500 mb-3 border border-red-100">
            {lastError}
          </div>
        )}

        <div className="flex gap-2">
            {onRetry && (
            <button 
                onClick={onRetry}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs py-3 rounded-xl font-bold transition-colors"
            >
                Sincronizar
            </button>
            )}
            {onMaintenance && (
             <button 
                onClick={onMaintenance}
                className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-600 text-xs py-3 rounded-xl font-bold transition-colors border border-orange-200"
                title="Use se os dados estiverem bagunçados"
            >
                Reparar Planilha
            </button>
            )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
        <h3 className="text-slate-700 font-bold mb-6 border-b border-emerald-50 pb-3 text-lg">Configuração</h3>
        
        <div className="space-y-8">
          
          <Section title="1. Máquina & Energia">
             <div className="grid grid-cols-2 gap-3">
               <Input label="Preço Máquina (R$)" val={formData.precoMaq} onChange={v => handleChange('precoMaq', v)} />
               <Input label="Vida Útil (Horas Reais)" val={formData.vidaUtilHoras || 8000} onChange={v => handleChange('vidaUtilHoras', v)} />
               <Input label="Manutenção Mensal (R$)" val={formData.manutencaoMensal || 20} onChange={v => handleChange('manutencaoMensal', v)} />
               <Input label="Potência Média (Watts)" val={formData.potencia} onChange={v => handleChange('potencia', v)} />
               <Input label="Custo kWh (R$)" val={formData.kwh} step={0.01} onChange={v => handleChange('kwh', v)} />
               <Input label="Eficiência Fonte (0-1)" val={formData.eficienciaFonte || 0.9} step={0.01} onChange={v => handleChange('eficienciaFonte', v)} />
             </div>
          </Section>

          <Section title="2. Empresa & Custos Fixos">
             <div className="col-span-2 mb-2">
                <Input label="Horas Trabalhadas/Mês" val={formData.horasTrab} onChange={v => handleChange('horasTrab', v)} />
             </div>
             <div className="grid grid-cols-3 gap-2">
               <Input label="MEI" val={formData.mei} onChange={v => handleChange('mei', v)} />
               <Input label="Aluguel" val={formData.aluguel} onChange={v => handleChange('aluguel', v)} />
               <Input label="Software" val={formData.softwares} onChange={v => handleChange('softwares', v)} />
               <Input label="Loja" val={formData.ecommerce} onChange={v => handleChange('ecommerce', v)} />
               <Input label="Ads" val={formData.publicidade} onChange={v => handleChange('publicidade', v)} />
               <Input label="Outros" val={formData.condominio} onChange={v => handleChange('condominio', v)} />
             </div>
          </Section>

          <Section title="3. Mão de Obra & Processos">
             <div className="grid grid-cols-2 gap-3">
               <Input label="Valor da sua Hora (R$)" val={formData.valorHoraTrabalho || 25} onChange={v => handleChange('valorHoraTrabalho', v)} />
               <Input label="Tempo Prep. Padrão (min)" val={formData.tempoPreparacao || 15} onChange={v => handleChange('tempoPreparacao', v)} />
               <Input label="Tempo Pós Padrão (min)" val={formData.tempoPosProcessamento || 15} onChange={v => handleChange('tempoPosProcessamento', v)} />
               <Input label="Atendimento (min)" val={formData.tempoAtendimento || 10} onChange={v => handleChange('tempoAtendimento', v)} />
             </div>
          </Section>

          <Section title="4. Serviços & Materiais">
             <div className="grid grid-cols-2 gap-3">
               <Input label="Perda Material (%)" val={formData.perdaMaterial || 5} onChange={v => handleChange('perdaMaterial', v)} />
               <Input label="Custo Embalagem (R$)" val={formData.embalagem} onChange={v => handleChange('embalagem', v)} />
             </div>
             <div className="grid grid-cols-3 gap-2 mt-2">
                <Input label="Pint. Simp" val={formData.pintSimples} onChange={v => handleChange('pintSimples', v)} />
                <Input label="Pint. Méd" val={formData.pintMedia} onChange={v => handleChange('pintMedia', v)} />
                <Input label="Pint. Prof" val={formData.pintProf} onChange={v => handleChange('pintProf', v)} />
             </div>
          </Section>

          <Section title="5. Estratégia">
             <div className="grid grid-cols-2 gap-3">
               <Input label="Markup (Multiplicador)" val={formData.markup} step={0.1} onChange={v => handleChange('markup', v)} />
               <Input label="Risco / Margem Erro (%)" val={formData.risco || 10} onChange={v => handleChange('risco', v)} />
             </div>
          </Section>

          <button onClick={() => onSave(formData)} className="w-full bg-primary hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-200 mt-4 text-sm uppercase tracking-wide transition-transform active:scale-95">
            Salvar Tudo
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="border-b border-emerald-50 pb-6 last:border-0 last:pb-0">
    <h4 className="text-primary text-xs font-black uppercase tracking-wider mb-4">{title}</h4>
    {children}
  </div>
);

const Input = ({ label, val, onChange, step }: { label: string, val: number, onChange: (v: string) => void, step?: number }) => (
  <div>
    <label className="text-slate-400 text-[10px] font-bold block mb-1 truncate uppercase">{label}</label>
    <input 
      type="number" 
      step={step}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" 
      value={val} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);
