#!/bin/bash

# Script de configuración inicial del servidor Ubuntu para EMMA
# Ejecutar como root: curl -fsSL https://raw.githubusercontent.com/tu-repo/setup-server.sh | bash

set -e

echo "🔧 Configurando servidor Ubuntu para EMMA"

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Crear usuario para la aplicación
useradd -m -s /bin/bash emma
usermod -aG docker emma

# Configurar firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Configurar directorio de aplicación
mkdir -p /opt/emma
chown emma:emma /opt/emma

# Instalar herramientas adicionales
apt install -y git curl wget nano htop

echo "✅ Servidor configurado. Ahora puedes:"
echo "1. Cambiar al usuario emma: su - emma"
echo "2. Clonar tu repositorio en /opt/emma"
echo "3. Ejecutar ./deploy.sh"
