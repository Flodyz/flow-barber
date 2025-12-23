import api from './api';
import type { Agendamento, AgendamentoFormData, ApiResponse, DisponibilidadeResponse } from '../types';

export const agendamentoService = {
  // Listar todos os agendamentos
  async listar(): Promise<Agendamento[]> {
    const response = await api.get<ApiResponse<Agendamento[]>>('/agendamentos');
    return response.data.data;
  },

  // Buscar agendamento por ID
  async buscarPorId(id: number): Promise<Agendamento> {
    const response = await api.get<ApiResponse<Agendamento>>(`/agendamentos/${id}`);
    return response.data.data;
  },

  // Buscar agendamentos por data
  async buscarPorData(data: string): Promise<Agendamento[]> {
    const response = await api.get<ApiResponse<Agendamento[]>>(`/agendamentos/data/${data}`);
    return response.data.data;
  },

  // Buscar agendamentos por barbeiro
  async buscarPorBarbeiro(barbeiroId: number, data?: string): Promise<Agendamento[]> {
    let url = `/agendamentos/barbeiro/${barbeiroId}`;
    if (data) {
      url += `?data=${data}`;
    }
    const response = await api.get<ApiResponse<Agendamento[]>>(url);
    return response.data.data;
  },

  // Buscar próximos agendamentos
  async buscarProximos(limite = 10): Promise<Agendamento[]> {
    const response = await api.get<ApiResponse<Agendamento[]>>(`/agendamentos/proximos?limite=${limite}`);
    return response.data.data;
  },

  // Criar novo agendamento
  async criar(agendamento: AgendamentoFormData): Promise<Agendamento> {
    const response = await api.post<ApiResponse<Agendamento>>('/agendamentos', agendamento);
    return response.data.data;
  },

  // Atualizar agendamento
  async atualizar(id: number, dados: { status?: string; observacoes?: string }): Promise<Agendamento> {
    const response = await api.put<ApiResponse<Agendamento>>(`/agendamentos/${id}`, dados);
    return response.data.data;
  },

  // Cancelar agendamento
  async cancelar(id: number, motivo?: string): Promise<void> {
    await api.patch(`/agendamentos/${id}/cancelar`, { motivo });
  },
  
  // Deletar agendamento
  async deletar(id: number): Promise<void> {
    await api.delete(`/agendamentos/${id}`);
  },

  // Verificar disponibilidade
  async verificarDisponibilidade(
    barbeiroId: number, 
    data: string, 
    horaInicio: string, 
    servicoId: number
  ): Promise<DisponibilidadeResponse> {
    const params = new URLSearchParams({
      barbeiro_id: barbeiroId.toString(),
      data,
      hora_inicio: horaInicio,
      servico_id: servicoId.toString()
    });
    
    const response = await api.get<ApiResponse<DisponibilidadeResponse>>(`/agendamentos/disponibilidade?${params}`);
    return response.data.data;
  }
};