# 💈 Backend - Sistema de Gerenciamento de Barbearia

Backend moderno para sistema de agendamentos de barbearia, construído com Node.js, Express, PostgreSQL e Prisma ORM.

## 🚀 Stack Tecnológica

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Banco de Dados:** PostgreSQL 15+
- **ORM:** Prisma 5.x
- **Autenticação:** JWT (jsonwebtoken)
- **Segurança:** bcryptjs, helmet, cors
- **Logs:** morgan

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 15+ (ou Docker)
- npm ou yarn

## ⚡ Setup Rápido

### Opção 1: Script Automatizado (Recomendado)

```powershell
cd apps/backend
.\setup.ps1
```

### Opção 2: Manual

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 3. Iniciar PostgreSQL
docker-compose up -d postgres

# 4. Gerar Prisma Client
npm run prisma:generate

# 5. Rodar migrations
npm run prisma:migrate

# 6. Popular banco (opcional)
npm run prisma:seed

# 7. Iniciar servidor
npm run dev
```

## 📂 Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   ├── seed.js            # Dados iniciais
│   └── migrations/        # Histórico de migrations
├── src/
│   ├── config/            # Configurações
│   ├── controllers/       # Controladores de rotas
│   ├── database/
│   │   └── prisma.js      # Cliente Prisma
│   ├── middlewares/       # Middlewares Express
│   ├── models/            # (Deprecated - usar Prisma)
│   ├── routes/            # Definição de rotas
│   └── server.js          # Entry point
├── .env                   # Variáveis de ambiente (não commitado)
├── .env.example           # Template de variáveis
├── package.json
└── Dockerfile
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais:

- **usuarios** - Usuários do sistema (admin/barbeiro)
- **barbeiros** - Informações profissionais dos barbeiros
- **clientes** - Cadastro de clientes
- **servicos** - Serviços oferecidos
- **agendamentos** - Agendamentos de serviços

### Relacionamentos:

```
Usuario (1:1) Barbeiro
Barbeiro (1:N) Agendamento
Cliente (1:N) Agendamento
Servico (1:N) Agendamento
```

## 📜 Scripts Disponíveis

```json
{
  "dev": "Iniciar em modo desenvolvimento",
  "start": "Iniciar em produção",
  "prisma:generate": "Gerar Prisma Client",
  "prisma:migrate": "Criar/aplicar migrations",
  "prisma:migrate:deploy": "Aplicar migrations em produção",
  "prisma:studio": "Abrir GUI do banco",
  "prisma:seed": "Popular banco com dados iniciais"
}
```

## 🔐 Autenticação

Sistema de autenticação baseado em JWT com refresh tokens.

### Endpoints:

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token

### Headers:

```
Authorization: Bearer <token>
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Buscar cliente
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

### Serviços
- `GET /api/servicos` - Listar serviços
- `GET /api/servicos/:id` - Buscar serviço
- `POST /api/servicos` - Criar serviço
- `PUT /api/servicos/:id` - Atualizar serviço
- `DELETE /api/servicos/:id` - Deletar serviço

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `GET /api/agendamentos/:id` - Buscar agendamento
- `POST /api/agendamentos` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/agendamentos/:id` - Cancelar agendamento

### Barbeiros
- `GET /api/barbeiros` - Listar barbeiros
- `GET /api/barbeiros/:id` - Buscar barbeiro
- `GET /api/barbeiros/:id/disponibilidade` - Ver disponibilidade

## 🔧 Variáveis de Ambiente

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# JWT
JWT_SECRET=seu_secret_aqui

# CORS (opcional)
ALLOWED_ORIGINS=http://localhost:5173
```

## 🐳 Docker

### Desenvolvimento:

```bash
# Subir apenas PostgreSQL
docker-compose up -d postgres

# Subir todos os serviços
docker-compose up -d
```

### Produção:

```bash
docker-compose -f docker-compose.yml up -d --build
```

## 🧪 Testando a API

### Health Check:

```bash
curl http://localhost:3000/api/health
```

### Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@barbearia.com",
    "password": "admin123"
  }'
```

## 🔐 Credenciais Padrão

Após executar o seed:

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@barbearia.com | admin123 |
| Barbeiro | joao@barbearia.com | barbeiro123 |
| Barbeiro | pedro@barbearia.com | barbeiro123 |

**⚠️ IMPORTANTE:** Altere estas credenciais em produção!

## 📊 Prisma Studio

Interface gráfica para visualizar e editar dados:

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

## 🔄 Migração SQLite → PostgreSQL

Este projeto foi recentemente migrado de SQLite para PostgreSQL. Consulte a documentação completa:

- [MIGRACAO_POSTGRESQL.md](./MIGRACAO_POSTGRESQL.md) - Guia completo
- [GUIA_CONTROLLERS.md](./GUIA_CONTROLLERS.md) - Como atualizar código
- [SETUP_RAPIDO.md](./SETUP_RAPIDO.md) - Comandos rápidos

## 🛠️ Troubleshooting

### Erro: "Can't reach database server"

```bash
# Verificar se PostgreSQL está rodando
docker ps

# Iniciar PostgreSQL
docker-compose up -d postgres
```

### Erro: "Port already in use"

```bash
# Verificar processo na porta 3000
netstat -ano | findstr :3000

# Mudar porta no .env
PORT=3001
```

### Resetar banco completamente

```bash
npx prisma migrate reset
npm run prisma:seed
```

## 📚 Documentação Adicional

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

ISC

## 👤 Autor

Desenvolvido para o projeto de sistema de barbearia.

---

**🚀 Happy coding!**
