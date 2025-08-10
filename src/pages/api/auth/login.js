import { auth } from '../../../lib/auth.js';

export async function POST({ request }) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await auth.verifyCredentials(username, password);
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Credenciales inválidas'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = auth.generateToken(user);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Login exitoso',
      user: { id: user.id, username: user.username, role: user.role },
      token
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
