const ClienteModel = require('../models/ClienteModel');

class ClienteController {
  // Criar novo cliente
  static async criar(req, res) {
    try {
      const { nome, telefone, email, data_nascimento, endereco, observacoes } = req.body;
      
      // Validações básicas
      if (!nome || !telefone) {
        return res.status(400).json({
          error: 'Dados obrigatórios não fornecidos',
          message: 'Nome e telefone são obrigatórios'
        });
      }
      
      const cliente = await ClienteModel.criar({
        nome,
        telefone,
        email,
        data_nascimento,
        endereco,
        observacoes
      });
      
      res.status(201).json({
        success: true,
        data: cliente,
        message: 'Cliente criado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Listar todos os clientes
  static async listar(req, res) {
    try {
      const clientes = await ClienteModel.buscarTodos();
      
      res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
      
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar cliente por ID
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const cliente = await ClienteModel.buscarPorId(id);
      
      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente não encontrado',
          message: 'Nenhum cliente encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        data: cliente
      });
      
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar cliente por nome ou telefone
  static async buscar(req, res) {
    try {
      const { termo } = req.query;
      
      if (!termo) {
        return res.status(400).json({
          error: 'Termo de busca não fornecido',
          message: 'Forneça um termo para busca por nome ou telefone'
        });
      }
      
      const clientes = await ClienteModel.buscarPorNomeOuTelefone(termo);
      
      res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Atualizar cliente
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, telefone, email, data_nascimento, endereco, observacoes } = req.body;
      
      // Validações básicas
      if (!nome || !telefone) {
        return res.status(400).json({
          error: 'Dados obrigatórios não fornecidos',
          message: 'Nome e telefone são obrigatórios'
        });
      }
      
      const cliente = await ClienteModel.atualizar(id, {
        nome,
        telefone,
        email,
        data_nascimento,
        endereco,
        observacoes
      });
      
      if (cliente.changes === 0) {
        return res.status(404).json({
          error: 'Cliente não encontrado',
          message: 'Nenhum cliente encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        data: cliente,
        message: 'Cliente atualizado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Deletar cliente (soft delete)
  static async deletar(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await ClienteModel.deletar(id);
      
      if (resultado.changes === 0) {
        return res.status(404).json({
          error: 'Cliente não encontrado',
          message: 'Nenhum cliente encontrado com este ID'
        });
      }
      
      res.json({
        success: true,
        message: 'Cliente removido com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Buscar agendamentos do cliente
  static async buscarAgendamentos(req, res) {
    try {
      const { id } = req.params;
      
      const agendamentos = await ClienteModel.buscarAgendamentos(id);
      
      res.json({
        success: true,
        data: agendamentos,
        total: agendamentos.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar agendamentos do cliente:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = ClienteController;