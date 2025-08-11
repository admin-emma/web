# 🗄️ Scripts de Base de Datos

Scripts para gestión y mantenimiento de la base de datos SQLite.

## 📊 Scripts Disponibles

### `backup-db.sh`
**Backup automático de la base de datos**
- Crea backup con timestamp
- Comprime el archivo
- Almacena en directorio `backups/`

```bash
./backup-db.sh
```

### `restore-db.sh`
**Restaurar base de datos desde backup**
- Lista backups disponibles
- Restaura backup seleccionado
- Mantiene backup actual como seguridad

```bash
./restore-db.sh [archivo-backup.sql.gz]
```

## 📁 Estructura de Backups

```
backups/
├── database-2025-08-11-120000.sql.gz
├── database-2025-08-11-130000.sql.gz
└── database-2025-08-11-140000.sql.gz
```

## 🔄 Automatización

Para backups automáticos, agrega a crontab:

```bash
# Backup cada 6 horas
0 */6 * * * /path/to/scripts/database/backup-db.sh

# Backup diario a las 2 AM
0 2 * * * /path/to/scripts/database/backup-db.sh
```

## ⚠️ Consideraciones

- La base de datos se encuentra en: `database.sqlite`
- Los backups se almacenan comprimidos (`.gz`)
- Siempre verificar permisos antes de restaurar
- Detener aplicación durante restauración en producción
