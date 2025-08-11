#!/bin/bash

# Script de backup para la base de datos EMMA
# Uso: ./backup-db.sh

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Crear directorio de backups si no existe
mkdir -p backups

# Generar nombre de archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/database_backup_${TIMESTAMP}.sqlite"

log_info "🗄️  Creando backup de la base de datos..."

# Verificar que existe la base de datos
if [ ! -f "database.sqlite" ]; then
    log_warn "⚠️  database.sqlite no encontrada en el directorio actual"
    exit 1
fi

# Crear backup
cp database.sqlite "$BACKUP_FILE"

# Verificar el backup
if [ -f "$BACKUP_FILE" ]; then
    FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    log_info "✅ Backup creado exitosamente: $BACKUP_FILE (${FILE_SIZE})"
    
    # Mostrar información de la base de datos
    TABLES_COUNT=$(sqlite3 "$BACKUP_FILE" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
    log_info "📊 Tablas en la base de datos: $TABLES_COUNT"
    
    # Listar backups existentes
    log_info "📚 Backups disponibles:"
    ls -lht backups/database_backup_*.sqlite 2>/dev/null | head -5 || log_warn "No hay backups previos"
    
else
    log_warn "❌ Error al crear el backup"
    exit 1
fi

log_info "🎉 Backup completado exitosamente"
