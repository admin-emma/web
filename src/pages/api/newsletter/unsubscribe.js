import { newsletterQueries } from '../../../lib/database.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { email } = data;

    // Validar email
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si existe la suscripción
    const existingSubscription = newsletterQueries.getByEmail.get(email);

    if (!existingSubscription) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No se encontró una suscripción con este email'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (existingSubscription.status === 'unsubscribed') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Este email ya está dado de baja'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Dar de baja la suscripción
    newsletterQueries.unsubscribe.run(email.toLowerCase().trim());

    return new Response(JSON.stringify({
      success: true,
      message: 'Email dado de baja exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error dando de baja email:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
