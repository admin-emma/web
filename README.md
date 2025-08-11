# 🌟 EMMA - Plataforma Web

Plataforma web moderna desarrollada con Astro, Node.js y SQLite para gestión empresarial.

## 🚀 Inicio Rápido

### Despliegue en Producción
```bash
./deploy          # Despliegue completo
./setup-ssl       # Configurar HTTPS (después del despliegue)
./verify          # Verificar estado del despliegue
```

### Desarrollo Local
```bash
./dev docker      # Desarrollo con Docker
./dev npm         # Desarrollo con npm
```

## 📁 Estructura del Proyecto

```
├── 📂 docs/                    # Documentación
│   ├── DEPLOYMENT-GUIDE.md     # Guía completa de despliegue
│   ├── DEPLOY.md              # Documentación de despliegue
│   └── DOCKER-README.md        # Documentación de Docker
│
├── 📂 scripts/                 # Scripts organizados
│   ├── 📂 deployment/          # Scripts de producción
│   │   ├── deploy.sh           # ⭐ Despliegue principal
│   │   ├── setup-ssl.sh        # Configurar SSL/HTTPS
│   │   ├── setup-server.sh     # Configurar servidor inicial
│   │   ├── verify-deployment.sh # Verificar despliegue
│   │   ├── fix-ssl.sh          # Corregir problemas SSL
│   │   ├── setup-http-only.sh  # Configurar solo HTTP
│   │   └── check-system.sh     # Verificar sistema
│   │
│   ├── 📂 database/            # Scripts de base de datos
│   │   ├── backup-db.sh        # Backup de base de datos
│   │   └── restore-db.sh       # Restaurar base de datos
│   │
│   └── 📂 development/         # Scripts de desarrollo
│       ├── dev.sh              # Desarrollo Linux/Mac
│       ├── dev.ps1             # Desarrollo Windows
│       └── restart-nginx-http.ps1
│
├── 📂 nginx/                   # Configuración nginx
├── 📂 src/                     # Código fuente Astro
├── 📂 public/                  # Archivos estáticos
└── 📄 Acceso rápido (raíz)
    ├── deploy                  # → scripts/deployment/deploy.sh
    ├── setup-ssl              # → scripts/deployment/setup-ssl.sh
    ├── verify                  # → scripts/deployment/verify-deployment.sh
    └── dev                     # → scripts/development/dev.sh
```

## 🔧 Comandos Principales

| Comando | Descripción | Ubicación |
|---------|-------------|-----------|
| `./deploy` | Despliegue completo automatizado | `scripts/deployment/deploy.sh` |
| `./setup-ssl` | Configurar SSL con Let's Encrypt | `scripts/deployment/setup-ssl.sh` |
| `./verify` | Verificar estado del despliegue | `scripts/deployment/verify-deployment.sh` |
| `./dev docker` | Desarrollo con Docker | `scripts/development/dev.sh` |

## 📚 Documentación

- **[📖 Guía de Despliegue](docs/DEPLOYMENT-GUIDE.md)** - Proceso completo paso a paso
- **[🐳 Docker](docs/DOCKER-README.md)** - Configuración de contenedores
- **[🚀 Deploy](docs/DEPLOY.md)** - Documentación de despliegue

## 🛠️ Tecnologías

- **Frontend**: Astro + TypeScript
- **Backend**: Node.js + Express
- **Base de datos**: SQLite
- **Contenedores**: Docker + Docker Compose
- **Proxy**: nginx
- **SSL**: Let's Encrypt
- **CI/CD**: Scripts automatizados

## 🌐 URLs de Producción

- **Aplicación**: https://descubre.emma.pe
- **Admin**: https://descubre.emma.pe/admin
- **Health Check**: https://descubre.emma.pe/api/health

## ⚡ Scripts por Categoría

### � Despliegue y Producción
```bash
scripts/deployment/deploy.sh           # Despliegue principal
scripts/deployment/setup-ssl.sh        # Configurar HTTPS
scripts/deployment/verify-deployment.sh # Verificar estado
scripts/deployment/setup-server.sh     # Configurar servidor
```

