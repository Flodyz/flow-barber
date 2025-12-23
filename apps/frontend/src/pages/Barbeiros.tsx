import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, User, Phone, Mail, MapPin, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { barbeiroService } from '../services/barbeiroService';
import { useAuth } from '../contexts/AuthContext';
import type { Barbeiro, BarbeiroCompleteFormData } from '../types';

export function Barbeiros() {
  const { usuario } = useAuth();
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBarbeiro, setEditingBarbeiro] = useState<Barbeiro | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<BarbeiroCompleteFormData>();

  // Verificar se é admin
  const isAdmin = usuario?.tipo === 'admin';

  // Carregar barbeiros
  useEffect(() => {
    carregarBarbeiros();
  }, []);

  const carregarBarbeiros = async () => {
    try {
      setLoading(true);
      const data = await barbeiroService.listar();
      setBarbeiros(data);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
      toast.error('Erro ao carregar barbeiros');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para novo barbeiro
  const handleNovoBarbeiro = () => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem criar barbeiros');
      return;
    }
    reset();
    setEditingBarbeiro(null);
    setShowModal(true);
  };

  // Abrir modal para editar barbeiro
  const handleEditarBarbeiro = (barbeiro: Barbeiro) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem editar barbeiros');
      return;
    }
    
    setEditingBarbeiro(barbeiro);
    setValue('nome', barbeiro.nome);
    setValue('telefone', barbeiro.telefone || '');
    setValue('email', barbeiro.email || '');
    setValue('endereco', barbeiro.endereco || '');
    setValue('especialidades', barbeiro.especialidades || '');
    setValue('ativo', barbeiro.ativo);
    setShowModal(true);
  };

  // Salvar barbeiro (criar ou atualizar)
  const onSubmit = async (data: BarbeiroCompleteFormData) => {
    try {
      if (editingBarbeiro) {
        await barbeiroService.atualizar(editingBarbeiro.id, data);
        toast.success('Barbeiro atualizado com sucesso!');
      } else {
        await barbeiroService.criar(data);
        toast.success('Barbeiro criado com sucesso!');
      }
      
      // Recarregar dados antes de fechar o modal
      await carregarBarbeiros();
      setShowModal(false);
      reset();
    } catch (error: any) {
      console.error('Erro ao salvar barbeiro:', error);
      const message = error.response?.data?.message || 'Erro ao salvar barbeiro';
      toast.error(message);
    }
  };

  // Deletar barbeiro
  const handleDeletarBarbeiro = async (barbeiro: Barbeiro) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem excluir barbeiros');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o barbeiro "${barbeiro.nome}"?`)) {
      return;
    }

    try {
      await barbeiroService.deletar(barbeiro.id);
      toast.success('Barbeiro excluído com sucesso!');
      carregarBarbeiros();
    } catch (error: any) {
      console.error('Erro ao deletar barbeiro:', error);
      const message = error.response?.data?.message || 'Erro ao excluir barbeiro';
      toast.error(message);
    }
  };

  // Alternar status ativo/inativo
  const handleToggleStatus = async (barbeiro: Barbeiro) => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar o status');
      return;
    }

    try {
      await barbeiroService.atualizar(barbeiro.id, { 
        ...barbeiro, 
        ativo: !barbeiro.ativo 
      });
      toast.success(`Barbeiro ${!barbeiro.ativo ? 'ativado' : 'desativado'} com sucesso!`);
      carregarBarbeiros();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      const message = error.response?.data?.message || 'Erro ao alterar status';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Barbeiros</h1>
          <p className="mt-2 text-sm text-silver-600">
            Gerencie a equipe de barbeiros da barbearia
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleNovoBarbeiro}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Barbeiro
            </button>
          </div>
        )}
      </div>

      {/* Lista de barbeiros */}
      <div className="mt-6">
        {loading ? (
          <div className="card">
            <div className="card-body text-center text-silver-600">
              Carregando...
            </div>
          </div>
        ) : barbeiros.length === 0 ? (
          <div className="card">
            <div className="card-body text-center text-silver-600">
              Nenhum barbeiro encontrado
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbeiros.map((barbeiro) => (
              <div key={barbeiro.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-lg font-semibold text-primary-900">
                          {barbeiro.nome}
                        </h3>
                        <p className="text-sm text-silver-600">
                          ID: #{barbeiro.id}
                        </p>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={() => handleEditarBarbeiro(barbeiro)}
                          className="text-silver-600 hover:text-primary-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletarBarbeiro(barbeiro)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    {barbeiro.telefone && (
                      <div className="flex items-center text-silver-700">
                        <Phone className="h-4 w-4 mr-2 text-silver-600" />
                        <span className="text-sm">{barbeiro.telefone}</span>
                      </div>
                    )}
                    
                    {barbeiro.email && (
                      <div className="flex items-center text-silver-700">
                        <Mail className="h-4 w-4 mr-2 text-silver-600" />
                        <span className="text-sm">{barbeiro.email}</span>
                      </div>
                    )}
                    
                    {barbeiro.endereco && (
                      <div className="flex items-center text-silver-700">
                        <MapPin className="h-4 w-4 mr-2 text-silver-600" />
                        <span className="text-sm">{barbeiro.endereco}</span>
                      </div>
                    )}
                    
                    {barbeiro.especialidades && (
                      <div className="flex items-start text-silver-700">
                        <Award className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-silver-600" />
                        <span className="text-sm">{barbeiro.especialidades}</span>
                      </div>
                    )}

                    {barbeiro.total_agendamentos !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-silver-700">Agendamentos:</span>
                        <span className="text-sm text-primary-900">
                          {barbeiro.total_agendamentos}
                        </span>
                      </div>
                    )}

                    {barbeiro.agendamentos_concluidos !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-silver-700">Concluídos:</span>
                        <span className="text-sm text-green-600">
                          {barbeiro.agendamentos_concluidos}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-silver-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-silver-600">
                        Cadastrado em {new Date(barbeiro.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          barbeiro.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {barbeiro.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleToggleStatus(barbeiro)}
                            className={`text-xs px-2 py-1 rounded ${
                              barbeiro.ativo
                                ? 'text-red-400 hover:text-red-300'
                                : 'text-green-400 hover:text-green-300'
                            }`}
                          >
                            {barbeiro.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de barbeiro */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-silver-300">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-primary-900 mb-4">
                    {editingBarbeiro ? 'Editar Barbeiro' : 'Novo Barbeiro'}
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
                        placeholder="Nome completo do barbeiro"
                      />
                      {errors.nome && (
                        <p className="mt-1 text-sm text-red-500">{errors.nome.message}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Telefone
                      </label>
                      <input
                        {...register('telefone')}
                        className="input-field w-full"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        E-mail
                      </label>
                      <input
                        {...register('email', {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'E-mail inválido'
                          }
                        })}
                        type="email"
                        className="input-field w-full"
                        placeholder="barbeiro@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Endereço */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Endereço
                      </label>
                      <input
                        {...register('endereco')}
                        className="input-field w-full"
                        placeholder="Endereço completo"
                      />
                    </div>

                    {/* Especialidades */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Especialidades
                      </label>
                      <textarea
                        {...register('especialidades')}
                        rows={3}
                        className="input-field w-full"
                        placeholder="Cortes masculinos, barba, degradê, etc..."
                      />
                    </div>

                    {/* Status Ativo */}
                    {editingBarbeiro && (
                      <div className="flex items-center">
                        <input
                          {...register('ativo')}
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 bg-white border-silver-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <label className="ml-2 text-sm text-primary-900">
                          Barbeiro ativo
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-silver-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {isSubmitting ? 'Salvando...' : (editingBarbeiro ? 'Atualizar' : 'Criar')}
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