#!/bin/bash
# Emma: Script único para administración y despliegue
# Uso: ./emma.sh [deploy|ssl|verify|dev]

set -e
ACCION="$1"

function deploy() {
  echo "[Emma] Desplegando en modo HTTP..."
  bash scripts/deployment/deploy.sh
}

function ssl() {
  echo "[Emma] Activando SSL/HTTPS..."
  bash scripts/deployment/setup-ssl.sh
}

function verify() {
  echo "[Emma] Verificando despliegue..."
  bash scripts/deployment/verify-deployment.sh
}

function dev() {
  echo "[Emma] Iniciando entorno de desarrollo..."
  if [ -f scripts/legacy/dev.sh ]; then
    bash scripts/legacy/dev.sh
  else
    echo "No existe dev.sh, ejecuta manualmente el entorno de desarrollo."
  fi
}

case "$ACCION" in
  deploy)
    deploy
    ;;
  ssl)
    ssl
    ;;
  verify)
    verify
    ;;
  dev)
    dev
    ;;
  *)
    echo "Uso: $0 [deploy|ssl|verify|dev]"
    exit 1
    ;;
esac
