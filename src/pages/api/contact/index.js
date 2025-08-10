import { contactQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

export async function GET({ request }) {
  try {
    // Verificar autenticación para ver contactos
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

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const contact = contactQueries.getById.get(id);
      return new Response(JSON.stringify(contact), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contacts = contactQueries.getAll.all();
    return new Response(JSON.stringify(contacts), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error obteniendo contactos:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const { name, email, company, subject, message } = await request.json();
    
    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Nombre, email y mensaje son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email inválido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = contactQueries.create.run(
      name,
      email,
      company || '',
      subject || '',
      message
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Mensaje enviado exitosamente. Te contactaremos pronto.',
      id: result.lastInsertRowid
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error enviando contacto:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request }) {
  try {
    // Verificar autenticación para actualizar status
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

    const { id, status } = await request.json();
    
    if (!id || !status) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID y status son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    contactQueries.updateStatus.run(status, id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Status actualizado exitosamente'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error actualizando contacto:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request }) {
  try {
    // Verificar autenticación
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

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    contactQueries.delete.run(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Contacto eliminado exitosamente'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error eliminando contacto:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