### 🗄️ Base de Datos
```bash
scripts/database/backup-db.sh          # Backup automático
scripts/database/restore-db.sh         # Restaurar backup
```

### 💻 Desarrollo
```bash
scripts/development/dev.sh             # Desarrollo Linux/Mac
scripts/development/dev.ps1            # Desarrollo Windows
```

## 🔒 Seguridad

- SSL/TLS automático con Let's Encrypt
- Variables de entorno seguras
- Rate limiting en nginx
- Validación de archivos subidos
- Headers de seguridad configurados

## 🆘 Solución de Problemas

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Verificar estado de contenedores
docker-compose ps

# Verificar configuración completa
./verify

# Ver documentación completa
cat docs/DEPLOYMENT-GUIDE.md
```

---

## 🤝 Contribución

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.🚀 EMMA - Plataforma de Recursos Humanos

EMMA es una plataforma integral de gestión de recursos humanos diseñada para transformar la experiencia laboral en Perú. Combina tecnología moderna con un enfoque centrado en el empleado para ofrecer soluciones completas de RRHH.

## 🌟 Características Principales

### 📊 **Sitio Web Corporativo**
- ✅ **Página de inicio** con hero dinámico y testimonios
- ✅ **Blog de RRHH** con artículos sobre mejores prácticas
- ✅ **Sección de carreras** con posiciones activas de la base de datos
- ✅ **Newsletter** para mantenerse actualizado sobre oportunidades
- ✅ **Formularios de contacto** para consultas y aplicaciones
- ✅ **Diseño responsivo** optimizado para móviles

### ⚙️ **Panel de Administración**
- ✅ **Dashboard** con métricas y estadísticas en tiempo real
- ✅ **Gestión de blogs** (crear, editar, eliminar artículos)
- ✅ **Gestión de posiciones laborales** con estados activo/inactivo
- ✅ **Gestión de testimonios** dinámicos para el sitio
- ✅ **Gestión de hero slides** para la página principal
- ✅ **Gestión de usuarios** y control de acceso
- ✅ **Gestión de contactos** y aplicaciones de trabajo
- ✅ **Gestión de newsletter** con seguimiento de suscriptores
- ✅ **Gestión de banners** de notificaciones
- ✅ **Subida de archivos** para CVs e imágenes

### 🎨 **Diseño y Marca**
- ✅ **Colores EMMA**: Paleta consistente (#035AA6, #07598C, #11B4D9, #038C7F)
- ✅ **Gradientes dinámicos** según departamentos y contexto
- ✅ **Iconografía** Font Awesome integrada
- ✅ **Tipografía** Atkinson Hyperlegible para accesibilidad
- ✅ **Componentes reutilizables** con patrón de diseño consistente

### 🔧 **Tecnologías Utilizadas**
- **Frontend**: Astro + TypeScript + Tailwind CSS
- **Backend**: Node.js con APIs REST
- **Base de datos**: SQLite con queries optimizadas
- **Autenticación**: Sistema de sesiones con middleware
- **Uploads**: Manejo de archivos con validación
- **Arquitectura**: Separación de JavaScript en módulos

## 🏗️ Estructura del Proyecto

```text
src/
├── components/          # Componentes reutilizables
│   ├── admin/          # Componentes específicos del admin
│   └── mdx/            # Componentes para contenido MDX
├── layouts/            # Plantillas de página
├── pages/              # Rutas y páginas
│   ├── admin/          # Panel de administración
│   ├── api/            # Endpoints REST
│   └── blog/           # Sistema de blog
├── scripts/            # JavaScript separado por módulos
│   ├── admin/          # Scripts del panel admin
│   └── components/     # Scripts de componentes
├── lib/                # Utilidades y configuraciones
└── styles/             # Estilos globales
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/emma-web.git
cd emma-web

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

### Acceso al Panel de Administración
- **URL**: `http://localhost:4321/admin`
- **Credenciales por defecto**: Ver configuración en `src/lib/auth.js`

## 🐳 Despliegue en Producción

### Opción 1: Despliegue con Docker (Recomendado)

