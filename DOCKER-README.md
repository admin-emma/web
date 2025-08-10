# 🐳 EMMA - Dockerización Completa para emma.pe

## 📋 Resumen de Archivos Creados

### Docker
- `Dockerfile` - Imagen optimizada multi-stage para producción
- `docker-compose.yml` - Orquestación completa (App + Nginx + SSL)
- `.dockerignore` - Exclusiones para optimizar build

### Nginx
- `nginx/nginx.conf` - Configuración principal con seguridad
- `nginx/conf.d/emma.pe.conf` - Virtual host para emma.pe con SSL

### Scripts de Despliegue
- `deploy.sh` - Script automatizado de despliegue
- `setup-server.sh` - Configuración inicial del servidor Ubuntu
- `.env.production` - Variables de entorno de producción

### Health Check
- `src/pages/api/health.js` - Endpoint para monitoreo Docker

## 🚀 Guía de Despliegue

### 1. Preparar Servidor Ubuntu

```bash
# En tu servidor Ubuntu (como root)
curl -fsSL https://raw.githubusercontent.com/tu-repo/setup-server.sh | bash

# O manualmente:
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. Configurar DNS
Apunta tu dominio emma.pe a la IP de tu servidor:
- A record: emma.pe → IP_DEL_SERVIDOR
- A record: www.emma.pe → IP_DEL_SERVIDOR

### 3. Subir Código al Servidor

```bash
# En el servidor
su - emma
cd /opt/emma
git clone https://github.com/tu-usuario/emma-web.git .

# O subir archivos vía SCP/FTP
```

### 4. Configurar Variables de Entorno

```bash
# Editar variables de producción
nano .env.production

# Cambiar especialmente:
JWT_SECRET=genera_un_secret_muy_seguro_aqui
```

### 5. Ejecutar Despliegue

```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

## 🏗️ Arquitectura de Contenedores

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │────│   EMMA App      │    │    Certbot     │
│  (Reverse Proxy)│    │  (Astro + Node) │    │  (SSL Certs)   │
│   Port 80/443   │    │   Port 4321     │    │   (Scheduled)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────│    Volumes      │
                        │ • SQLite DB     │
                        │ • Uploads       │
                        │ • SSL Certs     │
                        └─────────────────┘
```

## 🔧 Componentes Incluidos

### ✅ Aplicación Astro
- Build optimizado multi-stage
- Usuario no-root para seguridad
- Health checks automáticos
- Manejo adecuado de señales

### ✅ Nginx
- Reverse proxy con SSL
- Rate limiting por endpoints
- Compresión Gzip
- Headers de seguridad
- Caché para archivos estáticos

### ✅ SSL/HTTPS
- Certificados automáticos Let's Encrypt
- Renovación automática
- Configuración SSL moderna
- HSTS headers

### ✅ Persistencia
- Base de datos SQLite persistente
- Uploads de usuarios persistentes
- Logs persistentes

## 📊 Monitoreo y Mantenimiento

### Ver Estado
```bash
docker-compose ps
docker-compose logs -f
```

### Actualizar Aplicación
```bash
git pull
./deploy.sh
```

### Backup Base de Datos
```bash
cp data/database.sqlite backups/database-$(date +%Y%m%d).sqlite
```

### Ver Logs por Servicio
```bash
docker-compose logs nginx
docker-compose logs emma-app
docker-compose logs certbot
```

## 🔒 Seguridad Implementada

- ✅ Contenedores con usuarios no-root
- ✅ Rate limiting en APIs
- ✅ Headers de seguridad HTTP
- ✅ SSL/TLS moderno
- ✅ Firewall UFW configurado
- ✅ Validación de uploads
- ✅ Denegación de archivos sensibles

## 🚨 Troubleshooting

### Contenedores no inician
```bash
docker-compose logs
docker-compose down && docker-compose up --build
```

### SSL no funciona
```bash
# Verificar certificados
docker-compose exec nginx ls -la /etc/nginx/ssl/live/emma.pe/

# Regenerar certificados
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d emma.pe
```

### Base de datos corrupta
```bash
# Restaurar desde backup
cp backups/database-FECHA.sqlite data/database.sqlite
docker-compose restart emma-app
```

## 📞 Soporte

La aplicación estará disponible en:
- **Producción**: https://emma.pe
- **Admin**: https://emma.pe/admin
- **Health**: https://emma.pe/api/health

¡Todo listo para producción en emma.pe! 🎉
