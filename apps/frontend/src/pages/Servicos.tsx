import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Clock, DollarSign, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import { servicoService } from '../services/servicoService';
import { useAuth } from '../contexts/AuthContext';
import type { Servico, ServicoFormData } from '../types';

export function Servicos() {
  const { usuario } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<ServicoFormData>();

  // Verificar se é admin
  const isAdmin = usuario?.tipo === 'admin';

  // Carregar serviços
  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      // Limpar estado para forçar re-renderização
      setServicos([]);
      const data = await servicoService.listar();
      setServicos(data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para novo serviço
  const handleNovoServico = () => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem criar serviços');
      return;
    }
    reset();
    setEditingServico(null);
    setShowModal(true);
  };

  // Abrir modal para editar serviço
  const handleEditarServico = (servico: Servico) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem editar serviços');
      return;
    }
    
    setEditingServico(servico);
    setValue('nome', servico.nome);
    setValue('descricao', servico.descricao || '');
    setValue('preco', servico.preco);
    setValue('duracao', servico.duracao);
    setShowModal(true);
  };

  // Salvar serviço (criar ou atualizar)
  const onSubmit = async (data: ServicoFormData) => {
    try {
      if (editingServico) {
        await servicoService.atualizar(editingServico.id, data);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await servicoService.criar(data);
        toast.success('Serviço criado com sucesso!');
      }
      
      // Recarregar dados antes de fechar o modal
      await carregarServicos();
      setShowModal(false);
      reset();
    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);
      const message = error.response?.data?.message || 'Erro ao salvar serviço';
      toast.error(message);
    }
  };

  // Deletar serviço
  const handleDeletarServico = async (servico: Servico) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem excluir serviços');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o serviço "${servico.nome}"?`)) {
      return;
    }

    try {
      await servicoService.deletar(servico.id);
      toast.success('Serviço excluído com sucesso!');
      carregarServicos();
    } catch (error: any) {
      console.error('Erro ao deletar serviço:', error);
      const message = error.response?.data?.message || 'Erro ao excluir serviço';
      toast.error(message);
    }
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Formatar duração
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Serviços</h1>
          <p className="mt-2 text-sm text-silver-600">
            Gerencie os serviços oferecidos pela barbearia
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleNovoServico}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </button>
          </div>
        )}
      </div>

      {/* Lista de serviços */}
      <div className="mt-6">
        {loading ? (
          <div className="card">
            <div className="card-body text-center text-silver-600">
              Carregando...
            </div>
          </div>
        ) : servicos.length === 0 ? (
          <div className="card">
            <div className="card-body text-center text-silver-600">
              Nenhum serviço encontrado
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico) => (
              <div key={servico.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
                          <Scissors className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-lg font-semibold text-primary-900">
                          {servico.nome}
                        </h3>
                        {servico.descricao && (
                          <p className="text-sm text-silver-600 mt-1">
                            {servico.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={() => handleEditarServico(servico)}
                          className="text-silver-600 hover:text-primary-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletarServico(servico)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-silver-700">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="text-sm">Preço:</span>
                      </div>
                      <span className="text-lg font-semibold text-green-600">
                        {formatPrice(servico.preco)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-silver-700">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">Duração:</span>
                      </div>
                      <span className="text-sm text-silver-900">
                        {formatDuration(servico.duracao)}
                      </span>
                    </div>

                    {servico.total_agendamentos !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-silver-700">Agendamentos:</span>
                        <span className="text-sm text-silver-900">
                          {servico.total_agendamentos}
                        </span>
                      </div>
                    )}

                    {servico.agendamentos_concluidos !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-silver-700">Concluídos:</span>
                        <span className="text-sm text-green-600">
                          {servico.agendamentos_concluidos}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-silver-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-silver-600">
                        Criado em {new Date(servico.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        servico.ativo 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {servico.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de serviço */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-silver-300">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-primary-900 mb-4">
                    {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Nome *
                      </label>
                      <input
                        {...register('nome', { required: 'Nome é obrigatório' })}
                        className="input-field w-full"
                        placeholder="Nome do serviço"
                      />
                      {errors.nome && (
                        <p className="mt-1 text-sm text-red-500">{errors.nome.message}</p>
                      )}
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Descrição
                      </label>
                      <textarea
                        {...register('descricao')}
                        rows={3}
                        className="input-field w-full"
                        placeholder="Descrição do serviço..."
                      />
                    </div>

                    {/* Preço */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Preço (R$) *
                      </label>
                      <input
                        {...register('preco', { 
                          required: 'Preço é obrigatório',
                          valueAsNumber: true,
                          min: { value: 0.01, message: 'Preço deve ser maior que zero' }
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field w-full"
                        placeholder="0.00"
                      />
                      {errors.preco && (
                        <p className="mt-1 text-sm text-red-500">{errors.preco.message}</p>
                      )}
                    </div>

                    {/* Duração */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Duração (minutos) *
                      </label>
                      <input
                        {...register('duracao', { 
                          required: 'Duração é obrigatória',
                          valueAsNumber: true,
                          min: { value: 1, message: 'Duração deve ser maior que zero' }
                        })}
                        type="number"
                        min="1"
                        className="input-field w-full"
                        placeholder="30"
                      />
                      {errors.duracao && (
                        <p className="mt-1 text-sm text-red-500">{errors.duracao.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-silver-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {isSubmitting ? 'Salvando...' : (editingServico ? 'Atualizar' : 'Criar')}
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
    </div>
  );
}