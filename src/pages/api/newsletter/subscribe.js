import { newsletterQueries } from '../../../lib/database.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { email, type = 'general', source = 'website', metadata = null } = data;

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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Formato de email inválido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si ya existe una suscripción
    const existingSubscription = newsletterQueries.getByEmail.get(email);

    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        return new Response(JSON.stringify({
          success: false,
          message: 'Este email ya está suscrito'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Reactivar suscripción existente
        newsletterQueries.resubscribe.run(email);
        
        return new Response(JSON.stringify({
          success: true,
          message: '¡Suscripción reactivada exitosamente!'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Crear nueva suscripción
    const metadataString = metadata ? JSON.stringify(metadata) : null;
    
    newsletterQueries.subscribe.run(
      email.toLowerCase().trim(),
      type,
      source,
      metadataString
    );

    return new Response(JSON.stringify({
      success: true,
      message: '¡Suscripción exitosa! Te mantendremos informado.'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en suscripción:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET({ url }) {
  try {
    const email = url.searchParams.get('email');
    
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const subscription = newsletterQueries.getByEmail.get(email);
    
    return new Response(JSON.stringify({
      success: true,
      subscription: subscription || null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error consultando suscripción:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
