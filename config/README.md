# ⚙️ Configuration Files

Esta carpeta contiene archivos de configuración para servicios externos y herramientas.

## 📂 Estructura

```
config/
└── nginx/                # Configuración de nginx
    ├── nginx.conf            # Configuración principal
    └── conf.d/               # Configuraciones de sitios
        ├── emma.pe.conf             # Configuración activa
        ├── emma.pe.http-only.conf   # HTTP únicamente
        └── emma.pe.ssl-fixed.conf   # SSL sin www
```

## 🌐 nginx

### Archivos de Configuración

- **`nginx.conf`**: Configuración principal del servidor nginx
- **`conf.d/emma.pe.conf`**: Configuración activa del sitio
- **`conf.d/emma.pe.http-only.conf`**: Configuración temporal HTTP
- **`conf.d/emma.pe.ssl-fixed.conf`**: Configuración SSL corregida

### Uso

Los archivos de configuración se montan como volúmenes en el contenedor nginx:

```yaml
volumes:
  - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./config/nginx/conf.d:/etc/nginx/conf.d:ro
```

### Configuraciones Disponibles

1. **HTTP-only**: Para arranque inicial sin SSL
2. **SSL completo**: Para producción con HTTPS
3. **SSL sin www**: Para dominios sin subdominio www

### Rate Limiting

Configurado para:
- API endpoints: 10 requests/minuto burst
- Admin endpoints: 5 requests/minuto burst
- Login endpoints: Rate limiting estricto

### Proxy Headers

Headers configurados para aplicación Astro:
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `Host`

## 🔧 Personalización

Para modificar la configuración:

1. Edita los archivos en `config/nginx/`
2. Reinicia nginx: `docker-compose restart nginx`
3. Verifica logs: `docker-compose logs nginx`

## 🔒 SSL

Los certificados SSL se almacenan en `./ssl/` y se montan en nginx automáticamente.
