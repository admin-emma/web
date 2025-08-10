-- EMMA Platform - Seed Data SQL
-- Este archivo contiene datos iniciales para la plataforma EMMA

-- Crear usuario administrador por defecto
-- IMPORTANTE: El hash debe ser generado en el servidor con la contraseña real
INSERT OR IGNORE INTO users (id, username, email, password_hash, role, created_at) VALUES 
(1, 'admin', 'admin@emma.pe', 'REPLACE_WITH_REAL_HASH', 'admin', datetime('now'));

-- Datos de ejemplo para posiciones de trabajo
INSERT OR IGNORE INTO job_positions (
    title, description, department, location, employment_type, 
    salary_min, salary_max, requirements, responsibilities, 
    experience_min, is_active, is_featured, created_at
) VALUES 
-- Especialista en RRHH
('Especialista en Recursos Humanos', 
 'Únete a nuestro equipo como Especialista en RRHH y ayuda a transformar la gestión del talento en empresas peruanas. Trabajarás con tecnología de vanguardia y metodologías innovadoras.', 
 'Recursos Humanos', 'Lima, Perú', 'Tiempo Completo', 
 3500, 5500, 
 'Licenciatura en Psicología, Administración o afines. Mínimo 2 años de experiencia en RRHH. Conocimiento en legislación laboral peruana. Manejo de Office avanzado.',
 'Gestión de procesos de selección y reclutamiento, administración de personal, elaboración de nómina, desarrollo de políticas de RRHH, y capacitación del personal.', 
 2, 1, 1, datetime('now')),

-- Analista de People Analytics
('Analista de People Analytics', 
 'Posición estratégica para liderar la transformación digital de RRHH mediante análisis de datos y métricas de talento. Formarás parte de un equipo innovador en el sector.', 
 'Analytics', 'Lima, Perú', 'Tiempo Completo', 
 4000, 7000, 
 'Licenciatura en Ingeniería, Estadística, Matemáticas o afines. Experiencia en análisis de datos. Dominio de Excel avanzado, SQL deseable. Power BI o Tableau es un plus.',
 'Análisis de métricas de RRHH, creación de dashboards ejecutivos, reporting de KPIs, optimización de procesos basada en datos, y presentaciones a gerencia.', 
 3, 1, 1, datetime('now')),

-- Consultor en Transformación Digital
('Consultor en Transformación Digital RRHH', 
 'Lidera proyectos de digitalización en empresas clientes, implementando soluciones tecnológicas innovadoras que transforman la gestión del talento humano.', 
 'Consultoría', 'Lima, Perú', 'Tiempo Completo', 
 5000, 8500, 
 'Experiencia en consultoría o implementación de sistemas HRIS/HCM. Conocimiento en gestión de proyectos (PMP deseable). Inglés intermedio-avanzado. Capacidad de liderazgo.',
 'Diseño e implementación de soluciones digitales, capacitación a equipos cliente, seguimiento post-implementación, y desarrollo de propuestas comerciales.', 
 4, 1, 0, datetime('now'));

-- Testimonios de ejemplo
INSERT OR IGNORE INTO testimonials (
    name, position, company, content, image_url, is_active, created_at
) VALUES 
('María González', 'Gerente de RRHH', 'TechCorp SAC', 
 'EMMA transformó completamente nuestros procesos de RRHH. La digitalización nos permitió reducir tiempos operativos en 60% y mejorar significativamente la experiencia del empleado.', 
 '', 1, datetime('now')),

('Carlos Mendoza', 'Director de Talento', 'Innovate Peru', 
 'La plataforma de analytics de EMMA nos dio insights que nunca habíamos tenido sobre nuestro talento. Ahora tomamos decisiones estratégicas basadas en datos reales.', 
 '', 1, datetime('now')),

('Ana Rodríguez', 'CEO', 'StartupLima', 
 'Como startup en crecimiento, necesitábamos profesionalizar nuestro RRHH rápidamente. EMMA nos acompañó en todo el proceso con soluciones escalables y efectivas.', 
 '', 1, datetime('now'));

-- Hero slides para la página principal
INSERT OR IGNORE INTO hero_slides (
    title, subtitle, cta_text, cta_url, background_image, is_active, sort_order, created_at
) VALUES 
('Transforma tu Gestión de RRHH', 
 'Digitaliza y optimiza todos tus procesos de recursos humanos con tecnología de vanguardia diseñada para el mercado peruano', 
 'Conoce Nuestros Servicios', '/about', 
 '', 1, 1, datetime('now')),

('People Analytics Avanzado', 
 'Toma decisiones estratégicas basadas en datos con nuestras herramientas de análisis de talento y métricas de rendimiento', 
 'Descubre Analytics', '/contact', 
 '', 1, 2, datetime('now')),

('Únete a Nuestro Equipo', 
 'Forma parte de la revolución digital en RRHH. Descubre oportunidades de carrera profesional en EMMA', 
 'Ver Posiciones', '/careers', 
 '', 1, 3, datetime('now'));

-- Banner de notificación inicial
INSERT OR IGNORE INTO notification_banners (
    message, type, is_active, created_at
) VALUES 
('🚀 ¡Bienvenido a EMMA! Plataforma líder en transformación digital de RRHH en Perú', 
 'success', 1, datetime('now'));
