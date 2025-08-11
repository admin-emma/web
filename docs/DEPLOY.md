# 🚀 EMMA Platform - Deployment Ready

## � Base de Datos

La aplicación utiliza tu base de datos SQLite existente (`database.sqlite`) que se encuentra en el directorio raíz del proyecto.

### 🗄️ Gestión de Base de Datos

#### Crear Backup
```bash
chmod +x backup-db.sh
./backup-db.sh
```

#### Restaurar Backup
```bash
chmod +x restore-db.sh
./restore-db.sh backups/database_backup_YYYYMMDD_HHMMSS.sqlite
```

#### Verificar Base de Datos
```bash
sqlite3 database.sqlite "SELECT COUNT(*) FROM users;"
```

## 🔐 Credenciales de Acceso

**⚠️ IMPORTANTE**: Utiliza las credenciales configuradas en tu base de datos existente.

## 🔧 Cambiar Contraseña en Producción

### Opción 1: A través del Panel de Administración
1. Accede a `https://descubre.emma.pe/admin` 
2. Inicia sesión con las credenciales por defecto
3. Ve a la sección de usuarios
4. Cambia la contraseña del usuario admin

### Opción 2: Variables de Entorno (Recomendado)
En el archivo `.env` del servidor, puedes configurar:

```env
ADMIN_PASSWORD=tu_contraseña_super_segura
ADMIN_EMAIL=tu_email@emma.pe
ADMIN_USERNAME=tu_usuario
```

## 🐳 Docker Build

El Dockerfile está configurado para:
- ✅ Utilizar tu base de datos SQLite existente
- ✅ Persistir cambios en la base de datos entre deployments  
- ✅ Mapear la base de datos como volumen para persistencia
- ✅ Optimización multi-stage para producción
- ✅ Backup automático antes de cada deployment

## � Configuración SSL/HTTPS

### Prerrequisitos para SSL
- Dominio descubre.emma.pe configurado para apuntar a tu servidor
- Puerto 80 y 443 abiertos en el firewall
- Aplicación funcionando correctamente en HTTP

### Configurar SSL automáticamente
```bash
./setup-ssl.sh
```

### Renovar certificados manualmente
```bash
./renew-ssl.sh
```

### Verificar SSL
```bash
# Verificar certificado
openssl x509 -in ssl/live/descubre.emma.pe/fullchain.pem -text -noout

# Probar HTTPS
curl -I https://descubre.emma.pe
```

## �🛡️ Seguridad

- Hash de contraseña con bcrypt (salt 10)
- Usuario no-root en contenedor
- Variables de entorno para configuración sensible
- SSL automático con Let's Encrypt
- Firewall configurado (UFW)
- Fail2Ban para protección SSH
- Rate limiting en nginx

## 📝 Comandos de Deployment

### Configuración inicial del servidor
```bash
# 1. Configurar servidor (ejecutar como root)
curl -fsSL https://raw.githubusercontent.com/tu-repo/setup-server.sh | bash

# 2. Cambiar al usuario emma
su - emma
cd /opt/emma

# 3. Clonar repositorio
git clone <tu-repo> .

# 4. Configurar variables de entorno
cp .env.example .env
nano .env
```

### Despliegue de la aplicación
```bash
# 1. Crear backup de la base de datos actual
chmod +x backup-db.sh
./backup-db.sh

# 2. Desplegar aplicación
chmod +x deploy.sh
./deploy.sh

# 3. Configurar SSL/HTTPS (después del primer despliegue)
chmod +x setup-ssl.sh
./setup-ssl.sh
```

### Verificación del sistema
```bash
# Verificar estado completo del sistema
chmod +x check-system.sh
./check-system.sh
```

## 🔄 Comandos Útiles

```bash
# Ver logs de la aplicación
docker-compose logs -f emma-app

# Ver estado de contenedores
docker-compose ps

# Reiniciar solo la aplicación
docker-compose restart emma-app

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO!)
docker-compose down -v
```

## 🔍 Verificación Post-Deployment

1. **Web principal**: `https://descubre.emma.pe`
2. **Panel admin**: `https://descubre.emma.pe/admin`
3. **Careers**: `https://descubre.emma.pe/careers`
4. **Contact**: `https://descubre.emma.pe/contact`

---

**Fecha de build**: Agosto 2025  
**Versión**: Production Ready  
**Tecnologías**: Astro, SQLite, Docker, Alpine Linux
