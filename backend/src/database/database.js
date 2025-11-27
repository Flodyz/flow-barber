const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Usar variável de ambiente ou caminho padrão
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'barbearia.db');

// Criar diretório se não existir
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Diretório do banco criado:', dbDir);
}

// Função para criar conexão com o banco
const createConnection = () => {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Erro ao conectar com o banco de dados:', err.message);
    } else {
      console.log('✅ Conectado ao banco de dados SQLite');
    }
  });
};

// Função para inicializar o banco de dados
const initDatabase = () => {
  const db = createConnection();
  
  // Habilitar foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Criar tabelas
  const tables = [
    // Tabela de usuários (barbeiros/admin)
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      senha VARCHAR(255) NOT NULL,
      tipo VARCHAR(20) DEFAULT 'barbeiro' CHECK (tipo IN ('admin', 'barbeiro')),
      ativo BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabela de barbeiros
    `CREATE TABLE IF NOT EXISTS barbeiros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      telefone VARCHAR(15),
      especialidades TEXT,
      horario_inicio TIME DEFAULT '08:00',
      horario_fim TIME DEFAULT '18:00',
      dias_trabalho TEXT DEFAULT '1,2,3,4,5,6', -- 0=domingo, 1=segunda...
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`,
    
    // Tabela de clientes
    `CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL,
      telefone VARCHAR(15) NOT NULL,
      email VARCHAR(100),
      data_nascimento DATE,
      endereco TEXT,
      observacoes TEXT,
      ativo BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabela de serviços
    `CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL,
      descricao TEXT,
      preco DECIMAL(10,2) NOT NULL,
      duracao INTEGER NOT NULL, -- em minutos
      ativo BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabela de agendamentos
    `CREATE TABLE IF NOT EXISTS agendamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      barbeiro_id INTEGER NOT NULL,
      servico_id INTEGER NOT NULL,
      data_agendamento DATE NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fim TIME NOT NULL,
      status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado')),
      valor_total DECIMAL(10,2),
      observacoes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
      FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id) ON DELETE CASCADE,
      FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
    )`
  ];
  
  // Executar criação das tabelas
  tables.forEach((table, index) => {
    db.run(table, (err) => {
      if (err) {
        console.error(`❌ Erro ao criar tabela ${index + 1}:`, err.message);
      } else {
        console.log(`✅ Tabela ${index + 1} criada/verificada com sucesso`);
      }
    });
  });
  
  // Aguardar criação das tabelas antes de inserir dados
  setTimeout(() => {
    insertInitialData(db);
    
    db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar o banco:', err.message);
      } else {
        console.log('✅ Conexão com banco fechada');
      }
    });
  }, 1000);
};

// Função para inserir dados iniciais
const insertInitialData = (db) => {
  const bcrypt = require('bcryptjs');
  
  // Verificar se já existem usuários
  db.get('SELECT COUNT(*) as count FROM usuarios', [], (err, row) => {
    if (err) {
      console.error('❌ Erro ao verificar usuários:', err.message);
      return;
    }
    
    if (row.count === 0) {
      // Inserir usuário admin padrão
      const senhaHash = bcrypt.hashSync('admin123', 10);
      
      db.run(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Administrador', 'admin@barbearia.com', senhaHash, 'admin'],
        function(err) {
          if (err) {
            console.error('❌ Erro ao inserir admin:', err.message);
          } else {
            console.log('✅ Usuário admin criado - Email: admin@barbearia.com, Senha: admin123');
          }
        }
      );
      
      // Inserir barbeiro padrão
      const senhaBarbeiroHash = bcrypt.hashSync('barbeiro123', 10);
      
      db.run(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['João Silva', 'joao@barbearia.com', senhaBarbeiroHash, 'barbeiro'],
        function(err) {
          if (err) {
            console.error('❌ Erro ao inserir barbeiro:', err.message);
          } else {
            // Inserir dados do barbeiro
            db.run(
              'INSERT INTO barbeiros (usuario_id, telefone, especialidades) VALUES (?, ?, ?)',
              [this.lastID, '(11) 99999-9999', 'Corte masculino, Barba, Bigode'],
              (err) => {
                if (err) {
                  console.error('❌ Erro ao inserir dados do barbeiro:', err.message);
                } else {
                  console.log('✅ Barbeiro criado - Email: joao@barbearia.com, Senha: barbeiro123');
                }
              }
            );
          }
        }
      );
    }
  });
  
  // Inserir serviços padrão
  db.get('SELECT COUNT(*) as count FROM servicos', [], (err, row) => {
    if (err) {
      console.error('❌ Erro ao verificar serviços:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const servicos = [
        ['Corte Masculino', 'Corte de cabelo masculino tradicional', 25.00, 30],
        ['Barba', 'Aparar e desenhar barba', 15.00, 20],
        ['Corte + Barba', 'Combo completo corte e barba', 35.00, 45],
        ['Bigode', 'Aparar e desenhar bigode', 10.00, 15],
        ['Sobrancelha', 'Design de sobrancelha masculina', 12.00, 15]
      ];
      
      servicos.forEach(([nome, descricao, preco, duracao]) => {
        db.run(
          'INSERT INTO servicos (nome, descricao, preco, duracao) VALUES (?, ?, ?, ?)',
          [nome, descricao, preco, duracao],
          (err) => {
            if (err) {
              console.error(`❌ Erro ao inserir serviço ${nome}:`, err.message);
            } else {
              console.log(`✅ Serviço criado: ${nome}`);
            }
          }
        );
      });
    }
  });
};

module.exports = {
  createConnection,
  initDatabase,
  DB_PATH
};