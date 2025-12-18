const prisma = require('../database/prisma');
const bcrypt = require('bcryptjs');

class UsuarioModel {
  static async buscarPorEmail(email) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { 
          email,
          ativo: true 
        },
        include: {
          barbeiro: {
            select: {
              id: true
            }
          }
        }
      });

      if (!usuario) return null;

      // Formatar resposta para manter compatibilidade
      return {
        ...usuario,
        barbeiro_id: usuario.barbeiro?.id || null,
        tipo: usuario.tipo.toLowerCase()
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async criar(usuarioData) {
    try {
      const { nome, email, senha, tipo } = usuarioData;
      
      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);
      
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          tipo: tipo.toUpperCase()
        }
      });

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo.toLowerCase()
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Email já cadastrado');
      }
      throw error;
    }
  }
  
  static async validarSenha(senhaPlana, senhaHash) {
    return await bcrypt.compare(senhaPlana, senhaHash);
  }
  
  static async buscarPorId(id) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { 
          id: parseInt(id),
          ativo: true 
        },
        include: {
          barbeiro: {
            select: {
              id: true
            }
          }
        }
      });

      if (!usuario) return null;

      // Formatar resposta para manter compatibilidade
      return {
        ...usuario,
        barbeiro_id: usuario.barbeiro?.id || null,
        tipo: usuario.tipo.toLowerCase()
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async atualizarSenha(id, novaSenha) {
    try {
      const senhaHash = await bcrypt.hash(novaSenha, 10);
      
      const usuario = await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: { senha: senhaHash }
      });

      return { 
        id: usuario.id, 
        updated: true, 
        changes: 1 
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return { id, updated: false, changes: 0 };
      }
      throw error;
    }
  }
}

module.exports = UsuarioModel;
