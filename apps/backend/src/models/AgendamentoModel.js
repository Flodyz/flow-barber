const prisma = require('../database/prisma');

class AgendamentoModel {
  static async criar(agendamentoData) {
    try {
      const { cliente_id, servico_id, barbeiro_id, data_agendamento, hora_inicio, observacoes, status = 'AGENDADO' } = agendamentoData;
      
      // Buscar serviço para calcular hora_fim e valor_total
      const servico = await prisma.servico.findUnique({
        where: { id: parseInt(servico_id) }
      });

      if (!servico) {
        throw new Error('Serviço não encontrado');
      }

      // Calcular hora_fim
      const [horas, minutos] = hora_inicio.split(':').map(Number);
      const inicioMinutos = horas * 60 + minutos;
      const fimMinutos = inicioMinutos + servico.duracao;
      
      const horaFim = Math.floor(fimMinutos / 60);
      const minutoFim = fimMinutos % 60;
      const hora_fim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
      
      const agendamento = await prisma.agendamento.create({
        data: {
          clienteId: parseInt(cliente_id),
          servicoId: parseInt(servico_id),
          barbeiroId: parseInt(barbeiro_id),
          dataAgendamento: new Date(data_agendamento),
          horaInicio: hora_inicio,
          horaFim: hora_fim,
          valorTotal: servico.preco,
          observacoes,
          status
        }
      });

      return {
        id: agendamento.id,
        cliente_id: agendamento.clienteId,
        servico_id: agendamento.servicoId,
        barbeiro_id: agendamento.barbeiroId,
        data_agendamento: agendamento.dataAgendamento.toISOString().split('T')[0],
        hora_inicio: agendamento.horaInicio,
        hora_fim: agendamento.horaFim,
        valor_total: parseFloat(agendamento.valorTotal),
        observacoes: agendamento.observacoes,
        status: agendamento.status
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Já existe um agendamento neste horário');
      }
      if (error.code === 'P2003') {
        throw new Error('Cliente, serviço ou barbeiro não encontrado');
      }
      throw error;
    }
  }
  
