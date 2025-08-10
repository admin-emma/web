# Comandos de Terminal Frecuentes - EMMA HR Project

## 🚀 Comandos de Desarrollo

### Iniciar Proyecto
```powershell
# Desarrollo
npm run dev

# Preview de producción
npm run preview

# Build para producción
npm run build
```

### Gestión de Dependencias
```powershell
# Instalar dependencias
npm install

# Instalar nueva dependencia
npm install [package-name]

# Instalar dependencia de desarrollo
npm install -D [package-name]

# Actualizar dependencias
npm update

# Verificar dependencias obsoletas
npm outdated

# Limpiar node_modules
Remove-Item -Recurse -Force node_modules; npm install
```

## 🗄️ Comandos de Base de Datos

### SQLite Management
```powershell
# Abrir base de datos en línea de comandos
sqlite3 database.sqlite

# Backup de base de datos
Copy-Item database.sqlite "database_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sqlite"

# Verificar integridad
sqlite3 database.sqlite "PRAGMA integrity_check;"

# Ver esquema de tablas
sqlite3 database.sqlite ".schema"

# Ejecutar query desde archivo
sqlite3 database.sqlite ".read query.sql"
```

### Queries Frecuentes
```sql
-- Ver todas las tablas
.tables

-- Describir estructura de tabla
.schema [table_name]

-- Ver datos recientes
SELECT * FROM [table_name] ORDER BY created_at DESC LIMIT 10;

-- Limpiar tabla (cuidado en producción)
DELETE FROM [table_name];

-- Resetear auto-increment
DELETE FROM sqlite_sequence WHERE name='[table_name]';
```

## 📁 Comandos de Archivos

### Gestión de Archivos
```powershell
# Crear directorio
New-Item -ItemType Directory -Path "src\components\[feature]"

# Copiar archivo
Copy-Item "template.astro" "new-component.astro"

# Mover archivo
Move-Item "old-location\file.astro" "new-location\"

# Eliminar archivo
Remove-Item "filename.astro"

# Eliminar directorio y contenido
Remove-Item -Recurse -Force "directory-name"

# Buscar archivos por extensión
Get-ChildItem -Recurse -Filter "*.astro"

# Buscar contenido en archivos
Select-String -Pattern "search-term" -Path "src\**\*.astro"
```

### Permisos y Propiedades
```powershell
# Ver propiedades de archivo
Get-ItemProperty "filename.astro"

# Cambiar permisos (si es necesario)
icacls "filename.astro" /grant Users:F
```

## 🔍 Comandos de Búsqueda y Análisis

### Búsqueda de Código
```powershell
# Buscar texto en archivos
findstr /r /s "pattern" src\*.astro

# Buscar con PowerShell (más potente)
Select-String -Pattern "className.*button" -Path "src\**\*.astro"

# Contar líneas de código
Get-ChildItem -Recurse -Include *.astro,*.js,*.ts | Measure-Object -Property Length -Sum

# Buscar archivos modificados recientemente
Get-ChildItem -Recurse | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-7)}
```

### Análisis de Proyecto
```powershell
# Listar archivos por tamaño
Get-ChildItem -Recurse | Sort-Object Length -Descending | Select-Object Name, Length, FullName -First 20

# Contar archivos por tipo
Get-ChildItem -Recurse | Group-Object Extension | Sort-Object Count -Descending

# Ver estructura de directorios
tree /f
```

## 🌐 Comandos de Red y Servidor

### Testing de Endpoints
```powershell
# Test endpoint con Invoke-WebRequest
Invoke-WebRequest -Uri "http://localhost:4321/api/blog" -Method GET

# POST con datos JSON
$body = '{"title":"Test","content":"Content"}'
Invoke-WebRequest -Uri "http://localhost:4321/api/blog" -Method POST -Body $body -ContentType "application/json"

# Ver puertos en uso
netstat -an | findstr ":4321"

# Verificar si puerto está ocupado
Test-NetConnection -ComputerName localhost -Port 4321
```

### Performance Testing
```powershell
# Tiempo de respuesta simple
Measure-Command { Invoke-WebRequest -Uri "http://localhost:4321" }

# Test de carga básico (PowerShell)
1..10 | ForEach-Object -Parallel { Invoke-WebRequest -Uri "http://localhost:4321" } -ThrottleLimit 5
```

## 🎨 Comandos de Assets y Media

### Optimización de Imágenes
```powershell
# Copiar imágenes a public/uploads
Copy-Item "source-image.jpg" "public\uploads\"

# Verificar tamaño de imágenes
Get-ChildItem "public\uploads\*.jpg","public\uploads\*.png" | Select-Object Name, @{Name="Size(KB)";Expression={[math]::round($_.Length/1KB,2)}}

# Buscar imágenes grandes
Get-ChildItem -Recurse "public\uploads" | Where-Object {$_.Length -gt 1MB} | Select-Object Name, @{Name="Size(MB)";Expression={[math]::round($_.Length/1MB,2)}}
```

