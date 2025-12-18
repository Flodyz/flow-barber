# Backend - Sistema de Barbearia
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema (curl e openssl para Prisma)
RUN apk add --no-cache curl openssl

# Copiar package files
COPY package*.json ./

# Copiar schema do Prisma
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Variáveis de ambiente (serão sobrescritas pelo docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Script de inicialização com Prisma migrations
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Comando de inicialização
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]