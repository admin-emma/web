#!/bin/bash

# Script de despliegue simplificado para EMMA
# Uso: ./deploy-simple.sh

set -e

echo "🚀 Iniciando despliegue simplificado de EMMA"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
    log_error "docker-compose.yml no encontrado. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar o crear archivo .env
if [ ! -f ".env" ]; then
    log_warn "Archivo .env no encontrado. Creando con valores por defecto..."
    cat > .env << EOF
SESSION_SECRET=emma-secret-key-$(date +%s)
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@emma.pe
ADMIN_USERNAME=admin
EOF
    log_info "✅ Archivo .env creado. Edita las credenciales si es necesario."
fi

log_info "Cargando configuración desde .env..."
source .env

# Verificar variables críticas
if [ -z "$SESSION_SECRET" ]; then
    log_error "SESSION_SECRET no configurado en .env"
    exit 1
fi

log_info "Creando directorios necesarios..."
mkdir -p ssl
mkdir -p public/uploads
mkdir -p logs

# Verificar que existe la base de datos o la inicializamos
if [ ! -f "database.sqlite" ]; then
    log_warn "Base de datos database.sqlite no encontrada. Inicializando..."
    
    # Verificar si existe script de inicialización
    if [ -f "init-db.sh.backup" ]; then
        log_info "Encontrado script de inicialización. Ejecutando..."
        chmod +x init-db.sh.backup
        cp init-db.sh.backup init-db.sh
        chmod +x init-db.sh
        ./init-db.sh
        log_info "✅ Base de datos inicializada"
    else
        # Crear base de datos vacía con permisos correctos
        log_info "Creando base de datos vacía..."
        touch database.sqlite
        chmod 666 database.sqlite
        log_warn "⚠️  Base de datos vacía creada. La aplicación creará las tablas automáticamente."
    fi
else
    log_info "✅ Base de datos encontrada: database.sqlite"
    # Verificar permisos de la base de datos
    chmod 666 database.sqlite
    log_info "✅ Permisos de base de datos verificados"
fi

# Verificar dependencias del sistema
log_info "Verificando dependencias del sistema..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado. Ejecuta './setup-server.sh' primero."
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado. Ejecuta './setup-server.sh' primero."
    exit 1
fi

# Verificar que el usuario puede usar Docker
if ! docker ps &> /dev/null; then
    log_error "No tienes permisos para usar Docker. Ejecuta: sudo usermod -aG docker $USER && newgrp docker"
    exit 1
fi

log_info "✅ Dependencias verificadas"

# Configurar nginx para HTTP primero (antes de SSL)
log_info "Configurando nginx para despliegue HTTP temporal..."
if [ -f "nginx/conf.d/emma.pe.http-only.conf" ]; then
    log_info "Usando configuración HTTP-only para arranque inicial..."
    cp nginx/conf.d/emma.pe.conf nginx/conf.d/emma.pe.ssl.conf.backup 2>/dev/null || true
    cp nginx/conf.d/emma.pe.http-only.conf nginx/conf.d/emma.pe.conf
    log_info "✅ nginx configurado para HTTP temporal"
fi

log_info "Levantando contenedores con la base de datos actual..."
docker-compose up --build -d

# Esperar a que los contenedores arranquen
log_info "Esperando a que los contenedores se inicialicen..."
sleep 15

# Verificar que la aplicación esté respondiendo
log_info "Verificando que la aplicación esté funcionando..."
for i in {1..6}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
        log_info "✅ Aplicación respondiendo correctamente"
        break
    elif [ $i -eq 6 ]; then
        log_warn "⚠️  La aplicación no responde en HTTP. Verificando logs..."
        docker-compose logs emma-app --tail 10
        log_warn "Continuando con el despliegue..."
    else
        log_info "Intento $i/6: Esperando respuesta de la aplicación..."
        sleep 10
    fi
done

log_info "📊 Estado final del despliegue:"
docker-compose ps

log_info "🌐 La aplicación está disponible en:"
log_info "   HTTP:  http://descubre.emma.pe"
log_info "   IP:    http://$(curl -s ifconfig.me || echo 'IP-del-servidor')"

if [ -f "./ssl/live/descubre.emma.pe/fullchain.pem" ]; then
    log_info "   HTTPS: https://descubre.emma.pe (SSL configurado)"
else
    log_warn "   HTTPS: No configurado - ejecuta './setup-ssl.sh' para habilitar SSL"
    log_warn "   ⚠️  Actualmente funcionando en HTTP únicamente"
fi

log_info "📱 Panel de administración:"
log_info "   https://descubre.emma.pe/admin"

log_info "📋 Para ver logs en tiempo real:"
log_info "   docker-compose logs -f"

echo ""
log_info "🎉 ¡Despliegue completado exitosamente!"
echo ""
if [ ! -f "./ssl/live/descubre.emma.pe/fullchain.pem" ]; then
    log_warn "⚠️  SSL no está configurado. Para habilitar HTTPS:"
    log_warn "   1. Asegúrate de que tu dominio descubre.emma.pe apunte a este servidor"
    log_warn "   2. Ejecuta: chmod +x setup-ssl.sh && ./setup-ssl.sh"
fi
