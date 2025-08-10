import { blogQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateUniqueSlug(title) {
  const baseSlug = generateSlug(title);
  
  // Verificar si el slug base ya existe
  const existingBlog = blogQueries.getBySlug.get(baseSlug);
  
  if (!existingBlog) {
    return baseSlug;
  }
  
  // Si existe, añadir un número hasta encontrar uno único
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (blogQueries.getBySlug.get(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
}

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const slug = url.searchParams.get('slug');
    const published = url.searchParams.get('published');

    if (id) {
      const blog = blogQueries.getById.get(id);
      return new Response(JSON.stringify(blog), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (slug) {
      const blog = blogQueries.getBySlug.get(slug);
      return new Response(JSON.stringify(blog), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (published === 'true') {
      const blogs = blogQueries.getPublished.all('published');
      return new Response(JSON.stringify(blogs), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar autenticación para ver todos los blogs
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

    const blogs = blogQueries.getAll.all();
    return new Response(JSON.stringify(blogs), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error obteniendo blogs:', error);
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

    const { title, description, content, heroImage, status = 'draft', author, slug } = await request.json();
    
    if (!title || !content || !author || !slug) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Título, contenido, autor y slug son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el slug no exista
    const existingBlog = blogQueries.getBySlug.get(slug);
    if (existingBlog) {
      return new Response(JSON.stringify({
        success: false,
        message: 'El slug ya está siendo usado por otro blog'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pubDate = new Date().toISOString();

    const result = blogQueries.create.run(
      title,
      description || '',
      content,
      author,
      slug,
      heroImage || null,
      status,
      pubDate
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Blog creado exitosamente',
      id: result.lastInsertRowid
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creando blog:', error);
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

    const { id, title, description, content, heroImage, status } = await request.json();
    
    if (!id || !title || !content) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID, título y contenido son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener el blog actual para comparar el título
    const currentBlog = blogQueries.getById.get(id);
    if (!currentBlog) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Blog no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar slug solo si el título ha cambiado
    let slug = currentBlog.slug;
    if (currentBlog.title !== title) {
      // Función para generar slug único excluyendo el blog actual
      const generateUniqueSlugForUpdate = (title, excludeId) => {
        const baseSlug = generateSlug(title);
        
        // Verificar si el slug base ya existe (excluyendo el blog actual)
        const existingBlog = blogQueries.getBySlug.get(baseSlug);
        
        if (!existingBlog || existingBlog.id === excludeId) {
          return baseSlug;
        }
        
        // Si existe, añadir un número hasta encontrar uno único
        let counter = 1;
        let uniqueSlug = `${baseSlug}-${counter}`;
        
        while (true) {
          const existingWithCounter = blogQueries.getBySlug.get(uniqueSlug);
          if (!existingWithCounter || existingWithCounter.id === excludeId) {
            break;
          }
          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
        }
        
        return uniqueSlug;
      };
      
      slug = generateUniqueSlugForUpdate(title, parseInt(id));
    }

    blogQueries.update.run(
      title,
      description || '',
      content,
      user.username,
      slug,
      heroImage || null,
      status,
      id
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Blog actualizado exitosamente'
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

    blogQueries.delete.run(id);

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
