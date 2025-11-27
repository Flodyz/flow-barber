# Backend - Sistema de Barbearia
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar SQLite3
RUN apk add --no-cache sqlite

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretório para banco de dados
RUN mkdir -p /app/data

# Modificar caminho do banco para volume persistente
ENV DB_PATH=/app/data/barbearia.db

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Instalar curl para health check
RUN apk add --no-cache curl

# Comando de inicialização
CMD ["npm", "start"]