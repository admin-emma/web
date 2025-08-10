import { recruitmentQueries, jobPositionQueries } from '../../../lib/database.js';
import { auth } from '../../../lib/auth.js';

export async function GET({ request }) {
  try {
    // Verificar autenticación para ver aplicaciones
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
      const recruitment = recruitmentQueries.getById.get(id);
      return new Response(JSON.stringify(recruitment), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const recruitments = recruitmentQueries.getAll.all();
    return new Response(JSON.stringify(recruitments), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error obteniendo aplicaciones:', error);
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
    const formData = await request.formData();
    
    const name = formData.get('nombre');
    const email = formData.get('email');
    const phone = formData.get('telefono');
    const position = formData.get('posicion');
    const positionId = formData.get('position_id'); // Nueva relación
    const experience = formData.get('experiencia');
    const salaryExpectation = formData.get('salario');
    const coverLetter = formData.get('carta');
    const cvFile = formData.get('cv');
    
    if (!name || !email || !position) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Nombre, email y posición son requeridos'
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

    // Validar CV si se proporciona
    let cvPath = null;
    if (cvFile && cvFile.size > 0) {
      // Validar tamaño del archivo (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (cvFile.size > maxSize) {
        return new Response(JSON.stringify({
          success: false,
          message: 'El archivo CV no puede superar los 5MB'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(cvFile.type)) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Solo se permiten archivos PDF, DOC o DOCX'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Guardar archivo CV
      try {
        const arrayBuffer = await cvFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Crear nombre único para el archivo
        const timestamp = Date.now();
        const fileExtension = cvFile.name.split('.').pop();
        const fileName = `cv_${timestamp}.${fileExtension}`;
        cvPath = `uploads/cv/${fileName}`;
        
        // Crear directorio si no existe
        const fs = await import('fs');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cv');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Guardar archivo
        const fullPath = path.join(uploadDir, fileName);
        fs.writeFileSync(fullPath, buffer);
        
      } catch (fileError) {
        console.error('Error guardando CV:', fileError);
        return new Response(JSON.stringify({
          success: false,
          message: 'Error guardando el archivo CV'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const result = recruitmentQueries.create.run(
      name,
      email,
      phone || '',
      position,
      experience || '',
      salaryExpectation || '',
      cvPath,
      coverLetter || '',
      positionId ? parseInt(positionId) : null // Nueva relación
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Aplicación enviada exitosamente. Te contactaremos pronto.',
      id: result.lastInsertRowid
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error enviando aplicación:', error);
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

    recruitmentQueries.updateStatus.run(status, id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Status actualizado exitosamente'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error actualizando aplicación:', error);
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

    recruitmentQueries.delete.run(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Aplicación eliminada exitosamente'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error eliminando aplicación:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
