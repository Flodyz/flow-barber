const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido',
        message: 'É necessário estar logado para acessar este recurso'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário atualizado
    const usuario = await UsuarioModel.buscarPorId(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário não encontrado ou inativo'
      });
    }
    
    // Remover senha do objeto
    delete usuario.senha;
    
    req.usuario = usuario;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Faça login novamente'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token malformado ou inválido'
      });
    }
    
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas administradores podem acessar este recurso'
    });
  }
  next();
};

// Middleware para verificar se é admin ou barbeiro próprio
const requireAdminOrOwnBarbeiro = (req, res, next) => {
  const { barbeiro_id } = req.params;
  
  if (req.usuario.tipo === 'admin') {
    return next();
  }
  
  if (req.usuario.tipo === 'barbeiro' && req.usuario.barbeiro_id == barbeiro_id) {
    return next();
  }
  
  return res.status(403).json({
    error: 'Acesso negado',
    message: 'Você só pode acessar seus próprios dados'
  });
};

// Middleware de validação de entrada
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: error.details[0].message
      });
    }
    
    next();
  };
};

// Middleware de log de requisições (desenvolvimento)
const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
      body: req.method !== 'GET' ? req.body : undefined,
      query: Object.keys(req.query).length ? req.query : undefined,
      user: req.usuario ? { id: req.usuario.id, tipo: req.usuario.tipo } : 'Não autenticado'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOwnBarbeiro,
  validateInput,
  requestLogger
};