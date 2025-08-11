# Script de desarrollo local para EMMA (Windows PowerShell)
# Uso: .\dev-simple.ps1 [comando]

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

# Función para mostrar ayuda
function Show-Help {
    Write-Host "Script de desarrollo local para EMMA" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\dev-simple.ps1 [comando]"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  npm       - Desarrollo directo con npm"
    Write-Host "  docker    - Desarrollo con Docker (recomendado para pruebas)"
    Write-Host "  start     - Iniciar con Docker"
    Write-Host "  stop      - Parar contenedores Docker"
    Write-Host "  logs      - Ver logs de Docker"
    Write-Host "  shell     - Acceder al contenedor Docker"
    Write-Host "  install   - Instalar dependencias"
    Write-Host "  build     - Construir para producción"
    Write-Host "  clean     - Limpiar contenedores Docker"
    Write-Host "  help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\dev.ps1 docker    # Iniciar con Docker (recomendado para pruebas)"
    Write-Host "  .\dev.ps1 npm       # Iniciar desarrollo con npm"
    Write-Host "  .\dev.ps1 logs      # Ver logs de Docker"
    Write-Host "  .\dev.ps1 stop      # Parar Docker"
}

# Verificar que Docker está disponible
function Check-Docker {
    try {
        $null = docker --version
        Write-Info "Docker disponible: $(docker --version)"
        
        $dockerRunning = docker ps 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Docker Desktop no está corriendo. Por favor inicialo."
            return $false
        }
        Write-Info "Docker Desktop está corriendo"
        return $true
    }
    catch {
        Write-Warn "Docker no está instalado o no disponible en PATH"
        Write-Info "Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop"
        return $false
    }
}

# Verificar archivos necesarios
function Check-Files {
    if (!(Test-Path "database.sqlite")) {
        Write-Warn "database.sqlite no encontrada."
        Write-Info "Si es la primera vez, la aplicación intentará crear una BD básica."
    }

    if (!(Test-Path ".env")) {
        Write-Info "Creando archivo .env..."
        
        # Crear archivo .env básico sin BOM
        $envContent = @"
NODE_ENV=development
HOST=0.0.0.0
PORT=4321
ADMIN_EMAIL=admin@emma.pe
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SESSION_SECRET=dev-secret-key-change-in-production
DOMAIN=localhost
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx
DATABASE_PATH=./database.sqlite
"@
        
        # Escribir sin BOM usando UTF8NoBOM
        [System.IO.File]::WriteAllText(".env", $envContent, [System.Text.UTF8Encoding]::new($false))
        
        Write-Info "Archivo .env creado con configuracion de desarrollo"
    }
}

# Comando principal
switch ($Command.ToLower()) {
    "docker" {
        Write-Step "Iniciando EMMA con Docker..."
        
        if (!(Check-Docker)) {
            exit 1
        }
        
        Check-Files
        
        Write-Info "Construyendo e iniciando contenedores..."
        docker-compose -f docker-compose.dev.yml up --build -d
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error al iniciar contenedores" -ForegroundColor Red
            exit 1
        }
        
        Write-Info "Esperando que la aplicación esté lista..."
        Start-Sleep -Seconds 10
        
        Write-Info "Estado de contenedores:"
        docker-compose -f docker-compose.dev.yml ps
        
        Write-Host ""
        Write-Info "EMMA está corriendo con Docker!"
        Write-Info "Aplicación: http://localhost:4321"
        Write-Info "Admin: http://localhost:4321/admin"
        Write-Info "Health: http://localhost:4321/api/health"
        Write-Host ""
        Write-Info "Para ver logs: .\dev-simple.ps1 logs"
        Write-Info "Para parar: .\dev-simple.ps1 stop"
    }
    
    "start" {
        Write-Step "Iniciando EMMA con Docker..."
        
        if (!(Check-Docker)) {
            exit 1
        }
        
        Check-Files
        docker-compose -f docker-compose.dev.yml up --build -d
        
        Write-Info "EMMA iniciado con Docker en http://localhost:4321"
    }
    
    "stop" {
        Write-Step "Parando contenedores Docker..."
        
        if (!(Check-Docker)) {
            exit 1
        }
        
        docker-compose -f docker-compose.dev.yml down
        Write-Info "Contenedores parados"
    }
    
    "logs" {
        Write-Step "Mostrando logs de Docker..."
        
        if (!(Check-Docker)) {
            exit 1
        }
        
        Write-Info "Logs en tiempo real (Ctrl+C para salir):"
        docker-compose -f docker-compose.dev.yml logs -f
    }
    
    "shell" {
        Write-Step "Accediendo al contenedor..."
        
        if (!(Check-Docker)) {
            exit 1
        }
        
        Write-Info "Accediendo al contenedor emma-dev..."
        docker-compose -f docker-compose.dev.yml exec emma-dev sh
    }
    
    "clean" {
        Write-Step "Limpiando contenedores y volúmenes Docker..."
        
        if (!(Check-Docker)) {
            exit 1
        }
        
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        Write-Info "Limpieza completada"
    }

    "npm" {
        Write-Step "Iniciando EMMA en modo desarrollo con npm..."
        Check-Files
        
        Write-Info "Verificando dependencias..."
        if (!(Test-Path "node_modules")) {
            Write-Info "Instalando dependencias..."
            npm install
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Error al instalar dependencias" -ForegroundColor Red
                exit 1
            }
        }
        
        Write-Host ""
        Write-Info "Iniciando EMMA con npm!"
        Write-Info "Aplicacion estara en: http://localhost:4321"
        Write-Info "Admin: http://localhost:4321/admin"
        Write-Host ""
        Write-Info "Para parar: Ctrl+C"
        Write-Host ""
        
        # Iniciar la aplicación
        npm run dev
    }
    
    "install" {
        Write-Step "Instalando dependencias..."
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Dependencias instaladas correctamente"
        } else {
            Write-Host "Error al instalar dependencias" -ForegroundColor Red
            exit 1
        }
    }
    
    "build" {
        Write-Step "Construyendo para producción..."
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Build completado exitosamente"
        } else {
            Write-Host "Error en el build" -ForegroundColor Red
            exit 1
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
