#!/bin/bash

# Script de configuración inicial del servidor Ubuntu para EMMA
# Ejecutar como root: curl -fsSL https://raw.githubusercontent.com/tu-repo/setup-server.sh | bash

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

echo "🔧 Configurando servidor Ubuntu para EMMA con SSL/HTTPS"

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como root"
   exit 1
fi

# Verificar conexión a internet
log_step "Verificando conexión a internet..."
if ! ping -c 1 google.com &> /dev/null; then
    log_error "No hay conexión a internet"
    exit 1
fi

log_step "Actualizando sistema base..."
apt update && apt upgrade -y

log_step "Instalando dependencias del sistema..."
apt install -y \
    curl \
    wget \
    git \
    nano \
    htop \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    sqlite3 \
    certbot

log_info "✅ Dependencias del sistema instaladas"

log_step "Instalando Docker..."
# Remover versiones anteriores de Docker
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Agregar repositorio oficial de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Iniciar y habilitar Docker
systemctl enable docker
systemctl start docker

# Verificar instalación de Docker
if docker --version &>/dev/null; then
    log_info "✅ Docker instalado: $(docker --version)"
else
    log_error "❌ Error al instalar Docker"
    exit 1
fi

log_step "Instalando Docker Compose standalone..."
# Instalar Docker Compose standalone (para compatibilidad)
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar instalación de Docker Compose
if docker-compose --version &>/dev/null; then
    log_info "✅ Docker Compose instalado: $(docker-compose --version)"
else
    log_error "❌ Error al instalar Docker Compose"
    exit 1
fi

log_step "Creando usuario para la aplicación..."
# Crear usuario para la aplicación
if id "emma" &>/dev/null; then
    log_warn "Usuario 'emma' ya existe"
else
    useradd -m -s /bin/bash emma
    log_info "✅ Usuario 'emma' creado"
fi

# Agregar usuario al grupo docker
usermod -aG docker emma
log_info "✅ Usuario 'emma' agregado al grupo docker"

log_step "Configurando firewall UFW..."
# Configurar firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log_info "✅ Firewall configurado (puertos 22, 80, 443 abiertos)"

log_step "Configurando Fail2Ban para seguridad..."
# Configurar Fail2Ban para SSH
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 1h
EOF

systemctl enable fail2ban
systemctl restart fail2ban
log_info "✅ Fail2Ban configurado"

log_step "Configurando directorio de aplicación..."
# Configurar directorio de aplicación
mkdir -p /opt/emma
chown emma:emma /opt/emma
chmod 755 /opt/emma
log_info "✅ Directorio /opt/emma creado"

log_step "Configurando SSL/Let's Encrypt..."
# Crear directorios para SSL
mkdir -p /opt/emma/ssl
mkdir -p /opt/emma/ssl/live/descubre.emma.pe
chown -R emma:emma /opt/emma/ssl

# Configurar Certbot para renovación automática
cat > /etc/cron.d/certbot << EOF
# Renovar certificados SSL automáticamente
0 12 * * * root test -x /usr/bin/certbot -a \! -d /run/systemd/system && perl -e 'sleep int(rand(43200))' && /usr/bin/certbot renew --quiet
EOF

log_info "✅ Configuración SSL preparada"

log_step "Optimizando configuración del sistema..."
# Optimizaciones para producción
cat >> /etc/sysctl.conf << EOF

# Optimizaciones para EMMA
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 3
vm.swappiness = 10
EOF

sysctl -p
log_info "✅ Optimizaciones del sistema aplicadas"

log_step "Configurando logs del sistema..."
# Configurar logrotate para logs de aplicación
cat > /etc/logrotate.d/emma << EOF
/opt/emma/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 emma emma
}
EOF

log_info "✅ Rotación de logs configurada"

echo ""
echo "🎉 ¡Servidor configurado exitosamente!"
echo ""
log_info "📋 Resumen de la configuración:"
log_info "   • Docker Engine: $(docker --version | cut -d' ' -f3 | tr -d ',')"
log_info "   • Docker Compose: $(docker-compose --version | cut -d' ' -f3 | tr -d ',')"
log_info "   • Usuario de aplicación: emma"
log_info "   • Directorio de trabajo: /opt/emma"
log_info "   • Firewall: activo (puertos 22, 80, 443)"
log_info "   • Fail2Ban: activo"
log_info "   • SSL/Certbot: preparado"
echo ""
log_info "🚀 Próximos pasos:"
log_info "   1. Cambiar al usuario emma: su - emma"
log_info "   2. Ir al directorio: cd /opt/emma"
log_info "   3. Clonar tu repositorio: git clone <tu-repo> ."
log_info "   4. Configurar variables de entorno: cp .env.example .env && nano .env"
log_info "   5. Ejecutar el despliegue: ./deploy.sh"
echo ""
log_warn "⚠️  IMPORTANTE: Configura tu dominio descubre.emma.pe para apuntar a esta IP antes del despliegue"
echo ""
