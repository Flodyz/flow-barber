const { createConnection } = require('../database/database');

class ServicoModel {
  static criar(servicoData) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      const { nome, descricao, preco, duracao } = servicoData;
      
      const sql = `
        INSERT INTO servicos (nome, descricao, preco, duracao)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(sql, [nome, descricao, preco, duracao], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...servicoData });
        }
      });
    });
  }
  
  static buscarTodos() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const sql = `
        SELECT s.*, 
               COUNT(a.id) as total_agendamentos,
               SUM(CASE WHEN a.status = 'concluido' THEN 1 ELSE 0 END) as agendamentos_concluidos
        FROM servicos s
        LEFT JOIN agendamentos a ON s.id = a.servico_id
        WHERE s.ativo = 1
        GROUP BY s.id
        ORDER BY s.nome
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
      const db = createConnection();
      
      const sql = 'SELECT * FROM servicos WHERE id = ? AND ativo = 1';
      
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
  
  static buscarAtivos() {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const sql = 'SELECT * FROM servicos WHERE ativo = 1 ORDER BY nome';
      
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
  
  static atualizar(id, servicoData) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      const { nome, descricao, preco, duracao } = servicoData;
      
      const sql = `
        UPDATE servicos 
        SET nome = ?, descricao = ?, preco = ?, duracao = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND ativo = 1
      `;
      
      db.run(sql, [nome, descricao, preco, duracao, id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...servicoData, changes: this.changes });
        }
      });
    });
  }
  
  static deletar(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      // Verifica se há agendamentos futuros
      const checkSql = `
        SELECT COUNT(*) as count 
        FROM agendamentos 
        WHERE servico_id = ? AND data_agendamento >= date('now') AND status NOT IN ('cancelado', 'concluido')
      `;
      
      db.get(checkSql, [id], (err, row) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }
        
        if (row.count > 0) {
          db.close();
          reject(new Error('Não é possível excluir serviço com agendamentos futuros'));
          return;
        }
        
        // Soft delete - marca como inativo
        const sql = 'UPDATE servicos SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        
        db.run(sql, [id], function(err) {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve({ id, deleted: true, changes: this.changes });
          }
        });
      });
    });
  }
  
  static buscarEstatisticas(id) {
    return new Promise((resolve, reject) => {
      const db = createConnection();
      
      const sql = `
        SELECT 
          COUNT(a.id) as total_agendamentos,
          SUM(CASE WHEN a.status = 'concluido' THEN 1 ELSE 0 END) as concluidos,
          SUM(CASE WHEN a.status = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
          AVG(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE NULL END) as valor_medio,
          SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END) as receita_total
        FROM agendamentos a
        WHERE a.servico_id = ?
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
}

module.exports = ServicoModel;