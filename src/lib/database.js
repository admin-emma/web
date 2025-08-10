import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear conexión a la base de datos
const db = new Database(join(process.cwd(), 'database.sqlite'));

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    hero_image TEXT,
    status TEXT DEFAULT 'draft',
    pub_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recruitments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT NOT NULL,
    experience TEXT,
    salary_expectation TEXT,
    cv_path TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'new',
    position_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (position_id) REFERENCES job_positions(id)
  );

  CREATE TABLE IF NOT EXISTS job_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    department TEXT,
    location TEXT DEFAULT 'Remoto',
    employment_type TEXT DEFAULT 'Tiempo completo',
    salary_min INTEGER,
    salary_max INTEGER,
    requirements TEXT, -- JSON string
    responsibilities TEXT, -- JSON string
    experience_min INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    is_featured BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'general', -- 'general', 'career', 'blog'
    status TEXT DEFAULT 'active', -- 'active', 'unsubscribed'
    source TEXT, -- 'homepage', 'blog', 'careers', etc.
    metadata TEXT, -- JSON para información adicional
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME
  );
`);

// Migraciones
try {
  // Migración 1: Agregar columna salary_expectation si no existe
  const checkSalaryColumn = db.prepare("PRAGMA table_info(recruitments)");
  const columns = checkSalaryColumn.all();
  const hasSalaryColumn = columns.some(col => col.name === 'salary_expectation');
  
  if (!hasSalaryColumn) {
    db.exec("ALTER TABLE recruitments ADD COLUMN salary_expectation TEXT");
    console.log('✅ Columna salary_expectation agregada a la tabla recruitments');
  }

  // Migración 2: Agregar columna position_id si no existe
  const hasPositionIdColumn = columns.some(col => col.name === 'position_id');
  
  if (!hasPositionIdColumn) {
    db.exec("ALTER TABLE recruitments ADD COLUMN position_id INTEGER");
    console.log('✅ Columna position_id agregada a la tabla recruitments');
  }

  // Migración 3: Insertar posiciones iniciales si la tabla está vacía
  const positionsCount = db.prepare("SELECT COUNT(*) as count FROM job_positions").get();
  
  if (positionsCount.count === 0) {
    const insertPosition = db.prepare(`
      INSERT INTO job_positions (
        title, description, department, location, employment_type,
        salary_min, salary_max, requirements, responsibilities, 
        experience_min, is_active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Posición disponible: React Native + Kotlin
    insertPosition.run(
      'Desarrollador React Native + Kotlin',
      'Desarrollar aplicaciones móviles multiplataforma para el sector de RRHH usando React Native y Kotlin nativo.',
      'Desarrollo',
      'Remoto desde Perú',
      'Tiempo completo',
      3500,
      5500,
      JSON.stringify([
        'Kotlin para desarrollo Android nativo',
        'React Native para desarrollo multiplataforma',
        'JavaScript/TypeScript',
        'APIs REST y GraphQL',
        'Git y metodologías ágiles',
        'Conocimientos de UX/UI móvil'
      ]),
      JSON.stringify([
        'Desarrollar aplicaciones móviles nativas y multiplataforma',
        'Colaborar con el equipo de diseño UX/UI',
        'Integrar APIs y servicios backend',
        'Mantener código limpio y documentado',
        'Participar en revisiones de código',
        'Contribuir a la arquitectura móvil'
      ]),
      2,
      1, // activa
      1  // destacada
    );

    // Posiciones no disponibles
    const unavailablePositions = [
      {
        title: 'Desarrollador Frontend',
        description: 'Desarrollo de interfaces web modernas con React y TypeScript.',
        department: 'Desarrollo',
        requirements: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
        responsibilities: ['Desarrollar interfaces de usuario', 'Implementar diseños responsive', 'Optimizar rendimiento web'],
        experience_min: 2,
        salary_min: 3000,
        salary_max: 4500
      },
      {
        title: 'Desarrollador Backend',
        description: 'Desarrollo de APIs y servicios backend escalables.',
        department: 'Desarrollo',
        requirements: ['Node.js', 'Python', 'Bases de datos', 'APIs REST', 'Microservicios'],
        responsibilities: ['Desarrollar APIs REST', 'Diseñar arquitectura backend', 'Optimizar bases de datos'],
        experience_min: 3,
        salary_min: 3500,
        salary_max: 5000
      },
      {
        title: 'UI/UX Designer',
        description: 'Diseño de experiencias de usuario para productos SaaS.',
        department: 'Diseño',
        requirements: ['Figma', 'Adobe Creative Suite', 'Design Systems', 'Prototipado', 'User Research'],
        responsibilities: ['Crear wireframes y prototipos', 'Diseñar interfaces de usuario', 'Realizar investigación de usuarios'],
        experience_min: 2,
        salary_min: 2800,
        salary_max: 4200
      }
    ];

    unavailablePositions.forEach(pos => {
      insertPosition.run(
        pos.title,
        pos.description,
        pos.department,
        'Remoto desde Perú',
        'Tiempo completo',
        pos.salary_min,
        pos.salary_max,
        JSON.stringify(pos.requirements),
        JSON.stringify(pos.responsibilities),
        pos.experience_min,
        0, // inactiva
        0  // no destacada
      );
    });

    console.log('✅ Posiciones iniciales creadas en job_positions');
  }

  // Migración 4: Crear tabla hero_slides si no existe
  const tablesQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hero_slides'");
  const heroTable = tablesQuery.get();
  
  if (!heroTable) {
    db.exec(`
      CREATE TABLE hero_slides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        background_image TEXT,
        button_text TEXT DEFAULT 'Conoce más',
        button_link TEXT DEFAULT '/about',
        is_active BOOLEAN DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insertar slides iniciales
    const insertSlide = db.prepare(`
      INSERT INTO hero_slides (title, subtitle, description, background_image, button_text, button_link, sort_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertSlide.run(
      'Transformamos el talento en éxito empresarial',
      'EMMA - Expertos en gestión de personas', 
      'Conectamos a las mejores empresas con el talento excepcional. Simplificamos procesos de selección y maximizamos el potencial humano de tu organización.',
      '/src/assets/best-practices.png',
      'Explorar servicios',
      '/about',
      1
    );
    
    insertSlide.run(
      'Tu próxima oportunidad profesional te está esperando',
      'Encuentra el trabajo ideal',
      'Descubre ofertas laborales en empresas innovadoras. Te acompañamos en cada paso hacia tu crecimiento profesional.',
      '/src/assets/people-analytics.jpg',
      'Ver ofertas',
      '/careers',
      2
    );
    
    insertSlide.run(
      'Experiencia que marca la diferencia',
      'Más de 10 años conectando talento',
      'Hemos ayudado a cientos de profesionales a encontrar su lugar ideal y a empresas a construir equipos excepcionales.',
      '/src/assets/tech-hr.png',
      'Nuestra historia',
      '/about',
      3
    );
    
    console.log('✅ Tabla hero_slides creada con datos iniciales');
  }

  // Migración 5: Crear tabla testimonials si no existe
  const testimonialsQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='testimonials'");
  const testimonialsTable = testimonialsQuery.get();
  
  if (!testimonialsTable) {
    db.exec(`
      CREATE TABLE testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        position TEXT,
        company TEXT,
        content TEXT NOT NULL,
        avatar_url TEXT,
        rating INTEGER DEFAULT 5,
        is_active BOOLEAN DEFAULT 1,
        is_featured BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insertar testimonios iniciales
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (name, position, company, content, rating, is_featured) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertTestimonial.run(
      'María González',
      'Gerente de RRHH',
      'TechCorp',
      'EMMA transformó completamente nuestro proceso de selección. En 3 meses encontramos a 5 desarrolladores excepcionales que se adaptaron perfectamente a nuestra cultura empresarial.',
      5,
      1
    );
    
    insertTestimonial.run(
      'Carlos Rodríguez',
      'Desarrollador Senior',
      'InnovaSoft',
      'Gracias a EMMA encontré mi trabajo ideal. El proceso fue transparente, rápido y me conectaron con una empresa que realmente valoraba mis habilidades.',
      5,
      1
    );
    
    insertTestimonial.run(
      'Ana Martínez',
      'CEO',
      'StartupPeru',
      'Como startup, necesitábamos talento de calidad rápidamente. EMMA nos ayudó a construir nuestro equipo inicial con profesionales comprometidos y competentes.',
      5,
      1
    );
    
    console.log('✅ Tabla testimonials creada con datos iniciales');
  }

} catch (error) {
  console.log('⚠️ Error en migraciones:', error.message);
}

// Migración 6: Agregar campo visual_type a hero_slides si no existe
try {
  const checkColumn = db.prepare("PRAGMA table_info(hero_slides)");
  const columns = checkColumn.all();
  const hasVisualType = columns.some(col => col.name === 'visual_type');
  
  if (!hasVisualType) {
    db.exec(`
      ALTER TABLE hero_slides 
      ADD COLUMN visual_type TEXT DEFAULT 'dashboard' 
      CHECK(visual_type IN ('dashboard', 'analytics', 'team', 'growth', 'innovation'))
    `);
    
    // Actualizar registros existentes con valores por defecto diferentes
    const updateQueries = [
      "UPDATE hero_slides SET visual_type = 'dashboard' WHERE id = 1",
      "UPDATE hero_slides SET visual_type = 'analytics' WHERE id = 2", 
      "UPDATE hero_slides SET visual_type = 'team' WHERE id = 3"
    ];
    
    updateQueries.forEach(query => {
      try {
        db.exec(query);
      } catch (e) {
        // Ignorar errores si los registros no existen
      }
    });
    
    console.log('✅ Migración 6 aplicada: Campo visual_type agregado a hero_slides');
  }
} catch (error) {
  console.log('⚠️ Migración 6: Error al agregar visual_type:', error.message);
}

// Crear usuario admin por defecto si no existe
const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin');
if (adminExists.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');
  console.log('✅ Usuario admin creado: username: admin, password: admin123');
}

// Funciones para blogs
export const blogQueries = {
  getAll: db.prepare('SELECT * FROM blogs ORDER BY pub_date DESC'),
  getById: db.prepare('SELECT * FROM blogs WHERE id = ?'),
  getBySlug: db.prepare('SELECT * FROM blogs WHERE slug = ?'),
  getPublished: db.prepare('SELECT * FROM blogs WHERE status = ? ORDER BY pub_date DESC'),
  create: db.prepare(`
    INSERT INTO blogs (title, description, content, author, slug, hero_image, status, pub_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  update: db.prepare(`
    UPDATE blogs 
    SET title = ?, description = ?, content = ?, author = ?, slug = ?, hero_image = ?, status = ?, updated_date = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM blogs WHERE id = ?')
};

// Funciones para contactos
export const contactQueries = {
  getAll: db.prepare('SELECT * FROM contacts ORDER BY created_at DESC'),
  getById: db.prepare('SELECT * FROM contacts WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO contacts (name, email, company, subject, message)
    VALUES (?, ?, ?, ?, ?)
  `),
  updateStatus: db.prepare('UPDATE contacts SET status = ? WHERE id = ?'),
  delete: db.prepare('DELETE FROM contacts WHERE id = ?')
};

// Funciones para usuarios
export const userQueries = {
  getAll: db.prepare('SELECT * FROM users ORDER BY username ASC'),
  getByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  getById: db.prepare('SELECT * FROM users WHERE id = ?'),
  create: db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)'),
  updatePassword: db.prepare('UPDATE users SET password = ? WHERE id = ?'),
  delete: db.prepare('DELETE FROM users WHERE id = ?')
};

// Funciones para posiciones de trabajo
export const jobPositionQueries = {
  getAll: db.prepare('SELECT * FROM job_positions ORDER BY created_at DESC'),
  getActive: db.prepare('SELECT * FROM job_positions WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC'),
  getFeatured: db.prepare('SELECT * FROM job_positions WHERE is_active = 1 AND is_featured = 1 ORDER BY created_at DESC'),
  getById: db.prepare('SELECT * FROM job_positions WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO job_positions (
      title, description, department, location, employment_type,
      salary_min, salary_max, requirements, responsibilities,
      experience_min, is_active, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  update: db.prepare(`
    UPDATE job_positions SET 
      title = ?, description = ?, department = ?, location = ?, employment_type = ?,
      salary_min = ?, salary_max = ?, requirements = ?, responsibilities = ?,
      experience_min = ?, is_active = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  toggleActive: db.prepare('UPDATE job_positions SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  toggleFeatured: db.prepare('UPDATE job_positions SET is_featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  delete: db.prepare('DELETE FROM job_positions WHERE id = ?')
};

// Funciones para reclutamiento (actualizadas con relación a posiciones)
export const recruitmentQueries = {
  getAll: db.prepare(`
    SELECT r.*, jp.title as position_title 
    FROM recruitments r 
    LEFT JOIN job_positions jp ON r.position_id = jp.id 
    ORDER BY r.created_at DESC
  `),
  getByPosition: db.prepare(`
    SELECT r.*, jp.title as position_title 
    FROM recruitments r 
    LEFT JOIN job_positions jp ON r.position_id = jp.id 
    WHERE r.position_id = ? 
    ORDER BY r.created_at DESC
  `),
  getById: db.prepare('SELECT * FROM recruitments WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO recruitments (
      name, email, phone, position, experience, salary_expectation, 
      cv_path, cover_letter, position_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updateStatus: db.prepare('UPDATE recruitments SET status = ? WHERE id = ?'),
  delete: db.prepare('DELETE FROM recruitments WHERE id = ?')
};

  // Migración 6: Crear tabla notification_banners si no existe
  const bannerTableQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='notification_banners'");
  const bannerTable = bannerTableQuery.get();
  
  if (!bannerTable) {
    db.exec(`
      CREATE TABLE notification_banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        banner_type TEXT NOT NULL CHECK(banner_type IN ('system', 'news', 'event', 'promotion', 'warning')),
        image_url TEXT,
        action_url TEXT,
        action_text TEXT,
        is_active INTEGER DEFAULT 1,
        dismissible INTEGER DEFAULT 1,
        show_on_pages TEXT DEFAULT 'all' CHECK(show_on_pages IN ('all', 'home', 'specific')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla notification_banners creada exitosamente');
  }

// Funciones para hero slides
export const heroSlidesQueries = {
  getAll: db.prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at ASC'),
  getActive: db.prepare('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC'),
  getById: db.prepare('SELECT * FROM hero_slides WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO hero_slides (
      title, subtitle, description, background_image, button_text, button_link, 
      visual_type, is_active, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  update: db.prepare(`
    UPDATE hero_slides SET 
      title = ?, subtitle = ?, description = ?, background_image = ?, 
      button_text = ?, button_link = ?, visual_type = ?, is_active = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  toggleActive: db.prepare('UPDATE hero_slides SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  deactivateAll: db.prepare('UPDATE hero_slides SET is_active = 0, updated_at = CURRENT_TIMESTAMP'),
  delete: db.prepare('DELETE FROM hero_slides WHERE id = ?'),
  
  // Función para activar un slide específico y desactivar todos los demás
  activateOnly: (slideId) => {
    const transaction = db.transaction(() => {
      // Primero desactivar todos
      heroSlidesQueries.deactivateAll.run();
      // Luego activar solo el seleccionado
      heroSlidesQueries.toggleActive.run(1, slideId);
    });
    return transaction();
  }
};

// Funciones para testimonios
export const testimonialsQueries = {
  getAll: db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC'),
  getActive: db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC'),
  getFeatured: db.prepare('SELECT * FROM testimonials WHERE is_active = 1 AND is_featured = 1 ORDER BY created_at DESC'),
  getById: db.prepare('SELECT * FROM testimonials WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO testimonials (
      name, position, company, content, avatar_url, rating, is_active, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  update: db.prepare(`
    UPDATE testimonials SET 
      name = ?, position = ?, company = ?, content = ?, avatar_url = ?, 
      rating = ?, is_active = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  toggleActive: db.prepare('UPDATE testimonials SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  toggleFeatured: db.prepare('UPDATE testimonials SET is_featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  delete: db.prepare('DELETE FROM testimonials WHERE id = ?')
};

// Funciones para notification banners
export const notificationBannersQueries = {
  getAll: db.prepare('SELECT * FROM notification_banners ORDER BY created_at DESC'),
  getActive: db.prepare('SELECT * FROM notification_banners WHERE is_active = 1 ORDER BY created_at DESC'),
  getById: db.prepare('SELECT * FROM notification_banners WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO notification_banners (
      title, description, banner_type, image_url, action_url, action_text, is_active, dismissible, show_on_pages
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  update: db.prepare(`
    UPDATE notification_banners SET 
      title = ?, description = ?, banner_type = ?, image_url = ?, action_url = ?, action_text = ?, 
      is_active = ?, dismissible = ?, show_on_pages = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  toggleActive: db.prepare('UPDATE notification_banners SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  delete: db.prepare('DELETE FROM notification_banners WHERE id = ?')
};

// Funciones para newsletter subscriptions
export const newsletterQueries = {
  getAll: db.prepare('SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC'),
  getById: db.prepare('SELECT * FROM newsletter_subscriptions WHERE id = ?'),
  getByEmail: db.prepare('SELECT * FROM newsletter_subscriptions WHERE email = ?'),
  getActiveByType: db.prepare('SELECT * FROM newsletter_subscriptions WHERE type = ? AND status = \'active\''),
  subscribe: db.prepare(`
    INSERT OR REPLACE INTO newsletter_subscriptions (
      email, type, source, metadata, status, subscribed_at
    ) VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
  `),
  unsubscribe: db.prepare(`
    UPDATE newsletter_subscriptions SET 
      status = 'unsubscribed', 
      unsubscribed_at = CURRENT_TIMESTAMP 
    WHERE email = ?
  `),
  resubscribe: db.prepare(`
    UPDATE newsletter_subscriptions SET 
      status = 'active', 
      unsubscribed_at = NULL,
      subscribed_at = CURRENT_TIMESTAMP
    WHERE email = ?
  `),
  delete: db.prepare('DELETE FROM newsletter_subscriptions WHERE id = ?'),
  getStats: db.prepare(`
    SELECT 
      type,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
    FROM newsletter_subscriptions 
    GROUP BY type
  `)
};

// Función para obtener la instancia de la base de datos
export function getDatabase() {
  return db;
}

export default db;
