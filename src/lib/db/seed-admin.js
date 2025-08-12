// src/lib/db/seed-admin.js
import bcrypt from 'bcryptjs';

export function ensureAdmin(db) {
  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASS || 'admin123';

  const exists = db.prepare('SELECT COUNT(*) AS c FROM users WHERE username = ?').get(user);
  if (exists.c === 0) {
    const hash = bcrypt.hashSync(pass, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(user, hash, 'admin');
    console.log(`✅ Admin creado: ${user}`);
  }
}
