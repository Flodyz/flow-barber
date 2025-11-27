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
```

### Frontend (.env.production)
```
VITE_API_URL=https://flow-api.flodydev.site/api
```

## Volume Mounts
- Backend: `/app/data` para persistência do banco SQLite

## Health Checks
- Backend: GET /api/health
- Frontend: GET /health