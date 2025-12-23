import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Phone, Mail, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { clienteService } from '../services/clienteService';
import type { Cliente, ClienteFormData } from '../types';

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<ClienteFormData>();

  // Carregar clientes
  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      // Limpar filtro ao recarregar
      setSearchTerm('');
      // Limpar estado para forçar re-renderização
      setClientes([]);
      const data = await clienteService.listar();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Buscar clientes
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      carregarClientes();
      return;
    }

    try {
      setLoading(true);
      const data = await clienteService.buscar(searchTerm);
      setClientes(data);
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para novo cliente
  const handleNovoCliente = () => {
    reset();
    setEditingCliente(null);
    setShowModal(true);
  };

  // Abrir modal para editar cliente
  const handleEditarCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setValue('nome', cliente.nome);
    setValue('telefone', cliente.telefone);
    setValue('email', cliente.email || '');
    setValue('data_nascimento', cliente.data_nascimento || '');
    setValue('endereco', cliente.endereco || '');
    setValue('observacoes', cliente.observacoes || '');
    setShowModal(true);
  };

  // Salvar cliente (criar ou atualizar)
  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (editingCliente) {
        await clienteService.atualizar(editingCliente.id, data);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await clienteService.criar(data);
        toast.success('Cliente criado com sucesso!');
      }
      
      // Recarregar dados antes de fechar o modal
      await carregarClientes();
      setShowModal(false);
      reset();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      const message = error.response?.data?.message || 'Erro ao salvar cliente';
      toast.error(message);
    }
  };

  // Deletar cliente
  const handleDeletarCliente = async (cliente: Cliente) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`)) {
      return;
    }

    try {
      await clienteService.deletar(cliente.id);
      toast.success('Cliente excluído com sucesso!');
      carregarClientes();
    } catch (error: any) {
      console.error('Erro ao deletar cliente:', error);
      const message = error.response?.data?.message || 'Erro ao excluir cliente';
      toast.error(message);
    }
  };

  const clientesFiltrados = searchTerm 
    ? clientes 
    : clientes;

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Clientes</h1>
          <p className="mt-2 text-sm text-silver-600">
            Gerencie os clientes da barbearia
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleNovoCliente}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Barra de busca */}
      <div className="mt-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-silver-600" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10 w-full"
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-secondary"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="mt-6">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-silver-700">
              <thead className="bg-silver-100">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Agendamentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Último Agendamento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-silver-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-silver-600">
                      Carregando...
                    </td>
                  </tr>
                ) : clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-silver-600">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-primary-900">
                              {cliente.nome}
                            </div>
                            {cliente.data_nascimento && (
                              <div className="text-sm text-silver-600 flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-silver-500" />
                                {new Date(cliente.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary-900 flex items-center">
                          <Phone className="h-3 w-3 mr-2 text-silver-600" />
                          {cliente.telefone}
                        </div>
                        {cliente.email && (
                          <div className="text-sm text-silver-700 flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-2 text-silver-500" />
                            {cliente.email}
                          </div>
                        )}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                        {cliente.total_agendamentos || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-silver-700">
                        {cliente.ultimo_agendamento 
                          ? new Date(cliente.ultimo_agendamento).toLocaleDateString('pt-BR')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditarCliente(cliente)}
                          className="text-silver-600 hover:text-primary-900 mr-3"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletarCliente(cliente)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-silver-300">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-primary-900 mb-4">
                    {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
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
                        placeholder="Nome completo"
                      />
                      {errors.nome && (
                        <p className="mt-1 text-sm text-red-500">{errors.nome.message}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Telefone *
                      </label>
                      <input
                        {...register('telefone', { required: 'Telefone é obrigatório' })}
                        className="input-field w-full"
                        placeholder="(11) 99999-9999"
                      />
                      {errors.telefone && (
                        <p className="mt-1 text-sm text-red-400">{errors.telefone.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Email
                      </label>
                      <input
                        {...register('email', {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                        type="email"
                        className="input-field w-full"
                        placeholder="email@exemplo.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Data de nascimento */}
                    <div>
                      <label className="block text-sm font-medium text-primary-900 mb-1">
                        Data de Nascimento
                      </label>
                      <input
                        {...register('data_nascimento')}
                        type="date"
                        className="input-field w-full"
                      />
                    </div>

                    {/* Endereço */}
                    <div>
                      <label className="block text-sm font-medium text-silver-200 mb-1">
                        Endereço
                      </label>
                      <input
                        {...register('endereco')}
                        className="input-field w-full"
                        placeholder="Endereço completo"
                      />
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
                        placeholder="Observações sobre o cliente..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-silver-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {isSubmitting ? 'Salvando...' : (editingCliente ? 'Atualizar' : 'Criar')}
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