import api from './api';
import type { Servico, ServicoFormData, ApiResponse } from '../types';

export const servicoService = {
  // Listar todos os serviços
  async listar(): Promise<Servico[]> {
    const response = await api.get<ApiResponse<Servico[]>>('/servicos');
    return response.data.data;
  },

  // Listar apenas serviços ativos
  async listarAtivos(): Promise<Servico[]> {
    const response = await api.get<ApiResponse<Servico[]>>('/servicos/ativos');
    return response.data.data;
  },

  // Buscar serviço por ID
  async buscarPorId(id: number): Promise<Servico> {
    const response = await api.get<ApiResponse<Servico>>(`/servicos/${id}`);
    return response.data.data;
  },

  // Criar novo serviço
  async criar(servico: ServicoFormData): Promise<Servico> {
    const response = await api.post<ApiResponse<Servico>>('/servicos', servico);
    return response.data.data;
  },

  // Atualizar serviço
  async atualizar(id: number, servico: ServicoFormData): Promise<Servico> {
    const response = await api.put<ApiResponse<Servico>>(`/servicos/${id}`, servico);
    return response.data.data;
  },

  // Deletar serviço
  async deletar(id: number): Promise<void> {
    await api.delete(`/servicos/${id}`);
  },

  // Buscar estatísticas do serviço
  async buscarEstatisticas(id: number) {
    const response = await api.get(`/servicos/${id}/estatisticas`);
    return response.data.data;
  }
};