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

    const { currentPassword, newPassword } = await request.json();

    // Validaciones
    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({
        message: 'Todos los campos son obligatorios'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validar longitud de nueva contraseña
    if (newPassword.length < 6) {
      return new Response(JSON.stringify({
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Obtener usuario actual (ya verificado en la autenticación)
    const currentUser = userQueries.getById.get(user.id);
    if (!currentUser) {
      return new Response(JSON.stringify({
        message: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isCurrentPasswordValid) {
      return new Response(JSON.stringify({
        message: 'La contraseña actual es incorrecta'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Hash de la nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    userQueries.updatePassword(currentUser.id, hashedNewPassword);

    return new Response(JSON.stringify({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
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
