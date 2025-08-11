# 📁 Scripts de Despliegue

Scripts para producción y configuración del servidor.

## 🚀 Scripts Principales

### `deploy.sh` ⭐
**Despliegue principal automatizado**
- Verifica dependencias del sistema
- Configura variables de entorno
- Inicializa base de datos
- Levanta contenedores Docker
- Configura nginx temporal HTTP

```bash
./deploy.sh
```

### `setup-ssl.sh` 🔒
**Configuración SSL con Let's Encrypt**
- Obtiene certificados automáticamente
- Configura nginx para HTTPS
- Redirige HTTP → HTTPS

```bash
./setup-ssl.sh
```

### `verify-deployment.sh` 🔍
**Verificación post-despliegue**
- Verifica estado de contenedores
- Comprueba conectividad HTTP/HTTPS
- Valida configuración y permisos

```bash
./verify-deployment.sh
```

## 🛠️ Scripts de Soporte

### `setup-server.sh`
Configuración inicial del servidor Ubuntu
- Instala Docker y Docker Compose
- Configura firewall
- Crea usuarios y permisos

### `fix-ssl.sh`
Corrección de problemas SSL
- Arregla configuración nginx
- Remueve subdominios www problemáticos

### `setup-http-only.sh`
Configuración temporal solo HTTP
- Para troubleshooting SSL
- Configuración nginx minimalista

### `check-system.sh`
Verificación de dependencias del sistema
- Docker, Docker Compose
- Permisos de usuario
- Puertos disponibles

## 📋 Orden de Ejecución

1. **Primera vez:**
   ```bash
   ./setup-server.sh      # Solo una vez
   ./deploy.sh            # Despliegue HTTP
   ./verify-deployment.sh # Verificar
   ./setup-ssl.sh         # Configurar HTTPS
   ```

2. **Actualizaciones:**
   ```bash
   git pull
   ./deploy.sh
   ./verify-deployment.sh
   ```

## 🆘 Resolución de Problemas

- **SSL falla**: `./fix-ssl.sh`
- **nginx no arranca**: `./setup-http-only.sh`
- **Dependencias**: `./check-system.sh`
- **Estado general**: `./verify-deployment.sh`
