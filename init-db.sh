#!/bin/bash

# Script para inicializar la base de datos con datos semilla
# Este script se ejecuta en el contenedor Docker para PRODUCCIÓN

echo "🌱 Inicializando base de datos EMMA con seed data..."

# En producción, siempre empezamos desde cero
# Eliminar base de datos existente si existe
if [ -f "/app/database.sqlite" ]; then
    echo "🗑️  Eliminando base de datos existente para empezar desde cero..."
    rm -f /app/database.sqlite
fi

echo "📝 Creando estructura de base de datos desde cero..."

# Crear la estructura de la base de datos
sqlite3 /app/database.sqlite << 'EOF'
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de posiciones de trabajo
CREATE TABLE IF NOT EXISTS job_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    department TEXT,
    location TEXT,
    employment_type TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    requirements TEXT,
    responsibilities TEXT,
    experience_min INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    is_featured BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de testimonios
CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT,
    company TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de hero slides
CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT,
    cta_url TEXT,
    background_image TEXT,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de suscripciones al newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME NULL
);

-- Tabla de envíos de contacto
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL
);

-- Tabla de aplicaciones de reclutamiento
CREATE TABLE IF NOT EXISTS recruitment_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_position_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    cv_filename TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME NULL,
    FOREIGN KEY (job_position_id) REFERENCES job_positions (id)
);

-- Tabla de banners de notificación
CREATE TABLE IF NOT EXISTS notification_banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL
);
EOF

echo "📊 Aplicando seed data..."

# Aplicar el seed data
if [ -f "/app/seed-data.sql" ]; then
    sqlite3 /app/database.sqlite < /app/seed-data.sql
    echo "✅ Seed data aplicado correctamente"
else
    echo "⚠️  Archivo seed-data.sql no encontrado, continuando sin datos de ejemplo"
fi

# Establecer permisos correctos
chmod 664 /app/database.sqlite
chown astro:nodejs /app/database.sqlite

echo "🎉 Base de datos EMMA inicializada correctamente"

# Mostrar estadísticas
echo "📈 Estadísticas de la base de datos:"
echo "   👥 Usuarios: $(sqlite3 /app/database.sqlite 'SELECT COUNT(*) FROM users;')"
echo "   💼 Posiciones: $(sqlite3 /app/database.sqlite 'SELECT COUNT(*) FROM job_positions;')"
echo "   💬 Testimonios: $(sqlite3 /app/database.sqlite 'SELECT COUNT(*) FROM testimonials;')"
echo "   🎯 Hero Slides: $(sqlite3 /app/database.sqlite 'SELECT COUNT(*) FROM hero_slides;')"
