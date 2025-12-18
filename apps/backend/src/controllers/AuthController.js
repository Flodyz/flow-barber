const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { email, senha } = req.body;
      
      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({
          error: 'Dados obrigatórios não fornecidos',
          message: 'Email e senha são obrigatórios'
        });
      }
      
      // Buscar usuário
      const usuario = await UsuarioModel.buscarPorEmail(email);
      
      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }
      
      // Verificar senha
      const senhaValida = await UsuarioModel.validarSenha(senha, usuario.senha);
      
      if (!senhaValida) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }
      
      // Gerar token JWT
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          tipo: usuario.tipo,
          barbeiro_id: usuario.barbeiro_id 
        },
        jwtSecret,
        { expiresIn: '24h' }
      );
      
      // Remover senha do objeto de resposta
      delete usuario.senha;
      
      res.json({
        success: true,
        data: {
          usuario,
          token
        },
        message: 'Login realizado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Verificar token
  static async verificarToken(req, res) {
    try {
      const { usuario } = req; // Vem do middleware de autenticação
      
      res.json({
        success: true,
        data: { usuario },
        message: 'Token válido'
      });
      
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Renovar token
  static async renovarToken(req, res) {
    try {
      const { usuario } = req; // Vem do middleware de autenticação
      
      // Gerar novo token
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
      const novoToken = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          tipo: usuario.tipo,
          barbeiro_id: usuario.barbeiro_id 
        },
        jwtSecret,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        data: {
          usuario,
          token: novoToken
        },
        message: 'Token renovado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Alterar senha
  static async alterarSenha(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const { usuario } = req; // Vem do middleware de autenticação
      
      // Validações básicas
      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          error: 'Dados obrigatórios não fornecidos',
          message: 'Senha atual e nova senha são obrigatórias'
        });
      }
      
      if (novaSenha.length < 6) {
        return res.status(400).json({
          error: 'Senha muito curta',
          message: 'A nova senha deve ter pelo menos 6 caracteres'
        });
      }
      
      // Buscar dados completos do usuário
      const usuarioCompleto = await UsuarioModel.buscarPorId(usuario.id);
      
      if (!usuarioCompleto) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'Usuário não existe no sistema'
        });
      }
      
      // Verificar senha atual
      const senhaAtualValida = await UsuarioModel.validarSenha(senhaAtual, usuarioCompleto.senha);
      
      if (!senhaAtualValida) {
        return res.status(400).json({
          error: 'Senha atual incorreta',
          message: 'A senha atual fornecida está incorreta'
        });
      }
      
      // Atualizar senha
      await UsuarioModel.atualizarSenha(usuario.id, novaSenha);
      
      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
  
  // Logout (opcional - principalmente para limpar token no frontend)
  static async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
      
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = AuthController;