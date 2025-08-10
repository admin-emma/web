import { heroSlidesQueries } from '../../../lib/database.js';
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
    const slideId = url.searchParams.get('id');
    
    if (slideId) {
      // Obtener un slide específico
      const slide = heroSlidesQueries.getById.get(slideId);
      if (!slide) {
        return new Response(JSON.stringify({ error: 'Slide no encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(slide), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Obtener todos los slides
      const slides = heroSlidesQueries.getAll.all();
      return new Response(JSON.stringify(slides), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error en GET /api/hero-slides:', error);
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
        return await createSlide(formData);
      
      case 'update':
        return await updateSlide(formData);
      
      case 'toggle-status':
        return await toggleSlideStatus(formData);
      
      case 'delete':
        return await deleteSlide(formData);
      
      default:
        return new Response('Acción no válida', {
          status: 400,
          headers: { 'Location': '/admin/hero-slides?error=invalid-action' }
        });
    }
  } catch (error) {
    console.error('Error en POST /api/hero-slides:', error);
    return new Response('Error interno del servidor', {
      status: 500,
      headers: { 'Location': '/admin/hero-slides?error=server-error' }
    });
  }
}

async function createSlide(formData) {
  try {
    const title = formData.get('title')?.trim();
    const subtitle = formData.get('subtitle')?.trim() || null;
    const description = formData.get('description')?.trim();
    const background_image = formData.get('background_image')?.trim() || null;
    const button_text = formData.get('button_text')?.trim() || null;
    const button_link = formData.get('button_link')?.trim() || null;
    const is_active = formData.get('is_active') === '1' ? 1 : 0;
    const sort_order = parseInt(formData.get('sort_order')) || 1;
    const visual_type = formData.get('visual_type')?.trim() || 'dashboard';

    // Validaciones
    if (!title || !description) {
      return new Response('Título y descripción son obligatorios', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=missing-fields' }
      });
    }

    // Validar visual_type
    const validVisualTypes = ['dashboard', 'analytics', 'team', 'growth', 'innovation'];
    if (!validVisualTypes.includes(visual_type)) {
      return new Response('Tipo de visualización no válido', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=invalid-visual-type' }
      });
    }

    if (title.length > 200 || description.length > 500) {
      return new Response('Título o descripción demasiado largos', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=field-too-long' }
      });
    }

    // Validar imagen de fondo si se proporciona (permite URLs y rutas locales)
    if (background_image && !isValidUrl(background_image) && !background_image.startsWith('/')) {
      return new Response('URL de imagen de fondo no válida', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=invalid-image-url' }
      });
    }

    if (button_link && !isValidUrl(button_link) && !button_link.startsWith('/')) {
      return new Response('Enlace del botón no válido', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=invalid-button-link' }
      });
    }

    // Crear el slide
    heroSlidesQueries.create.run(
      title,
      subtitle,
      description,
      background_image,
      button_text,
      button_link,
      visual_type,
      is_active,
      sort_order
    );

    // Si el slide se creó como activo, desactivar todos los demás
    if (is_active === 1) {
      const newSlide = heroSlidesQueries.getAll.all().pop(); // Obtener el último slide creado
      if (newSlide) {
        heroSlidesQueries.activateOnly(newSlide.id);
      }
    }

    return new Response('Slide creado exitosamente', {
      status: 302,
      headers: { 'Location': '/admin/hero-slides?message=slide-created' }
    });
  } catch (error) {
    console.error('Error al crear slide:', error);
    return new Response('Error al crear el slide', {
      status: 500,
      headers: { 'Location': '/admin/hero-slides?error=create-failed' }
    });
  }
}

