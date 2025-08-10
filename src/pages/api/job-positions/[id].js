import { jobPositionQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

export async function GET({ params, request }) {
  try {
    const { id } = params;
    const position = jobPositionQueries.getById.get(id);

    if (!position) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Posición no encontrada'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parsear JSON fields
    const formattedPosition = {
      ...position,
      requirements: position.requirements ? JSON.parse(position.requirements) : [],
      responsibilities: position.responsibilities ? JSON.parse(position.responsibilities) : []
    };

    return new Response(JSON.stringify({
      success: true,
      position: formattedPosition
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error obteniendo posición:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ params, request }) {
  try {
    // Verificar autenticación
    const user = await auth.verifyAuth(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
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

    // Actualizar posición
    jobPositionQueries.update.run(
      data.title || existingPosition.title,
      data.description || existingPosition.description,
      data.department || existingPosition.department,
      data.location || existingPosition.location,
      data.employment_type || existingPosition.employment_type,
      data.salary_min !== undefined ? data.salary_min : existingPosition.salary_min,
      data.salary_max !== undefined ? data.salary_max : existingPosition.salary_max,
      JSON.stringify(data.requirements !== undefined ? data.requirements : JSON.parse(existingPosition.requirements || '[]')),
      JSON.stringify(data.responsibilities !== undefined ? data.responsibilities : JSON.parse(existingPosition.responsibilities || '[]')),
      data.experience_min !== undefined ? data.experience_min : existingPosition.experience_min,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : existingPosition.is_active,
      data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : existingPosition.is_featured,
      id
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Posición actualizada exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error actualizando posición:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ params, request }) {
  try {
    // Verificar autenticación
    const user = await auth.verifyAuth(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

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

    // Eliminar posición
    jobPositionQueries.delete.run(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Posición eliminada exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error eliminando posición:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
