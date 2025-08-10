// Script para generar hash de contraseña para usuario admin
// Ejecutar: node generate-admin-password.js

const bcrypt = require('bcrypt');

async function generateAdminPassword() {
    // Contraseña por defecto: "admin123"
    // ¡IMPORTANTE! Cambiar esta contraseña en producción
    const password = 'admin123';
    const saltRounds = 10;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password hash para admin:');
        console.log(hash);
        console.log('\n⚠️  IMPORTANTE: Cambiar esta contraseña después del primer login');
        console.log('📧 Email: admin@emma.pe');
        console.log('🔑 Password temporal: admin123');
    } catch (error) {
        console.error('Error generando hash:', error);
    }
}

generateAdminPassword();
