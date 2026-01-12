import { Settings, AppData } from './types';

export const DEFAULT_SETTINGS: Settings = {
  // Basic / Legacy
  markup: 3.0,
  kwh: 0.95,
  potencia: 350,
  embalagem: 2.50,
  pintSimples: 20,
  pintMedia: 40,
  pintProf: 80,
  aluguel: 0,
  softwares: 50,
  ecommerce: 0,
  mei: 75,
  publicidade: 0,
  condominio: 0,
  precoMaq: 3500,
  vidaUtil: 24, // months
  horasTrab: 160, // Realistic monthly hours
  FatPrevisto: 5000,

  // Advanced Defaults
  perdaMaterial: 5, // 5%
  eficienciaFonte: 0.9,
  manutencaoMensal: 20,
  vidaUtilHoras: 8000,
  valorHoraTrabalho: 25, // R$ per hour
  tempoPreparacao: 15, // Minutes
  tempoPosProcessamento: 15, // Minutes
  tempoAtendimento: 10, // Minutes
  risco: 10, // 10%
  imposto: 0,
};

export const MOCK_DATA: AppData = {
  estoque: [
    { id: 'st1', nome: 'Deep Black', marca: 'Voolt3D', peso: 820, preco: 120, cor: '#1e293b', tipo: 'PLA' },
    { id: 'st2', nome: 'Arctic White', marca: 'Voolt3D', peso: 140, preco: 110, cor: '#f8fafc', tipo: 'PLA' },
    { id: 'st3', nome: 'Crystal Clear', marca: '3D Fila', peso: 1000, preco: 140, cor: '#cbd5e1', tipo: 'PETG' },
    { id: 'st4', nome: 'Fire Red', marca: 'Creality', peso: 150, preco: 90, cor: '#ef4444', tipo: 'ABS' },
    { id: 'st5', nome: 'Royal Blue', marca: 'Voolt3D', peso: 400, preco: 130, cor: '#3b82f6', tipo: 'SILK' },
  ],
  vendas: [
    { id: 'v1', data: '2026-01-10', item: 'Suporte XYZ', material: 'PLA "Preto"', peso: 45, venda: 120, lucro: 75 },
    { id: 'v2', data: '2026-01-12', item: 'Vaso Geométrico', material: 'PLA "Branco"', peso: 120, venda: 80, lucro: 45 },
    { id: 'v3', data: '2026-01-15', item: 'Peça Técnica', material: 'ABS "Vermelho"', peso: 200, venda: 200, lucro: 120 },
  ],
  gastos: [
    { id: '17000001', data: '2026-01-10', descricao: 'Manutenção Bico', valor: 50 },
    { id: '17000002', data: '2026-01-14', descricao: 'Álcool Isopropílico', valor: 25 },
  ]
};