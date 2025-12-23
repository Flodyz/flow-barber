const prisma = require('../database/prisma');

class ServicoModel {
  static async criar(servicoData) {
    try {
      const { nome, descricao, preco, duracao } = servicoData;
      
      const servico = await prisma.servico.create({
        data: {
          nome,
          descricao,
          preco: parseFloat(preco),
          duracao: parseInt(duracao)
        }
      });

      return {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        preco: parseFloat(servico.preco),
        duracao: servico.duracao
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Já existe um serviço com este nome');
      }
      throw error;
    }
  }
  
  static async buscarTodos() {
    try {
      const servicos = await prisma.servico.findMany({
        include: {
          agendamentos: {
            select: { id: true, status: true }
          }
        },
        orderBy: { nome: 'asc' }
      });

      return servicos.map(s => ({
        ...s,
        preco: parseFloat(s.preco),
        created_at: s.createdAt ? s.createdAt.toISOString() : null,
        updated_at: s.updatedAt ? s.updatedAt.toISOString() : null,
        total_agendamentos: s.agendamentos.length,
        agendamentos_concluidos: s.agendamentos.filter(a => a.status === 'CONCLUIDO').length
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorId(id) {
    try {
      const servico = await prisma.servico.findUnique({
        where: { id: parseInt(id) },
        include: {
          agendamentos: {
            select: { id: true, status: true }
          }
        }
      });

      if (!servico) return null;

      return {
        ...servico,
        preco: parseFloat(servico.preco),
        created_at: servico.createdAt ? servico.createdAt.toISOString() : null,
        updated_at: servico.updatedAt ? servico.updatedAt.toISOString() : null,
        total_agendamentos: servico.agendamentos.length
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async atualizar(id, servicoData) {
    try {
      const { nome, descricao, preco, duracao } = servicoData;
      
      const updateData = {};
      if (nome) updateData.nome = nome;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (preco) updateData.preco = parseFloat(preco);
      if (duracao) updateData.duracao = parseInt(duracao);

      const servico = await prisma.servico.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      // Retornar dados completos atualizados
      return { 
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        preco: parseFloat(servico.preco),
        duracao: servico.duracao,
        ativo: servico.ativo,
        created_at: servico.createdAt ? servico.createdAt.toISOString() : null,
        updated_at: servico.updatedAt ? servico.updatedAt.toISOString() : null,
        changes: 1
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id: parseInt(id), changes: 0 };
      }
      if (error.code === 'P2002') {
        throw new Error('Já existe um serviço com este nome');
      }
      throw error;
    }
  }
  
  static async deletar(id) {
    try {
      // Verificar se há agendamentos futuros
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const agendamentosFuturos = await prisma.agendamento.count({
        where: {
          servicoId: parseInt(id),
          dataAgendamento: { gte: hoje },
          status: { notIn: ['CANCELADO'] }
        }
      });

      if (agendamentosFuturos > 0) {
        throw new Error('Não é possível excluir um serviço com agendamentos futuros');
      }

      await prisma.servico.delete({
        where: { id: parseInt(id) }
      });

      return { id: parseInt(id), changes: 1 };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id: parseInt(id), changes: 0 };
      }
      if (error.code === 'P2003') {
        throw new Error('Não é possível excluir um serviço com agendamentos');
      }
      throw error;
    }
  }
  
  static async buscarEstatisticas(id) {
    try {
      const agendamentos = await prisma.agendamento.findMany({
        where: { servicoId: parseInt(id) },
        select: {
          status: true,
          valorTotal: true
        }
      });

      const total_agendamentos = agendamentos.length;
      const concluidos = agendamentos.filter(a => a.status === 'CONCLUIDO').length;
      const cancelados = agendamentos.filter(a => a.status === 'CANCELADO').length;
      
      const valoresCompletos = agendamentos
        .filter(a => a.status === 'CONCLUIDO' && a.valorTotal)
        .map(a => parseFloat(a.valorTotal));
      
      const receita_total = valoresCompletos.reduce((a, b) => a + b, 0);

      return {
        total_agendamentos,
        concluidos,
        cancelados,
        receita_total
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarMaisPopulares(limite = 5) {
    try {
      const servicos = await prisma.servico.findMany({
        include: {
          agendamentos: {
            where: { status: 'CONCLUIDO' },
            select: { id: true }
          }
        }
      });

      // Ordenar por número de agendamentos
      const servicosComContagem = servicos
        .map(s => ({
          id: s.id,
          nome: s.nome,
          descricao: s.descricao,
          preco: parseFloat(s.preco),
          duracao: s.duracao,
          total_agendamentos: s.agendamentos.length
        }))
        .sort((a, b) => b.total_agendamentos - a.total_agendamentos)
        .slice(0, limite);

      return servicosComContagem;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ServicoModel;
