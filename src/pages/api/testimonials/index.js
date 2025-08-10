import { testimonialsQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

export async function GET({ request }) {
  try {
    // Verificar autenticación
    const user = auth.verifyAuth(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const testimonialId = url.searchParams.get('id');
    
    if (testimonialId) {
      // Obtener un testimonio específico
      const testimonial = testimonialsQueries.getById.get(testimonialId);
      if (!testimonial) {
        return new Response(JSON.stringify({ error: 'Testimonio no encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(testimonial), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Obtener todos los testimonios
      const testimonials = testimonialsQueries.getAll.all();
      return new Response(JSON.stringify(testimonials), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error en GET /api/testimonials:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    // Verificar autenticación
    const user = auth.verifyAuth(request);
    if (!user) {
      return new Response('No autorizado', {
        status: 401,
        headers: { 'Location': '/admin' }
      });
    }

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
      case 'create':
        return await createTestimonial(formData);
      
      case 'update':
        return await updateTestimonial(formData);
      
      case 'toggle-status':
        return await toggleTestimonialStatus(formData);
      
      case 'toggle-featured':
        return await toggleTestimonialFeatured(formData);
      
      case 'delete':
        return await deleteTestimonial(formData);
      
      default:
        return new Response('Acción no válida', {
          status: 400,
          headers: { 'Location': '/admin/testimonials?error=invalid-action' }
        });
    }
  } catch (error) {
    console.error('Error en POST /api/testimonials:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Location': '/admin/testimonials?error=server-error' }
    });
  }
}

async function createTestimonial(formData) {
  try {
    const name = formData.get('name')?.trim();
    const position = formData.get('position')?.trim();
    const company = formData.get('company')?.trim() || null;
    const content = formData.get('content')?.trim();
    const avatar_url = formData.get('avatar_url')?.trim() || null;
    const rating = parseInt(formData.get('rating'));
    const is_active = formData.get('is_active') === '1' ? 1 : 0;
    const is_featured = formData.get('is_featured') === '1' ? 1 : 0;

    // Validaciones
    if (!name || !position || !content || !rating) {
      return new Response('Nombre, cargo, contenido y calificación son obligatorios', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=missing-fields' }
      });
    }

    if (name.length > 100 || position.length > 100 || content.length > 1000) {
      return new Response('Uno o más campos superan la longitud máxima', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=field-too-long' }
      });
    }

    if (company && company.length > 100) {
      return new Response('Nombre de empresa demasiado largo', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=company-too-long' }
      });
    }

    if (rating < 1 || rating > 5) {
      return new Response('Calificación debe estar entre 1 y 5', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=invalid-rating' }
      });
    }

    // Validar URL del avatar si se proporciona
    if (avatar_url && !isValidUrl(avatar_url)) {
      return new Response('URL del avatar no válida', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=invalid-avatar-url' }
      });
    }

    // Crear el testimonio
    testimonialsQueries.create.run(
      name,
      position,
      company,
      content,
      avatar_url,
      rating,
      is_active,
      is_featured
    );

    return new Response('Testimonio creado exitosamente', {
      status: 302,
      headers: { 'Location': '/admin/testimonials?message=testimonial-created' }
    });
  } catch (error) {
    console.error('Error al crear testimonio:', error);
    return new Response('Error al crear el testimonio', {
      status: 500,
      headers: { 'Location': '/admin/testimonials?error=create-failed' }
    });
  }
}

async function updateTestimonial(formData) {
  try {
    const testimonialId = formData.get('testimonialId');
    const name = formData.get('name')?.trim();
    const position = formData.get('position')?.trim();
    const company = formData.get('company')?.trim() || null;
    const content = formData.get('content')?.trim();
    const avatar_url = formData.get('avatar_url')?.trim() || null;
    const rating = parseInt(formData.get('rating'));
    const is_active = formData.get('is_active') === '1' ? 1 : 0;
    const is_featured = formData.get('is_featured') === '1' ? 1 : 0;

    // Validaciones
    if (!testimonialId || !name || !position || !content || !rating) {
      return new Response('ID, nombre, cargo, contenido y calificación son obligatorios', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=missing-fields' }
      });
    }

    // Verificar que el testimonio existe
    const existingTestimonial = testimonialsQueries.getById.get(testimonialId);
    if (!existingTestimonial) {
      return new Response('Testimonio no encontrado', {
        status: 404,
        headers: { 'Location': '/admin/testimonials?error=testimonial-not-found' }
      });
    }

    if (name.length > 100 || position.length > 100 || content.length > 1000) {
      return new Response('Uno o más campos superan la longitud máxima', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=field-too-long' }
      });
    }

    if (company && company.length > 100) {
      return new Response('Nombre de empresa demasiado largo', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=company-too-long' }
      });
    }

    if (rating < 1 || rating > 5) {
      return new Response('Calificación debe estar entre 1 y 5', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=invalid-rating' }
      });
    }

    // Validar URL del avatar si se proporciona
    if (avatar_url && !isValidUrl(avatar_url)) {
      return new Response('URL del avatar no válida', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=invalid-avatar-url' }
      });
    }

    // Actualizar el testimonio
    testimonialsQueries.update.run(
      name,
      position,
      company,
      content,
      avatar_url,
      rating,
      is_active,
      is_featured,
      testimonialId
    );

    return new Response('Testimonio actualizado exitosamente', {
      status: 302,
      headers: { 'Location': '/admin/testimonials?message=testimonial-updated' }
    });
  } catch (error) {
    console.error('Error al actualizar testimonio:', error);
    return new Response('Error al actualizar el testimonio', {
      status: 500,
      headers: { 'Location': '/admin/testimonials?error=update-failed' }
    });
  }
}

