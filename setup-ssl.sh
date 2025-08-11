#!/bin/bash

# Script para configurar SSL/HTTPS con Let's Encrypt para EMMA
# Ejecutar después del primer despliegue: ./setup-ssl.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🔒 Configurando SSL/HTTPS para EMMA"

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml no encontrado. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar que el dominio está configurado
DOMAIN="emma.pe"
log_step "Verificando configuración DNS para $DOMAIN..."

# Obtener IP pública del servidor
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com)
log_info "IP pública del servidor: $PUBLIC_IP"

# Verificar resolución DNS
DNS_IP=$(dig +short $DOMAIN | tail -n1)
if [ "$DNS_IP" != "$PUBLIC_IP" ]; then
    log_warn "⚠️  El dominio $DOMAIN no apunta a este servidor"
    log_warn "   DNS resuelve a: $DNS_IP"
    log_warn "   Servidor está en: $PUBLIC_IP"
    log_warn "   Configura tu DNS antes de continuar"
    
    read -p "¿Continuar de todas formas? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Configuración SSL cancelada"
        exit 1
    fi
fi

# Verificar que la aplicación está corriendo
log_step "Verificando que la aplicación esté en funcionamiento..."
if ! docker-compose ps | grep -q "emma-app.*Up"; then
    log_error "La aplicación no está corriendo. Ejecuta './deploy.sh' primero"
    exit 1
fi

# Verificar que nginx está respondiendo en puerto 80
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    log_error "Nginx no está respondiendo en puerto 80"
    log_info "Verifica los logs: docker-compose logs nginx"
    exit 1
fi

log_info "✅ Aplicación respondiendo correctamente"

# Detener nginx temporalmente para el challenge
log_step "Preparando para obtener certificado SSL..."
docker-compose stop nginx

# Obtener certificado SSL con certbot
log_step "Solicitando certificado SSL para $DOMAIN..."

# Crear comando certbot
CERTBOT_COMMAND="certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --domains $DOMAIN,www.$DOMAIN \
    --cert-path ./ssl/live/$DOMAIN/ \
    --key-path ./ssl/live/$DOMAIN/ \
    --fullchain-path ./ssl/live/$DOMAIN/ \
    --chain-path ./ssl/live/$DOMAIN/"

# Ejecutar certbot
if $CERTBOT_COMMAND; then
    log_info "✅ Certificado SSL obtenido exitosamente"
else
    log_error "❌ Error al obtener certificado SSL"
    log_info "Reiniciando nginx sin SSL..."
    docker-compose start nginx
    exit 1
fi

# Copiar certificados al directorio correcto
log_step "Configurando certificados..."
sudo mkdir -p ./ssl/live/$DOMAIN/
sudo cp /etc/letsencrypt/live/$DOMAIN/* ./ssl/live/$DOMAIN/ 2>/dev/null || true
sudo chown -R $(whoami):$(whoami) ./ssl/

# Verificar que los certificados existen
if [ ! -f "./ssl/live/$DOMAIN/fullchain.pem" ] || [ ! -f "./ssl/live/$DOMAIN/privkey.pem" ]; then
    log_warn "⚠️  Certificados no encontrados en la ubicación esperada"
    log_info "Creando certificados de prueba..."
    
    # Crear certificados auto-firmados para testing
    mkdir -p ./ssl/live/$DOMAIN/
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./ssl/live/$DOMAIN/privkey.pem \
        -out ./ssl/live/$DOMAIN/fullchain.pem \
        -subj "/C=PE/ST=Lima/L=Lima/O=EMMA/OU=IT/CN=$DOMAIN"
    
    cp ./ssl/live/$DOMAIN/fullchain.pem ./ssl/live/$DOMAIN/chain.pem
    
    log_warn "⚠️  Usando certificados auto-firmados (solo para testing)"
fi

# Reiniciar nginx con SSL
log_step "Reiniciando nginx con configuración SSL..."
docker-compose start nginx

# Esperar a que nginx esté listo
sleep 5

# Verificar que HTTPS funciona
log_step "Verificando configuración HTTPS..."
if curl -s -k -o /dev/null -w "%{http_code}" https://localhost | grep -q "200\|301\|302"; then
    log_info "✅ HTTPS configurado correctamente"
else
    log_error "❌ Error en configuración HTTPS"
    log_info "Revisa los logs: docker-compose logs nginx"
    exit 1
fi

# Configurar renovación automática
log_step "Configurando renovación automática..."
cat > ./renew-ssl.sh << 'EOF'
#!/bin/bash
# Script de renovación de certificados SSL

set -e

echo "🔄 Renovando certificados SSL..."

# Detener nginx
docker-compose stop nginx

# Renovar certificados
certbot renew --quiet

# Copiar certificados actualizados
sudo cp /etc/letsencrypt/live/emma.pe/* ./ssl/live/emma.pe/ 2>/dev/null || true
sudo chown -R $(whoami):$(whoami) ./ssl/

# Reiniciar nginx
docker-compose start nginx

echo "✅ Certificados SSL renovados exitosamente"
EOF

chmod +x ./renew-ssl.sh

# Configurar cron para renovación automática
(crontab -l 2>/dev/null; echo "0 3 * * 1 cd /opt/emma && ./renew-ssl.sh >> ./logs/ssl-renewal.log 2>&1") | crontab -

log_info "✅ Renovación automática configurada (cada lunes a las 3 AM)"

echo ""
echo "🎉 ¡SSL/HTTPS configurado exitosamente!"
echo ""
log_info "🌐 Tu sitio web está disponible en:"
log_info "   • HTTP:  http://$DOMAIN (redirige a HTTPS)"
log_info "   • HTTPS: https://$DOMAIN"
echo ""
log_info "🔧 Comandos útiles:"
log_info "   • Verificar certificados: ./renew-ssl.sh"
log_info "   • Ver logs SSL: tail -f logs/ssl-renewal.log"
log_info "   • Verificar SSL: curl -I https://$DOMAIN"
echo ""
log_info "📋 Información de certificado:"
openssl x509 -in ./ssl/live/$DOMAIN/fullchain.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)" || log_warn "No se pudo leer información del certificado"
echo ""
