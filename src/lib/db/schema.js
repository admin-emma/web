// src/lib/db/schema.js
export function applySchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;

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

    CREATE TABLE IF NOT EXISTS job_positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      department TEXT,
      location TEXT DEFAULT 'Remoto',
      employment_type TEXT DEFAULT 'Tiempo completo',
      salary_min INTEGER,
      salary_max INTEGER,
      requirements TEXT,        -- JSON string
      responsibilities TEXT,    -- JSON string
      experience_min INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      is_featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      type TEXT DEFAULT 'general',      -- 'general', 'career', 'blog'
      status TEXT DEFAULT 'active',     -- 'active', 'unsubscribed'
      source TEXT,
      metadata TEXT,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      background_image TEXT,
      button_text TEXT DEFAULT 'Conoce más',
      button_link TEXT DEFAULT '/about',
      visual_type TEXT DEFAULT 'dashboard' CHECK(visual_type IN ('dashboard','analytics','team','growth','innovation')),
      is_active BOOLEAN DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS testimonials (
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
    );

    CREATE TABLE IF NOT EXISTS notification_banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      banner_type TEXT NOT NULL CHECK(banner_type IN ('system','news','event','promotion','warning')),
      image_url TEXT,
      action_url TEXT,
      action_text TEXT,
      is_active INTEGER DEFAULT 1,
      dismissible INTEGER DEFAULT 1,
      show_on_pages TEXT DEFAULT 'all' CHECK(show_on_pages IN ('all','home','specific')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
