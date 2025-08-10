# Multi-stage build para optimizar el tamaño final
FROM node:22-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY astro.config.mjs ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY src/ ./src/
COPY public/ ./public/

# Crear directorio para la base de datos
RUN mkdir -p /app/data

# Copiar base de datos SQLite si existe
COPY database.sqlite ./data/database.sqlite

# Build de la aplicación
RUN npm run build

# Etapa de producción
FROM node:22-alpine AS production

# Instalar dumb-init para manejo adecuado de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S astro -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias y instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar la aplicación construida desde el stage builder
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/data ./data

# Crear directorio para uploads si no existe
RUN mkdir -p /app/public/uploads && chown -R astro:nodejs /app/public/uploads

# Cambiar al usuario no-root
USER astro

# Exponer puerto
EXPOSE 4321

# Variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Comando de inicio con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "./dist/server/entry.mjs"]
