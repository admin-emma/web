#!/bin/bash

# Script para desarrollo local de EMMA
# Uso: ./dev.sh [comando]

set -e

# Colores para output
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Función para mostrar ayuda
show_help() {
    echo "🚀 Script de desarrollo local para EMMA"
    echo ""
    echo "Uso: ./dev.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start     - Iniciar aplicación en modo desarrollo"
    echo "  stop      - Parar aplicación"
    echo "  restart   - Reiniciar aplicación"
    echo "  logs      - Ver logs en tiempo real"
    echo "  shell     - Acceder al contenedor"
    echo "  install   - Instalar dependencias"
    echo "  build     - Construir para producción"
    echo "  clean     - Limpiar contenedores y volúmenes"
    echo "  db        - Ver información de la base de datos"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./dev.sh start    # Iniciar en modo desarrollo"
    echo "  ./dev.sh logs     # Ver logs"
    echo "  ./dev.sh shell    # Acceder al contenedor"
}

# Verificar que Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_warn "Docker no está instalado. Instalando Docker Desktop..."
        log_info "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! docker ps &> /dev/null; then
        log_warn "Docker no está corriendo. Por favor inicia Docker Desktop."
        exit 1
    fi
}

# Verificar archivos necesarios
check_files() {
    if [ ! -f "database.sqlite" ]; then
        log_warn "⚠️  database.sqlite no encontrada."
        log_info "💡 Si es la primera vez, la aplicación intentará crear una BD básica."
    fi

    if [ ! -f ".env.dev" ]; then
        log_warn "⚠️  .env.dev no encontrado, creando uno básico..."
        cp .env.dev.example .env.dev 2>/dev/null || log_info "Usando variables de entorno por defecto"
    fi
}

# Comando principal
case "${1:-start}" in
    "start")
        log_step "🚀 Iniciando EMMA en modo desarrollo..."
        check_docker
        check_files
        
        log_info "Copiando variables de entorno de desarrollo..."
        cp .env.dev .env 2>/dev/null || true
        
        log_info "Construyendo e iniciando contenedores..."
        docker-compose -f docker-compose.dev.yml up --build -d
        
        log_info "⏳ Esperando que la aplicación esté lista..."
        sleep 10
        
        log_info "📋 Estado de contenedores:"
        docker-compose -f docker-compose.dev.yml ps
        
        echo ""
        log_info "🎉 ¡EMMA está corriendo en modo desarrollo!"
        log_info "🌐 Aplicación: http://localhost:4321"
        log_info "🔧 Admin: http://localhost:4321/admin"
        log_info "❤️  Health: http://localhost:4321/api/health"
        echo ""
        log_info "📝 Para ver logs: ./dev.sh logs"
        log_info "🛑 Para parar: ./dev.sh stop"
        ;;
        
    "stop")
        log_step "🛑 Parando aplicación de desarrollo..."
        docker-compose -f docker-compose.dev.yml down
        log_info "✅ Aplicación parada"
        ;;
        
    "restart")
        log_step "🔄 Reiniciando aplicación..."
        docker-compose -f docker-compose.dev.yml restart
        log_info "✅ Aplicación reiniciada"
        ;;
        
    "logs")
        log_step "📋 Mostrando logs en tiempo real..."
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
        
    "shell")
        log_step "🐚 Accediendo al contenedor..."
        docker-compose -f docker-compose.dev.yml exec emma-dev sh
        ;;
        
    "install")
        log_step "📦 Instalando dependencias..."
        docker-compose -f docker-compose.dev.yml exec emma-dev npm install
        log_info "✅ Dependencias instaladas"
        ;;
        
    "build")
        log_step "🏗️  Construyendo para producción..."
        docker-compose -f docker-compose.dev.yml exec emma-dev npm run build
        log_info "✅ Build completado"
        ;;
        
    "clean")
        log_step "🧹 Limpiando contenedores y volúmenes..."
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        log_info "✅ Limpieza completada"
        ;;
        
    "db")
        log_step "🗄️  Información de la base de datos..."
        if [ -f "database.sqlite" ]; then
            DB_SIZE=$(ls -lh database.sqlite | awk '{print $5}')
            log_info "📊 Tamaño de BD: $DB_SIZE"
            
            if command -v sqlite3 &> /dev/null; then
                TABLES_COUNT=$(sqlite3 database.sqlite "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "ERROR")
                if [ "$TABLES_COUNT" != "ERROR" ]; then
                    log_info "📋 Tablas: $TABLES_COUNT"
                    log_info "🔍 Estructura de tablas:"
                    sqlite3 database.sqlite ".tables"
                else
                    log_warn "⚠️  No se pudo leer la base de datos"
                fi
            else
                log_info "💡 Instala sqlite3 para ver más detalles: brew install sqlite (Mac) o apt install sqlite3 (Linux)"
            fi
        else
            log_warn "⚠️  database.sqlite no encontrada"
        fi
        ;;
        
    "help"|"-h"|"--help")
        show_help
        ;;
        
    *)
        log_warn "Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac
