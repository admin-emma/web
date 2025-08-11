#!/bin/bash

# Script de despliegue para EMMA (solo HTTP, sin SSL)
# Uso: ./deploy-http.sh

set -e

echo "🚀 Iniciando despliegue de EMMA en emma.pe (HTTP only)"

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
if [ ! -f "docker-compose-http.yml" ]; then
    log_error "No se encuentra docker-compose-http.yml. ¿Estás en el directorio correcto?"
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    log_warn "No se encuentra archivo .env. Creando desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_warn "Por favor edita el archivo .env con los valores correctos antes de continuar."
        log_warn "Variables importantes: ADMIN_PASSWORD, SESSION_SECRET"
        read -p "¿Has configurado el archivo .env? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Configura el archivo .env y vuelve a ejecutar el script."
            exit 1
        fi
    else
        log_error "No se encuentra .env.example. Crea un archivo .env manualmente."
        exit 1
    fi
fi

# Cargar variables de entorno
source .env

# Verificar variables críticas
if [ -z "$ADMIN_PASSWORD" ]; then
    log_error "ADMIN_PASSWORD no está configurado en .env"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    log_error "SESSION_SECRET no está configurado en .env"
    exit 1
fi

log_info "Variables de entorno cargadas correctamente"

# Crear directorios necesarios
log_info "Creando directorios necesarios..."
mkdir -p data
mkdir -p public/uploads
mkdir -p public/cv

# Detener contenedores existentes si están corriendo
log_info "Deteniendo contenedores existentes..."
docker-compose -f docker-compose-http.yml down 2>/dev/null || true

# Limpiar imágenes huérfanas
log_info "Limpiando imágenes Docker huérfanas..."
docker image prune -f

# Construir y levantar servicios
log_info "Construyendo e iniciando servicios..."
docker-compose -f docker-compose-http.yml up -d --build

# Esperar a que los servicios estén listos
log_info "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de contenedores
log_info "Verificando estado de contenedores..."
docker-compose -f docker-compose-http.yml ps

# Verificar que la aplicación responde
log_info "Verificando que la aplicación responde..."
for i in {1..10}; do
    if curl -f http://localhost 2>/dev/null; then
        log_info "✅ Aplicación respondiendo correctamente!"
        break
    else
        if [ $i -eq 10 ]; then
            log_error "❌ La aplicación no responde después de 10 intentos"
            exit 1
        fi
        log_warn "Intento $i/10 - esperando..."
        sleep 5
    fi
done

echo ""
echo "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo "📱 Accesos:"
echo "   🌐 Web principal: http://emma.pe"
echo "   ⚙️  Panel admin: http://emma.pe/admin"
echo "   💼 Careers: http://emma.pe/careers"
echo "   📧 Contact: http://emma.pe/contact"
echo ""
echo "🔐 Credenciales de admin:"
echo "   👤 Usuario: admin"
echo "   📧 Email: admin@emma.pe"
echo "   🔑 Password: [configurado en .env]"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Accede a http://emma.pe/admin"
echo "   2. Cambia la contraseña del administrador"
echo "   3. Configura SSL/HTTPS cuando esté listo"
echo ""
log_info "EMMA está funcionando en HTTP. SSL se puede configurar después."
