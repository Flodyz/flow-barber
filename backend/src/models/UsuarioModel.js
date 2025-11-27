const { getConnection } = require('../database/database');
const bcrypt = require('bcryptjs');

class UsuarioModel {
  static async buscarPorEmail(email) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT u.*, b.id as barbeiro_id
        FROM usuarios u
        LEFT JOIN barbeiros b ON u.id = b.usuario_id
        WHERE u.email = ? AND u.ativo = 1
      `;
      
      db.get(sql, [email], (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  
  static async criar(usuarioData) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      const { nome, email, senha, tipo } = usuarioData;
      
      // Hash da senha
      const senhaHash = bcrypt.hashSync(senha, 10);
      
      const sql = `
        INSERT INTO usuarios (nome, email, senha, tipo)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(sql, [nome, email, senhaHash, tipo], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id: this.lastID, 
            nome, 
            email, 
            tipo 
          });
        }
      });
    });
  }
  
  static async validarSenha(senhaPlana, senhaHash) {
    return bcrypt.compareSync(senhaPlana, senhaHash);
  }
  
  static async buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT u.*, b.id as barbeiro_id
        FROM usuarios u
        LEFT JOIN barbeiros b ON u.id = b.usuario_id
        WHERE u.id = ? AND u.ativo = 1
      `;
      
      db.get(sql, [id], (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  
  static async atualizarSenha(id, novaSenha) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const senhaHash = bcrypt.hashSync(novaSenha, 10);
      
      const sql = `
        UPDATE usuarios 
        SET senha = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [senhaHash, id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id, updated: true, changes: this.changes });
        }
      });
    });
  }
}

module.exports = UsuarioModel;
