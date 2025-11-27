# Sistema de Gerenciamento de Barbearia

Sistema completo para gerenciamento de barbearia desenvolvido como projeto acadêmico, com funcionalidades de agendamento, controle de clientes, serviços e barbeiros.

## 🎯 Funcionalidades

### 📋 Gerenciamento de Clientes
- ✅ Cadastrar clientes com informações completas
- ✅ Listar todos os clientes
- ✅ Buscar clientes por nome ou telefone
- ✅ Editar informações dos clientes
- ✅ Visualizar histórico de agendamentos

### 💇 Gerenciamento de Serviços
- ✅ Cadastrar serviços (corte, barba, etc.)
- ✅ Definir preços e duração
- ✅ Listar serviços disponíveis
- ✅ Editar informações dos serviços

### 📅 Gerenciamento de Agendamentos
- ✅ Agendar serviços para clientes
- ✅ Associar agendamentos a barbeiros específicos
- ✅ Verificar disponibilidade de horários
- ✅ Listar agendamentos por data
- ✅ Listar agendamentos por barbeiro
- ✅ Cancelar agendamentos
- ✅ Atualizar status dos agendamentos

### 👨‍🦲 Gerenciamento de Barbeiros
- ✅ Listar barbeiros disponíveis
- ✅ Verificar agenda de cada barbeiro
- ✅ Consultar horários disponíveis

### 🔐 Sistema de Autenticação
- ✅ Login com email e senha
- ✅ Autenticação JWT
- ✅ Controle de acesso por perfil (Admin/Barbeiro)
- ✅ Logout seguro

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite3** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **CORS** - Controle de acesso
- **Helmet** - Segurança HTTP
- **Morgan** - Log de requisições

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **React Router DOM** - Roteamento
- **React Hook Form** - Formulários
- **Axios** - Requisições HTTP
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd trabalho-barbearia
```

### 2. Configurar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Inicializar o banco de dados
npm run init-db

# Iniciar o servidor em modo de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 3. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 👤 Usuários de Demonstração

### Administrador
- **Email:** admin@barbearia.com
- **Senha:** admin123
- **Permissões:** Acesso completo ao sistema

### Barbeiro
- **Email:** joao@barbearia.com
- **Senha:** barbeiro123
- **Permissões:** Visualizar agendamentos e gerenciar seus próprios dados

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### usuarios
```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('admin', 'barbeiro') DEFAULT 'barbeiro',
  ativo BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### clientes
```sql
CREATE TABLE clientes (
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
);
```

#### servicos
```sql
CREATE TABLE servicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  duracao INTEGER NOT NULL, -- em minutos
  ativo BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### agendamentos
```sql
CREATE TABLE agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  barbeiro_id INTEGER NOT NULL,
  servico_id INTEGER NOT NULL,
  data_agendamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status ENUM('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado') DEFAULT 'agendado',
  valor_total DECIMAL(10,2),
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id) ON DELETE CASCADE,
  FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
);
```

## 🎨 Design System

### Paleta de Cores
- **Preto:** `#000000` - `#212529`
- **Prata:** `#f8fafc` - `#0f172a`

### Componentes Customizados
- **Botões:** Primary, Secondary, Danger
- **Cards:** Layout padrão com bordas e sombras
- **Formulários:** Campos estilizados com validação
- **Status Badges:** Indicadores visuais para agendamentos

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/alterar-senha` - Alterar senha

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes/:id` - Buscar cliente por ID
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente
- `GET /api/clientes/buscar?termo=` - Buscar por nome/telefone

### Serviços
- `GET /api/servicos` - Listar serviços
- `POST /api/servicos` - Criar serviço (admin)
- `GET /api/servicos/:id` - Buscar serviço por ID
- `PUT /api/servicos/:id` - Atualizar serviço (admin)
- `DELETE /api/servicos/:id` - Deletar serviço (admin)

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `GET /api/agendamentos/:id` - Buscar agendamento por ID
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `PATCH /api/agendamentos/:id/cancelar` - Cancelar agendamento
- `GET /api/agendamentos/data/:data` - Buscar por data
- `GET /api/agendamentos/barbeiro/:id` - Buscar por barbeiro

### Barbeiros
- `GET /api/barbeiros` - Listar barbeiros
- `GET /api/barbeiros/:id` - Buscar barbeiro por ID
- `PUT /api/barbeiros/:id` - Atualizar barbeiro
- `GET /api/barbeiros/disponiveis` - Buscar disponíveis
- `GET /api/barbeiros/:id/horarios-disponiveis` - Horários disponíveis

## 🔒 Segurança

### Medidas Implementadas
- ✅ Autenticação JWT
- ✅ Criptografia de senhas com bcrypt
- ✅ Rate limiting nas requisições
- ✅ Headers de segurança com Helmet
- ✅ Validação de dados de entrada
- ✅ Controle de permissões por role
- ✅ Sanitização de dados
- ✅ CORS configurado

## 📱 Responsividade

O sistema foi desenvolvido com design responsivo, funcionando em:
- 💻 Desktop
- 📱 Tablet
- 📲 Mobile

## 🧪 Testes

Para testar o sistema:

1. Acesse `http://localhost:3000`
2. Use as credenciais de demonstração
3. Navegue pelas diferentes seções
4. Teste as funcionalidades de CRUD

## 📋 Scripts Disponíveis

### Backend
```bash
npm run dev     # Servidor em desenvolvimento
npm start       # Servidor em produção
npm run init-db # Inicializar banco de dados
```

### Frontend
```bash
npm run dev     # Servidor de desenvolvimento
npm run build   # Build para produção
npm run preview # Preview do build
npm run lint    # Verificar código
```

## 🤝 Contribuição

Este é um projeto acadêmico desenvolvido para demonstrar conhecimentos em:
- Desenvolvimento Full Stack
- APIs RESTful
- Autenticação e Autorização
- Interface de Usuário Responsiva
- Gerenciamento de Estado
- Boas Práticas de Código

## 📄 Licença

Projeto desenvolvido para fins acadêmicos.