### Limpieza de Assets
```powershell
# Limpiar uploads temporales
Remove-Item "public\uploads\temp_*"

# Backup de assets
Copy-Item -Recurse "public\uploads" "backup\uploads_$(Get-Date -Format 'yyyyMMdd')"
```

## 🔧 Comandos de Git (si aplica)

### Workflow Básico
```powershell
# Status del repositorio
git status

# Agregar cambios
git add .

# Commit con mensaje
git commit -m "feat: add notification banner system"

# Push a rama
git push origin main

# Ver historial
git log --oneline -10
```

### Gestión de Ramas
```powershell
# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Merge de rama
git merge feature/nueva-funcionalidad

# Eliminar rama
git branch -d feature/nueva-funcionalidad
```

## 🧹 Comandos de Limpieza

### Limpieza de Desarrollo
```powershell
# Limpiar cache de npm
npm cache clean --force

# Limpiar build
Remove-Item -Recurse -Force dist

# Limpiar todo y reinstalar
Remove-Item -Recurse -Force node_modules, dist, .astro; npm install

# Limpiar archivos temporales
Remove-Item -Recurse -Force *.tmp, *.log, *.cache
```

### Limpieza de Base de Datos
```powershell
# Backup antes de limpiar
Copy-Item database.sqlite "database_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sqlite"

# Limpiar datos de prueba (ejemplo)
sqlite3 database.sqlite "DELETE FROM contacts WHERE email LIKE '%test%';"
```

## 📊 Comandos de Monitoreo

### Performance y Uso
```powershell
# Memoria usada por Node.js
Get-Process node | Select-Object ProcessName, WorkingSet, CPU

# Espacio en disco
Get-PSDrive C | Select-Object Used, Free, @{Name="Total(GB)";Expression={[math]::round(($_.Used + $_.Free)/1GB,2)}}

# Archivos más grandes del proyecto
Get-ChildItem -Recurse | Sort-Object Length -Descending | Select-Object Name, @{Name="Size(MB)";Expression={[math]::round($_.Length/1MB,2)}} -First 10
```

### Logs y Debug
```powershell
# Ver logs de npm en tiempo real
npm run dev | Tee-Object -FilePath "dev.log"

# Buscar errores en logs
Select-String -Pattern "error|Error|ERROR" -Path "dev.log"

# Monitorear cambios en archivos
Get-ChildItem -Recurse "src" | Where-Object {$_.LastWriteTime -gt (Get-Date).AddMinutes(-5)}
```

## 🔒 Comandos de Seguridad

### Verificación de Seguridad
```powershell
# Audit de npm
npm audit

# Arreglar vulnerabilidades
npm audit fix

# Verificar permisos de archivos críticos
Get-Acl database.sqlite | Format-List

# Verificar variables de entorno
Get-ChildItem Env: | Where-Object {$_.Name -like "*API*" -or $_.Name -like "*KEY*"}
```

## 🚀 Comandos de Deployment

### Preparación para Producción
```powershell
# Build optimizado
npm run build

# Verificar build
Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum

# Test del build
npm run preview

# Verificar que no hay errores en build
npm run build 2>&1 | Select-String -Pattern "error|Error|ERROR"
```

### Verificación Pre-Deploy
```powershell
# Verificar que database existe
Test-Path database.sqlite

# Verificar archivos críticos
@("package.json", "astro.config.mjs", "database.sqlite") | ForEach-Object { 
    if (Test-Path $_) { Write-Host "✓ $_" -ForegroundColor Green } 
    else { Write-Host "✗ $_" -ForegroundColor Red }
}

# Tamaño final del build
$buildSize = (Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum).Sum
Write-Host "Build size: $([math]::round($buildSize/1MB,2)) MB"
```

---

## 💡 Aliases Útiles (Opcional)

Agrega estos aliases a tu perfil de PowerShell (`$PROFILE`):

```powershell
# Aliases de desarrollo
function dev { npm run dev }
function build { npm run build }
function preview { npm run preview }

# Aliases de base de datos
function db { sqlite3 database.sqlite }
function dbbackup { Copy-Item database.sqlite "database_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sqlite" }

# Aliases de limpieza
function clean { Remove-Item -Recurse -Force node_modules, dist, .astro; npm install }
function cleandb { Copy-Item database.sqlite "database_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sqlite"; sqlite3 database.sqlite "VACUUM;" }
```

---

## 🎯 Shortcuts por Contexto

### Desarrollo Diario
```powershell
# Iniciar día de desarrollo
npm run dev

# Final del día (backup)
dbbackup; git add .; git commit -m "daily progress"
```

### Debugging
```powershell
# Restart completo
Stop-Process -Name node -Force; npm run dev

# Reset total
clean; npm run dev
```

### Testing
```powershell
# Test manual rápido
npm run build; npm run preview
```
