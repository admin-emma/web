#!/bin/bash

# Script para configurar nginx temporalmente solo con HTTP
# Esto permite que nginx arranque sin certificados SSL

echo "🔧 Configurando nginx para HTTP temporal..."

# Renombrar configuración SSL a backup
mv nginx/conf.d/emma.pe.conf nginx/conf.d/emma.pe.ssl.conf.backup

# Renombrar configuración HTTP-only para usar
mv nginx/conf.d/emma.pe.http-only.conf nginx/conf.d/emma.pe.conf

echo "✅ Configuración cambiada a HTTP-only"
echo "📋 Reiniciando nginx..."

# Reiniciar nginx
docker-compose restart nginx

echo "🌐 Verificando que nginx esté funcionando..."
sleep 5

# Verificar status
docker-compose ps nginx

echo ""
echo "🔍 Si nginx está funcionando, intenta:"
echo "   curl -I http://descubre.emma.pe"
echo ""
echo "⚡ Para configurar SSL después de que nginx funcione:"
echo "   ./setup-ssl.sh"
