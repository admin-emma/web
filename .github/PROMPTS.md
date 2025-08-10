# Prompts Reutilizables - EMMA HR Project

## 🎯 Prompts para Creación de Componentes

### Nuevo Componente Admin
```
Crea un componente admin para [FEATURE] siguiendo los patrones establecidos:
1. Página .astro con stats cards, tabla responsive, modal CRUD
2. API con GET, POST, PUT, DELETE endpoints
3. JavaScript para manejo de estado y eventos
4. Solo clases Tailwind CSS, sin CSS personalizado
5. TypeScript interfaces y JSDoc comments
6. Manejo de errores y estados de carga
7. Responsive design mobile-first
8. Validación de inputs y seguridad
```

### Nuevo Componente Frontend
```
Crea un componente frontend para [FEATURE] que:
1. Use el patrón Astro establecido (frontmatter → HTML → script)
2. Tenga TypeScript interfaces apropiadas
3. Use solo clases Tailwind CSS
4. Sea responsive (mobile-first)
5. Maneje errores gracefully
6. Tenga datos de fallback/default
7. Siga el design system de EMMA
```

### Nueva API Endpoint
```
Crea una API endpoint para [FEATURE] con:
1. Ruta: /api/[feature]/index.js
2. Métodos: GET, POST, PUT, DELETE
3. Validación de inputs requeridos
4. Manejo de errores consistente
5. Respuestas JSON estructuradas
6. Uso de prepared statements
7. Códigos de estado HTTP apropiados
```

## 🛠️ Prompts para Debugging

### Análisis de Errores
```
Analiza este error y proporciona:
1. Causa raíz del problema
2. Solución paso a paso
3. Código corregido
4. Prevención de errores similares
5. Testing para validar la solución

Error: [PEGAR ERROR AQUÍ]
```

### Optimización de Rendimiento
```
Optimiza este código para:
1. Mejor rendimiento de base de datos
2. Menor uso de memoria
3. Carga más rápida
4. Mejor UX (estados de carga)
5. Mantener funcionalidad actual

Código: [PEGAR CÓDIGO AQUÍ]
```

### Refactoring de Código
```
Refactoriza este código siguiendo los patrones de EMMA:
1. Separar HTML de JavaScript
2. Usar solo Tailwind CSS
3. Agregar TypeScript typing
4. Mejorar manejo de errores
5. Hacer responsive
6. Optimizar performance

Código actual: [PEGAR CÓDIGO AQUÍ]
```

## 🎨 Prompts para Diseño y UX

### Mejora de Interfaz
```
Mejora esta interfaz siguiendo el design system de EMMA:
1. Colores: azul (primary), verde (success), rojo (error)
2. Espaciado consistente con Tailwind
3. Typography profesional
4. Icons apropiados (Heroicons)
5. Estados hover/focus
6. Responsive design
7. Accesibilidad

Interfaz actual: [DESCRIPCIÓN]
```

### Componente Responsive
```
Convierte este componente a responsive siguiendo:
1. Mobile-first approach
2. Breakpoints: sm(640px), md(768px), lg(1024px)
3. Grid adaptativos
4. Typography escalable
5. Navegación mobile-friendly
6. Touch-friendly buttons

Componente: [PEGAR CÓDIGO AQUÍ]
```

## 🗄️ Prompts para Base de Datos

### Nueva Tabla
```
Crea una tabla para [FEATURE] con:
1. Estructura SQL con constraints apropiados
2. Migración en database.js
3. Queries preparadas para CRUD
4. Índices para performance
5. Relaciones con otras tablas si aplica
6. Datos de ejemplo para testing

Requisitos: [DESCRIBIR CAMPOS NECESARIOS]
```

### Optimización de Queries
```
Optimiza estas queries SQL para:
1. Mejor performance
2. Uso de índices apropiados
3. Reducir N+1 queries
4. Paginación eficiente
5. Filtros optimizados

Queries actuales: [PEGAR QUERIES AQUÍ]
```

## 🔧 Prompts para Funcionalidades Específicas

### Sistema de Notificaciones
```
Implementa un sistema de notificaciones que:
1. Use banners discretos (no popups molestos)
2. Diferentes tipos: sistema, noticia, evento, promoción
3. Posiciones configurables
4. Se pueda cerrar (dismissible)
5. Control desde admin panel
6. Responsive y profesional
```

### Upload de Archivos
```
Crea un sistema de upload para [TIPO_ARCHIVO] que:
1. Valide tipos de archivo permitidos
2. Limite tamaño de archivos
3. Genere nombres únicos
4. Guarde metadata en BD
5. Muestre preview si es imagen
6. Tenga barra de progreso
7. Maneje errores gracefully
```

