const { getConnection } = require('../database/database');

class AgendamentoModel {
  static criar(agendamentoData) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      const { 
        cliente_id, 
        barbeiro_id, 
        servico_id, 
        data_agendamento, 
        hora_inicio,
        observacoes 
      } = agendamentoData;
      
      // Primeiro, buscar a duração do serviço para calcular hora_fim
      const servicoSql = 'SELECT duracao, preco FROM servicos WHERE id = ?';
      
      db.get(servicoSql, [servico_id], (err, servico) => {
        if (err || !servico) {
          db.close();
          reject(err || new Error('Serviço não encontrado'));
          return;
        }
        
        // Calcular hora_fim baseada na duração do serviço
        const [horas, minutos] = hora_inicio.split(':').map(Number);
        const inicioMinutos = horas * 60 + minutos;
        const fimMinutos = inicioMinutos + servico.duracao;
        
        const horaFim = Math.floor(fimMinutos / 60);
        const minutoFim = fimMinutos % 60;
        const hora_fim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
        
        const sql = `
          INSERT INTO agendamentos 
          (cliente_id, barbeiro_id, servico_id, data_agendamento, hora_inicio, hora_fim, valor_total, observacoes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [
          cliente_id, 
          barbeiro_id, 
          servico_id, 
          data_agendamento, 
          hora_inicio, 
          hora_fim, 
          servico.preco,
          observacoes
        ], function(err) {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve({ 
              id: this.lastID, 
              ...agendamentoData, 
              hora_fim, 
              valor_total: servico.preco 
            });
          }
        });
      });
    });
  }
  
  static buscarTodos() {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               s.nome as servico_nome, s.duracao, s.preco,
               u.nome as barbeiro_nome
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        JOIN barbeiros b ON a.barbeiro_id = b.id
        JOIN usuarios u ON b.usuario_id = u.id
        ORDER BY a.data_agendamento DESC, a.hora_inicio DESC
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
  
  static buscarPorData(data) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               s.nome as servico_nome, s.duracao, s.preco,
               u.nome as barbeiro_nome
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        JOIN barbeiros b ON a.barbeiro_id = b.id
        JOIN usuarios u ON b.usuario_id = u.id
        WHERE a.data_agendamento = ?
        ORDER BY a.hora_inicio
      `;
      
      db.all(sql, [data], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  static buscarPorBarbeiro(barbeiroId, data = null) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      let sql = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               s.nome as servico_nome, s.duracao, s.preco
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        WHERE a.barbeiro_id = ?
      `;
      
      let params = [barbeiroId];
      
      if (data) {
        sql += ' AND a.data_agendamento = ?';
        params.push(data);
      }
      
      sql += ' ORDER BY a.data_agendamento DESC, a.hora_inicio';
      
      db.all(sql, params, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  static verificarDisponibilidade(barbeiroId, data, horaInicio, servicoId, agendamentoIdExcluir = null) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      // Buscar duração do serviço
      const servicoSql = 'SELECT duracao FROM servicos WHERE id = ?';
      
      db.get(servicoSql, [servicoId], (err, servico) => {
        if (err || !servico) {
          db.close();
          reject(err || new Error('Serviço não encontrado'));
          return;
        }
        
        // Calcular horário de fim
        const [horas, minutos] = horaInicio.split(':').map(Number);
        const inicioMinutos = horas * 60 + minutos;
        const fimMinutos = inicioMinutos + servico.duracao;
        
        const horaFim = Math.floor(fimMinutos / 60);
        const minutoFim = fimMinutos % 60;
        const hora_fim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
        
        // Verificar conflitos
        let sql = `
          SELECT COUNT(*) as conflitos 
          FROM agendamentos 
          WHERE barbeiro_id = ? 
          AND data_agendamento = ? 
          AND status NOT IN ('cancelado')
          AND (
            (hora_inicio < ? AND hora_fim > ?) OR
            (hora_inicio < ? AND hora_fim > ?) OR
            (hora_inicio >= ? AND hora_inicio < ?)
          )
        `;
        
        let params = [
          barbeiroId, data,
          hora_fim, horaInicio,
          horaInicio, horaInicio,
          horaInicio, hora_fim
        ];
        
        if (agendamentoIdExcluir) {
          sql += ' AND id != ?';
          params.push(agendamentoIdExcluir);
        }
        
        db.get(sql, params, (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve({
              disponivel: row.conflitos === 0,
              hora_fim: hora_fim,
              conflitos: row.conflitos
            });
          }
        });
      });
    });
  }
  
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone, c.email as cliente_email,
               s.nome as servico_nome, s.duracao, s.preco,
               u.nome as barbeiro_nome
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        JOIN barbeiros b ON a.barbeiro_id = b.id
        JOIN usuarios u ON b.usuario_id = u.id
        WHERE a.id = ?
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
  
  static atualizar(id, agendamentoData) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      const { status, observacoes } = agendamentoData;
      
      const sql = `
        UPDATE agendamentos 
        SET status = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [status, observacoes, id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...agendamentoData, changes: this.changes });
        }
      });
    });
  }
  
  static cancelar(id, motivo = '') {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const observacoesCancelamento = motivo ? `CANCELADO: ${motivo}` : 'CANCELADO';
      
      const sql = `
        UPDATE agendamentos 
        SET status = 'cancelado', observacoes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [observacoesCancelamento, id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id, status: 'cancelado', changes: this.changes });
        }
      });
    });
  }
  
  static buscarProximos(limite = 10) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               s.nome as servico_nome, s.duracao,
               u.nome as barbeiro_nome
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        JOIN servicos s ON a.servico_id = s.id
        JOIN barbeiros b ON a.barbeiro_id = b.id
        JOIN usuarios u ON b.usuario_id = u.id
        WHERE a.data_agendamento >= date('now') 
        AND a.status NOT IN ('cancelado', 'concluido')
        ORDER BY a.data_agendamento, a.hora_inicio
        LIMIT ?
      `;
      
      db.all(sql, [limite], (err, rows) => {
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

module.exports = AgendamentoModel;
