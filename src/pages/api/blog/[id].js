import { blogQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

export async function PUT({ params, request }) {
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

    const blogId = params.id;
    const { title, description, content, heroImage, status, author, slug } = await request.json();
    
    if (!title || !content || !author || !slug) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Título, contenido, autor y slug son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el blog existe
    const existingBlog = blogQueries.getById.get(blogId);
    if (!existingBlog) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Blog no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el slug no esté siendo usado por otro blog
    const blogWithSlug = blogQueries.getBySlug.get(slug);
    if (blogWithSlug && blogWithSlug.id !== parseInt(blogId)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'El slug ya está siendo usado por otro blog'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Actualizar el blog
    blogQueries.update.run(
      title,
      description || '',
      content,
      author,
      slug,
      heroImage || '',
      status || 'draft',
      blogId
    );

    // Obtener el blog actualizado
    const updatedBlog = blogQueries.getById.get(blogId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Blog actualizado exitosamente',
      blog: updatedBlog
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error actualizando blog:', error);
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

    const blogId = params.id;
    
    // Verificar que el blog existe
    const existingBlog = blogQueries.getById.get(blogId);
    if (!existingBlog) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Blog no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Eliminar el blog
    blogQueries.delete.run(blogId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Blog eliminado exitosamente'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error eliminando blog:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
