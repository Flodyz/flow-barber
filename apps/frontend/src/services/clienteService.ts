import api from './api';
import type { Cliente, ClienteFormData, ApiResponse } from '../types';

export const clienteService = {
  // Listar todos os clientes
  async listar(): Promise<Cliente[]> {
    const response = await api.get<ApiResponse<Cliente[]>>('/clientes');
    return response.data.data;
  },

  // Buscar cliente por ID
  async buscarPorId(id: number): Promise<Cliente> {
    const response = await api.get<ApiResponse<Cliente>>(`/clientes/${id}`);
    return response.data.data;
  },

  // Buscar clientes por termo (nome ou telefone)
  async buscar(termo: string): Promise<Cliente[]> {
    const response = await api.get<ApiResponse<Cliente[]>>(`/clientes/buscar?termo=${encodeURIComponent(termo)}`);
    return response.data.data;
  },

  // Criar novo cliente
  async criar(cliente: ClienteFormData): Promise<Cliente> {
    const response = await api.post<ApiResponse<Cliente>>('/clientes', cliente);
    return response.data.data;
  },

  // Atualizar cliente
  async atualizar(id: number, cliente: ClienteFormData): Promise<Cliente> {
    const response = await api.put<ApiResponse<Cliente>>(`/clientes/${id}`, cliente);
    return response.data.data;
  },

  // Deletar cliente
  async deletar(id: number): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },

  // Buscar agendamentos do cliente
  async buscarAgendamentos(id: number) {
    const response = await api.get(`/clientes/${id}/agendamentos`);
    return response.data.data;
  }
};