```bash
# Preparar servidor Ubuntu
curl -fsSL https://raw.githubusercontent.com/tu-repo/setup-server.sh | bash

# Configurar DNS: descubre.emma.pe → IP_del_servidor

# Clonar y desplegar
git clone https://github.com/tu-usuario/emma-web.git /opt/emma
cd /opt/emma
chmod +x deploy.sh
./deploy.sh
```

### Opción 2: Despliegue Manual

```bash
# Build de producción
npm run build

# El sitio estará en ./dist/ listo para servir
```

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `./deploy.sh`             | Automated Docker deployment to production        |

## 📱 URLs Importantes

### Sitio Web Público
- **Inicio**: https://descubre.emma.pe
- **Blog**: https://descubre.emma.pe/blog
- **Carreras**: https://descubre.emma.pe/careers
- **Contacto**: https://descubre.emma.pe/contact
- **Acerca de**: https://descubre.emma.pe/about

### Panel de Administración
- **Dashboard**: https://descubre.emma.pe/admin
- **Gestión de Blogs**: https://descubre.emma.pe/admin/blogs
- **Gestión de Posiciones**: https://descubre.emma.pe/admin/job-positions
- **Gestión de Testimonios**: https://descubre.emma.pe/admin/testimonials
- **Gestión de Hero Slides**: https://descubre.emma.pe/admin/hero-slides
- **Gestión de Usuarios**: https://descubre.emma.pe/admin/users
- **Gestión de Contactos**: https://descubre.emma.pe/admin/contacts
- **Gestión de Newsletter**: https://descubre.emma.pe/admin/recruitment

### APIs Disponibles
- **Health Check**: https://descubre.emma.pe/api/health
- **Blog API**: https://descubre.emma.pe/api/blog
- **Contacto API**: https://descubre.emma.pe/api/contact
- **Newsletter API**: https://descubre.emma.pe/api/newsletter
- **Autenticación**: https://descubre.emma.pe/api/auth

## 🔒 Seguridad Implementada

- ✅ **Autenticación** por sesiones en panel admin
- ✅ **Validación de archivos** para uploads de CV
- ✅ **Rate limiting** en APIs críticas (via Nginx)
- ✅ **Headers de seguridad** HTTP
- ✅ **Sanitización** de entradas de usuario
- ✅ **HTTPS** con certificados Let's Encrypt

## 📊 Base de Datos

La aplicación utiliza SQLite con las siguientes tablas principales:
- **users**: Usuarios del sistema y admin
- **job_positions**: Posiciones laborales activas/inactivas
- **testimonials**: Testimonios de empleados/clientes
- **hero_slides**: Slides dinámicos para la página principal
- **newsletter_subscriptions**: Suscriptores del newsletter
- **contact_submissions**: Mensajes de contacto
- **recruitment_applications**: Aplicaciones de trabajo con CVs

## 🎯 Funcionalidades del Admin

### Dashboard
- Métricas en tiempo real de aplicaciones, contactos, newsletter
- Gráficos de tendencias y estadísticas
- Accesos rápidos a gestión de contenido

### Gestión de Contenido
- **Blog**: Editor WYSIWYG para artículos de RRHH
- **Posiciones**: CRUD completo con estados y metadatos
- **Testimonios**: Gestión de testimonios con fotos
- **Hero Slides**: Configuración de slides principales

### Gestión de Datos
- **Contactos**: Visualización y respuesta a consultas
- **Aplicaciones**: Revisión de CVs y datos de candidatos
- **Newsletter**: Gestión de suscriptores por fuente

## 🌐 Características Técnicas

- **SEO Optimizado**: Meta tags, sitemap, structured data
- **Performance**: Lighthouse 100/100, lazy loading, optimización de imágenes
- **Accesibilidad**: WCAG 2.1 AA, contraste adecuado, navegación por teclado
- **Responsive**: Diseño mobile-first con breakpoints Tailwind
- **PWA Ready**: Service workers y manifest configurables

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## 📞 Soporte y Contribución

Para reportar bugs o solicitar funcionalidades:
1. Crear un issue en GitHub
2. Seguir las plantillas de contribución
3. Documentar cambios en el README

---

**EMMA** - Transformando la gestión de recursos humanos en Perú 🇵🇪

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
