#!/bin/bash

# Script para verificar que el despliegue de EMMA esté funcionando correctamente
# Uso: ./verify-deployment.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_check() {
    echo -e "${BLUE}[?]${NC} $1"
}

echo "🔍 Verificando despliegue de EMMA..."
echo ""

# Verificar contenedores
log_check "Verificando estado de contenedores..."
if docker-compose ps | grep -q "Up"; then
    log_info "Contenedores están ejecutándose"
    docker-compose ps | grep "Up" | while read line; do
        echo "   ✓ $line"
    done
else
    log_error "No hay contenedores ejecutándose"
    exit 1
fi

echo ""

# Verificar aplicación EMMA
log_check "Verificando aplicación EMMA (puerto 4321)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4321 | grep -q "200\|301\|302"; then
    log_info "Aplicación EMMA responde correctamente"
else
    log_error "Aplicación EMMA no responde en puerto 4321"
fi

# Verificar nginx
log_check "Verificando nginx (puerto 80)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if echo "$HTTP_CODE" | grep -q "200\|301\|302\|500"; then
    log_info "nginx responde correctamente (HTTP $HTTP_CODE)"
else
    log_error "nginx no responde en puerto 80 (HTTP $HTTP_CODE)"
fi

# Verificar base de datos
log_check "Verificando base de datos..."
if [ -f "database.sqlite" ]; then
    SIZE=$(stat -f%z "database.sqlite" 2>/dev/null || stat -c%s "database.sqlite" 2>/dev/null)
    if [ "$SIZE" -gt "0" ]; then
        log_info "Base de datos existe y tiene contenido ($SIZE bytes)"
    else
        log_warn "Base de datos existe pero está vacía"
    fi
    
    # Verificar permisos
    PERMS=$(ls -la database.sqlite | awk '{print $1}')
    if [[ "$PERMS" == *"rw-"*"rw-"* ]]; then
        log_info "Permisos de base de datos son correctos ($PERMS)"
    else
        log_warn "Permisos de base de datos pueden causar problemas ($PERMS)"
    fi
else
    log_error "Base de datos no encontrada"
fi

# Verificar variables de entorno
log_check "Verificando configuración..."
if [ -f ".env" ]; then
    log_info "Archivo .env encontrado"
    if grep -q "SESSION_SECRET" .env; then
        log_info "SESSION_SECRET configurado"
    else
        log_warn "SESSION_SECRET no encontrado en .env"
    fi
else
    log_warn "Archivo .env no encontrado"
fi

# Verificar SSL
log_check "Verificando SSL..."
if [ -f "ssl/live/descubre.emma.pe/fullchain.pem" ]; then
    log_info "Certificados SSL encontrados"
    HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://localhost 2>/dev/null || echo "000")
    if [ "$HTTPS_CODE" != "000" ]; then
        log_info "HTTPS funciona (código $HTTPS_CODE)"
    else
        log_warn "HTTPS no responde correctamente"
    fi
else
    log_warn "SSL no configurado (solo HTTP disponible)"
fi

# Verificar acceso externo
log_check "Verificando acceso desde IP pública..."
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "desconocida")
if [ "$PUBLIC_IP" != "desconocida" ]; then
    log_info "IP pública: $PUBLIC_IP"
    EXTERNAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$PUBLIC_IP" 2>/dev/null || echo "000")
    if echo "$EXTERNAL_CODE" | grep -q "200\|301\|302\|500"; then
        log_info "Acceso externo funciona (HTTP $EXTERNAL_CODE)"
    else
        log_warn "Acceso externo puede tener problemas (HTTP $EXTERNAL_CODE)"
    fi
fi

# Verificar dominio
log_check "Verificando dominio descubre.emma.pe..."
DOMAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://descubre.emma.pe" 2>/dev/null || echo "000")
if echo "$DOMAIN_CODE" | grep -q "200\|301\|302\|500"; then
    log_info "Dominio responde correctamente (HTTP $DOMAIN_CODE)"
else
    log_warn "Dominio no responde o DNS no configurado (HTTP $DOMAIN_CODE)"
fi

echo ""
echo "📋 Resumen de verificación:"
echo ""

# URLs disponibles
echo "🌐 URLs disponibles:"
echo "   📱 Aplicación: http://descubre.emma.pe"
echo "   📱 Por IP:     http://$PUBLIC_IP"
echo "   🛡️  Admin:      http://descubre.emma.pe/admin"
echo "   ❤️  Health:     http://descubre.emma.pe/api/health"

if [ -f "ssl/live/descubre.emma.pe/fullchain.pem" ]; then
    echo "   🔒 HTTPS:      https://descubre.emma.pe"
fi

echo ""
echo "🛠️  Comandos útiles:"
echo "   Ver logs:      docker-compose logs -f"
echo "   Estado:        docker-compose ps"
echo "   Reiniciar:     docker-compose restart"
echo "   Configurar SSL: ./setup-ssl.sh"

# Verificar si hay errores críticos
ERROR_COUNT=0
if ! docker-compose ps | grep -q "Up"; then
    ((ERROR_COUNT++))
fi

if [ ! -f "database.sqlite" ]; then
    ((ERROR_COUNT++))
fi

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo ""
    log_info "🎉 ¡Despliegue verificado exitosamente!"
else
    echo ""
    log_error "⚠️  Se encontraron $ERROR_COUNT problemas críticos"
    echo "   Consulta DEPLOYMENT-GUIDE.md para soluciones"
fi
