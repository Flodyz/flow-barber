// Tipos do usuário e autenticação
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'barbeiro';
  ativo: boolean;
  barbeiro_id?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    usuario: Usuario;
    token: string;
  };
  message: string;
}

// Tipos do cliente
export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  data_nascimento?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  total_agendamentos?: number;
  ultimo_agendamento?: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteFormData {
  nome: string;
  telefone: string;
  email?: string;
  data_nascimento?: string;
  endereco?: string;
  observacoes?: string;
}

// Tipos do serviço
export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number; // em minutos
  ativo: boolean;
  total_agendamentos?: number;
  agendamentos_concluidos?: number;
  created_at: string;
  updated_at: string;
}

export interface ServicoFormData {
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
}

// Tipos do barbeiro
export interface Barbeiro {
  id: number;
  usuario_id: number;
  nome: string;
  email: string;
  telefone?: string;
  especialidades?: string;
  horario_inicio: string;
  horario_fim: string;
  dias_trabalho: string; // "1,2,3,4,5,6" - dias da semana
  ativo: boolean;
  total_agendamentos?: number;
  agendamentos_concluidos?: number;
  created_at: string;
  updated_at: string;
}

export interface BarbeiroFormData {
  telefone?: string;
  especialidades?: string;
  horario_inicio?: string;
  horario_fim?: string;
  dias_trabalho?: string;
}

// Tipos do agendamento
export type StatusAgendamento = 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface Agendamento {
  id: number;
  cliente_id: number;
  barbeiro_id: number;
  servico_id: number;
  data_agendamento: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  status: StatusAgendamento;
  valor_total: number;
  observacoes?: string;
  // Dados relacionados (joins)
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_email?: string;
  barbeiro_nome?: string;
  servico_nome?: string;
  duracao?: number;
  preco?: number;
  created_at: string;
  updated_at: string;
}

export interface AgendamentoFormData {
  cliente_id: number;
  barbeiro_id: number;
  servico_id: number;
  data_agendamento: string;
  hora_inicio: string;
  observacoes?: string;
}

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export interface ApiError {
  error: string;
  message: string;
}

// Tipos de disponibilidade
export interface DisponibilidadeResponse {
  disponivel: boolean;
  hora_fim: string;
  conflitos: number;
}

// Tipos de estatísticas
export interface EstatisticasServico {
  total_agendamentos: number;
  concluidos: number;
  cancelados: number;
  valor_medio: number;
  receita_total: number;
}

export interface EstatisticasBarbeiro {
  total_agendamentos: number;
  concluidos: number;
  cancelados: number;
  receita_total: number;
  valor_medio: number;
}

// Tipos de filtros e busca
export interface FiltroAgendamentos {
  data?: string;
  barbeiro_id?: number;
  status?: StatusAgendamento;
}

export interface FiltroClientes {
  termo?: string;
  ativo?: boolean;
}

// Tipos de formulários
export interface LoginFormData {
  email: string;
  senha: string;
}

export interface AlterarSenhaFormData {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}