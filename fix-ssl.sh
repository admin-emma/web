#!/bin/bash

# Script para arreglar DNS y configurar SSL de Let's Encrypt correctamente
# Uso: ./fix-ssl.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🔧 Arreglando configuración SSL para descubre.emma.pe"

DOMAIN="descubre.emma.pe"

# 1. Arreglar configuración nginx actual para quitar www
log_step "Arreglando configuración nginx..."

# Backup de configuración actual
cp nginx/conf.d/emma.pe.conf nginx/conf.d/emma.pe.conf.backup-$(date +%s)

# Quitar www de la configuración actual
sed -i 's/server_name descubre.emma.pe www.descubre.emma.pe;/server_name descubre.emma.pe;/g' nginx/conf.d/emma.pe.conf

log_info "✅ Configuración nginx actualizada (removido www.descubre.emma.pe)"

# 2. Reiniciar nginx con la configuración corregida
log_step "Reiniciando nginx con configuración corregida..."
docker-compose restart nginx
sleep 5

# 3. Verificar que nginx responde
log_step "Verificando que nginx responde..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302\|500"; then
    log_info "✅ nginx responde correctamente"
else
    log_error "nginx no responde. Verifica la configuración."
    exit 1
fi

# 4. Ejecutar configuración SSL solo para descubre.emma.pe
log_step "Ejecutando configuración SSL para $DOMAIN únicamente..."
./setup-ssl.sh

# 5. Verificar resultado
if [ -f "ssl/live/$DOMAIN/fullchain.pem" ]; then
    log_info "🎉 ¡SSL configurado exitosamente!"
    log_info "🌐 Sitio disponible en:"
    log_info "   https://descubre.emma.pe"
    log_info "   https://descubre.emma.pe/admin"
else
    log_warn "⚠️  SSL no se configuró correctamente"
    log_info "Sitio disponible en HTTP:"
    log_info "   http://descubre.emma.pe"
fi

echo ""
log_info "📋 Para verificar el estado completo:"
log_info "   ./verify-deployment.sh"
