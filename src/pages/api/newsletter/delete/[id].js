import { newsletterQueries } from '../../../../lib/database.js';

export async function DELETE({ params, request }) {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de suscripción requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verificar que la suscripción existe
    const existingSubscription = newsletterQueries.getById.get(parseInt(id));
    
    if (!existingSubscription) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Suscripción no encontrada'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Eliminar la suscripción
    const result = newsletterQueries.delete.run(parseInt(id));

    if (result.changes > 0) {
      return new Response(JSON.stringify({
        success: true,
        message: `Suscripción de ${existingSubscription.email} eliminada exitosamente`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'No se pudo eliminar la suscripción'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error deleting newsletter subscription:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
