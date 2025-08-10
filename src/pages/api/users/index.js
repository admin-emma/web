import { userQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

export async function GET({ request }) {
  try {
    // Verificar autenticación usando el mismo método que blogs
    const user = auth.verifyAuth(request);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Acceso no autorizado'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener todos los usuarios (sin contraseñas)
    const users = userQueries.getAll.all().map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at
    }));
    
    return new Response(JSON.stringify({
      success: true,
      users: users
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
