import { auth } from '../../../lib/auth.js';
import { promises as fs } from 'fs';
import { join } from 'path';

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

    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No se proporcionó ningún archivo'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, GIF y WebP.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 10MB.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `blog-${timestamp}.${extension}`;
    
    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Guardar archivo
    const filePath = join(uploadDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(filePath, buffer);

    // Retornar URL pública
    const publicUrl = `/uploads/${fileName}`;

    return new Response(JSON.stringify({
      success: true,
      message: 'Imagen subida exitosamente',
      url: publicUrl,
      filename: fileName
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
