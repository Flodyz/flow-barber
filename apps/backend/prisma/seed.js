/**
 * Script de Seed - Prisma
 * 
 * Popula o banco de dados com dados iniciais:
 * - Usuário administrador
 * - Usuário barbeiro de exemplo
 * - Serviços padrão da barbearia
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // ============================================
    // LIMPAR DADOS EXISTENTES (CUIDADO EM PRODUÇÃO!)
    // ============================================
    console.log('🗑️  Limpando dados existentes...');
    await prisma.agendamento.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.servico.deleteMany();
    await prisma.barbeiro.deleteMany();
    await prisma.usuario.deleteMany();
    console.log('✅ Dados anteriores removidos\n');

    // ============================================
    // CRIAR USUÁRIOS
    // ============================================
    console.log('👤 Criando usuários...');

    // Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@barbearia.com',
        senha: adminPassword,
        tipo: 'ADMIN',
        ativo: true,
      },
    });
    console.log('✅ Admin criado - Email: admin@barbearia.com | Senha: admin123');

    // Barbeiro 1
    const barbeiroPassword = await bcrypt.hash('barbeiro123', 10);
    const usuario1 = await prisma.usuario.create({
      data: {
        nome: 'João Silva',
        email: 'joao@barbearia.com',
        senha: barbeiroPassword,
        tipo: 'BARBEIRO',
        ativo: true,
      },
    });

    await prisma.barbeiro.create({
      data: {
        usuarioId: usuario1.id,
        telefone: '(11) 99999-9999',
        especialidades: 'Corte masculino, Barba, Bigode',
        horarioInicio: '08:00',
        horarioFim: '18:00',
        diasTrabalho: '1,2,3,4,5,6', // Segunda a Sábado
      },
    });
    console.log('✅ Barbeiro criado - Email: joao@barbearia.com | Senha: barbeiro123');

    // Barbeiro 2
    const usuario2 = await prisma.usuario.create({
      data: {
        nome: 'Pedro Santos',
        email: 'pedro@barbearia.com',
        senha: barbeiroPassword,
        tipo: 'BARBEIRO',
        ativo: true,
      },
    });

    await prisma.barbeiro.create({
      data: {
        usuarioId: usuario2.id,
        telefone: '(11) 98888-8888',
        especialidades: 'Corte moderno, Design de barba, Sobrancelha',
        horarioInicio: '09:00',
        horarioFim: '19:00',
        diasTrabalho: '1,2,3,4,5', // Segunda a Sexta
      },
    });
    console.log('✅ Barbeiro criado - Email: pedro@barbearia.com | Senha: barbeiro123\n');

    // ============================================
    // CRIAR SERVIÇOS
    // ============================================
    console.log('✂️  Criando serviços...');

    const servicos = [
      {
        nome: 'Corte Masculino',
        descricao: 'Corte de cabelo masculino tradicional ou moderno',
        preco: 25.00,
        duracao: 30,
      },
      {
        nome: 'Barba',
        descricao: 'Aparar e desenhar barba com navalha',
        preco: 15.00,
        duracao: 20,
      },
      {
        nome: 'Corte + Barba',
        descricao: 'Combo completo: corte de cabelo + barba',
        preco: 35.00,
        duracao: 45,
      },
      {
        nome: 'Bigode',
        descricao: 'Aparar e desenhar bigode',
        preco: 10.00,
        duracao: 15,
      },
      {
        nome: 'Sobrancelha',
        descricao: 'Design de sobrancelha masculina',
        preco: 12.00,
        duracao: 15,
      },
      {
        nome: 'Design de Barba',
        descricao: 'Desenho completo da barba com degradê',
        preco: 20.00,
        duracao: 25,
      },
      {
        nome: 'Corte Infantil',
        descricao: 'Corte de cabelo para crianças até 12 anos',
        preco: 20.00,
        duracao: 25,
      },
    ];

    for (const servico of servicos) {
      await prisma.servico.create({ data: servico });
      console.log(`✅ Serviço criado: ${servico.nome} - R$ ${servico.preco.toFixed(2)}`);
    }

    // ============================================
    // CRIAR CLIENTES DE EXEMPLO
    // ============================================
    console.log('\n👥 Criando clientes de exemplo...');

    const clientes = [
      {
        nome: 'Carlos Oliveira',
        telefone: '(11) 97777-7777',
        email: 'carlos@email.com',
        dataNascimento: new Date('1990-05-15'),
        endereco: 'Rua das Flores, 123 - São Paulo/SP',
        observacoes: 'Prefere cortes modernos',
      },
      {
        nome: 'Ricardo Souza',
        telefone: '(11) 96666-6666',
        email: 'ricardo@email.com',
        dataNascimento: new Date('1985-08-20'),
        observacoes: 'Alérgico a determinados produtos - verificar antes',
      },
      {
        nome: 'Fernando Lima',
        telefone: '(11) 95555-5555',
        email: null,
        dataNascimento: new Date('1995-12-10'),
      },
    ];

    for (const cliente of clientes) {
      await prisma.cliente.create({ data: cliente });
      console.log(`✅ Cliente criado: ${cliente.nome}`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 RESUMO:');
    console.log('   - 1 Administrador');
    console.log('   - 2 Barbeiros');
    console.log('   - 7 Serviços');
    console.log('   - 3 Clientes de exemplo');
    console.log('\n🔐 CREDENCIAIS DE ACESSO:');
    console.log('   Admin:    admin@barbearia.com / admin123');
    console.log('   Barbeiro: joao@barbearia.com / barbeiro123');
    console.log('   Barbeiro: pedro@barbearia.com / barbeiro123');

  } catch (error) {
    console.error('\n❌ Erro ao executar seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
