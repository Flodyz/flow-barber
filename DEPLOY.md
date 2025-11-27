# Instruções para Deploy no Coolify

## Backend Configuration
- **Build Pack**: Dockerfile
- **Port**: 3000
- **Base Directory**: /backend
- **Dockerfile Location**: /Dockerfile

## Frontend Configuration  
- **Build Pack**: Dockerfile
- **Port**: 80
- **Base Directory**: /frontend
- **Dockerfile Location**: /Dockerfile

## Environment Variables

### Backend (.env.production)
```
NODE_ENV=production
PORT=3000
DB_PATH=/app/data/barbearia.db
ALLOWED_ORIGINS=https://flow.flodydev.site
JWT_SECRET=seu_jwt_secret_super_seguro_para_producao_barbearia_2025_coolify_flow
```

### Frontend (.env.production)
```
VITE_API_URL=https://flow-api.flodydev.site/api
```

## ⚠️ IMPORTANTE - Configuração no Coolify:

### Variáveis de Ambiente OBRIGATÓRIAS no Backend:
1. `NODE_ENV=production`
2. `PORT=3000` 
3. `DB_PATH=/app/data/barbearia.db`
4. `ALLOWED_ORIGINS=https://flow.flodydev.site`
5. `JWT_SECRET=gere_uma_chave_secreta_forte_aqui`

**⚡ Para gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Volume Mounts
- Backend: `/app/data` para persistência do banco SQLite

## Health Checks
- Backend: GET /api/health
- Frontend: GET /health