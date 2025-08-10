// TypeScript para el dashboard del admin

// Funciones utilitarias para elementos DOM
function getDashboardElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T;
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return element;
}

function getDashboardElementSafe<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// Verificar autenticación para dashboard
async function checkDashboardAuth(): Promise<boolean> {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    window.location.href = '/admin';
    return false;
  }
  
  try {
    // Verificar que el token sea válido haciendo una request a una API protegida
    const response = await fetch('/api/blog', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      window.location.href = '/admin';
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verificando auth:', error);
    window.location.href = '/admin';
    return false;
  }
}

// Cargar estadísticas
async function loadStats(): Promise<void> {
  const token = localStorage.getItem('auth-token');
  
  try {
    // Cargar blogs
    const blogsResponse = await fetch('/api/blog', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (blogsResponse.ok) {
      const blogs = await blogsResponse.json();
      const totalBlogsElement = getDashboardElementSafe('totalBlogs');
      if (totalBlogsElement) {
        totalBlogsElement.textContent = (blogs.length || 0).toString();
      }
    }
    
    // Cargar contactos
    const contactsResponse = await fetch('/api/contact', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (contactsResponse.ok) {
      const contacts = await contactsResponse.json();
      const totalContactsElement = getDashboardElementSafe('totalContacts');
      if (totalContactsElement) {
        totalContactsElement.textContent = (contacts.length || 0).toString();
      }
    }
    
    // Cargar hero slides
    const heroSlidesResponse = await fetch('/api/hero-slides', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (heroSlidesResponse.ok) {
      const heroSlides = await heroSlidesResponse.json();
      const activeSlides = heroSlides.filter((slide: any) => slide.is_active === 1);
      const totalHeroSlidesElement = getDashboardElementSafe('totalHeroSlides');
      if (totalHeroSlidesElement) {
        totalHeroSlidesElement.textContent = (activeSlides.length || 0).toString();
      }
    }

  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    
    // Mostrar valores por defecto en caso de error
    const totalBlogsElement = getDashboardElementSafe('totalBlogs');
    const totalContactsElement = getDashboardElementSafe('totalContacts');
    const totalHeroSlidesElement = getDashboardElementSafe('totalHeroSlides');
    
    if (totalBlogsElement) totalBlogsElement.textContent = '0';
    if (totalContactsElement) totalContactsElement.textContent = '0';
    if (totalHeroSlidesElement) totalHeroSlidesElement.textContent = '0';
  }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkDashboardAuth();
  
  if (isAuthenticated) {
    // Mostrar contenido y ocultar loading
    const loadingScreen = getDashboardElementSafe('loadingScreen');
    const adminContent = getDashboardElementSafe('adminContent');
    
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');
    
    // Cargar estadísticas
    await loadStats();
  }
});
