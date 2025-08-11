# 💻 Scripts de Desarrollo

Scripts para desarrollo local en diferentes plataformas.

## 🛠️ Scripts Disponibles

### `dev.sh` (Linux/Mac)
**Script de desarrollo para sistemas Unix**

```bash
# Desarrollo con Docker (recomendado)
./dev.sh docker

# Desarrollo con npm local
./dev.sh npm

# Solo mostrar ayuda
./dev.sh
```

### `dev.ps1` (Windows)
**Script de desarrollo para Windows PowerShell**

```powershell
# Desarrollo con Docker
.\dev.ps1 docker

# Desarrollo con npm local  
.\dev.ps1 npm

# Desarrollo simple
.\dev.ps1 simple
```

### `restart-nginx-http.ps1`
**Reinicio de nginx para desarrollo Windows**
- Reinicia contenedor nginx
- Configura HTTP temporal
- Para desarrollo y debugging

## 🔧 Modos de Desarrollo

### 🐳 Docker (Recomendado)
- Entorno aislado y consistente
- Hot reload automático
- Base de datos SQLite incluida
- nginx configurado

**Puertos:**
- Aplicación: `http://localhost:4321`
- Admin: `http://localhost:4321/admin`

### 📦 npm Local
- Ejecución nativa
- Más rápido para cambios pequeños
- Requiere Node.js instalado localmente

**Puerto:**
- Aplicación: `http://localhost:4321`

## 🔄 Hot Reload

Ambos modos soportan hot reload:
- Cambios en `/src` se reflejan automáticamente
- Base de datos persiste entre reinicios
- Logs visibles en tiempo real

## 🗂️ Archivos de Configuración

### Docker
- `docker-compose.dev.yml` - Configuración de desarrollo
- `Dockerfile.dev` - Imagen de desarrollo
- `.env.dev` - Variables de entorno de desarrollo

### npm
- `package.json` - Scripts y dependencias
- `astro.config.mjs` - Configuración Astro
- `.env` - Variables de entorno

## 🐛 Debugging

### Ver logs en Docker:
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Acceder al contenedor:
```bash
docker-compose -f docker-compose.dev.yml exec emma-app bash
```

### Verificar base de datos:
```bash
# En Docker
docker-compose -f docker-compose.dev.yml exec emma-app ls -la database.sqlite

# Local
ls -la database.sqlite
```

## ⚡ Comandos Rápidos

```bash
# Detener desarrollo
Ctrl+C

# Limpiar contenedores Docker
docker-compose -f docker-compose.dev.yml down

# Reconstruir imagen
docker-compose -f docker-compose.dev.yml up --build

# Ver estado
docker-compose -f docker-compose.dev.yml ps
```
