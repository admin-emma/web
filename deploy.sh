#!/bin/bash

# Script de despliegue para EMMA en servidor Ubuntu
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando despliegue de EMMA en emma.pe"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logs con colores
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    log_error "No se encontró docker-compose.yml. Ejecuta este script desde el directorio del proyecto."
    exit 1
fi

# Crear directorios necesarios
log_info "Creando directorios necesarios..."
mkdir -p data
mkdir -p ssl
mkdir -p public/uploads
mkdir -p logs

# Verificar que existe la base de datos
if [ ! -f "database.sqlite" ]; then
    log_warn "No se encontró database.sqlite. Se creará una nueva base de datos."
    touch database.sqlite
fi

# Copiar base de datos al directorio de datos
if [ -f "database.sqlite" ]; then
    log_info "Copiando base de datos a directorio de datos..."
    cp database.sqlite data/
fi

# Crear archivo .gitkeep para uploads
touch public/uploads/.gitkeep

# Detener contenedores existentes
log_info "Deteniendo contenedores existentes..."
docker-compose down || true

# Construir y ejecutar contenedores
log_info "Construyendo y ejecutando contenedores..."
docker-compose up --build -d

# Verificar que los contenedores están ejecutándose
log_info "Verificando estado de contenedores..."
sleep 10

if ! docker-compose ps | grep -q "Up"; then
    log_error "Algunos contenedores no están ejecutándose correctamente."
    docker-compose logs
    exit 1
fi

log_info "✅ Contenedores ejecutándose correctamente!"

# Generar certificados SSL si no existen
if [ ! -f "ssl/live/emma.pe/fullchain.pem" ]; then
    log_info "Generando certificados SSL con Let's Encrypt..."
    
    # Crear configuración temporal sin SSL
    docker-compose exec nginx sh -c "
        cp /etc/nginx/conf.d/emma.pe.conf /etc/nginx/conf.d/emma.pe.conf.bak
        sed 's/listen 443 ssl http2;/listen 443;/' /etc/nginx/conf.d/emma.pe.conf.bak > /etc/nginx/conf.d/emma.pe.conf
        sed '/ssl_/d' /etc/nginx/conf.d/emma.pe.conf > /tmp/temp.conf && mv /tmp/temp.conf /etc/nginx/conf.d/emma.pe.conf
        nginx -s reload
    "
    
    # Generar certificados
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@emma.pe \
        --agree-tos \
        --no-eff-email \
        -d emma.pe \
        -d www.emma.pe
    
    # Restaurar configuración con SSL
    docker-compose exec nginx sh -c "
        mv /etc/nginx/conf.d/emma.pe.conf.bak /etc/nginx/conf.d/emma.pe.conf
        nginx -s reload
    "
    
    log_info "✅ Certificados SSL generados!"
else
    log_info "✅ Certificados SSL ya existen."
fi

# Mostrar estado final
log_info "📊 Estado final del despliegue:"
docker-compose ps

log_info "🌐 La aplicación está disponible en:"
log_info "   HTTP:  http://emma.pe"
log_info "   HTTPS: https://emma.pe"

log_info "📱 Panel de administración:"
log_info "   https://emma.pe/admin"

log_info "📋 Para ver logs en tiempo real:"
log_info "   docker-compose logs -f"

log_info "🔄 Para actualizar la aplicación:"
log_info "   git pull && ./deploy.sh"

echo ""
log_info "🎉 ¡Despliegue completado exitosamente!"
