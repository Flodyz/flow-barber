import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Calendar, Clock, User, Scissors, Filter, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { agendamentoService } from '../services/agendamentoService';
import { clienteService } from '../services/clienteService';
import { servicoService } from '../services/servicoService';
import { barbeiroService } from '../services/barbeiroService';
import type { Agendamento, AgendamentoFormData, Cliente, Servico, Barbeiro } from '../types';

export function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroData, setFiltroData] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<AgendamentoFormData>();

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Filtrar agendamentos quando filtros mudarem
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const statusMatch = filtroStatus === 'todos' || agendamento.status === filtroStatus;
    const dataMatch = !filtroData || agendamento.data_agendamento.startsWith(filtroData);
    return statusMatch && dataMatch;
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [agendamentosData, clientesData, servicosData, barbeirosData] = await Promise.all([
        agendamentoService.listar(),
        clienteService.listar(),
        servicoService.listar(),
        barbeiroService.listar()
      ]);

      setAgendamentos(agendamentosData);
      setClientes(clientesData);
      setServicos(servicosData);
      setBarbeiros(barbeirosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Novo agendamento
  const handleNovoAgendamento = () => {
    reset();
    setShowModal(true);
  };

  // Ver detalhes do agendamento
  const handleVerDetalhes = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowDetailsModal(true);
  };

  // Atualizar status do agendamento
  const handleAtualizarStatus = async (agendamentoId: number, novoStatus: 'concluido' | 'cancelado') => {
    try {
      if (novoStatus === 'cancelado') {
        await agendamentoService.cancelar(agendamentoId);
      } else {
        await agendamentoService.atualizar(agendamentoId, { status: novoStatus });
      }
      toast.success(`Agendamento ${novoStatus === 'concluido' ? 'concluído' : 'cancelado'} com sucesso!`);
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar status';
      toast.error(message);
    }
  };

  // Criar agendamento
  const onSubmit = async (data: AgendamentoFormData) => {
    try {
      await agendamentoService.criar(data);
      toast.success('Agendamento criado com sucesso!');
      setShowModal(false);
      reset();
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      const message = error.response?.data?.message || 'Erro ao criar agendamento';
      toast.error(message);
    }
  };

  // Formatação de data e hora
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Cores do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-silver-100 text-silver-800';
    }
  };

  // Verificar se o horário está disponível
  const verificarDisponibilidade = async (data: string, horario: string, barbeiroId: number) => {
    try {
      const disponivel = await agendamentoService.verificarDisponibilidade(data, horario, barbeiroId);
      return disponivel;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  };

  // Formatar data e hora
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-900 text-blue-200';
      case 'concluido':
        return 'bg-green-900 text-green-200';
      case 'cancelado':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-900 text-gray-200';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado':
        return <AlertCircle className="h-4 w-4" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Gerar horários disponíveis
  const gerarHorarios = () => {
    const horarios = [];
    for (let hora = 8; hora < 18; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horarioStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horarios.push(horarioStr);
      }
    }
    return horarios;
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Agendamentos</h1>
          <p className="mt-2 text-sm text-silver-600">
            Gerencie os agendamentos da barbearia
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleNovoAgendamento}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 card">
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-silver-600 mr-2" />
              <span className="text-sm text-silver-700">Filtros:</span>
            </div>
            
            <div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="input-field"
              >
                <option value="todos">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="input-field"
                placeholder="Filtrar por data"
              />
            </div>

            {(filtroStatus !== 'todos' || filtroData) && (
              <button
                onClick={() => {
                  setFiltroStatus('todos');
                  setFiltroData('');
                }}
                className="text-sm text-silver-600 hover:text-primary-900"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de agendamentos */}
      <div className="mt-6">
        {loading ? (
          <div className="card">
            <div className="card-body text-center text-silver-600">
              Carregando...
            </div>
          </div>
        ) : agendamentosFiltrados.length === 0 ? (
          <div className="card">
            <div className="card-body text-center text-silver-600">
              Nenhum agendamento encontrado
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {agendamentosFiltrados.map((agendamento) => {
              const { date, time } = formatDateTime(agendamento.data_agendamento);
              
              return (
                <div key={agendamento.id} className="card">
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-primary-900">
                            #{agendamento.id}
                          </h3>
                          <p className="text-sm text-silver-600">
                            {date} às {time}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusColor(agendamento.status)}`}>
                          {getStatusIcon(agendamento.status)}
                          <span className="ml-1 capitalize">{agendamento.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-silver-700">
                        <User className="h-4 w-4 mr-2 text-silver-600" />
                        <span className="text-sm">{agendamento.cliente?.nome}</span>
                      </div>
                      
                      <div className="flex items-center text-silver-700">
                        <Scissors className="h-4 w-4 mr-2 text-silver-600" />
                        <span className="text-sm">{agendamento.servico?.nome}</span>
                      </div>
                      
                      <div className="flex items-center text-silver-700">
                        <Clock className="h-4 w-4 mr-2 text-silver-600" />
                        <span className="text-sm">com {agendamento.barbeiro?.nome}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-silver-300">
                      <span className="text-lg font-semibold text-green-600">
                        R$ {agendamento.servico?.preco.toFixed(2)}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerDetalhes(agendamento)}
                          className="text-silver-600 hover:text-primary-900"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {agendamento.status === 'agendado' && (
                          <>
                            <button
                              onClick={() => handleAtualizarStatus(agendamento.id, 'concluido')}
                              className="text-green-600 hover:text-green-700"
                              title="Marcar como concluído"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAtualizarStatus(agendamento.id, 'cancelado')}
                              className="text-red-500 hover:text-red-700"
                              title="Cancelar agendamento"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de novo agendamento */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-silver-300">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-primary-900 mb-4">
                    Novo Agendamento
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Cliente */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Cliente *
                      </label>
                      <select
                        {...register('clienteId', { required: 'Cliente é obrigatório' })}
                        className="input-field w-full"
                      >
                        <option value="">Selecione um cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.telefone}
                          </option>
                        ))}
                      </select>
                      {errors.clienteId && (
                        <p className="mt-1 text-sm text-red-500">{errors.clienteId.message}</p>
                      )}
                    </div>

                    {/* Serviço */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Serviço *
                      </label>
                      <select
                        {...register('servicoId', { required: 'Serviço é obrigatório' })}
                        className="input-field w-full"
                      >
                        <option value="">Selecione um serviço</option>
                        {servicos.filter(s => s.ativo).map(servico => (
                          <option key={servico.id} value={servico.id}>
                            {servico.nome} - R$ {servico.preco.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      {errors.servicoId && (
                        <p className="mt-1 text-sm text-red-500">{errors.servicoId.message}</p>
                      )}
                    </div>

                    {/* Barbeiro */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Barbeiro *
                      </label>
                      <select
                        {...register('barbeiroId', { required: 'Barbeiro é obrigatório' })}
                        className="input-field w-full"
                      >
                        <option value="">Selecione um barbeiro</option>
                        {barbeiros.filter(b => b.ativo).map(barbeiro => (
                          <option key={barbeiro.id} value={barbeiro.id}>
                            {barbeiro.nome}
                          </option>
                        ))}
                      </select>
                      {errors.barbeiroId && (
                        <p className="mt-1 text-sm text-red-500">{errors.barbeiroId.message}</p>
                      )}
                    </div>

                    {/* Data */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Data *
                      </label>
                      <input
                        {...register('dataAgendamento', { required: 'Data é obrigatória' })}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field w-full"
                      />
                      {errors.dataAgendamento && (
                        <p className="mt-1 text-sm text-red-400">{errors.dataAgendamento.message}</p>
                      )}
                    </div>

                    {/* Horário */}
                    <div>
                      <label className="block text-sm font-medium text-silver-200 mb-1">
                        Horário *
                      </label>
                      <select
                        {...register('horarioAgendamento', { required: 'Horário é obrigatório' })}
                        className="input-field w-full"
                      >
                        <option value="">Selecione um horário</option>
                        {gerarHorarios().map(horario => (
                          <option key={horario} value={horario}>
                            {horario}
                          </option>
                        ))}
                      </select>
                      {errors.horarioAgendamento && (
                        <p className="mt-1 text-sm text-red-400">{errors.horarioAgendamento.message}</p>
                      )}
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="block text-sm font-medium text-silver-200 mb-1">
                        Observações
                      </label>
                      <textarea
                        {...register('observacoes')}
                        rows={3}
                        className="input-field w-full"
                        placeholder="Observações adicionais..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-primary-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {showDetailsModal && selectedAgendamento && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailsModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-silver-300">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-primary-900 mb-4">
                  Detalhes do Agendamento #{selectedAgendamento.id}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-silver-600">Cliente:</span>
                    <p className="text-primary-900">{selectedAgendamento.cliente?.nome}</p>
                    <p className="text-sm text-silver-700">{selectedAgendamento.cliente?.telefone}</p>
                  </div>

                  <div>
                    <span className="text-sm text-silver-600">Serviço:</span>
                    <p className="text-primary-900">{selectedAgendamento.servico?.nome}</p>
                    <p className="text-sm text-silver-700">
                      R$ {selectedAgendamento.servico?.preco.toFixed(2)} - {selectedAgendamento.servico?.duracao} min
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-silver-600">Barbeiro:</span>
                    <p className="text-primary-900">{selectedAgendamento.barbeiro?.nome}</p>
                  </div>

                  <div>
                    <span className="text-sm text-silver-600">Data e Horário:</span>
                    <p className="text-primary-900">
                      {formatDateTime(selectedAgendamento.data_agendamento).date} às {formatDateTime(selectedAgendamento.data_agendamento).time}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-silver-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(selectedAgendamento.status)}`}>
                      {selectedAgendamento.status}
                    </span>
                  </div>

                  {selectedAgendamento.observacoes && (
                    <div>
                      <span className="text-sm text-silver-600">Observações:</span>
                      <p className="text-primary-900">{selectedAgendamento.observacoes}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-silver-600">Criado em:</span>
                    <p className="text-primary-900">
                      {new Date(selectedAgendamento.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-silver-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}