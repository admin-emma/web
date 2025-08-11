# 🐳 EMMA - Configuración Docker

## � Arquitectura de Contenedores

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │────│   EMMA App      │    │    Certbot      │
│  (Reverse Proxy)│    │  (Astro + Node) │    │  (SSL Certs)    │
│   Port 80/443   │    │   Port 4321     │    │   (Scheduled)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────│    Volumes      │
                        │ • SQLite DB     │
                        │ • Uploads       │
                        │ • SSL Certs     │
                        └─────────────────┘
```

## 🗂️ Archivos Docker

### Contenedores
- **`Dockerfile`** - Imagen multi-stage optimizada para producción
- **`docker-compose.yml`** - Orquestación de servicios
- **`.dockerignore`** - Exclusiones para optimizar build

### Configuración Nginx
- **`nginx/nginx.conf`** - Configuración base con seguridad
- **`nginx/conf.d/emma.pe.conf`** - Virtual host con SSL/HTTPS
- **`nginx/conf.d/emma.pe.http-only.conf`** - Configuración temporal HTTP

### Health Check
- **`src/pages/api/health.js`** - Endpoint para monitoreo de contenedores

## 🔧 Servicios Docker

### 📱 emma-app
```yaml
# Aplicación principal Astro/Node.js
ports: 3000:4321
volumes:
  - ./database.sqlite:/app/database.sqlite  # Base de datos persistente
  - ./public/uploads:/app/public/uploads    # Archivos subidos
```

**Características:**
- Build multi-stage optimizado
- Usuario no-root (astro:nodejs)
- Health checks automáticos
- Manejo de señales con dumb-init

### 🌐 nginx
```yaml
# Reverse proxy y servidor web
ports: 80:80, 443:443
volumes:
  - ./ssl:/etc/nginx/ssl           # Certificados SSL
  - ./public/uploads:/var/www/uploads  # Archivos estáticos
```

**Características:**
- Rate limiting por endpoint
- Compresión Gzip automática
- Headers de seguridad HTTP
- Configuración SSL moderna

### 🔒 certbot
```yaml
# Gestión automática de certificados SSL
volumes:
  - ./ssl:/etc/letsencrypt        # Certificados
  - ./public:/var/www/certbot     # Challenge files
```

**Características:**
- Renovación automática cada 12h
- Certificados Let's Encrypt gratuitos
- Soporte para múltiples dominios

## � Comandos Docker Útiles

### Gestión básica
```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs nginx
docker-compose logs emma-app

# Reiniciar un servicio
docker-compose restart emma-app

# Rebuild completo
docker-compose down && docker-compose up --build -d
```

### Debugging
```bash
# Acceder al contenedor de la aplicación
docker-compose exec emma-app sh

# Acceder al contenedor nginx
docker-compose exec nginx sh

# Ver uso de recursos
docker stats

# Inspeccionar configuración
docker-compose config
```

### Limpieza
```bash
# Limpiar contenedores parados
docker container prune

# Limpiar imágenes sin usar
docker image prune

# Limpiar volúmenes sin usar (¡CUIDADO!)
docker volume prune
```

## 🔒 Configuración de Seguridad

### Aplicación
- Usuario no-root (UID 1001)
- Variables de entorno para secretos
- Validación de uploads
- Rate limiting en APIs

### Nginx
- Headers de seguridad HTTP configurados
- Denegación de archivos sensibles (.php, .sh, etc.)
- Rate limiting por endpoint:
  - Admin: 5 req/min
  - API: 20 req/min

### Red
- Red interna docker (emma-network)
- Solo puertos necesarios expuestos (80, 443)
- Certificados SSL automáticos

## 🚨 Solución de Problemas

### La aplicación no inicia
```bash
# Ver logs detallados
docker-compose logs emma-app

# Verificar variables de entorno
docker-compose exec emma-app env | grep -E "(NODE_ENV|PORT|ADMIN)"

# Verificar base de datos
docker-compose exec emma-app ls -la database.sqlite
```

### Nginx no responde
```bash
# Verificar configuración
docker-compose exec nginx nginx -t

# Verificar certificados SSL
docker-compose exec nginx ls -la /etc/nginx/ssl/live/emma.pe/

# Reload configuración
docker-compose exec nginx nginx -s reload
```

### Problemas de SSL
```bash
# Verificar certificados
openssl x509 -in ssl/live/emma.pe/fullchain.pem -text -noout

# Regenerar certificados (con la aplicación parada)
docker-compose stop nginx
./setup-ssl.sh
```

## � Endpoints Importantes

- **Aplicación**: `http://localhost:3000` (interno)
- **Web pública**: `https://emma.pe`
- **Admin**: `https://emma.pe/admin`
- **Health check**: `https://emma.pe/api/health`
- **API**: `https://emma.pe/api/*`

---

> 💡 **Tip**: Para documentación de despliegue completo, ver `DEPLOYMENT-README.md`
