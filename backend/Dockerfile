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

# Comando de inicialização
CMD ["npm", "start"]