async function updateSlide(formData) {
  try {
    const slideId = formData.get('slideId');
    const title = formData.get('title')?.trim();
    const subtitle = formData.get('subtitle')?.trim() || null;
    const description = formData.get('description')?.trim();
    const background_image = formData.get('background_image')?.trim() || null;
    const button_text = formData.get('button_text')?.trim() || null;
    const button_link = formData.get('button_link')?.trim() || null;
    const is_active = formData.get('is_active') === '1' ? 1 : 0;
    const sort_order = parseInt(formData.get('sort_order')) || 1;
    const visual_type = formData.get('visual_type')?.trim() || 'dashboard';

    // Validaciones
    if (!slideId || !title || !description) {
      return new Response('ID, título y descripción son obligatorios', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=missing-fields' }
      });
    }

    // Validar visual_type
    const validVisualTypes = ['dashboard', 'analytics', 'team', 'growth', 'innovation'];
    if (!validVisualTypes.includes(visual_type)) {
      return new Response('Tipo de visualización no válido', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=invalid-visual-type' }
      });
    }

    // Verificar que el slide existe
    const existingSlide = heroSlidesQueries.getById.get(slideId);
    if (!existingSlide) {
      return new Response('Slide no encontrado', {
        status: 404,
        headers: { 'Location': '/admin/hero-slides?error=slide-not-found' }
      });
    }

    if (title.length > 200 || description.length > 500) {
      return new Response('Título o descripción demasiado largos', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=field-too-long' }
      });
    }

    // Validar imagen de fondo si se proporciona (permite URLs y rutas locales)
    if (background_image && !isValidUrl(background_image) && !background_image.startsWith('/')) {
      return new Response('URL de imagen de fondo no válida', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=invalid-image-url' }
      });
    }

    if (button_link && !isValidUrl(button_link) && !button_link.startsWith('/')) {
      return new Response('Enlace del botón no válido', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=invalid-button-link' }
      });
    }

    // Actualizar el slide
    heroSlidesQueries.update.run(
      title,
      subtitle,
      description,
      background_image,
      button_text,
      button_link,
      visual_type,
      is_active,
      sort_order,
      slideId
    );

    // Si el slide se actualizó como activo, desactivar todos los demás
    if (is_active === 1) {
      heroSlidesQueries.activateOnly(slideId);
    }

    return new Response('Slide actualizado exitosamente', {
      status: 302,
      headers: { 'Location': '/admin/hero-slides?message=slide-updated' }
    });
  } catch (error) {
    console.error('Error al actualizar slide:', error);
    return new Response('Error al actualizar el slide', {
      status: 500,
      headers: { 'Location': '/admin/hero-slides?error=update-failed' }
    });
  }
}

async function toggleSlideStatus(formData) {
  try {
    const slideId = formData.get('slideId');
    const status = formData.get('status');

    if (!slideId || status === null) {
      return new Response('ID del slide y estado son obligatorios', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=missing-fields' }
      });
    }

    // Verificar que el slide existe
    const existingSlide = heroSlidesQueries.getById.get(slideId);
    if (!existingSlide) {
      return new Response('Slide no encontrado', {
        status: 404,
        headers: { 'Location': '/admin/hero-slides?error=slide-not-found' }
      });
    }

    // Cambiar estado
    if (status === '1') {
      // Si se está activando, usar la función que desactiva todos los demás
      heroSlidesQueries.activateOnly(slideId);
    } else {
      // Si se está desactivando, solo cambiar este slide
      heroSlidesQueries.toggleActive.run(status, slideId);
    }

    const action = status === '1' ? 'activado' : 'desactivado';
    return new Response(`Slide ${action} exitosamente`, {
      status: 302,
      headers: { 'Location': `/admin/hero-slides?message=slide-${action}` }
    });
  } catch (error) {
    console.error('Error al cambiar estado del slide:', error);
    return new Response('Error al cambiar el estado del slide', {
      status: 500,
      headers: { 'Location': '/admin/hero-slides?error=toggle-failed' }
    });
  }
}

async function deleteSlide(formData) {
  try {
    const slideId = formData.get('slideId');

    if (!slideId) {
      return new Response('ID del slide es obligatorio', {
        status: 400,
        headers: { 'Location': '/admin/hero-slides?error=missing-slide-id' }
      });
    }

    // Verificar que el slide existe
    const existingSlide = heroSlidesQueries.getById.get(slideId);
    if (!existingSlide) {
      return new Response('Slide no encontrado', {
        status: 404,
        headers: { 'Location': '/admin/hero-slides?error=slide-not-found' }
      });
    }

    // Eliminar el slide
    heroSlidesQueries.delete.run(slideId);

    return new Response('Slide eliminado exitosamente', {
      status: 302,
      headers: { 'Location': '/admin/hero-slides?message=slide-deleted' }
    });
  } catch (error) {
    console.error('Error al eliminar slide:', error);
    return new Response('Error al eliminar el slide', {
      status: 500,
      headers: { 'Location': '/admin/hero-slides?error=delete-failed' }
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
