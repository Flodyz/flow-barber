const ServicoModel = require('../models/ServicoModel');

class ServicoController {
  // Criar novo serviço
  static async criar(req, res) {
    try {
      const { nome, descricao, preco, duracao } = req.body;
      
      // Validações básicas
      if (!nome || !preco || !duracao) {
        return res.status(400).json({
          error: 'Dados obrigatórios não fornecidos',
          message: 'Nome, preço e duração são obrigatórios'
        });
      }
      
      if (preco <= 0 || duracao <= 0) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Preço e duração devem ser maiores que zero'
        });
      }
      
      const servico = await ServicoModel.criar({
        nome,
        descricao,
        preco: parseFloat(preco),
        duracao: parseInt(duracao)
      });
      
      res.status(201).json({
        success: true,
        data: servico,
        message: 'Serviço criado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Listar todos os serviços
  static async listar(req, res) {
    try {
      const servicos = await ServicoModel.buscarTodos();
      
      res.json({
        success: true,
        data: servicos,
        total: servicos.length
      });
      
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Listar apenas serviços ativos
  static async listarAtivos(req, res) {
    try {
      const servicos = await ServicoModel.buscarAtivos();
      
      res.json({
        success: true,
        data: servicos,
        total: servicos.length
      });
      
    } catch (error) {
      console.error('Erro ao listar serviços ativos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar serviço por ID
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const servico = await ServicoModel.buscarPorId(id);
      
      if (!servico) {
        return res.status(404).json({
          error: 'Serviço não encontrado',
          message: 'Nenhum serviço encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        data: servico
      });
      
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Atualizar serviço
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, duracao } = req.body;
      
      // Validações básicas
      if (!nome || !preco || !duracao) {
        return res.status(400).json({
          error: 'Dados obrigatórios não fornecidos',
          message: 'Nome, preço e duração são obrigatórios'
        });
      }
      
      if (preco <= 0 || duracao <= 0) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Preço e duração devem ser maiores que zero'
        });
      }
      
      const servico = await ServicoModel.atualizar(id, {
        nome,
        descricao,
        preco: parseFloat(preco),
        duracao: parseInt(duracao)
      });
      
      if (servico.changes === 0) {
        return res.status(404).json({
          error: 'Serviço não encontrado',
          message: 'Nenhum serviço encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        data: servico,
        message: 'Serviço atualizado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Deletar serviço (soft delete)
  static async deletar(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await ServicoModel.deletar(id);
      
      if (resultado.changes === 0) {
        return res.status(404).json({
          error: 'Serviço não encontrado',
          message: 'Nenhum serviço encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        message: 'Serviço removido com sucesso'
      });
      
    } catch (error) {
      if (error.message.includes('agendamentos futuros')) {
        return res.status(400).json({
          error: 'Não é possível excluir',
          message: error.message
        });
      }
      
      console.error('Erro ao deletar serviço:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar estatísticas do serviço
  static async buscarEstatisticas(req, res) {
    try {
      const { id } = req.params;
      
      const estatisticas = await ServicoModel.buscarEstatisticas(id);
      
      res.json({
        success: true,
        data: estatisticas
      });
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas do serviço:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = ServicoController;