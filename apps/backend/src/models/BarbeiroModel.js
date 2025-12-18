const prisma = require('../database/prisma');

class BarbeiroModel {
  static async buscarTodos() {
    try {
      const barbeiros = await prisma.barbeiro.findMany({
        where: { usuario: { ativo: true, tipo: 'BARBEIRO' } },
        include: {
          usuario: {
            select: { nome: true, email: true, ativo: true }
          },
          agendamentos: {
            select: { id: true, status: true }
          }
        },
        orderBy: { usuario: { nome: 'asc' } }
      });

      return barbeiros.map(b => ({
        ...b,
        nome: b.usuario.nome,
        email: b.usuario.email,
        ativo: b.usuario.ativo,
        horario_inicio: b.horarioInicio,
        horario_fim: b.horarioFim,
        dias_trabalho: b.diasTrabalho,
        usuario_id: b.usuarioId,
        created_at: b.createdAt ? b.createdAt.toISOString() : null,
        updated_at: b.updatedAt ? b.updatedAt.toISOString() : null,
        total_agendamentos: b.agendamentos.length,
        agendamentos_concluidos: b.agendamentos.filter(a => a.status === 'CONCLUIDO').length
      }));
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorId(id) {
    try {
      const barbeiro = await prisma.barbeiro.findUnique({
        where: { id: parseInt(id) },
        include: {
          usuario: {
            select: { nome: true, email: true, ativo: true }
          }
        }
      });

      if (!barbeiro || !barbeiro.usuario.ativo) return null;

      return {
        ...barbeiro,
        nome: barbeiro.usuario.nome,
        email: barbeiro.usuario.email,
        ativo: barbeiro.usuario.ativo,
        horario_inicio: barbeiro.horarioInicio,
        horario_fim: barbeiro.horarioFim,
        dias_trabalho: barbeiro.diasTrabalho,
        usuario_id: barbeiro.usuarioId,
        created_at: barbeiro.createdAt ? barbeiro.createdAt.toISOString() : null,
        updated_at: barbeiro.updatedAt ? barbeiro.updatedAt.toISOString() : null
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarPorUsuarioId(usuarioId) {
    try {
      const barbeiro = await prisma.barbeiro.findUnique({
        where: { usuarioId: parseInt(usuarioId) },
        include: {
          usuario: {
            select: { nome: true, email: true, ativo: true }
          }
        }
      });

      if (!barbeiro || !barbeiro.usuario.ativo) return null;

      return {
        ...barbeiro,
        nome: barbeiro.usuario.nome,
        email: barbeiro.usuario.email,
        ativo: barbeiro.usuario.ativo,
        horario_inicio: barbeiro.horarioInicio,
        horario_fim: barbeiro.horarioFim,
        dias_trabalho: barbeiro.diasTrabalho,
        usuario_id: barbeiro.usuarioId,
        created_at: barbeiro.createdAt ? barbeiro.createdAt.toISOString() : null,
        updated_at: barbeiro.updatedAt ? barbeiro.updatedAt.toISOString() : null
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarDisponiveisData(data, horaInicio, duracao) {
    try {
      // Calcular hora de fim
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const inicioMinutos = horas * 60 + minutos;
      const fimMinutos = inicioMinutos + duracao;
      
      const horaFim = Math.floor(fimMinutos / 60);
      const minutoFim = fimMinutos % 60;
      const hora_fim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
      
      // Buscar barbeiros sem conflitos
      const barbeiros = await prisma.barbeiro.findMany({
        where: {
          usuario: { ativo: true, tipo: 'BARBEIRO' }
        },
        include: {
          usuario: {
            select: { nome: true, email: true }
          },
          agendamentos: {
            where: {
              dataAgendamento: new Date(data),
              status: { not: 'CANCELADO' },
              OR: [
                { horaInicio: { lt: hora_fim }, horaFim: { gt: horaInicio } },
                { horaInicio: { lt: horaInicio }, horaFim: { gt: horaInicio } },
                { horaInicio: { gte: horaInicio, lt: hora_fim } }
              ]
            }
          }
        },
        orderBy: { usuario: { nome: 'asc' } }
      });

      // Filtrar apenas os sem conflitos
      return barbeiros
        .filter(b => b.agendamentos.length === 0)
        .map(b => ({
          ...b,
          nome: b.usuario.nome,
          email: b.usuario.email,
          horario_inicio: b.horarioInicio,
          horario_fim: b.horarioFim,
          dias_trabalho: b.diasTrabalho,
          usuario_id: b.usuarioId
        }));
    } catch (error) {
      throw error;
    }
  }
  
  static async buscarHorariosDisponiveis(barbeiroId, data) {
    try {
      const barbeiro = await prisma.barbeiro.findUnique({
        where: { id: parseInt(barbeiroId) },
        select: {
          horarioInicio: true,
          horarioFim: true,
          diasTrabalho: true
        }
      });

      if (!barbeiro) throw new Error('Barbeiro não encontrado');

      // Verificar se trabalha no dia da semana
      const dayOfWeek = new Date(data + 'T00:00:00').getDay();
      const diasTrabalho = barbeiro.diasTrabalho.split(',').map(Number);
      
      if (!diasTrabalho.includes(dayOfWeek)) {
        return [];
      }

      // Buscar agendamentos do dia
      const agendamentos = await prisma.agendamento.findMany({
        where: {
          barbeiroId: parseInt(barbeiroId),
          dataAgendamento: new Date(data),
          status: { not: 'CANCELADO' }
        },
        select: { horaInicio: true, horaFim: true },
        orderBy: { horaInicio: 'asc' }
      });

      // Gerar slots disponíveis
      const slots = gerarSlotsDisponiveis(
        barbeiro.horarioInicio,
        barbeiro.horarioFim,
        agendamentos.map(a => ({
          hora_inicio: a.horaInicio,
          hora_fim: a.horaFim
        }))
      );

      return slots;
    } catch (error) {
      throw error;
    }
  }
  
  static async atualizar(id, barbeiroData) {
    try {
      const { telefone, especialidades, horario_inicio, horario_fim, dias_trabalho } = barbeiroData;
      
      const barbeiro = await prisma.barbeiro.update({
        where: { id: parseInt(id) },
        data: {
          telefone,
          especialidades,
          horarioInicio: horario_inicio,
          horarioFim: horario_fim,
          diasTrabalho: dias_trabalho
        }
      });

      return { id: barbeiro.id, ...barbeiroData, changes: 1 };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id, changes: 0 };
      }
      throw error;
    }
  }
  
  static async buscarEstatisticas(id) {
    try {
      const agendamentos = await prisma.agendamento.findMany({
        where: { barbeiroId: parseInt(id) },
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
}

// Função auxiliar para gerar slots disponíveis
function gerarSlotsDisponiveis(horaInicio, horaFim, agendamentos) {
  const slots = [];
  const intervalo = 30; // Intervalos de 30 minutos

  const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
  const [fimHoras, fimMinutos] = horaFim.split(':').map(Number);

  const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos;
  const fimTotalMinutos = fimHoras * 60 + fimMinutos;

  for (let minutos = inicioTotalMinutos; minutos < fimTotalMinutos; minutos += intervalo) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    const horario = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // Verificar se não conflita com agendamentos existentes
    const conflito = agendamentos.some(agendamento => {
      return horario >= agendamento.hora_inicio && horario < agendamento.hora_fim;
    });

    if (!conflito) {
      slots.push(horario);
    }
  }

  return slots;
}

module.exports = BarbeiroModel;
