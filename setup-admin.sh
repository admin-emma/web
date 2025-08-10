#!/bin/bash

# Script seguro para generar hash de contraseña de administrador
# Este script se ejecuta en el servidor durante el despliegue

echo "🔐 Generando usuario administrador para EMMA..."

# Leer contraseña de manera segura
read -s -p "🔑 Ingresa la contraseña para admin@emma.pe: " ADMIN_PASSWORD
echo

if [ -z "$ADMIN_PASSWORD" ]; then
    echo "❌ Contraseña no puede estar vacía"
    exit 1
fi

# Generar hash usando Node.js
HASH=$(node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('$ADMIN_PASSWORD', 10).then(hash => {
    console.log(hash);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
")

if [ $? -ne 0 ]; then
    echo "❌ Error generando hash de contraseña"
    exit 1
fi

# Actualizar la base de datos con el hash real
sqlite3 /app/database.sqlite "
UPDATE users 
SET password_hash = '$HASH' 
WHERE username = 'admin' AND email = 'admin@emma.pe';
"

if [ $? -eq 0 ]; then
    echo "✅ Usuario administrador configurado exitosamente"
    echo "📧 Email: admin@emma.pe"
    echo "🔐 Contraseña configurada de manera segura"
else
    echo "❌ Error actualizando usuario administrador"
    exit 1
fi
