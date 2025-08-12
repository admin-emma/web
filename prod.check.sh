#!/bin/bash
set -e

DOMAIN="descubre.emma.pe"
DATA_DIR="./data"

echo "🔍 Verificando pre-requisitos para producción..."

# 1️⃣ Verificar DNS
echo -n "📡 Verificando DNS para $DOMAIN... "
SERVER_IP=$(curl -s ifconfig.me)
DNS_IP=$(dig +short $DOMAIN | tail -n 1)

if [ "$SERVER_IP" == "$DNS_IP" ]; then
  echo "✅ OK ($DNS_IP)"
else
  echo "❌ DNS no apunta a este servidor."
  echo "    - IP servidor: $SERVER_IP"
  echo "    - IP DNS:      $DNS_IP"
  exit 1
fi

# 2️⃣ Verificar puertos 80 y 443 abiertos
echo -n "🌐 Verificando puertos 80 y 443... "
for PORT in 80 443; do
  if nc -z -w2 127.0.0.1 $PORT >/dev/null 2>&1; then
    echo -n "OK:$PORT "
  else
    echo "❌ Puerto $PORT no está abierto en localhost."
    exit 1
  fi
done
echo "✅"

# 3️⃣ Verificar volumen ./data
echo -n "💾 Verificando carpeta de datos ($DATA_DIR)... "
if [ -d "$DATA_DIR" ]; then
  if [ -w "$DATA_DIR" ]; then
    echo "✅ OK"
  else
    echo "❌ Carpeta existe pero no tiene permisos de escritura."
    exit 1
  fi
else
  echo "❌ Carpeta no existe. Creando..."
  mkdir -p "$DATA_DIR"
  chmod 775 "$DATA_DIR"
  echo "✅ Carpeta creada con permisos."
fi

echo ""
echo "🎯 Todo listo para levantar en producción 🚀"
