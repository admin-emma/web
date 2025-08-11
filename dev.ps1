# Script de desarrollo local para EMMA (Windows PowerShell)
# Uso: .\dev.ps1 [comando]

param(
    [string]$Command = "start"
)

# Función para mostrar mensajes con colores
function Write-Info { 
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green 
}

function Write-Warn { 
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow 
}

function Write-Step { 
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Blue 
}

function Write-Error-Custom { 
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red 
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "🚀 Script de desarrollo local para EMMA" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\dev.ps1 [comando]"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  start     - Iniciar aplicación en modo desarrollo"
    Write-Host "  stop      - Parar aplicación"
    Write-Host "  restart   - Reiniciar aplicación"
    Write-Host "  logs      - Ver logs en tiempo real"
    Write-Host "  shell     - Acceder al contenedor"
    Write-Host "  install   - Instalar dependencias"
    Write-Host "  build     - Construir para producción"
    Write-Host "  clean     - Limpiar contenedores y volúmenes"
    Write-Host "  db        - Ver información de la base de datos"
    Write-Host "  npm       - Desarrollo directo con npm (sin Docker)"
    Write-Host "  help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\dev.ps1 start    # Iniciar en modo desarrollo"
    Write-Host "  .\dev.ps1 npm      # Desarrollo directo con npm"
    Write-Host "  .\dev.ps1 logs     # Ver logs"
}

# Verificar que Docker está disponible
function Check-Docker {
    try {
        $null = docker --version
        $dockerRunning = docker ps 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Docker no está corriendo. Por favor inicia Docker Desktop."
            return $false
        }
        return $true
    }
    catch {
        Write-Warn "Docker no está instalado. Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
        return $false
    }
}

# Verificar archivos necesarios
function Check-Files {
    if (!(Test-Path "database.sqlite")) {
        Write-Warn "⚠️  database.sqlite no encontrada."
        Write-Info "💡 Si es la primera vez, la aplicación intentará crear una BD básica."
    }

    if (!(Test-Path ".env.dev")) {
        Write-Warn "⚠️  .env.dev no encontrado."
        if (Test-Path ".env.dev.example") {
            Copy-Item ".env.dev.example" ".env.dev"
            Write-Info "✅ Creado .env.dev desde .env.dev.example"
        }
    }
}

# Comando principal
switch ($Command.ToLower()) {
    "start" {
        Write-Step "🚀 Iniciando EMMA en modo desarrollo con Docker..."
        
        if (!(Check-Docker)) {
            exit 1
        }
        
        Check-Files
        
        Write-Info "Copiando variables de entorno de desarrollo..."
        if (Test-Path ".env.dev") {
            Copy-Item ".env.dev" ".env" -Force
        }
        
        Write-Info "Construyendo e iniciando contenedores..."
        docker-compose -f docker-compose.dev.yml up --build -d
        
        Write-Info "⏳ Esperando que la aplicación esté lista..."
        Start-Sleep -Seconds 10
        
        Write-Info "📋 Estado de contenedores:"
        docker-compose -f docker-compose.dev.yml ps
        
        Write-Host ""
        Write-Info "🎉 ¡EMMA está corriendo en modo desarrollo!"
        Write-Info "🌐 Aplicación: http://localhost:4321"
        Write-Info "🔧 Admin: http://localhost:4321/admin"
        Write-Info "❤️  Health: http://localhost:4321/api/health"
        Write-Host ""
        Write-Info "📝 Para ver logs: .\dev.ps1 logs"
        Write-Info "🛑 Para parar: .\dev.ps1 stop"
    }
    
    "npm" {
        Write-Step "🚀 Iniciando EMMA en modo desarrollo con npm (sin Docker)..."
        Check-Files
        
        Write-Info "Copiando variables de entorno de desarrollo..."
        if (Test-Path ".env.dev") {
            Copy-Item ".env.dev" ".env" -Force
        }
        
        Write-Info "Verificando dependencias..."
        if (!(Test-Path "node_modules")) {
            Write-Info "📦 Instalando dependencias..."
            npm install
        }
        
        Write-Host ""
        Write-Info "🎉 ¡Iniciando EMMA con npm!"
        Write-Info "🌐 Aplicación estará en: http://localhost:4321"
        Write-Info "🔧 Admin: http://localhost:4321/admin"
        Write-Host ""
        Write-Info "⏹️  Para parar: Ctrl+C"
        Write-Host ""
        
        npm run dev
    }
    
    "stop" {
        Write-Step "🛑 Parando aplicación de desarrollo..."
        docker-compose -f docker-compose.dev.yml down
        Write-Info "✅ Aplicación parada"
    }
    
    "restart" {
        Write-Step "🔄 Reiniciando aplicación..."
        docker-compose -f docker-compose.dev.yml restart
        Write-Info "✅ Aplicación reiniciada"
    }
    
    "logs" {
        Write-Step "📋 Mostrando logs en tiempo real..."
        docker-compose -f docker-compose.dev.yml logs -f
    }
    
    "shell" {
        Write-Step "🐚 Accediendo al contenedor..."
        docker-compose -f docker-compose.dev.yml exec emma-dev sh
    }
    
    "install" {
        Write-Step "📦 Instalando dependencias..."
        if (Check-Docker) {
            docker-compose -f docker-compose.dev.yml exec emma-dev npm install
        } else {
            npm install
        }
        Write-Info "✅ Dependencias instaladas"
    }
    
    "build" {
        Write-Step "🏗️  Construyendo para producción..."
        if (Check-Docker) {
            docker-compose -f docker-compose.dev.yml exec emma-dev npm run build
        } else {
            npm run build
        }
        Write-Info "✅ Build completado"
    }
    
    "clean" {
        Write-Step "🧹 Limpiando contenedores y volúmenes..."
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        Write-Info "✅ Limpieza completada"
    }
    
    "db" {
        Write-Step "🗄️  Información de la base de datos..."
        if (Test-Path "database.sqlite") {
            $dbSize = (Get-Item "database.sqlite").Length
            $dbSizeFormatted = if ($dbSize -gt 1MB) { "{0:N2} MB" -f ($dbSize / 1MB) } 
                               elseif ($dbSize -gt 1KB) { "{0:N2} KB" -f ($dbSize / 1KB) } 
                               else { "$dbSize bytes" }
            Write-Info "📊 Tamaño de BD: $dbSizeFormatted"
            
            # Intentar usar sqlite3 si está disponible
            try {
                $tablesCount = sqlite3 database.sqlite "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>$null
                if ($tablesCount) {
                    Write-Info "📋 Tablas: $tablesCount"
                    Write-Info "🔍 Estructura de tablas:"
                    sqlite3 database.sqlite ".tables"
                }
            }
            catch {
                Write-Info "💡 Instala sqlite3 para ver más detalles de la BD"
            }
        } else {
            Write-Warn "⚠️  database.sqlite no encontrada"
        }
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Write-Warn "Comando no reconocido: $Command"
        Show-Help
        exit 1
    }
}
