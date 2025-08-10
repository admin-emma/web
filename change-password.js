// change-password.js - Script para cambiar contraseña desde terminal
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'database.sqlite'));

// Función para cambiar contraseña
function changePassword(username, newPassword) {
  try {
    // Verificar que el usuario existe
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      console.log(`❌ Usuario "${username}" no encontrado`);
      return;
    }

    // Hash de la nueva contraseña
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    // Actualizar contraseña
    const result = db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hashedPassword, username);
    
    if (result.changes > 0) {
      console.log(`✅ Contraseña cambiada exitosamente para "${username}"`);
    } else {
      console.log(`❌ Error al cambiar contraseña para "${username}"`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

// Función para crear usuario
function createUser(username, password, role = 'admin') {
  try {
    // Verificar que el usuario no existe
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      console.log(`❌ El usuario "${username}" ya existe`);
      return;
    }

    // Hash de la contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Crear usuario
    const result = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, role);
    
    if (result.lastInsertRowid) {
      console.log(`✅ Usuario "${username}" creado exitosamente con rol "${role}"`);
    } else {
      console.log(`❌ Error al crear usuario "${username}"`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

// Función para listar usuarios
function listUsers() {
  try {
    const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY username').all();
    
    console.log('\n📋 Lista de Usuarios:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (users.length === 0) {
      console.log('   No hay usuarios registrados');
    } else {
      users.forEach(user => {
        console.log(`   ID: ${user.id} | Usuario: ${user.username} | Rol: ${user.role} | Creado: ${new Date(user.created_at).toLocaleDateString()}`);
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
  }
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'change-password':
    if (args.length < 3) {
      console.log('Uso: node change-password.js change-password <username> <new-password>');
      console.log('Ejemplo: node change-password.js change-password admin mi-nueva-contraseña');
    } else {
      changePassword(args[1], args[2]);
    }
    break;
    
  case 'create-user':
    if (args.length < 3) {
      console.log('Uso: node change-password.js create-user <username> <password> [role]');
      console.log('Ejemplo: node change-password.js create-user editor123 password456 editor');
    } else {
      createUser(args[1], args[2], args[3] || 'admin');
    }
    break;
    
  case 'list-users':
    listUsers();
    break;
    
  default:
    console.log('📖 Comandos disponibles:');
    console.log('  change-password <username> <new-password>  - Cambiar contraseña de usuario');
    console.log('  create-user <username> <password> [role]   - Crear nuevo usuario');
    console.log('  list-users                                 - Listar todos los usuarios');
    console.log('');
    console.log('🔧 Ejemplos:');
    console.log('  node change-password.js change-password admin nueva-contraseña');
    console.log('  node change-password.js create-user editor123 password456 editor');
    console.log('  node change-password.js list-users');
}
