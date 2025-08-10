import { jobPositionQueries } from '../../../../lib/database.js';
import { auth } from '../../../../lib/auth.js';

export async function PATCH({ params, request }) {
  try {
    // Verificar autenticación
    const user = await auth.verifyAuth(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id, action } = params;
    const data = await request.json();

    // Verificar que la posición existe
    const existingPosition = jobPositionQueries.getById.get(id);
    if (!existingPosition) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Posición no encontrada'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let message = '';
    if (action === 'toggle-active') {
      const newStatus = data.is_active ? 1 : 0;
      jobPositionQueries.toggleActive.run(newStatus, id);
      message = `Posición ${newStatus ? 'activada' : 'desactivada'} exitosamente`;
    } else if (action === 'toggle-featured') {
      const newStatus = data.is_featured ? 1 : 0;
      jobPositionQueries.toggleFeatured.run(newStatus, id);
      message = `Posición ${newStatus ? 'destacada' : 'no destacada'} exitosamente`;
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Acción no válida'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: message
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en toggle de posición:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
