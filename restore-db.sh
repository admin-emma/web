#!/bin/bash

# Script de restauración para la base de datos EMMA
# Uso: ./restore-db.sh <archivo_backup>

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Verificar parámetro
if [ -z "$1" ]; then
    log_error "Debe especificar el archivo de backup a restaurar"
    echo "Uso: $0 <archivo_backup>"
    echo ""
    echo "Backups disponibles:"
    ls -lht backups/database_backup_*.sqlite 2>/dev/null | head -10 || echo "No hay backups disponibles"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que existe el archivo de backup
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Archivo de backup no encontrado: $BACKUP_FILE"
    exit 1
fi

log_info "🔄 Restaurando base de datos desde: $BACKUP_FILE"

# Crear backup de la base de datos actual antes de restaurar
if [ -f "database.sqlite" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    CURRENT_BACKUP="database_current_${TIMESTAMP}.sqlite"
    log_warn "⚠️  Creando backup de seguridad de la BD actual: $CURRENT_BACKUP"
    cp database.sqlite "$CURRENT_BACKUP"
fi

# Restaurar
cp "$BACKUP_FILE" database.sqlite

# Verificar la restauración
if [ -f "database.sqlite" ]; then
    FILE_SIZE=$(ls -lh database.sqlite | awk '{print $5}')
    log_info "✅ Base de datos restaurada exitosamente (${FILE_SIZE})"
    
    # Verificar integridad
    TABLES_COUNT=$(sqlite3 database.sqlite "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "ERROR")
    
    if [ "$TABLES_COUNT" != "ERROR" ]; then
        log_info "📊 Verificación: $TABLES_COUNT tablas encontradas"
        log_info "🎉 Restauración completada exitosamente"
    else
        log_error "❌ Error al verificar la integridad de la base de datos restaurada"
        exit 1
    fi
else
    log_error "❌ Error al restaurar la base de datos"
    exit 1
fi
