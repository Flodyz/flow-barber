# Configuração para Deploy no Coolify

## 🚀 Sistema de Barbearia - Deploy Guide

### **SQLite no Coolify**
✅ **Sim, funcionará perfeitamente!**

### **Configurações Necessárias:**

#### **1. Volume Persistente (IMPORTANTE)**
```bash
# No Coolify, adicione um volume:
Volume Path: /app/data
Host Path: /data/barbearia
```

#### **2. Variáveis de Ambiente**
```env
NODE_ENV=production
DB_PATH=/app/data/barbearia.db
PORT=3001
```

#### **3. Configuração de Build**
- **Dockerfile Path:** `./backend/Dockerfile` (para backend)
- **Dockerfile Path:** `./frontend/Dockerfile` (para frontend)

#### **4. Health Checks**
- **Backend:** `http://localhost:3001/api/health`
- **Frontend:** `http://localhost:80`

### **Passos no Coolify:**

1. **Conectar Repositório GitHub**
2. **Configurar como Multi-Container** (ou separar em 2 apps)
3. **Backend:**
   - Port: 3001
   - Volume: `/app/data` → `/data/barbearia`
   - Health check: `/api/health`

4. **Frontend:**
   - Port: 80
   - Conectar ao backend via network

### **Estrutura de Dados:**
- ✅ Banco criado automaticamente
- ✅ Tabelas criadas automaticamente  
- ✅ Usuários padrão inseridos:
  - Admin: `admin@barbearia.com` / `admin123`
  - Barbeiro: `joao@barbearia.com` / `barbeiro123`

### **Backup dos Dados:**
```bash
# O arquivo do banco estará em:
/data/barbearia/barbearia.db

# Para backup:
cp /data/barbearia/barbearia.db /backup/barbearia-$(date +%Y%m%d).db
```

### **Monitoramento:**
- Logs via Coolify dashboard
- Health checks automáticos
- Restart automático em caso de falha

### **Performance:**
- SQLite: Excelente para até 1000 usuários simultâneos
- Para mais que isso, considere migrar para PostgreSQL