### Filtros y Búsqueda
```
Implementa filtros de búsqueda para [FEATURE] con:
1. Búsqueda en tiempo real (debounced)
2. Filtros por categoría/estado
3. Ordenamiento por columnas
4. Paginación eficiente
5. URL state persistence
6. Loading states
7. Sin resultados state
```

## 📱 Prompts para Responsive Design

### Mobile Optimization
```
Optimiza esta página para mobile:
1. Navegación hamburger si es necesario
2. Tablas → cards en mobile
3. Formularios touch-friendly
4. Buttons con tamaño mínimo 44px
5. Spacing apropiado para touch
6. Typography legible en pantallas pequeñas

Página actual: [DESCRIBIR/PEGAR CÓDIGO]
```

### Progressive Enhancement
```
Implementa progressive enhancement para:
1. Funcionalidad básica sin JavaScript
2. Mejoras con JavaScript habilitado
3. Graceful degradation
4. Fallbacks apropiados
5. Error states informativos

Feature: [DESCRIBIR FUNCIONALIDAD]
```

## 🧪 Prompts para Testing

### Test Cases
```
Genera test cases para [FEATURE]:
1. Happy path scenarios
2. Edge cases y límites
3. Error handling
4. Validación de inputs
5. Performance bajo carga
6. Responsive behavior
7. Accesibilidad

Feature: [DESCRIBIR FUNCIONALIDAD]
```

### Manual Testing Script
```
Crea un script de testing manual para:
1. Flujo completo de usuario
2. Todos los estados posibles
3. Error scenarios
4. Cross-browser testing
5. Mobile testing
6. Performance checkpoints

Feature: [DESCRIBIR FUNCIONALIDAD]
```

## 🚀 Prompts para Deployment

### Production Checklist
```
Genera checklist pre-deployment para:
1. Optimización de assets
2. Minificación de código
3. Compresión de imágenes
4. Database migrations
5. Environment variables
6. Error monitoring
7. Performance metrics
8. Security checks
```

### Environment Setup
```
Configura el entorno para [ENVIRONMENT] con:
1. Variables de entorno apropiadas
2. Database connection
3. SSL/TLS configuration
4. Logging setup
5. Error reporting
6. Performance monitoring
7. Backup strategy
```

## 📊 Prompts para Analytics

### Performance Monitoring
```
Implementa monitoreo de performance para:
1. Page load times
2. Database query performance
3. API response times
4. Error rates
5. User interactions
6. Resource usage
7. Core Web Vitals

Dashboard: [ESPECIFICAR MÉTRICAS]
```

### User Analytics
```
Implementa analytics de usuario para:
1. Page views y navigation
2. Feature usage
3. Conversion funnels
4. Error tracking
5. Performance impact
6. Privacy-compliant tracking

Sin usar cookies de terceros.
```

## 🔒 Prompts para Seguridad

### Security Audit
```
Realiza audit de seguridad para:
1. Input validation
2. SQL injection prevention
3. XSS protection
4. CSRF tokens si es necesario
5. File upload security
6. Authentication/authorization
7. Data encryption
8. Rate limiting

Código/Feature: [ESPECIFICAR]
```

### Security Implementation
```
Implementa medidas de seguridad para:
1. Sanitización de inputs
2. Prepared statements
3. Error handling sin exposición
4. Validación server-side
5. Content Security Policy
6. Secure headers

Feature: [DESCRIBIR]
```

---

## 🎯 Comandos Frecuentes para Copilot

### Auto-completar Componente
`// Create admin component for [feature] following EMMA patterns`

### Generar API
`// Generate REST API for [resource] with CRUD operations`

### Responsive Layout
`// Make this layout responsive following mobile-first approach`

### Error Handling
`// Add comprehensive error handling with user-friendly messages`

### TypeScript Types
`// Add TypeScript interfaces and JSDoc comments`

### Database Operations
`// Create database operations with prepared statements`

### Form Validation
`// Add client and server-side validation`

### Loading States
`// Implement loading states and animations`

---

## 💡 Tips para Usar Estos Prompts

1. **Customiza**: Reemplaza [FEATURE], [TIPO_ARCHIVO], etc. con tus necesidades específicas
2. **Combina**: Usa múltiples prompts para features complejas
3. **Itera**: Refina los prompts basado en resultados
4. **Contexto**: Proporciona código existente cuando sea relevante
5. **Específico**: Mientras más específico, mejor el resultado
6. **Patterns**: Siempre menciona seguir los patrones de EMMA establecidos
