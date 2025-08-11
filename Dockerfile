# Multi-stage build para optimizar el tamaño final
FROM node:22-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias de desarrollo
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .



# Build de la aplicación
RUN npm run build

# Stage de producción
FROM node:22-alpine AS production

# Instalar dumb-init para manejo adecuado de señales y sqlite3
RUN apk add --no-cache dumb-init sqlite

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S astro -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios desde el builder
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package*.json ./
COPY --from=builder --chown=astro:nodejs /app/public ./public

# Copiar la base de datos existente
COPY database.sqlite ./database.sqlite

# Crear directorio para uploads si no existe
RUN mkdir -p /app/public/uploads && chown -R astro:nodejs /app/public/uploads
RUN mkdir -p /app/public/cv && chown -R astro:nodejs /app/public/cv

# Cambiar propiedad de la base de datos al usuario astro
RUN chown astro:nodejs database.sqlite

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
