# 🚀 EMMA - Plataforma de Recursos Humanos

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

# Configurar DNS: emma.pe → IP_del_servidor

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
- **Inicio**: https://emma.pe
- **Blog**: https://emma.pe/blog
- **Carreras**: https://emma.pe/careers
- **Contacto**: https://emma.pe/contact
- **Acerca de**: https://emma.pe/about

### Panel de Administración
- **Dashboard**: https://emma.pe/admin
- **Gestión de Blogs**: https://emma.pe/admin/blogs
- **Gestión de Posiciones**: https://emma.pe/admin/job-positions
- **Gestión de Testimonios**: https://emma.pe/admin/testimonials
- **Gestión de Hero Slides**: https://emma.pe/admin/hero-slides
- **Gestión de Usuarios**: https://emma.pe/admin/users
- **Gestión de Contactos**: https://emma.pe/admin/contacts
- **Gestión de Newsletter**: https://emma.pe/admin/recruitment

### APIs Disponibles
- **Health Check**: https://emma.pe/api/health
- **Blog API**: https://emma.pe/api/blog
- **Contacto API**: https://emma.pe/api/contact
- **Newsletter API**: https://emma.pe/api/newsletter
- **Autenticación**: https://emma.pe/api/auth

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