  static async verificarDisponibilidade(barbeiroId, dataAgendamento, horaInicio, horaFim) {
    try {
      const conflitos = await prisma.agendamento.findMany({
        where: {
          barbeiroId: parseInt(barbeiroId),
          dataAgendamento: new Date(dataAgendamento),
          status: { not: 'CANCELADO' },
          OR: [
            { horaInicio: { lt: horaFim }, horaFim: { gt: horaInicio } },
            { horaInicio: { lt: horaInicio }, horaFim: { gt: horaInicio } },
            { horaInicio: { gte: horaInicio, lt: horaFim } }
          ]
        }
      });

      return conflitos.length === 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarTodos() {
    try {
      const agendamentos = await prisma.agendamento.findMany({
        include: {
          cliente: { select: { nome: true, telefone: true } },
          servico: { select: { nome: true, duracao: true } },
          barbeiro: {
            select: {
              usuario: { select: { nome: true } }
            }
          }
        },
        orderBy: [
          { dataAgendamento: 'desc' },
          { horaInicio: 'desc' }
        ]
      });

      return agendamentos.map(a => ({
        ...a,
        cliente_nome: a.cliente.nome,
        cliente_telefone: a.cliente.telefone,
        servico_nome: a.servico.nome,
        duracao: a.servico.duracao,
        barbeiro_nome: a.barbeiro.usuario.nome,
        data_agendamento: a.dataAgendamento.toISOString().split('T')[0],
        hora_inicio: a.horaInicio,
        hora_fim: a.horaFim,
        valor_total: parseFloat(a.valorTotal),
        cliente_id: a.clienteId,
        servico_id: a.servicoId,
        barbeiro_id: a.barbeiroId,
        created_at: a.createdAt ? a.createdAt.toISOString() : null,
        updated_at: a.updatedAt ? a.updatedAt.toISOString() : null
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorId(id) {
    try {
      const agendamento = await prisma.agendamento.findUnique({
        where: { id: parseInt(id) },
        include: {
          cliente: { select: { nome: true, telefone: true, email: true } },
          servico: { select: { nome: true, duracao: true, preco: true } },
          barbeiro: {
            select: {
              telefone: true,
              usuario: { select: { nome: true, email: true } }
            }
          }
        }
      });

      if (!agendamento) return null;

      return {
        ...agendamento,
        cliente_nome: agendamento.cliente.nome,
        cliente_telefone: agendamento.cliente.telefone,
        cliente_email: agendamento.cliente.email,
        servico_nome: agendamento.servico.nome,
        duracao: agendamento.servico.duracao,
        barbeiro_nome: agendamento.barbeiro.usuario.nome,
        barbeiro_telefone: agendamento.barbeiro.telefone,
        barbeiro_email: agendamento.barbeiro.usuario.email,
        data_agendamento: agendamento.dataAgendamento.toISOString().split('T')[0],
        hora_inicio: agendamento.horaInicio,
        hora_fim: agendamento.horaFim,
        valor_total: parseFloat(agendamento.valorTotal),
        cliente_id: agendamento.clienteId,
        servico_id: agendamento.servicoId,
        barbeiro_id: agendamento.barbeiroId
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorCliente(clienteId) {
    try {
      const agendamentos = await prisma.agendamento.findMany({
        where: { clienteId: parseInt(clienteId) },
        include: {
          servico: { select: { nome: true, duracao: true } },
          barbeiro: {
            select: {
              usuario: { select: { nome: true } }
            }
          }
        },
        orderBy: [
          { dataAgendamento: 'desc' },
          { horaInicio: 'desc' }
        ]
      });

      return agendamentos.map(a => ({
        ...a,
        servico_nome: a.servico.nome,
        duracao: a.servico.duracao,
        barbeiro_nome: a.barbeiro.usuario.nome,
        data_agendamento: a.dataAgendamento.toISOString().split('T')[0],
        hora_inicio: a.horaInicio,
        hora_fim: a.horaFim,
        valor_total: parseFloat(a.valorTotal),
        servico_id: a.servicoId,
        barbeiro_id: a.barbeiroId,
        created_at: a.createdAt ? a.createdAt.toISOString() : null,
        updated_at: a.updatedAt ? a.updatedAt.toISOString() : null
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorBarbeiro(barbeiroId, data = null) {
    try {
      const where = {
        barbeiroId: parseInt(barbeiroId)
      };

      if (data) {
        where.dataAgendamento = new Date(data);
      }

      const agendamentos = await prisma.agendamento.findMany({
        where,
        include: {
          cliente: { select: { nome: true, telefone: true } },
          servico: { select: { nome: true, duracao: true } }
        },
        orderBy: [
          { dataAgendamento: 'asc' },
          { horaInicio: 'asc' }
        ]
      });

      return agendamentos.map(a => ({
        ...a,
        cliente_nome: a.cliente.nome,
        cliente_telefone: a.cliente.telefone,
        servico_nome: a.servico.nome,
        duracao: a.servico.duracao,
        data_agendamento: a.dataAgendamento.toISOString().split('T')[0],
        hora_inicio: a.horaInicio,
        hora_fim: a.horaFim,
        valor_total: parseFloat(a.valorTotal),
        cliente_id: a.clienteId,
        servico_id: a.servicoId,
        created_at: a.createdAt ? a.createdAt.toISOString() : null,
        updated_at: a.updatedAt ? a.updatedAt.toISOString() : null
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorData(data) {
    try {
      const agendamentos = await prisma.agendamento.findMany({
        where: { dataAgendamento: new Date(data) },
        include: {
          cliente: { select: { nome: true, telefone: true } },
          servico: { select: { nome: true, duracao: true } },
          barbeiro: {
            select: {
              usuario: { select: { nome: true } }
            }
          }
        },
        orderBy: { horaInicio: 'asc' }
      });

      return agendamentos.map(a => ({
        ...a,
        cliente_nome: a.cliente.nome,
        cliente_telefone: a.cliente.telefone,
        servico_nome: a.servico.nome,
        duracao: a.servico.duracao,
        barbeiro_nome: a.barbeiro.usuario.nome,
        data_agendamento: a.dataAgendamento.toISOString().split('T')[0],
        hora_inicio: a.horaInicio,
        hora_fim: a.horaFim,
        valor_total: parseFloat(a.valorTotal),
        cliente_id: a.clienteId,
        servico_id: a.servicoId,
        barbeiro_id: a.barbeiroId,
        created_at: a.createdAt ? a.createdAt.toISOString() : null,
        updated_at: a.updatedAt ? a.updatedAt.toISOString() : null
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async atualizar(id, agendamentoData) {
    try {
      const { data_agendamento, hora_inicio, observacoes, status } = agendamentoData;
      
      const updateData = {};
      
      if (data_agendamento) updateData.dataAgendamento = new Date(data_agendamento);
      if (hora_inicio) {
        updateData.horaInicio = hora_inicio;
        
        // Recalcular hora_fim se hora_inicio mudou
        const agendamento = await prisma.agendamento.findUnique({
          where: { id: parseInt(id) },
          include: { servico: { select: { duracao: true } } }
        });

        if (agendamento) {
          const [horas, minutos] = hora_inicio.split(':').map(Number);
          const inicioMinutos = horas * 60 + minutos;
          const fimMinutos = inicioMinutos + agendamento.servico.duracao;
          
          const horaFim = Math.floor(fimMinutos / 60);
          const minutoFim = fimMinutos % 60;
          updateData.horaFim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
        }
      }
      
      if (observacoes !== undefined) updateData.observacoes = observacoes;
      if (status) updateData.status = status.toUpperCase();

      const updated = await prisma.agendamento.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return { 
        id: updated.id,
        changes: 1,
        data_agendamento: updated.dataAgendamento?.toISOString().split('T')[0],
        hora_inicio: updated.horaInicio,
        hora_fim: updated.horaFim,
        status: updated.status,
        observacoes: updated.observacoes
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id: parseInt(id), changes: 0 };
      }
      throw error;
    }
  }
  
  static async atualizarStatus(id, status) {
    try {
      const agendamento = await prisma.agendamento.update({
        where: { id: parseInt(id) },
        data: { status: status.toUpperCase() }
      });

      return { id: agendamento.id, status: agendamento.status, changes: 1 };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id: parseInt(id), changes: 0 };
      }
      throw error;
    }
  }
  
  static async deletar(id) {
    try {
      await prisma.agendamento.delete({
        where: { id: parseInt(id) }
      });

      return { id: parseInt(id), changes: 1 };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id: parseInt(id), changes: 0 };
      }
      throw error;
    }
  }
  
  static async buscarProximos(limite = 10) {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          dataAgendamento: { gte: hoje },
          status: { notIn: ['CANCELADO', 'CONCLUIDO'] }
        },
        include: {
          cliente: { select: { nome: true, telefone: true } },
          servico: { select: { nome: true, duracao: true } },
          barbeiro: {
            select: {
              usuario: { select: { nome: true } }
            }
          }
        },
        orderBy: [
          { dataAgendamento: 'asc' },
          { horaInicio: 'asc' }
        ],
        take: limite
      });

      return agendamentos.map(a => ({
        ...a,
        cliente_nome: a.cliente.nome,
        cliente_telefone: a.cliente.telefone,
        servico_nome: a.servico.nome,
        duracao: a.servico.duracao,
        barbeiro_nome: a.barbeiro.usuario.nome,
        data_agendamento: a.dataAgendamento.toISOString().split('T')[0],
        hora_inicio: a.horaInicio,
        hora_fim: a.horaFim,
        valor_total: parseFloat(a.valorTotal),
        cliente_id: a.clienteId,
        servico_id: a.servicoId,
        barbeiro_id: a.barbeiroId,
        created_at: a.createdAt ? a.createdAt.toISOString() : null,
        updated_at: a.updatedAt ? a.updatedAt.toISOString() : null
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AgendamentoModel;
