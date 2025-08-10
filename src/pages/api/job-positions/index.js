import { jobPositionQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

export async function GET({ request }) {
  try {
    // Para la página pública, solo devolver posiciones activas
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active') !== 'false';
    
    let positions;
    if (activeOnly) {
      positions = jobPositionQueries.getActive.all();
    } else {
      // Verificar autenticación para ver todas las posiciones
      const user = auth.verifyAuth(request);
      if (!user) {
        return new Response(JSON.stringify({ error: 'No autorizado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      positions = jobPositionQueries.getAll.all();
    }

    // Parsear JSON fields
    const formattedPositions = positions.map(position => ({
      ...position,
      requirements: position.requirements ? JSON.parse(position.requirements) : [],
      responsibilities: position.responsibilities ? JSON.parse(position.responsibilities) : []
    }));

    return new Response(JSON.stringify({
      success: true,
      positions: formattedPositions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error obteniendo posiciones:', error);
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
    // Verificar autenticación
    const user = await auth.verifyAuth(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    
    // Validar campos requeridos
    const requiredFields = ['title', 'description', 'department'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(JSON.stringify({
          success: false,
          message: `El campo ${field} es requerido`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Crear nueva posición
    const result = jobPositionQueries.create.run(
      data.title,
      data.description || '',
      data.department,
      data.location || 'Remoto',
      data.employment_type || 'Tiempo completo',
      data.salary_min || 0,
      data.salary_max || 0,
      JSON.stringify(data.requirements || []),
      JSON.stringify(data.responsibilities || []),
      data.experience_min || 0,
      data.is_active ? 1 : 0,
      data.is_featured ? 1 : 0
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Posición creada exitosamente',
      id: result.lastInsertRowid
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creando posición:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
