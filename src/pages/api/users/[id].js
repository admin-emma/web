import { userQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

export async function DELETE({ params, request }) {
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

    const userId = parseInt(params.id);

    // Validación del ID
    if (isNaN(userId)) {
      return new Response(JSON.stringify({
        message: 'ID de usuario inválido'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Verificar que el usuario actual sea admin
    const currentUser = userQueries.getById.get(user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return new Response(JSON.stringify({
        message: 'No tienes permisos para eliminar usuarios'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // No permitir eliminar el usuario con ID 1 (admin principal)
    if (userId === 1) {
      return new Response(JSON.stringify({
        message: 'No se puede eliminar el administrador principal'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // No permitir que un usuario se elimine a sí mismo
    if (userId === user.id) {
      return new Response(JSON.stringify({
        message: 'No puedes eliminar tu propia cuenta'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Verificar que el usuario a eliminar existe
    const userToDelete = userQueries.getById(userId);
    if (!userToDelete) {
      return new Response(JSON.stringify({
        message: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Eliminar usuario
    userQueries.delete(userId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Usuario eliminado exitosamente'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
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
