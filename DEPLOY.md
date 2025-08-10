# 🚀 Guía de Despliegue EMMA

## 📋 Pre-requisitos

1. **Servidor Ubuntu** con Docker y Docker Compose instalados
2. **Dominio** apuntando al servidor (emma.pe)
3. **Acceso SSH** al servidor

## 🛠️ Instalación en Servidor

### 1. Preparar el Servidor

```bash
# Conectar al servidor
ssh usuario@emma.pe

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión para aplicar permisos
exit
```

### 2. Clonar el Repositorio

```bash
# Conectar nuevamente
ssh usuario@emma.pe

# Clonar repositorio
git clone https://github.com/admin-emma/web.git emma
cd emma
```

### 3. Configurar Variables de Entorno

```bash
# Copiar ejemplo de configuración
cp .env.example .env

# Editar configuración
nano .env
```

**Configuraciones importantes:**
```bash
# Credenciales de Admin (REQUERIDO)
ADMIN_EMAIL=admin@emma.pe
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_contraseña_super_segura

# Secret para sesiones (REQUERIDO)
SESSION_SECRET=generar_string_aleatorio_64_caracteres

# Configuración de dominio
DOMAIN=emma.pe
SSL_EMAIL=admin@emma.pe

# Configuración de uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx
```

### 4. Generar Session Secret

```bash
# Generar secret aleatorio
openssl rand -hex 32

# O usar Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Ejecutar Despliegue

```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

## 🔧 Proceso de Despliegue

El script `deploy.sh` ejecuta automáticamente:

1. ✅ **Validación** de configuración
2. 🏗️ **Build** de contenedores Docker
3. 🗄️ **Inicialización** de base de datos limpia
4. 🔐 **Configuración** de usuario admin
5. 🌐 **Configuración** de Nginx con SSL
6. 📜 **Generación** de certificados Let's Encrypt
7. 🚀 **Inicio** de todos los servicios

## 📱 Acceso Post-Despliegue

### Sitio Web Público
- **Principal**: https://emma.pe
- **Blog**: https://emma.pe/blog
- **Carreras**: https://emma.pe/careers
- **Contacto**: https://emma.pe/contact

### Panel de Administración
- **URL**: https://emma.pe/admin
- **Usuario**: admin@emma.pe
- **Password**: (configurada en .env)

## 🛡️ Seguridad Implementada

- ✅ HTTPS con certificados automáticos
- ✅ Rate limiting en APIs
- ✅ Headers de seguridad HTTP
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de archivos upload
- ✅ Separación de contenedores

## 📊 Monitoreo

```bash
# Ver logs en tiempo real
docker-compose logs -f emma-app

# Ver estado de servicios
docker-compose ps

# Ver uso de recursos
docker stats

# Health check
curl https://emma.pe/api/health
```

## 🔄 Actualizaciones

```bash
# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker-compose down
docker-compose up --build -d

# Ver logs
docker-compose logs -f
```

## ⚠️ Troubleshooting

### Error de SSL
```bash
# Regenerar certificados
docker-compose exec certbot certbot renew --force-renewal
docker-compose restart nginx
```

### Error de Base de Datos
```bash
# Reinicializar BD
docker-compose exec emma-app ./init-db.sh
```

### Error de Permisos
```bash
# Corregir permisos
sudo chown -R $USER:$USER ./data
sudo chown -R $USER:$USER ./public/uploads
```

## 📞 Soporte

- **Logs**: `docker-compose logs -f`
- **Health**: https://emma.pe/api/health
- **Status**: `docker-compose ps`
- **Email**: admin@emma.pe

---

¡EMMA está listo para transformar RRHH en Perú! 🇵🇪
