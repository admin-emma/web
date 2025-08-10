import { auth } from '../../../lib/auth.js';
import fs from 'fs';
import path from 'path';

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
    
    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({
        success: false,
        message: 'No se encontró archivo de imagen'
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
        message: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WebP'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB permitido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    
    // Crear directorio si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Guardar archivo
    const filePath = path.join(uploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);

    // Retornar URL del archivo
    const fileUrl = `/uploads/${fileName}`;

    return new Response(JSON.stringify({
      success: true,
      message: 'Imagen subida exitosamente',
      url: fileUrl,
      filename: fileName
    }), {
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

// GET para listar imágenes existentes
export async function GET({ request }) {
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

    const images = [];
    
    // Solo listar imágenes subidas (que están en public/uploads)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      
      imageFiles.forEach(file => {
        images.push({
          name: file,
          url: `/uploads/${file}`,
          type: 'upload',
          size: fs.statSync(path.join(uploadsDir, file)).size
        });
      });
    }

    return new Response(JSON.stringify({
      success: true,
      images: images
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error listando imágenes:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
