# 🚀 EMMA Platform - Deployment Ready

## 🔐 Credenciales de Acceso por Defecto

**⚠️ IMPORTANTE**: La aplicación viene con credenciales temporales para el primer acceso:

- **Usuario**: `admin`
- **Email**: `admin@emma.pe` 
- **Contraseña**: `admin123`

## 🔧 Cambiar Contraseña en Producción

### Opción 1: A través del Panel de Administración
1. Accede a `https://emma.pe/admin` 
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
- ✅ Crear la base de datos SQLite automáticamente
- ✅ Aplicar datos de ejemplo (posiciones, testimonios, etc.)
- ✅ Configurar usuario administrador con hash bcrypt seguro
- ✅ Optimización multi-stage para producción

## 🛡️ Seguridad

- Hash de contraseña con bcrypt (salt 10)
- Usuario no-root en contenedor
- Variables de entorno para configuración sensible
- SSL automático con Let's Encrypt

## 📝 Comandos de Deployment

```bash
# En el servidor
git pull origin main
chmod +x deploy.sh
./deploy.sh
```

## 🔍 Verificación Post-Deployment

1. **Web principal**: `https://emma.pe`
2. **Panel admin**: `https://emma.pe/admin`
3. **Careers**: `https://emma.pe/careers`
4. **Contact**: `https://emma.pe/contact`

---

**Fecha de build**: Agosto 2025  
**Versión**: Production Ready  
**Tecnologías**: Astro, SQLite, Docker, Alpine Linux
