const AgendamentoModel = require('../models/AgendamentoModel');

class AgendamentoController {
  // Criar novo agendamento
  static async criar(req, res) {
    try {
      const { cliente_id, barbeiro_id, servico_id, data_agendamento, hora_inicio, observacoes } = req.body;
      
      // Validações básicas
      if (!cliente_id || !barbeiro_id || !servico_id || !data_agendamento || !hora_inicio) {
        return res.status(400).json({
          error: 'Dados obrigatórios não fornecidos',
          message: 'Cliente, barbeiro, serviço, data e horário são obrigatórios'
        });
      }
      
      // Validar formato da data
      const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dataRegex.test(data_agendamento)) {
        return res.status(400).json({
          error: 'Data inválida',
          message: 'Data deve estar no formato YYYY-MM-DD'
        });
      }
      
      // Validar se a data não é no passado
      const hoje = new Date().toISOString().split('T')[0];
      if (data_agendamento < hoje) {
        return res.status(400).json({
          error: 'Data inválida',
          message: 'Não é possível agendar para datas passadas'
        });
      }
      
      // Validar formato da hora
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(hora_inicio)) {
        return res.status(400).json({
          error: 'Horário inválido',
          message: 'Horário deve estar no formato HH:MM'
        });
      }
      
      // Buscar serviço para calcular hora_fim
      const prisma = require('../database/prisma');
      const servico = await prisma.servico.findUnique({
        where: { id: parseInt(servico_id) }
      });
      
      if (!servico) {
        return res.status(404).json({
          error: 'Serviço não encontrado',
          message: 'O serviço selecionado não existe'
        });
      }
      
      // Calcular hora_fim
      const [horas, minutos] = hora_inicio.split(':').map(Number);
      const inicioMinutos = horas * 60 + minutos;
      const fimMinutos = inicioMinutos + servico.duracao;
      
      const horaFim = Math.floor(fimMinutos / 60);
      const minutoFim = fimMinutos % 60;
      const hora_fim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
      
      // Verificar disponibilidade
      const disponivel = await AgendamentoModel.verificarDisponibilidade(
        barbeiro_id, 
        data_agendamento, 
        hora_inicio, 
        hora_fim
      );
      
      if (!disponivel) {
        return res.status(409).json({
          error: 'Horário não disponível',
          message: 'O barbeiro já possui agendamento neste horário'
        });
      }
      
      const agendamento = await AgendamentoModel.criar({
        cliente_id,
        barbeiro_id,
        servico_id,
        data_agendamento,
        hora_inicio,
        observacoes
      });
      
      res.status(201).json({
        success: true,
        data: agendamento,
        message: 'Agendamento criado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Listar todos os agendamentos
  static async listar(req, res) {
    try {
      const agendamentos = await AgendamentoModel.buscarTodos();
      
      res.json({
        success: true,
        data: agendamentos,
        total: agendamentos.length
      });
      
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar agendamentos por data
  static async buscarPorData(req, res) {
    try {
      const { data } = req.params;
      
      // Validar formato da data
      const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dataRegex.test(data)) {
        return res.status(400).json({
          error: 'Data inválida',
          message: 'Data deve estar no formato YYYY-MM-DD'
        });
      }
      
      const agendamentos = await AgendamentoModel.buscarPorData(data);
      
      res.json({
        success: true,
        data: agendamentos,
        total: agendamentos.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar agendamentos por data:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar agendamentos por barbeiro
  static async buscarPorBarbeiro(req, res) {
    try {
      const { barbeiro_id } = req.params;
      const { data } = req.query;
      
      // Validar data se fornecida
      if (data) {
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(data)) {
          return res.status(400).json({
            error: 'Data inválida',
            message: 'Data deve estar no formato YYYY-MM-DD'
          });
        }
      }
      
      const agendamentos = await AgendamentoModel.buscarPorBarbeiro(barbeiro_id, data);
      
      res.json({
        success: true,
        data: agendamentos,
        total: agendamentos.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar agendamentos por barbeiro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar agendamento por ID
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const agendamento = await AgendamentoModel.buscarPorId(id);
      
      if (!agendamento) {
        return res.status(404).json({
          error: 'Agendamento não encontrado',
          message: 'Nenhum agendamento encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        data: agendamento
      });
      
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Atualizar status do agendamento
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;
      
      // Validar status
      const statusValidos = ['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'];
      if (status && !statusValidos.includes(status)) {
        return res.status(400).json({
          error: 'Status inválido',
          message: `Status deve ser um dos seguintes: ${statusValidos.join(', ')}`
        });
      }
      
      const agendamento = await AgendamentoModel.atualizar(id, {
        status,
        observacoes
      });
      
      if (agendamento.changes === 0) {
        return res.status(404).json({
          error: 'Agendamento não encontrado',
          message: 'Nenhum agendamento encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        data: agendamento,
        message: 'Agendamento atualizado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Cancelar agendamento
  static async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      
      const agendamento = await AgendamentoModel.cancelar(id, motivo);
      
      if (agendamento.changes === 0) {
        return res.status(404).json({
          error: 'Agendamento não encontrado',
          message: 'Nenhum agendamento encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        message: 'Agendamento cancelado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Verificar disponibilidade de horário
  static async verificarDisponibilidade(req, res) {
    try {
      const { barbeiro_id, data, hora_inicio, servico_id } = req.query;
      
      if (!barbeiro_id || !data || !hora_inicio || !servico_id) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios não fornecidos',
          message: 'barbeiro_id, data, hora_inicio e servico_id são obrigatórios'
        });
      }
      
      // Buscar serviço para calcular hora_fim
      const prisma = require('../database/prisma');
      const servico = await prisma.servico.findUnique({
        where: { id: parseInt(servico_id) }
      });
      
      if (!servico) {
        return res.status(404).json({
          error: 'Serviço não encontrado',
          message: 'O serviço selecionado não existe'
        });
      }
      
      // Calcular hora_fim
      const [horas, minutos] = hora_inicio.split(':').map(Number);
      const inicioMinutos = horas * 60 + minutos;
      const fimMinutos = inicioMinutos + servico.duracao;
      
      const horaFim = Math.floor(fimMinutos / 60);
      const minutoFim = fimMinutos % 60;
      const hora_fim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
      
      const disponivel = await AgendamentoModel.verificarDisponibilidade(
        barbeiro_id,
        data,
        hora_inicio,
        hora_fim
      );
      
      res.json({
        success: true,
        data: { disponivel }
      });
      
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar próximos agendamentos
  static async buscarProximos(req, res) {
    try {
      const { limite = 10 } = req.query;
      
      const agendamentos = await AgendamentoModel.buscarProximos(parseInt(limite));
      
      res.json({
        success: true,
        data: agendamentos,
        total: agendamentos.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar próximos agendamentos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Deletar agendamento
  static async deletar(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await AgendamentoModel.deletar(id);
      
      if (resultado.changes === 0) {
        return res.status(404).json({
          error: 'Agendamento não encontrado',
          message: 'Nenhum agendamento encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        message: 'Agendamento excluído com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = AgendamentoController;