
import React, { useState } from 'react';
import { Settings } from '../types';

interface SettingsViewProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  apiUrl: string;
  onUrlChange: (url: string) => void;
  lastError?: string | null;
  onRetry?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, apiUrl, onUrlChange, lastError, onRetry }) => {
  const [formData, setFormData] = useState<Settings>(settings);

  const handleChange = (key: keyof Settings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUrlChange(e.target.value);
  };

  return (
    <div className="space-y-6 pb-20">
      
      <div className={`jewelry-card p-6 bg-white ${lastError ? 'border-rose-200 ring-2 ring-rose-100' : 'border-amethyst-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <label className="text-slate-900 text-xs font-black uppercase tracking-widest">
            Conexão Google Sheets
          </label>
          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${lastError ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {lastError ? 'Desconectado' : 'Online'}
          </span>
        </div>
        
        <input 
          className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl text-xs font-mono font-bold text-slate-600 focus:border-amethyst-500 focus:outline-none mb-4" 
          value={apiUrl} 
          onChange={handleUrlChange}
          placeholder="Cole a URL do seu Web App Script aqui..."
        />
        
        {onRetry && (
           <button onClick={onRetry} className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs uppercase hover:bg-slate-200 transition-colors">
             Sincronizar Agora
           </button>
        )}
      </div>

      <div className="jewelry-card p-6 bg-white shadow-xl">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
           <h3 className="text-slate-900 font-black text-lg uppercase tracking-widest">Configurações</h3>
           <button onClick={() => onSave(formData)} className="jewel-gradient-amethyst text-white px-6 py-2 rounded-xl font-bold text-xs uppercase shadow-lg active:scale-95 transition-all">
            Salvar
          </button>
        </div>
        
        <div className="space-y-8">
          <Section title="Custos da Máquina">
             <div className="grid grid-cols-2 gap-4">
               <Input label="Preço Máquina (R$)" val={formData.precoMaq} onChange={v => handleChange('precoMaq', v)} />
               <Input label="Vida Útil (Horas)" val={formData.vidaUtilHoras || 8000} onChange={v => handleChange('vidaUtilHoras', v)} />
               <Input label="Manutenção/Mês (R$)" val={formData.manutencaoMensal || 20} onChange={v => handleChange('manutencaoMensal', v)} />
               <Input label="Potência (Watts)" val={formData.potencia} onChange={v => handleChange('potencia', v)} />
               <Input label="Energia (R$/kWh)" val={formData.kwh} step={0.01} onChange={v => handleChange('kwh', v)} />
               <Input label="Eficiência Fonte (0-1)" val={formData.eficienciaFonte || 0.9} step={0.01} onChange={v => handleChange('eficienciaFonte', v)} />
             </div>
          </Section>

          <Section title="Custos Fixos Mensais">
             <div className="col-span-2 mb-4">
                <Input label="Horas Trabalhadas/Mês" val={formData.horasTrab} onChange={v => handleChange('horasTrab', v)} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <Input label="MEI / Impostos" val={formData.mei} onChange={v => handleChange('mei', v)} />
               <Input label="Aluguel" val={formData.aluguel} onChange={v => handleChange('aluguel', v)} />
               <Input label="Softwares" val={formData.softwares} onChange={v => handleChange('softwares', v)} />
               <Input label="Marketing" val={formData.publicidade} onChange={v => handleChange('publicidade', v)} />
               <Input label="Ecommerce" val={formData.ecommerce} onChange={v => handleChange('ecommerce', v)} />
               <Input label="Condomínio/Outros" val={formData.condominio} onChange={v => handleChange('condominio', v)} />
             </div>
          </Section>

          <Section title="Mão de Obra e Processos">
             <div className="grid grid-cols-2 gap-4">
               <Input label="Valor Hora (R$)" val={formData.valorHoraTrabalho || 25} onChange={v => handleChange('valorHoraTrabalho', v)} />
               <Input label="Tempo Prep (min)" val={formData.tempoPreparacao || 15} onChange={v => handleChange('tempoPreparacao', v)} />
               <Input label="Tempo Pós (min)" val={formData.tempoPosProcessamento || 15} onChange={v => handleChange('tempoPosProcessamento', v)} />
               <Input label="Atendimento (min)" val={formData.tempoAtendimento || 10} onChange={v => handleChange('tempoAtendimento', v)} />
             </div>
          </Section>

           <Section title="Margens e Taxas">
             <div className="grid grid-cols-2 gap-4">
               <Input label="Markup (Multiplicador)" val={formData.markup} step={0.1} onChange={v => handleChange('markup', v)} />
               <Input label="Risco / Falha (%)" val={formData.risco} onChange={v => handleChange('risco', v)} />
               <Input label="Perda Material (%)" val={formData.perdaMaterial} onChange={v => handleChange('perdaMaterial', v)} />
             </div>
          </Section>

          <Section title="Serviços Extras (Preço Fixo)">
             <div className="grid grid-cols-2 gap-4">
               <Input label="Embalagem" val={formData.embalagem} onChange={v => handleChange('embalagem', v)} />
               <Input label="Pintura Simples" val={formData.pintSimples} onChange={v => handleChange('pintSimples', v)} />
               <Input label="Pintura Média" val={formData.pintMedia} onChange={v => handleChange('pintMedia', v)} />
               <Input label="Pintura Pro" val={formData.pintProf} onChange={v => handleChange('pintProf', v)} />
             </div>
          </Section>

          <button onClick={() => onSave(formData)} className="w-full jewel-gradient-amethyst text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-8">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amethyst-400"></span>
      {title}
    </h4>
    {children}
  </div>
);

const Input = ({ label, val, onChange, step }: { label: string, val: number, onChange: (v: string) => void, step?: number }) => (
  <div>
    <label className="text-slate-500 text-[10px] font-bold block mb-2 uppercase tracking-wide">{label}</label>
    <input 
      type="number" step={step}
      className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl text-slate-900 text-sm font-bold focus:border-amethyst-500 focus:bg-white focus:outline-none transition-all" 
      value={val} onChange={e => onChange(e.target.value)} 
    />
  </div>
);
