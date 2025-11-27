const { getConnection } = require('../database/database');

class BarbeiroModel {
  static buscarTodos() {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT b.*, u.nome, u.email, u.ativo,
               COUNT(a.id) as total_agendamentos,
               SUM(CASE WHEN a.status = 'concluido' THEN 1 ELSE 0 END) as agendamentos_concluidos
        FROM barbeiros b
        JOIN usuarios u ON b.usuario_id = u.id
        LEFT JOIN agendamentos a ON b.id = a.barbeiro_id
        WHERE u.ativo = 1 AND u.tipo = 'barbeiro'
        GROUP BY b.id
        ORDER BY u.nome
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
      
      const sql = `
        SELECT b.*, u.nome, u.email, u.ativo
        FROM barbeiros b
        JOIN usuarios u ON b.usuario_id = u.id
        WHERE b.id = ? AND u.ativo = 1
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
  
  static buscarPorUsuarioId(usuarioId) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT b.*, u.nome, u.email, u.ativo
        FROM barbeiros b
        JOIN usuarios u ON b.usuario_id = u.id
        WHERE u.id = ? AND u.ativo = 1
      `;
      
      db.get(sql, [usuarioId], (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  
  static buscarDisponiveisData(data, horaInicio, duracao) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      // Calcular hora de fim
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const inicioMinutos = horas * 60 + minutos;
      const fimMinutos = inicioMinutos + duracao;
      
      const horaFim = Math.floor(fimMinutos / 60);
      const minutoFim = fimMinutos % 60;
      const hora_fim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}`;
      
      // Buscar barbeiros sem conflitos no horário
      const sql = `
        SELECT DISTINCT b.*, u.nome, u.email
        FROM barbeiros b
        JOIN usuarios u ON b.usuario_id = u.id
        WHERE u.ativo = 1 AND u.tipo = 'barbeiro'
        AND b.id NOT IN (
          SELECT DISTINCT barbeiro_id
          FROM agendamentos
          WHERE data_agendamento = ?
          AND status NOT IN ('cancelado')
          AND (
            (hora_inicio < ? AND hora_fim > ?) OR
            (hora_inicio < ? AND hora_fim > ?) OR
            (hora_inicio >= ? AND hora_inicio < ?)
          )
        )
        ORDER BY u.nome
      `;
      
      db.all(sql, [
        data,
        hora_fim, horaInicio,
        horaInicio, horaInicio,
        horaInicio, hora_fim
      ], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  static buscarHorariosDisponiveis(barbeiroId, data) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      // Buscar horários do barbeiro
      const barbeiroSql = `
        SELECT horario_inicio, horario_fim, dias_trabalho
        FROM barbeiros
        WHERE id = ?
      `;
      
      db.get(barbeiroSql, [barbeiroId], (err, barbeiro) => {
        if (err || !barbeiro) {
          db.close();
          reject(err || new Error('Barbeiro não encontrado'));
          return;
        }
        
        // Verificar se trabalha no dia da semana
        const dayOfWeek = new Date(data + 'T00:00:00').getDay();
        const diasTrabalho = barbeiro.dias_trabalho.split(',').map(Number);
        
        if (!diasTrabalho.includes(dayOfWeek)) {
          db.close();
          resolve([]);
          return;
        }
        
        // Buscar agendamentos existentes
        const agendamentosSql = `
          SELECT hora_inicio, hora_fim
          FROM agendamentos
          WHERE barbeiro_id = ? AND data_agendamento = ? AND status NOT IN ('cancelado')
          ORDER BY hora_inicio
        `;
        
        db.all(agendamentosSql, [barbeiroId, data], (err, agendamentos) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            // Gerar slots disponíveis
            const slots = gerarSlotsDisponiveis(
              barbeiro.horario_inicio,
              barbeiro.horario_fim,
              agendamentos
            );
            resolve(slots);
          }
        });
      });
    });
  }
  
  static atualizar(id, barbeiroData) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      const { telefone, especialidades, horario_inicio, horario_fim, dias_trabalho } = barbeiroData;
      
      const sql = `
        UPDATE barbeiros 
        SET telefone = ?, especialidades = ?, horario_inicio = ?, 
            horario_fim = ?, dias_trabalho = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [telefone, especialidades, horario_inicio, horario_fim, dias_trabalho, id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...barbeiroData, changes: this.changes });
        }
      });
    });
  }
  
  static buscarEstatisticas(barbeiroId, periodo = 30) {
    return new Promise((resolve, reject) => {
      const db = getConnection();
      
      const sql = `
        SELECT 
          COUNT(a.id) as total_agendamentos,
          SUM(CASE WHEN a.status = 'concluido' THEN 1 ELSE 0 END) as concluidos,
          SUM(CASE WHEN a.status = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
          SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END) as receita_total,
          AVG(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE NULL END) as valor_medio
        FROM agendamentos a
        WHERE a.barbeiro_id = ? 
        AND a.data_agendamento >= date('now', '-${periodo} days')
      `;
      
      db.get(sql, [barbeiroId], (err, row) => {
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

// Função auxiliar para gerar slots disponíveis
function gerarSlotsDisponiveis(horaInicio, horaFim, agendamentos) {
  const slots = [];
  const intervalo = 30; // Intervalos de 30 minutos
  
  const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
  const [fimHoras, fimMinutos] = horaFim.split(':').map(Number);
  
  const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos;
  const fimTotalMinutos = fimHoras * 60 + fimMinutos;
  
  for (let minutos = inicioTotalMinutos; minutos < fimTotalMinutos; minutos += intervalo) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    const horario = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    
    // Verificar se não conflita com agendamentos existentes
    const conflito = agendamentos.some(agendamento => {
      return horario >= agendamento.hora_inicio && horario < agendamento.hora_fim;
    });
    
    if (!conflito) {
      slots.push(horario);
    }
  }
  
  return slots;
}

module.exports = BarbeiroModel;
