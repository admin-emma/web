# 🐳 Docker Configuration

Esta carpeta contiene toda la configuración relacionada con Docker para el proyecto EMMA.

## 📂 Estructura

```
docker/
├── compose/              # Archivos docker-compose
│   ├── docker-compose.yml      # Producción
│   └── docker-compose.dev.yml  # Desarrollo
├── images/               # Dockerfiles
│   ├── Dockerfile              # Imagen de producción
│   └── Dockerfile.dev          # Imagen de desarrollo
└── .dockerignore        # Archivos a ignorar en contexto Docker
```

## 🚀 Uso

### Producción
```bash
# Desde la raíz del proyecto
docker-compose up -d

# O usando archivos específicos
docker-compose -f docker/compose/docker-compose.yml up -d
```

### Desarrollo
```bash
# Desde la raíz del proyecto
docker-compose -f docker-compose.dev.yml up -d

# O usando archivos específicos
docker-compose -f docker/compose/docker-compose.dev.yml up -d
```

## 🔧 Configuración

### Imagen de Producción (Dockerfile)
- Basada en Node.js Alpine
- Optimizada para producción
- Incluye solo archivos necesarios
- Usuario no-root para seguridad

### Imagen de Desarrollo (Dockerfile.dev)
- Incluye herramientas de desarrollo
- Hot reload habilitado
- Volúmenes para desarrollo en tiempo real

### Compose de Producción
- Servicios: emma-app, nginx, certbot
- Redes aisladas
- Volúmenes persistentes para SSL y uploads
- Healthchecks configurados

### Compose de Desarrollo
- Hot reload para desarrollo
- Puertos expuestos para debugging
- Volúmenes de código fuente montados

## 📋 Notas

- Los archivos están duplicados en la raíz para compatibilidad
- Las rutas están actualizadas para apuntar a la nueva estructura
- nginx configuración movida a `config/nginx/`

## 🔄 Sincronización

Los archivos en la raíz son copias de los archivos maestros en esta carpeta:
- `./docker-compose.yml` ← `docker/compose/docker-compose.yml`
- `./docker-compose.dev.yml` ← `docker/compose/docker-compose.dev.yml`
- `./Dockerfile` ← `docker/images/Dockerfile`
- `./.dockerignore` ← `docker/.dockerignore`

**⚠️ Importante:** Edita los archivos maestros en `docker/` y luego copia a la raíz.
