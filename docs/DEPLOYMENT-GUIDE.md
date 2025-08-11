# 🚀 Guía de Despliegue EMMA

Esta guía documenta el proceso completo de despliegue de la aplicación EMMA, incluyendo todas las lecciones aprendidas.

## 📋 Prerrequisitos

- Servidor Ubuntu 22.04 LTS
- Docker y Docker Compose instalados
- Dominio configurado apuntando al servidor
- Acceso SSH al servidor

## 🔧 Proceso de Despliegue

### 1. Preparación del Servidor

```bash
# Instalar dependencias
./setup-server.sh
```

### 2. Configurar Variables de Entorno

El script de despliegue creará automáticamente un archivo `.env` con valores por defecto:

```bash
SESSION_SECRET=emma-secret-key-[timestamp]
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@emma.pe
ADMIN_USERNAME=admin
```

**⚠️ IMPORTANTE:** Cambia estas credenciales en producción.

### 3. Despliegue Principal

```bash
# Clonar repositorio
git clone [repo-url]
cd emma

# Ejecutar despliegue
./deploy.sh
```

El script automáticamente:
- ✅ Verifica dependencias
- ✅ Crea variables de entorno si no existen
- ✅ Inicializa la base de datos SQLite con permisos correctos
- ✅ Configura nginx para HTTP temporal
- ✅ Levanta todos los contenedores
- ✅ Verifica que la aplicación responda

### 4. Configurar SSL (Opcional pero Recomendado)

```bash
# Solo después de que HTTP funcione correctamente
./setup-ssl.sh
```

## 🗃️ Base de Datos

### Inicialización Automática

Si no existe `database.sqlite`, el script:
1. Busca `init-db.sh.backup` y lo ejecuta
2. Si no existe, crea una base de datos vacía
3. Configura permisos correctos (666)

### Problemas Comunes

**Error: "attempt to write a readonly database"**
```bash
# Solución
chmod 666 database.sqlite
docker-compose restart emma-app
```

## 🌐 nginx y SSL

### Configuración por Fases

1. **Fase HTTP**: Se usa `emma.pe.http-only.conf` (temporal)
2. **Fase HTTPS**: Se migra a configuración SSL completa

### Archivos de Configuración

- `nginx/conf.d/emma.pe.conf` - Configuración activa
- `nginx/conf.d/emma.pe.http-only.conf` - HTTP únicamente
- `nginx/conf.d/emma.pe.ssl.conf.backup` - Backup con SSL

## 🐛 Resolución de Problemas

### nginx no arranca

```bash
# Ver logs específicos
docker-compose logs nginx

# Verificar configuraciones duplicadas
ls nginx/conf.d/
rm nginx/conf.d/emma.pe.http-only.conf  # Si existe
```

### Error 500 en aplicación

```bash
# Verificar logs de la aplicación
docker-compose logs emma-app

# Problemas comunes:
# 1. SESSION_SECRET no configurado
# 2. Base de datos con permisos incorrectos
# 3. Variables de entorno faltantes
```

### DNS no resuelve

```bash
# Verificar desde el servidor
dig descubre.emma.pe
curl -I http://localhost  # Debe funcionar
curl -I http://[IP-publica]  # Debe funcionar
```

## 📦 Contenedores

### Estados Esperados

```bash
docker-compose ps
```

- `emma-app`: `Up X seconds (healthy)`
- `emma-nginx`: `Up X seconds` 
- `emma-certbot`: `Up X seconds`

### Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Verificar salud de la aplicación
curl -I http://localhost/api/health
```

## 🔄 Actualizaciones

```bash
# En el servidor
git pull origin main
docker-compose down
docker-compose up --build -d
```

## 🔒 Seguridad

### Variables de Entorno en Producción

**NUNCA** uses las credenciales por defecto. Cambia:

```bash
nano .env
```

```
SESSION_SECRET=genera-clave-segura-aqui
ADMIN_PASSWORD=contraseña-fuerte-aqui
ADMIN_EMAIL=tu-email@dominio.com
ADMIN_USERNAME=tu-usuario
```

### SSL/HTTPS

- El SSL se configura automáticamente con Let's Encrypt
- Los certificados se renuevan automáticamente
- HTTP redirige automáticamente a HTTPS una vez configurado

## 📊 Monitoreo

### URLs de Verificación

- **Aplicación**: `http://descubre.emma.pe`
- **Admin**: `http://descubre.emma.pe/admin`
- **Health Check**: `http://descubre.emma.pe/api/health`
- **SSL Check**: `https://descubre.emma.pe` (después de configurar SSL)

### Logs Importantes

```bash
# Aplicación
docker-compose logs emma-app

# nginx
docker-compose logs nginx

# SSL/Certbot
docker-compose logs certbot
```

## 🎯 Puntos Clave Aprendidos

1. **Orden importa**: HTTP primero, SSL después
2. **Permisos de base de datos**: Siempre verificar chmod 666
3. **Variables de entorno**: SESSION_SECRET es crítico
4. **nginx**: Evitar configuraciones duplicadas
5. **DNS**: Verificar antes de configurar SSL

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs [servicio]`
2. Verifica el estado: `docker-compose ps`
3. Consulta esta guía para soluciones comunes
4. Reinicia servicios: `docker-compose restart`

**¿Todo funcionando?** ¡Perfecto! 🎉 Tu aplicación EMMA está lista para producción.
