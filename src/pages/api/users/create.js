import bcrypt from 'bcryptjs';
import { userQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

export async function POST({ request }) {
  try {
    // Verificar autenticación
    const user = auth.verifyAuth(request);
    if (!user) {
      return new Response(JSON.stringify({
        message: 'Acceso no autorizado'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const { username, password, role } = await request.json();

    // Validaciones
    if (!username || !password || !role) {
      return new Response(JSON.stringify({
        message: 'Todos los campos son obligatorios'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = userQueries.getByUsername(username);
    if (existingUser) {
      return new Response(JSON.stringify({
        message: 'El nombre de usuario ya existe'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return new Response(JSON.stringify({
        message: 'La contraseña debe tener al menos 6 caracteres'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validar rol
    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({
        message: 'Rol inválido'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const result = userQueries.create({
      username,
      password: hashedPassword,
      role
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Usuario creado exitosamente',
      userId: result.lastInsertRowid
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return new Response(JSON.stringify({
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
