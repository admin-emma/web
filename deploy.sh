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

# Verificar si existe archivo .env
if [ ! -f ".env" ]; then
    log_error "Archivo .env no encontrado. Configura tus variables antes de desplegar."
    exit 1
fi

log_info "Cargando configuración desde .env..."
source .env

log_info "Creando directorios necesarios..."
mkdir -p ssl
mkdir -p public/uploads
mkdir -p logs

# Verificar que existe la base de datos
if [ ! -f "database.sqlite" ]; then
    log_error "Base de datos database.sqlite no encontrada en el directorio raíz."
    log_info "Asegúrate de que database.sqlite esté presente antes del despliegue."
    exit 1
fi

log_info "Base de datos encontrada: database.sqlite"

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

log_info "Levantando contenedores con la base de datos actual..."
docker-compose up --build -d

log_info "📊 Estado final del despliegue:"
docker-compose ps

log_info "🌐 La aplicación está disponible en:"
log_info "   HTTP:  http://emma.pe"
if [ -f "./ssl/live/emma.pe/fullchain.pem" ]; then
    log_info "   HTTPS: https://emma.pe (SSL configurado)"
else
    log_warn "   HTTPS: No configurado - ejecuta './setup-ssl.sh' para habilitar SSL"
fi

log_info "📱 Panel de administración:"
log_info "   https://emma.pe/admin"

log_info "📋 Para ver logs en tiempo real:"
log_info "   docker-compose logs -f"

echo ""
log_info "🎉 ¡Despliegue completado exitosamente!"
echo ""
if [ ! -f "./ssl/live/emma.pe/fullchain.pem" ]; then
    log_warn "⚠️  SSL no está configurado. Para habilitar HTTPS:"
    log_warn "   1. Asegúrate de que tu dominio emma.pe apunte a este servidor"
    log_warn "   2. Ejecuta: chmod +x setup-ssl.sh && ./setup-ssl.sh"
fi
