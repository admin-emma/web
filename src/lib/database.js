// src/lib/database.js
import db from './db/connection.js';
import { applySchema } from './db/schema.js';
import { ensureAdmin } from './db/seed-admin.js';

// 1) Crear tablas
applySchema(db);

// 2) Seeder user
ensureAdmin(db);

// 3) === QUERIES ===

// Blogs
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

// Contacts
export const contactQueries = {
  getAll: db.prepare('SELECT * FROM contacts ORDER BY created_at DESC'),
  getById: db.prepare('SELECT * FROM contacts WHERE id = ?'),
  create: db.prepare(`
    INSERT INTO contacts (name, email, phone, company, subject, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  updateStatus: db.prepare('UPDATE contacts SET status = ? WHERE id = ?'),
  delete: db.prepare('DELETE FROM contacts WHERE id = ?')
};

// Users
export const userQueries = {
  getAll: db.prepare('SELECT * FROM users ORDER BY username ASC'),
  getByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  getById: db.prepare('SELECT * FROM users WHERE id = ?'),
  create: db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)'),
  updatePassword: db.prepare('UPDATE users SET password = ? WHERE id = ?'),
  delete: db.prepare('DELETE FROM users WHERE id = ?')
};

// Job positions
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

// Recruitments
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

// Hero slides
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
  activateOnly: (slideId) => {
    const tx = db.transaction(() => {
      heroSlidesQueries.deactivateAll.run();
      heroSlidesQueries.toggleActive.run(1, slideId);
    });
    return tx();
  }
};

// Testimonials
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

// Notification banners
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
  delete: db.prepare('DELETE FROM notification_banners WHERE id = ?'),

  // NUEVO: helpers para garantizar exclusividad
  deactivateAll: db.prepare('UPDATE notification_banners SET is_active = 0, updated_at = CURRENT_TIMESTAMP'),
  activateOnlyTx: (id) => {
    const tx = db.transaction(() => {
      // Primero desactiva todos
      db.prepare('UPDATE notification_banners SET is_active = 0, updated_at = CURRENT_TIMESTAMP').run();
      // Activa solo el solicitado
      db.prepare('UPDATE notification_banners SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    });
    return tx();
  },
};

// Newsletter
export const newsletterQueries = {
  getAll: db.prepare('SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC'),
  getById: db.prepare('SELECT * FROM newsletter_subscriptions WHERE id = ?'),
  getByEmail: db.prepare('SELECT * FROM newsletter_subscriptions WHERE email = ?'),
  getActiveByType: db.prepare("SELECT * FROM newsletter_subscriptions WHERE type = ? AND status = 'active'"),
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

export function getDatabase() { return db; }
export default db;
