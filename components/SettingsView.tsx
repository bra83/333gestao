
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
  canInstall?: boolean;
  onInstall?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, apiUrl, onUrlChange, lastError, onRetry, onMaintenance, canInstall, onInstall }) => {
  const [formData, setFormData] = useState<Settings>(settings);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleChange = (key: keyof Settings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUrlChange(e.target.value);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* PWA Install Section */}
      {(canInstall || isIOS) && (
        <div className="jewelry-card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-200">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </div>
              <div>
                 <h3 className="font-black text-sm uppercase tracking-widest">Instalar Aplicativo</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Acesso rápido e offline</p>
              </div>
           </div>
           
           {canInstall && (
             <button onClick={onInstall} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[11px] uppercase py-3 rounded-xl tracking-widest active:scale-95 transition-all shadow-lg">
               Adicionar à Tela Inicial
             </button>
           )}

           {isIOS && (
             <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
               <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide leading-relaxed">
                 Toque em <span className="inline-block px-1"><svg className="inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M12 3v12M17 8l-5-5-5 5"/></svg></span> e selecione <br/>"Adicionar à Tela de Início"
               </p>
             </div>
           )}
        </div>
      )}

      <div className="jewelry-card p-6 shadow-sm border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-900 font-black text-xl uppercase tracking-tighter flex items-center gap-2">
            <span className="w-2 h-6 jewel-gradient-sapphire rounded-full"></span>
            Conectividade
          </h3>
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${lastError ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {lastError ? 'Desconectado' : 'Sincronizado'}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2 block ml-1">Google Apps Script URL</label>
            <input 
              className="w-full p-4 rounded-2xl text-xs font-mono font-bold" 
              value={apiUrl} 
              onChange={handleUrlChange}
              placeholder="https://script.google.com/macros/s/..."
            />
          </div>
          
          <div className="flex gap-3">
              <button onClick={onRetry} className="flex-1 bg-slate-900 text-white font-black text-[11px] uppercase py-4 rounded-2xl tracking-widest active:scale-95 transition-all shadow-lg">Sincronizar</button>
              <button onClick={() => window.open('https://sheets.new', '_blank')} className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-black text-[11px] uppercase py-4 rounded-2xl tracking-widest active:scale-95 transition-all">Ver Planilha</button>
          </div>
        </div>
      </div>

      <div className="jewelry-card p-8 shadow-sm border-slate-200">
        <h3 className="text-slate-900 font-black text-xl uppercase tracking-tighter mb-8 border-b-2 border-slate-100 pb-4">Ajustes da Oficina</h3>
        
        <div className="space-y-10">
          <Section title="Mecânica & Energia">
             <div className="grid grid-cols-2 gap-5">
               <Input label="Preço da Máquina" val={formData.precoMaq} onChange={v => handleChange('precoMaq', v)} />
               <Input label="Vida Útil (Horas)" val={formData.vidaUtilHoras || 8000} onChange={v => handleChange('vidaUtilHoras', v)} />
               <Input label="Manut. Mensal" val={formData.manutencaoMensal || 20} onChange={v => handleChange('manutencaoMensal', v)} />
               <Input label="Potência (W)" val={formData.potencia} onChange={v => handleChange('potencia', v)} />
               <Input label="Preço kWh" val={formData.kwh} step={0.01} onChange={v => handleChange('kwh', v)} />
               <Input label="Markup (x)" val={formData.markup} step={0.1} onChange={v => handleChange('markup', v)} />
             </div>
          </Section>

          <Section title="Custos de Guilda (Mensais)">
             <div className="grid grid-cols-3 gap-3">
               <div className="col-span-3">
                  <Input label="Horas de Trabalho Mensais" val={formData.horasTrab} onChange={v => handleChange('horasTrab', v)} />
               </div>
               <Input label="Impostos" val={formData.mei} onChange={v => handleChange('mei', v)} />
               <Input label="Aluguel" val={formData.aluguel} onChange={v => handleChange('aluguel', v)} />
               <Input label="Software" val={formData.softwares} onChange={v => handleChange('softwares', v)} />
             </div>
          </Section>

          <Section title="Habilidades & Processos">
             <div className="grid grid-cols-2 gap-5">
               <Input label="Valor Hora Própria" val={formData.valorHoraTrabalho || 25} onChange={v => handleChange('valorHoraTrabalho', v)} />
               <Input label="Taxa de Risco (%)" val={formData.risco || 10} onChange={v => handleChange('risco', v)} />
               <Input label="Prep. Projeto (min)" val={formData.tempoPreparacao || 15} onChange={v => handleChange('tempoPreparacao', v)} />
               <Input label="Pós-Proc. (min)" val={formData.tempoPosProcessamento || 15} onChange={v => handleChange('tempoPosProcessamento', v)} />
             </div>
          </Section>

          <button onClick={() => onSave(formData)} className="w-full jewel-gradient-amethyst text-white font-black uppercase py-6 rounded-[32px] text-sm tracking-[0.4em] shadow-xl active:scale-95 transition-all mt-10">
            SALVAR PARÂMETROS
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="space-y-6">
    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
      {title}
      <div className="flex-1 h-[1px] bg-slate-100"></div>
    </h4>
    {children}
  </div>
);

const Input = ({ label, val, onChange, step }: { label: string, val: number, onChange: (v: string) => void, step?: number }) => (
  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 group focus-within:border-amethyst-300 focus-within:bg-white transition-all">
    <label className="text-slate-500 text-[9px] font-black block mb-2 uppercase tracking-widest">{label}</label>
    <input 
      type="number" step={step}
      className="w-full bg-transparent border-none p-0 text-slate-900 text-lg font-black focus:ring-0 focus:outline-none placeholder:text-slate-300" 
      value={val} onChange={e => onChange(e.target.value)} 
    />
  </div>
);
