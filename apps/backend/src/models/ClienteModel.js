const prisma = require('../database/prisma');

class ClienteModel {
  static async criar(clienteData) {
    try {
      const { nome, telefone, email, data_nascimento, endereco, observacoes } = clienteData;
      
      const cliente = await prisma.cliente.create({
        data: {
          nome,
          telefone,
          email,
          dataNascimento: data_nascimento ? new Date(data_nascimento) : null,
          endereco,
          observacoes
        }
      });

      return { id: cliente.id, nome, telefone, email, data_nascimento, endereco, observacoes };
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarTodos() {
    try {
      const clientes = await prisma.cliente.findMany({
        where: { ativo: true },
        include: {
          agendamentos: {
            where: { status: { not: 'CANCELADO' } },
            select: { id: true, dataAgendamento: true }
          }
        },
        orderBy: { nome: 'asc' }
      });

      return clientes.map(c => ({
        ...c,
        data_nascimento: c.dataNascimento ? c.dataNascimento.toISOString().split('T')[0] : null,
        createdAt: c.createdAt ? c.createdAt.toISOString() : null,
        updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
        total_agendamentos: c.agendamentos.length,
        ultimo_agendamento: c.agendamentos.length > 0 
          ? new Date(Math.max(...c.agendamentos.map(a => new Date(a.dataAgendamento)))).toISOString().split('T')[0]
          : null
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorId(id) {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(id), ativo: true }
      });

      if (!cliente) return null;

      return {
        ...cliente,
        data_nascimento: cliente.dataNascimento ? cliente.dataNascimento.toISOString().split('T')[0] : null,
        createdAt: cliente.createdAt ? cliente.createdAt.toISOString() : null,
        updatedAt: cliente.updatedAt ? cliente.updatedAt.toISOString() : null
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorNomeOuTelefone(termo) {
    try {
      const clientes = await prisma.cliente.findMany({
        where: {
          AND: [
            { ativo: true },
            {
              OR: [
                { nome: { contains: termo, mode: 'insensitive' } },
                { telefone: { contains: termo } }
              ]
            }
          ]
        },
        orderBy: { nome: 'asc' }
      });

      return clientes.map(c => ({
        ...c,
        data_nascimento: c.dataNascimento ? c.dataNascimento.toISOString().split('T')[0] : null,
        createdAt: c.createdAt ? c.createdAt.toISOString() : null,
        updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async atualizar(id, clienteData) {
    try {
      const { nome, telefone, email, data_nascimento, endereco, observacoes } = clienteData;
      
      const cliente = await prisma.cliente.update({
        where: { id: parseInt(id) },
        data: {
          nome,
          telefone,
          email,
          dataNascimento: data_nascimento ? new Date(data_nascimento) : null,
          endereco,
          observacoes
        }
      });

      return { id: cliente.id, ...clienteData, changes: 1 };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id, changes: 0 };
      }
      throw error;
    }
  }
  
  static async deletar(id) {
    try {
      await prisma.cliente.update({
        where: { id: parseInt(id) },
        data: { ativo: false }
      });

      return { id, deleted: true, changes: 1 };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id, deleted: false, changes: 0 };
      }
      throw error;
    }
  }
  
  static async buscarAgendamentos(clienteId) {
    try {
      const agendamentos = await prisma.agendamento.findMany({
        where: { clienteId: parseInt(clienteId) },
        include: {
          servico: {
            select: { nome: true, preco: true, duracao: true }
          },
          barbeiro: {
            include: {
              usuario: {
                select: { nome: true }
              }
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
        data_agendamento: a.dataAgendamento,
        hora_inicio: a.horaInicio,
        hora_fim: a.horaFim,
        valor_total: a.valorTotal,
        servico_nome: a.servico.nome,
        preco: a.servico.preco,
        duracao: a.servico.duracao,
        barbeiro_nome: a.barbeiro.usuario.nome,
        status: a.status.toLowerCase()
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClienteModel;
