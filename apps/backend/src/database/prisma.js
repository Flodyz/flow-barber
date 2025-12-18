/**
 * Prisma Client Instance
 * 
 * Cliente único do Prisma para evitar múltiplas conexões com o banco
 * Usa singleton pattern para garantir uma única instância
 */

const { PrismaClient } = require('@prisma/client');

// Configuração do Prisma Client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
  });
};

// Garantir que existe apenas uma instância do Prisma Client
const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown - fechar conexões quando o processo terminar
process.on('beforeExit', async () => {
  console.log('🔌 Desconectando do banco de dados...');
  await prisma.$disconnect();
});

module.exports = prisma;
