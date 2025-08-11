# PowerShell script para configurar nginx con HTTP-only temporalmente
# Esto permite que nginx arranque sin certificados SSL

Write-Host "🔧 Reiniciando nginx con configuración HTTP-only..." -ForegroundColor Yellow

# Ejecutar comando en el servidor remoto
$serverCommand = @"
cd /opt/emma && 
echo '🔄 Reiniciando nginx...' && 
docker-compose restart nginx && 
sleep 5 && 
echo '📊 Estado de los contenedores:' && 
docker-compose ps && 
echo '' && 
echo '🌐 Verificando conectividad HTTP:' && 
curl -I http://descubre.emma.pe 2>/dev/null | head -3 || echo 'No se pudo conectar aún - esperando...' && 
echo '' && 
echo '✅ Si nginx está funcionando correctamente, ejecuta:' && 
echo '   ./setup-ssl.sh' && 
echo '   para configurar SSL'
"@

Write-Host "🚀 Ejecutando comandos en el servidor..." -ForegroundColor Green
Write-Host "Comando a ejecutar:" -ForegroundColor Cyan
Write-Host $serverCommand -ForegroundColor White

Write-Host ""
Write-Host "📋 Pasos siguientes:" -ForegroundColor Yellow
Write-Host "1. Copia y pega los comandos de arriba en el servidor" -ForegroundColor White
Write-Host "2. Verifica que nginx esté funcionando con HTTP" -ForegroundColor White
Write-Host "3. Ejecuta ./setup-ssl.sh para configurar SSL" -ForegroundColor White
