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

# Verificar que los archivos de BD están presentes
RUN ls -la init-db.sh seed-data.sql

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

# Copiar archivos de base de datos DIRECTAMENTE del contexto de build
COPY seed-database.sql ./
COPY init-db.sh ./

# Verificar que los archivos están presentes
RUN ls -la ./

# Hacer el script ejecutable y verificar
RUN chmod +x ./init-db.sh && ls -la ./init-db.sh

# Crear directorio para uploads si no existe
RUN mkdir -p /app/public/uploads && chown -R astro:nodejs /app/public/uploads
RUN mkdir -p /app/public/cv && chown -R astro:nodejs /app/public/cv

# Configurar variables de entorno temporales para la inicialización
ENV ADMIN_PASSWORD=admin123
ENV SESSION_SECRET=default-secret-key
ENV ADMIN_EMAIL=admin@emma.pe
ENV ADMIN_USERNAME=admin

# Inicializar base de datos directamente
RUN echo "🌱 Inicializando base de datos EMMA..." && \
    # Crear estructura de base de datos
    sqlite3 /app/database.sqlite < /app/seed-database.sql && \
    echo "📊 Seed data aplicado" && \
    # Usar hash bcrypt pre-generado para 'admin123' 
    # Este hash corresponde a la contraseña 'admin123' con bcrypt salt 10
    ADMIN_HASH='$2b$10$TKKaGlzJ8hPrUzJ5K4aGLeYBOJiK7H.S4J8Qx6YsY5nZKwfEQUdoi' && \
    sqlite3 /app/database.sqlite "UPDATE users SET password_hash = '${ADMIN_HASH}', email = '${ADMIN_EMAIL}', username = '${ADMIN_USERNAME}' WHERE id = 1;" && \
    echo "✅ Usuario administrador configurado: ${ADMIN_USERNAME} / ${ADMIN_EMAIL}" && \
    # Verificar base de datos
    echo "📈 Usuarios en BD: $(sqlite3 /app/database.sqlite 'SELECT COUNT(*) FROM users;')"

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
