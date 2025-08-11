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
if [ ! -f "docker/compose/docker-compose.yml" ]; then
    log_error "docker/compose/docker-compose.yml no encontrado. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar o crear archivo .env SIEMPRE
log_info "Verificando configuración de variables de entorno..."

# Crear .env si no existe O si está incompleto
if [ ! -f ".env" ] || ! grep -q "SESSION_SECRET" .env || ! grep -q "ADMIN_PASSWORD" .env; then
    log_warn "Archivo .env faltante o incompleto. Creando/corrigiendo..."
    
    # Backup si existe
    [ -f ".env" ] && cp .env .env.backup-$(date +%s)
    
    # Crear .env completo
    cat > .env << EOF
SESSION_SECRET=emma-secret-key-$(date +%s)-$(openssl rand -hex 8)
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@emma.pe
ADMIN_USERNAME=admin
EOF
    log_info "✅ Archivo .env creado/corregido con todas las variables requeridas"
    log_warn "🔒 IMPORTANTE: Cambia ADMIN_PASSWORD en producción!"
else
    log_info "✅ Archivo .env encontrado y completo"
fi

# Forzar carga de variables
log_info "Cargando configuración desde .env..."
set -a  # Exportar automáticamente todas las variables
source .env
set +a

# Verificar TODAS las variables críticas
MISSING_VARS=""
[ -z "$SESSION_SECRET" ] && MISSING_VARS="$MISSING_VARS SESSION_SECRET"
[ -z "$ADMIN_PASSWORD" ] && MISSING_VARS="$MISSING_VARS ADMIN_PASSWORD"
[ -z "$ADMIN_EMAIL" ] && MISSING_VARS="$MISSING_VARS ADMIN_EMAIL"
[ -z "$ADMIN_USERNAME" ] && MISSING_VARS="$MISSING_VARS ADMIN_USERNAME"

if [ -n "$MISSING_VARS" ]; then
    log_error "Variables críticas faltantes:$MISSING_VARS"
    log_error "Recreando archivo .env..."
    cat > .env << EOF
SESSION_SECRET=emma-secret-key-$(date +%s)-$(openssl rand -hex 8)
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@emma.pe
ADMIN_USERNAME=admin
EOF
    source .env
    log_info "✅ Variables recreadas exitosamente"
fi

log_info "✅ Variables de entorno verificadas:"
log_info "   SESSION_SECRET: ${SESSION_SECRET:0:20}..."
log_info "   ADMIN_USERNAME: $ADMIN_USERNAME"
log_info "   ADMIN_EMAIL: $ADMIN_EMAIL"

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

# ==========================================
# VERIFICACIÓN FINAL DE VARIABLES DE ENTORNO
# ==========================================
log_info "🔍 Verificación final de variables antes del despliegue..."

# Exportar variables explícitamente para docker-compose
export SESSION_SECRET="$SESSION_SECRET"
export ADMIN_PASSWORD="$ADMIN_PASSWORD"
export ADMIN_EMAIL="$ADMIN_EMAIL"
export ADMIN_USERNAME="$ADMIN_USERNAME"

# Verificar que docker-compose puede ver las variables
log_info "Verificando que docker-compose puede acceder a las variables..."
if docker-compose -f docker/compose/docker-compose.yml config | grep -q "SESSION_SECRET"; then
    log_error "⚠️  PROBLEMA: docker-compose.yml parece referenciar SESSION_SECRET directamente"
    log_info "Las variables se pasarán via environment"
fi

# Mostrar variables que se usarán (sin mostrar valores sensibles)
log_info "✅ Variables que se pasarán a los contenedores:"
echo "   SESSION_SECRET=***hidden***"
echo "   ADMIN_PASSWORD=***hidden***"
echo "   ADMIN_EMAIL=$ADMIN_EMAIL"
echo "   ADMIN_USERNAME=$ADMIN_USERNAME"

# Configurar nginx para HTTP primero (antes de SSL)
log_info "Configurando nginx para despliegue HTTP temporal..."
if [ -f "nginx/conf.d/emma.pe.http-only.conf" ]; then
    log_info "Usando configuración HTTP-only para arranque inicial..."
    cp nginx/conf.d/emma.pe.conf nginx/conf.d/emma.pe.ssl.conf.backup 2>/dev/null || true
    cp nginx/conf.d/emma.pe.http-only.conf nginx/conf.d/emma.pe.conf
    log_info "✅ nginx configurado para HTTP temporal"
fi

log_info "Levantando contenedores con la base de datos actual..."
docker-compose -f docker/compose/docker-compose.yml up --build -d

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
        docker-compose -f docker/compose/docker-compose.yml logs emma-app --tail 10
        log_warn "Continuando con el despliegue..."
    else
        log_info "Intento $i/6: Esperando respuesta de la aplicación..."
        sleep 10
    fi
done

log_info "📊 Estado final del despliegue:"
docker-compose -f docker/compose/docker-compose.yml ps

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
log_info "   docker-compose -f docker/compose/docker-compose.yml logs -f"

echo ""
log_info "🎉 ¡Despliegue completado exitosamente!"
echo ""
if [ ! -f "./ssl/live/descubre.emma.pe/fullchain.pem" ]; then
    log_warn "⚠️  SSL no está configurado. Para habilitar HTTPS:"
    log_warn "   1. Asegúrate de que tu dominio descubre.emma.pe apunte a este servidor"
    log_warn "   2. Ejecuta: chmod +x setup-ssl.sh && ./setup-ssl.sh"
fi
