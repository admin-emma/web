import { getDatabase } from './src/lib/database.js';

const db = getDatabase();

// Actualizar la imagen del primer slide a una ruta accesible
db.prepare(`UPDATE hero_slides SET background_image = '/uploads/best-practices.png' WHERE id = 1`).run();

console.log('✅ Imagen de fondo actualizada a ruta accesible');

// Verificar el resultado
const slide = db.prepare('SELECT id, background_image, is_active FROM hero_slides WHERE id = 1').get();
console.log('Slide 1:', slide);