async function toggleTestimonialStatus(formData) {
  try {
    const testimonialId = formData.get('testimonialId');
    const status = formData.get('status');

    if (!testimonialId || status === null) {
      return new Response('ID del testimonio y estado son obligatorios', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=missing-fields' }
      });
    }

    // Verificar que el testimonio existe
    const existingTestimonial = testimonialsQueries.getById.get(testimonialId);
    if (!existingTestimonial) {
      return new Response('Testimonio no encontrado', {
        status: 404,
        headers: { 'Location': '/admin/testimonials?error=testimonial-not-found' }
      });
    }

    // Cambiar estado
    testimonialsQueries.toggleActive.run(status, testimonialId);

    const action = status === '1' ? 'activado' : 'desactivado';
    return new Response(`Testimonio ${action} exitosamente`, {
      status: 302,
      headers: { 'Location': `/admin/testimonials?message=testimonial-${action}` }
    });
  } catch (error) {
    console.error('Error al cambiar estado del testimonio:', error);
    return new Response('Error al cambiar el estado del testimonio', {
      status: 500,
      headers: { 'Location': '/admin/testimonials?error=toggle-failed' }
    });
  }
}

async function toggleTestimonialFeatured(formData) {
  try {
    const testimonialId = formData.get('testimonialId');
    const featured = formData.get('featured');

    if (!testimonialId || featured === null) {
      return new Response('ID del testimonio y estado destacado son obligatorios', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=missing-fields' }
      });
    }

    // Verificar que el testimonio existe
    const existingTestimonial = testimonialsQueries.getById.get(testimonialId);
    if (!existingTestimonial) {
      return new Response('Testimonio no encontrado', {
        status: 404,
        headers: { 'Location': '/admin/testimonials?error=testimonial-not-found' }
      });
    }

    // Cambiar estado destacado
    testimonialsQueries.toggleFeatured.run(featured, testimonialId);

    const action = featured === '1' ? 'destacado' : 'quitado de destacados';
    return new Response(`Testimonio ${action} exitosamente`, {
      status: 302,
      headers: { 'Location': `/admin/testimonials?message=testimonial-${action}` }
    });
  } catch (error) {
    console.error('Error al cambiar estado destacado del testimonio:', error);
    return new Response('Error al cambiar el estado destacado del testimonio', {
      status: 500,
      headers: { 'Location': '/admin/testimonials?error=toggle-featured-failed' }
    });
  }
}

async function deleteTestimonial(formData) {
  try {
    const testimonialId = formData.get('testimonialId');

    if (!testimonialId) {
      return new Response('ID del testimonio es obligatorio', {
        status: 400,
        headers: { 'Location': '/admin/testimonials?error=missing-testimonial-id' }
      });
    }

    // Verificar que el testimonio existe
    const existingTestimonial = testimonialsQueries.getById.get(testimonialId);
    if (!existingTestimonial) {
      return new Response('Testimonio no encontrado', {
        status: 404,
        headers: { 'Location': '/admin/testimonials?error=testimonial-not-found' }
      });
    }

    // Eliminar el testimonio
    testimonialsQueries.delete.run(testimonialId);

    return new Response('Testimonio eliminado exitosamente', {
      status: 302,
      headers: { 'Location': '/admin/testimonials?message=testimonial-deleted' }
    });
  } catch (error) {
    console.error('Error al eliminar testimonio:', error);
    return new Response('Error al eliminar el testimonio', {
      status: 500,
      headers: { 'Location': '/admin/testimonials?error=delete-failed' }
    });
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
