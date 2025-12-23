const BarbeiroModel = require('../models/BarbeiroModel');

class BarbeiroController {
  // Listar todos os barbeiros
  static async listar(req, res) {
    try {
      const barbeiros = await BarbeiroModel.buscarTodos();
      
      res.json({
        success: true,
        data: barbeiros,
        total: barbeiros.length
      });
      
    } catch (error) {
      console.error('Erro ao listar barbeiros:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar barbeiro por ID
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const barbeiro = await BarbeiroModel.buscarPorId(id);
      
      if (!barbeiro) {
        return res.status(404).json({
          error: 'Barbeiro não encontrado',
          message: 'Nenhum barbeiro encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        data: barbeiro
      });
      
    } catch (error) {
      console.error('Erro ao buscar barbeiro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar barbeiros disponíveis para uma data/hora específica
  static async buscarDisponiveis(req, res) {
    try {
      const { data, hora_inicio, duracao } = req.query;
      
      if (!data || !hora_inicio || !duracao) {
        return res.status(400).json({
          error: 'Parâmetros obrigatórios não fornecidos',
          message: 'data, hora_inicio e duracao são obrigatórios'
        });
      }
      
      // Validar formato da data
      const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dataRegex.test(data)) {
        return res.status(400).json({
          error: 'Data inválida',
          message: 'Data deve estar no formato YYYY-MM-DD'
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
      
      const barbeiros = await BarbeiroModel.buscarDisponiveisData(
        data,
        hora_inicio,
        parseInt(duracao)
      );
      
      res.json({
        success: true,
        data: barbeiros,
        total: barbeiros.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar barbeiros disponíveis:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar horários disponíveis de um barbeiro em uma data
  static async buscarHorariosDisponiveis(req, res) {
    try {
      const { id } = req.params;
      const { data } = req.query;
      
      if (!data) {
        return res.status(400).json({
          error: 'Data não fornecida',
          message: 'Parâmetro data é obrigatório'
        });
      }
      
      // Validar formato da data
      const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dataRegex.test(data)) {
        return res.status(400).json({
          error: 'Data inválida',
          message: 'Data deve estar no formato YYYY-MM-DD'
        });
      }
      
      const horarios = await BarbeiroModel.buscarHorariosDisponiveis(id, data);
      
      res.json({
        success: true,
        data: horarios,
        total: horarios.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Criar novo barbeiro
  static async criar(req, res) {
    try {
      const { nome, email, telefone, especialidades, horario_inicio, horario_fim, dias_trabalho, senha, ativo } = req.body;
      
      // Validações básicas
      if (!nome) {
        return res.status(400).json({
          error: 'Dados obrigatórios não fornecidos',
          message: 'Nome é obrigatório'
        });
      }
      
      // Validar horários se fornecidos
      if (horario_inicio || horario_fim) {
        const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (horario_inicio && !horaRegex.test(horario_inicio)) {
          return res.status(400).json({
            error: 'Horário de início inválido',
            message: 'Horário deve estar no formato HH:MM'
          });
        }
        
        if (horario_fim && !horaRegex.test(horario_fim)) {
          return res.status(400).json({
            error: 'Horário de fim inválido',
            message: 'Horário deve estar no formato HH:MM'
          });
        }
      }
      
      const barbeiro = await BarbeiroModel.criar({
        nome,
        email,
        telefone,
        especialidades,
        horario_inicio,
        horario_fim,
        dias_trabalho,
        senha,
        ativo
      });
      
      res.status(201).json({
        success: true,
        data: barbeiro,
        message: 'Barbeiro criado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao criar barbeiro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Atualizar dados do barbeiro
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, telefone, especialidades, horario_inicio, horario_fim, dias_trabalho, ativo } = req.body;
      
      // Validar horários se fornecidos
      if (horario_inicio || horario_fim) {
        const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (horario_inicio && !horaRegex.test(horario_inicio)) {
          return res.status(400).json({
            error: 'Horário de início inválido',
            message: 'Horário deve estar no formato HH:MM'
          });
        }
        
        if (horario_fim && !horaRegex.test(horario_fim)) {
          return res.status(400).json({
            error: 'Horário de fim inválido',
            message: 'Horário deve estar no formato HH:MM'
          });
        }
      }
      
      // Validar dias de trabalho se fornecidos
      if (dias_trabalho) {
        const dias = dias_trabalho.split(',').map(Number);
        if (dias.some(dia => dia < 0 || dia > 6 || isNaN(dia))) {
          return res.status(400).json({
            error: 'Dias de trabalho inválidos',
            message: 'Dias devem ser números de 0-6 separados por vírgula (0=domingo, 1=segunda...)'
          });
        }
      }
      
      const barbeiro = await BarbeiroModel.atualizar(id, {
        nome,
        email,
        telefone,
        especialidades,
        horario_inicio,
        horario_fim,
        dias_trabalho,
        ativo
      });
      
      if (barbeiro.changes === 0) {
        return res.status(404).json({
          error: 'Barbeiro não encontrado',
          message: 'Nenhum barbeiro encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        data: barbeiro,
        message: 'Barbeiro atualizado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao atualizar barbeiro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Deletar barbeiro
  static async deletar(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await BarbeiroModel.deletar(id);
      
      if (resultado.changes === 0) {
        return res.status(404).json({
          error: 'Barbeiro não encontrado',
          message: 'Nenhum barbeiro encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        message: 'Barbeiro removido com sucesso'
      });
      
    } catch (error) {
      if (error.message.includes('agendamentos futuros')) {
        return res.status(400).json({
          error: 'Não é possível excluir',
          message: error.message
        });
      }
      
      console.error('Erro ao deletar barbeiro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar estatísticas do barbeiro
  static async buscarEstatisticas(req, res) {
    try {
      const { id } = req.params;
      const { periodo = 30 } = req.query;
      
      const estatisticas = await BarbeiroModel.buscarEstatisticas(id, parseInt(periodo));
      
      res.json({
        success: true,
        data: estatisticas
      });
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas do barbeiro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = BarbeiroController;