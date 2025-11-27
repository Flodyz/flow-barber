import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Scissors, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { agendamentoService } from '../services/agendamentoService';
import { clienteService } from '../services/clienteService';
import { servicoService } from '../services/servicoService';
import { barbeiroService } from '../services/barbeiroService';
import type { Agendamento } from '../types';

interface DashboardStats {
  totalClientes: number;
  totalServicos: number;
  totalBarbeiros: number;
  agendamentosHoje: number;
  agendamentosConcluidos: number;
  agendamentosCancelados: number;
  faturamentoMensal: number;
  proximosAgendamentos: Agendamento[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    totalServicos: 0,
    totalBarbeiros: 0,
    agendamentosHoje: 0,
    agendamentosConcluidos: 0,
    agendamentosCancelados: 0,
    faturamentoMensal: 0,
    proximosAgendamentos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [agendamentos, clientes, servicos, barbeiros] = await Promise.all([
        agendamentoService.listar(),
        clienteService.listar(),
        servicoService.listar(),
        barbeiroService.listar()
      ]);

      // Calcular estatísticas
      const hoje = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const agendamentosHoje = agendamentos.filter(a => 
        a.data_agendamento.startsWith(hoje)
      );

      const agendamentosConcluidos = agendamentos.filter(a => 
        a.status === 'concluido' && a.data_agendamento >= inicioMes
      );

      const agendamentosCancelados = agendamentos.filter(a => 
        a.status === 'cancelado' && a.data_agendamento >= inicioMes
      );

      const faturamentoMensal = agendamentosConcluidos.reduce((total, agendamento) => 
        total + (agendamento.servico?.preco || 0), 0
      );

      const proximosAgendamentos = agendamentos
        .filter(a => a.status === 'agendado' && a.data_agendamento >= hoje)
        .sort((a, b) => new Date(a.data_agendamento).getTime() - new Date(b.data_agendamento).getTime())
        .slice(0, 5);

      setStats({
        totalClientes: clientes.length,
        totalServicos: servicos.filter(s => s.ativo).length,
        totalBarbeiros: barbeiros.filter(b => b.ativo).length,
        agendamentosHoje: agendamentosHoje.length,
        agendamentosConcluidos: agendamentosConcluidos.length,
        agendamentosCancelados: agendamentosCancelados.length,
        faturamentoMensal,
        proximosAgendamentos
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-silver-600">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
        <p className="mt-2 text-sm text-silver-600">
          Visão geral do desempenho da barbearia
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clientes */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-silver-600">Clientes</p>
                <p className="text-2xl font-bold text-primary-900">{stats.totalClientes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Serviços */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-silver-600">Serviços</p>
                <p className="text-2xl font-bold text-primary-900">{stats.totalServicos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Barbeiros */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-silver-600">Barbeiros</p>
                <p className="text-2xl font-bold text-primary-900">{stats.totalBarbeiros}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Faturamento Mensal */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-yellow-600 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-silver-600">Faturamento</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.faturamentoMensal)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agendamentos do Dia e Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agendamentos Hoje */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">Hoje</h3>
              <Calendar className="h-5 w-5 text-silver-600" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-900 mb-2">
                {stats.agendamentosHoje}
              </div>
              <p className="text-sm text-silver-600">Agendamentos</p>
            </div>

            <div className="mt-4 pt-4 border-t border-silver-700">
              <div className="flex justify-between text-sm">
                <span className="text-silver-600">Status do dia</span>
                <span className="text-green-600">
                  {stats.agendamentosHoje > 0 ? 'Ativo' : 'Livre'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Concluídos Este Mês */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">Concluídos</h3>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.agendamentosConcluidos}
              </div>
              <p className="text-sm text-silver-600">Este mês</p>
            </div>

            <div className="mt-4 pt-4 border-t border-silver-700">
              <div className="flex justify-between text-sm">
                <span className="text-silver-600">Performance</span>
                <span className="text-green-600">
                  {stats.agendamentosConcluidos > 0 ? 'Excelente' : 'Iniciando'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancelados Este Mês */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">Cancelados</h3>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">
                {stats.agendamentosCancelados}
              </div>
              <p className="text-sm text-silver-600">Este mês</p>
            </div>

            <div className="mt-4 pt-4 border-t border-silver-700">
              <div className="flex justify-between text-sm">
                <span className="text-silver-400">Taxa</span>
                <span className="text-silver-300">
                  {stats.agendamentosConcluidos + stats.agendamentosCancelados > 0 
                    ? Math.round((stats.agendamentosCancelados / (stats.agendamentosConcluidos + stats.agendamentosCancelados)) * 100)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Agendamentos */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-primary-900">Próximos Agendamentos</h3>
              <p className="text-sm text-silver-600">Agendamentos confirmados para os próximos dias</p>
            </div>
            <Clock className="h-5 w-5 text-silver-600" />
          </div>

          {stats.proximosAgendamentos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-silver-600 mx-auto mb-4" />
              <p className="text-silver-600">Nenhum agendamento próximo</p>
              <p className="text-sm text-silver-700 mt-1">Os novos agendamentos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.proximosAgendamentos.map((agendamento) => {
                const { date, time } = formatDateTime(agendamento.data_agendamento);
                
                return (
                  <div key={agendamento.id} className="flex items-center p-4 bg-silver-50 rounded-lg border border-silver-200">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-primary-900">
                            {agendamento.cliente?.nome}
                          </h4>
                          <p className="text-sm text-silver-700">
                            {agendamento.servico?.nome} • {agendamento.barbeiro?.nome}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary-900">{date}</p>
                          <p className="text-sm text-silver-700">{time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {agendamento.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Geral */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">Performance</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-silver-700">Taxa de Conclusão</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.agendamentosConcluidos + stats.agendamentosCancelados > 0 
                    ? Math.round((stats.agendamentosConcluidos / (stats.agendamentosConcluidos + stats.agendamentosCancelados)) * 100)
                    : 0
                  }%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-silver-700">Agendamentos Ativos</span>
                <span className="text-sm font-medium text-primary-900">{stats.agendamentosHoje}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-silver-700">Equipe Ativa</span>
                <span className="text-sm font-medium text-primary-900">{stats.totalBarbeiros}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Rápidos */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">Insights</h3>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-silver-700">
                  {stats.agendamentosHoje === 0 
                    ? 'Dia livre para organização' 
                    : `${stats.agendamentosHoje} agendamento(s) hoje`
                  }
                </span>
              </div>
              
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-silver-700">
                  {stats.agendamentosConcluidos} serviços concluídos
                </span>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-silver-700">
                  Faturamento em crescimento
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-900">Ações Rápidas</h3>
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-silver-700 hover:text-primary-900 hover:bg-silver-100 rounded-lg transition-colors">
                → Novo Agendamento
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-silver-700 hover:text-primary-900 hover:bg-silver-100 rounded-lg transition-colors">
                → Cadastrar Cliente
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-silver-700 hover:text-primary-900 hover:bg-silver-100 rounded-lg transition-colors">
                → Ver Relatórios
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-silver-700 hover:text-primary-900 hover:bg-silver-100 rounded-lg transition-colors">
                → Gerenciar Equipe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}