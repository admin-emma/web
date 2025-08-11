#!/bin/bash

# Script de verificación del sistema EMMA
# Uso: ./check-system.sh

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

log_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

echo "🔍 Verificando sistema EMMA"
echo ""

# Función para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        log_info "✅ $1 está instalado: $($1 --version 2>/dev/null | head -n1 || echo 'versión no disponible')"
    else
        log_error "❌ $1 no está instalado"
        return 1
    fi
}

# Función para verificar servicio
check_service() {
    if systemctl is-active --quiet $1; then
        log_info "✅ Servicio $1 está activo"
    else
        log_error "❌ Servicio $1 no está activo"
        return 1
    fi
}

# Función para verificar puerto
check_port() {
    if netstat -tuln 2>/dev/null | grep -q ":$1 "; then
        log_info "✅ Puerto $1 está abierto"
    else
        log_warn "⚠️  Puerto $1 no está en uso"
        return 1
    fi
}

# Verificar dependencias del sistema
log_check "Verificando dependencias del sistema..."
check_command docker
check_command docker-compose
check_command git
check_command curl
check_command sqlite3
check_command nginx || log_warn "nginx no está instalado en el host (normal si usas Docker)"

echo ""

# Verificar servicios
log_check "Verificando servicios del sistema..."
check_service docker
check_service ufw || log_warn "UFW no está activo"

echo ""

# Verificar puertos
log_check "Verificando puertos..."
if command -v netstat &> /dev/null; then
    check_port 80 || log_warn "Puerto 80 no está en uso (nginx podría no estar corriendo)"
    check_port 443 || log_warn "Puerto 443 no está en uso (HTTPS no configurado)"
    check_port 3000 || log_warn "Puerto 3000 no está en uso (aplicación podría no estar corriendo)"
else
    log_warn "netstat no disponible, no se pueden verificar puertos"
fi

echo ""

# Verificar Docker
log_check "Verificando Docker..."
if docker ps &> /dev/null; then
    log_info "✅ Docker funciona correctamente"
    
    # Verificar contenedores de EMMA
    if docker ps | grep -q "emma-app"; then
        log_info "✅ Contenedor emma-app está corriendo"
    else
        log_warn "⚠️  Contenedor emma-app no está corriendo"
    fi
    
    if docker ps | grep -q "emma-nginx"; then
        log_info "✅ Contenedor emma-nginx está corriendo"
    else
        log_warn "⚠️  Contenedor emma-nginx no está corriendo"
    fi
else
    log_error "❌ No tienes permisos para usar Docker"
fi

echo ""

# Verificar archivos del proyecto
log_check "Verificando archivos del proyecto..."
if [ -f "docker-compose.yml" ]; then
    log_info "✅ docker-compose.yml encontrado"
else
    log_error "❌ docker-compose.yml no encontrado"
fi

if [ -f "database.sqlite" ]; then
    DB_SIZE=$(ls -lh database.sqlite | awk '{print $5}')
    log_info "✅ database.sqlite encontrada (${DB_SIZE})"
    
    # Verificar contenido de la base de datos
    if sqlite3 database.sqlite "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" &> /dev/null; then
        TABLES_COUNT=$(sqlite3 database.sqlite "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
        log_info "✅ Base de datos válida con $TABLES_COUNT tablas"
    else
        log_error "❌ Base de datos corrupta o inaccesible"
    fi
else
    log_error "❌ database.sqlite no encontrada"
fi

if [ -f ".env" ]; then
    log_info "✅ .env encontrado"
else
    log_warn "⚠️  .env no encontrado (usando variables por defecto)"
fi

echo ""

# Verificar SSL
log_check "Verificando configuración SSL..."
if [ -f "ssl/live/emma.pe/fullchain.pem" ] && [ -f "ssl/live/emma.pe/privkey.pem" ]; then
    log_info "✅ Certificados SSL encontrados"
    
    # Verificar validez del certificado
    if openssl x509 -in ssl/live/emma.pe/fullchain.pem -noout -checkend 2592000 &> /dev/null; then
        log_info "✅ Certificado SSL válido por más de 30 días"
    else
        log_warn "⚠️  Certificado SSL expira en menos de 30 días"
    fi
else
    log_warn "⚠️  Certificados SSL no encontrados (ejecuta ./setup-ssl.sh)"
fi

echo ""

# Verificar conectividad
log_check "Verificando conectividad..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    log_info "✅ Aplicación responde en HTTP"
else
    log_warn "⚠️  Aplicación no responde en HTTP (puerto 80)"
fi

if curl -s -k -o /dev/null -w "%{http_code}" https://localhost | grep -q "200\|301\|302"; then
    log_info "✅ Aplicación responde en HTTPS"
else
    log_warn "⚠️  Aplicación no responde en HTTPS (puerto 443)"
fi

echo ""

# Verificar recursos del sistema
log_check "Verificando recursos del sistema..."
MEMORY_TOTAL=$(free -h | awk '/^Mem:/{print $2}')
MEMORY_USED=$(free -h | awk '/^Mem:/{print $3}')
DISK_USAGE=$(df -h . | awk 'NR==2{print $5}' | tr -d '%')

log_info "💾 Memoria: $MEMORY_USED / $MEMORY_TOTAL usada"
log_info "💿 Disco: $DISK_USAGE% usado en esta partición"

if [ "$DISK_USAGE" -gt 90 ]; then
    log_error "❌ Poco espacio en disco (>90% usado)"
elif [ "$DISK_USAGE" -gt 80 ]; then
    log_warn "⚠️  Espacio en disco limitado (>80% usado)"
else
    log_info "✅ Espacio en disco suficiente"
fi

echo ""

# Resumen final
log_check "Resumen de verificación:"
if docker ps | grep -q "emma-app" && docker ps | grep -q "emma-nginx"; then
    log_info "🎉 Sistema EMMA funcionando correctamente"
else
    log_warn "⚠️  Algunos componentes no están funcionando"
    log_info "💡 Sugerencia: ejecuta './deploy.sh' para iniciar los servicios"
fi

echo ""
