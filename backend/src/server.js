const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const barbeiroRoutes = require('./routes/barbeiroRoutes');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutos
  max: 20000 // Limite de 20000 requests por IP
});

// Middlewares de segurança
app.use(helmet());
app.use(limiter);
app.use(morgan('combined'));

// CORS configurado para o frontend
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        // Em produção, permitir qualquer origem HTTPS, localhost ou requisições sem origin (Coolify)
        if (!origin || origin.startsWith('https://') || origin.startsWith('http://localhost') || origin.includes('flodydev.site')) {
          callback(null, true);
        } else {
          console.log('CORS bloqueado para:', origin);
          callback(new Error('Não permitido pelo CORS'));
        }
      }
    : allowedOrigins,
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/barbeiros', barbeiroRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    message: 'A rota solicitada não existe nesta API'
  });
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro capturado:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: 'JSON inválido',
      message: 'Verifique a estrutura do JSON enviado'
    });
  }
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

const PORT = process.env.PORT || 3000;

// Inicializar banco de dados na inicialização
const initDatabase = async () => {
  try {
    const { initDb } = require('./database/init');
    await initDb();
    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  }
};

// Inicializar aplicação
const startServer = async () => {
  await initDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;