import api from './api';
import type { Barbeiro, BarbeiroFormData, ApiResponse } from '../types';

export const barbeiroService = {
  // Listar todos os barbeiros
  async listar(): Promise<Barbeiro[]> {
    const response = await api.get<ApiResponse<Barbeiro[]>>('/barbeiros');
    return response.data.data;
  },

  // Buscar barbeiro por ID
  async buscarPorId(id: number): Promise<Barbeiro> {
    const response = await api.get<ApiResponse<Barbeiro>>(`/barbeiros/${id}`);
    return response.data.data;
  },

  // Buscar barbeiros disponíveis
  async buscarDisponiveis(data: string, horaInicio: string, duracao: number): Promise<Barbeiro[]> {
    const params = new URLSearchParams({
      data,
      hora_inicio: horaInicio,
      duracao: duracao.toString()
    });
    
    const response = await api.get<ApiResponse<Barbeiro[]>>(`/barbeiros/disponiveis?${params}`);
    return response.data.data;
  },

  // Buscar horários disponíveis de um barbeiro
  async buscarHorariosDisponiveis(id: number, data: string): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>(`/barbeiros/${id}/horarios-disponiveis?data=${data}`);
    return response.data.data;
  },

  // Atualizar barbeiro
  async atualizar(id: number, dados: BarbeiroFormData): Promise<Barbeiro> {
    const response = await api.put<ApiResponse<Barbeiro>>(`/barbeiros/${id}`, dados);
    return response.data.data;
  },

  // Criar novo barbeiro
  async criar(dados: BarbeiroFormData): Promise<Barbeiro> {
    const response = await api.post<ApiResponse<Barbeiro>>('/barbeiros', dados);
    return response.data.data;
  },

  // Deletar barbeiro
  async deletar(id: number): Promise<void> {
    await api.delete(`/barbeiros/${id}`);
  },

  // Buscar estatísticas do barbeiro
  async buscarEstatisticas(id: number, periodo = 30) {
    const response = await api.get(`/barbeiros/${id}/estatisticas?periodo=${periodo}`);
    return response.data.data;
  }
};