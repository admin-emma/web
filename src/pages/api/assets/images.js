import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const folder = url.searchParams.get('folder') || '';
    
    // Definir directorios permitidos
    const allowedFolders = ['', 'assets', 'uploads'];
    let baseDir;
    
    switch(folder) {
      case 'assets':
        baseDir = 'src/assets';
        break;
      case 'uploads':
        baseDir = 'public/uploads';
        break;
      default:
        baseDir = 'public';
    }
    
    if (!allowedFolders.includes(folder)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Directorio no permitido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const dirPath = join(process.cwd(), baseDir);
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      // Filtrar solo archivos de imagen
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const images = items
        .filter(item => {
          if (!item.isFile()) return false;
          const ext = item.name.toLowerCase().substring(item.name.lastIndexOf('.'));
          return imageExtensions.includes(ext);
        })
        .map(item => {
          let publicPath;
          
          switch(folder) {
            case 'assets':
              publicPath = `/src/assets/${item.name}`;
              break;
            case 'uploads':
              publicPath = `/uploads/${item.name}`;
              break;
            default:
              publicPath = `/${item.name}`;
          }
          
          return {
            name: item.name,
            path: publicPath,
            type: 'image'
          };
        });

      return new Response(JSON.stringify({
        success: true,
        images: images,
        folder: folder || 'public'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Error leyendo directorio'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
