const { getConnection } = require('../database/database');

class ClienteModel {
  static criar(clienteData) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      const { nome, telefone, email, data_nascimento, endereco, observacoes } = clienteData;
      
      const sql = `
        INSERT INTO clientes (nome, telefone, email, data_nascimento, endereco, observacoes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [nome, telefone, email, data_nascimento, endereco, observacoes], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...clienteData });
        }
      });
    });
  }
  
  static buscarTodos() {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT c.*, 
               COUNT(a.id) as total_agendamentos,
               MAX(a.data_agendamento) as ultimo_agendamento
        FROM clientes c
        LEFT JOIN agendamentos a ON c.id = a.cliente_id AND a.status != 'cancelado'
        WHERE c.ativo = 1
        GROUP BY c.id
        ORDER BY c.nome
      `;
      
      db.all(sql, [], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = 'SELECT * FROM clientes WHERE id = ? AND ativo = 1';
      
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
  
  static buscarPorNomeOuTelefone(termo) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT * FROM clientes 
        WHERE (nome LIKE ? OR telefone LIKE ?) AND ativo = 1
        ORDER BY nome
      `;
      
      const termoBusca = `%${termo}%`;
      
      db.all(sql, [termoBusca, termoBusca], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  static atualizar(id, clienteData) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      const { nome, telefone, email, data_nascimento, endereco, observacoes } = clienteData;
      
      const sql = `
        UPDATE clientes 
        SET nome = ?, telefone = ?, email = ?, data_nascimento = ?, 
            endereco = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND ativo = 1
      `;
      
      db.run(sql, [nome, telefone, email, data_nascimento, endereco, observacoes, id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...clienteData, changes: this.changes });
        }
      });
    });
  }
  
  static deletar(id) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      // Soft delete - marca como inativo
      const sql = 'UPDATE clientes SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: true, changes: this.changes });
        }
      });
    });
  }
  
  static buscarAgendamentos(clienteId) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT a.*, s.nome as servico_nome, s.preco, s.duracao,
               u.nome as barbeiro_nome
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        JOIN barbeiros b ON a.barbeiro_id = b.id
        JOIN usuarios u ON b.usuario_id = u.id
        WHERE a.cliente_id = ?
        ORDER BY a.data_agendamento DESC, a.hora_inicio DESC
      `;
      
      db.all(sql, [clienteId], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = ClienteModel;
