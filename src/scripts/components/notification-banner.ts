// TypeScript interfaces
interface NotificationBanner {
  id: number;
  title: string;
  description?: string;
  banner_type: 'system' | 'news' | 'event' | 'promotion' | 'warning';
  image_url?: string;
  action_url?: string;
  action_text?: string;
  is_active: boolean;
  dismissible: boolean;
  show_on_pages: string; // 'all', 'home', 'specific'
}

interface TypeStyles {
  bg: string;
  text: string;
  subtext: string;
  button: string;
  closeButton: string;
  iconBg: string;
  icon: string;
}

class NotificationBannerManager {
  private container: HTMLElement | null = null;
  private dismissedBanners: number[] = [];

  constructor() {
    this.dismissedBanners = this.getDismissedBanners();
    this.init();
  }

  async init(): Promise<void> {
    this.container = document.getElementById('notification-banner-container');
    if (!this.container) return;

    try {
      await this.loadAndShowBanners();
    } catch (error) {
      console.error('Error initializing notification banners:', error);
    }
  }

  async loadAndShowBanners(): Promise<void> {
    try {
      const response = await fetch('/api/notification-banner');
      if (!response.ok) return;

      const banners: NotificationBanner[] = await response.json();
      const currentPage = this.getCurrentPage();
      
      banners.forEach(banner => {
        if (this.shouldShowBanner(banner, currentPage)) {
          this.showBanner(banner);
        }
      });
    } catch (error) {
      console.error('Error loading notification banners:', error);
    }
  }

  shouldShowBanner(banner: NotificationBanner, currentPage: string): boolean {
    if (!banner.is_active) return false;
    if (banner.dismissible && this.dismissedBanners.includes(banner.id)) return false;
    
    // Verificar en qué páginas mostrar
    switch (banner.show_on_pages) {
      case 'all':
        return true;
      case 'home':
        return currentPage === '/' || currentPage === '/index.html';
      case 'specific':
        // Aquí podrías implementar lógica más específica
        return true;
      default:
        return true;
    }
  }

  getCurrentPage(): string {
    return window.location.pathname;
  }

  showBanner(banner: NotificationBanner): void {
    if (!this.container) return;

    const bannerElement = this.createBannerElement(banner);
    this.container.appendChild(bannerElement);

    // Animar entrada
    setTimeout(() => {
      bannerElement.classList.remove('-translate-y-full');
      bannerElement.classList.add('translate-y-0');
    }, 100);
  }

  createBannerElement(banner: NotificationBanner): HTMLDivElement {
    const bannerDiv = document.createElement('div');
    bannerDiv.className = `fixed top-0 left-0 right-0 z-50 transform -translate-y-full transition-transform duration-500 ease-out ${this.getTypeStyles(banner.banner_type).bg} shadow-md`;
    bannerDiv.dataset.bannerId = banner.id.toString();

    const typeStyles = this.getTypeStyles(banner.banner_type);
    
    bannerDiv.innerHTML = `
      <div class="container mx-auto px-4 py-2.5">
        <div class="flex items-center justify-between">
          <!-- Contenido del banner -->
          <div class="flex items-center space-x-3 flex-1">
            ${banner.image_url ? `
              <div class="flex-shrink-0">
                <img src="${banner.image_url}" alt="${banner.title}" class="w-8 h-8 object-cover rounded-md shadow-sm">
              </div>
            ` : `
              <div class="flex-shrink-0">
                <div class="w-6 h-6 rounded-full ${typeStyles.iconBg} flex items-center justify-center text-xs">
                  <span>${typeStyles.icon}</span>
                </div>
              </div>
            `}
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h3 class="text-sm font-medium ${typeStyles.text} truncate">
                  ${banner.title}
                </h3>
                ${banner.description ? `
                  <span class="hidden sm:inline text-xs ${typeStyles.subtext} truncate">
                    • ${banner.description}
                  </span>
                ` : ''}
              </div>
            </div>

            ${banner.action_url && banner.action_text ? `
              <div class="flex-shrink-0 hidden sm:block">
                <a 
                  href="${banner.action_url}" 
                  class="inline-flex items-center px-3 py-1 ${typeStyles.button} text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  ${banner.action_text}
                  <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            ` : ''}
          </div>

          <!-- Botón cerrar (solo si es dismissible) -->
          ${banner.dismissible ? `
            <button 
              class="ml-3 flex-shrink-0 ${typeStyles.closeButton} p-1 rounded-md hover:bg-black/10 transition-colors"
              onclick="bannerManager.dismissBanner(${banner.id})"
              title="Cerrar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    return bannerDiv;
  }

  getTypeStyles(type: string): TypeStyles {
    switch (type) {
      case 'system':
        return {
          bg: 'bg-blue-600',
          text: 'text-white',
          subtext: 'text-blue-100',
          button: 'bg-white text-blue-600 hover:bg-blue-50',
          closeButton: 'text-white hover:text-blue-100',
          iconBg: 'bg-blue-700',
          icon: '🔧'
        };
      case 'news':
        return {
          bg: 'bg-green-600',
          text: 'text-white',
          subtext: 'text-green-100',
          button: 'bg-white text-green-600 hover:bg-green-50',
          closeButton: 'text-white hover:text-green-100',
          iconBg: 'bg-green-700',
          icon: '📰'
        };
      case 'event':
        return {
          bg: 'bg-purple-600',
          text: 'text-white',
          subtext: 'text-purple-100',
          button: 'bg-white text-purple-600 hover:bg-purple-50',
          closeButton: 'text-white hover:text-purple-100',
          iconBg: 'bg-purple-700',
          icon: '🎉'
        };
      case 'promotion':
        return {
          bg: 'bg-orange-600',
          text: 'text-white',
          subtext: 'text-orange-100',
          button: 'bg-white text-orange-600 hover:bg-orange-50',
          closeButton: 'text-white hover:text-orange-100',
          iconBg: 'bg-orange-700',
          icon: '🎁'
        };
      case 'warning':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          subtext: 'text-red-100',
          button: 'bg-white text-red-600 hover:bg-red-50',
          closeButton: 'text-white hover:text-red-100',
          iconBg: 'bg-red-700',
          icon: '⚠️'
        };
      default:
        return {
          bg: 'bg-gray-600',
          text: 'text-white',
          subtext: 'text-gray-100',
          button: 'bg-white text-gray-600 hover:bg-gray-50',
          closeButton: 'text-white hover:text-gray-100',
          iconBg: 'bg-gray-700',
          icon: 'ℹ️'
        };
    }
  }

  dismissBanner(bannerId: number): void {
    const bannerElement = document.querySelector(`[data-banner-id="${bannerId}"]`) as HTMLElement;
    if (bannerElement) {
      bannerElement.classList.remove('translate-y-0');
      bannerElement.classList.add('-translate-y-full');
      
      setTimeout(() => {
        bannerElement.remove();
        this.adjustPagePadding();
      }, 500);
    }

    // Guardar en localStorage
    this.markAsDismissed(bannerId);
  }

  private getDismissedBanners(): number[] {
    try {
      const dismissed = localStorage.getItem('emma_dismissed_banners');
      return dismissed ? JSON.parse(dismissed) : [];
    } catch {
      return [];
    }
  }

  private markAsDismissed(bannerId: number): void {
    const dismissed = this.getDismissedBanners();
    if (!dismissed.includes(bannerId)) {
      dismissed.push(bannerId);
      try {
        localStorage.setItem('emma_dismissed_banners', JSON.stringify(dismissed));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  private adjustPagePadding(): void {
    if (!this.container) return;

    // Ajustar el padding del body cuando no hay banners
    const remainingBanners = this.container.children.length;
    const body = document.body;
    
    if (remainingBanners === 0) {
      body.style.paddingTop = '0';
    }
  }
}

// Función para ajustar el padding del body cuando hay banners
function adjustBodyPadding(): void {
  const banners = document.querySelectorAll('[data-banner-id]') as NodeListOf<HTMLElement>;
  const totalHeight = Array.from(banners).reduce((height, banner) => {
    return height + banner.offsetHeight;
  }, 0);
  
  document.body.style.paddingTop = totalHeight + 'px';
}

// Inicializar cuando el DOM esté listo
let bannerManager: NotificationBannerManager;
document.addEventListener('DOMContentLoaded', () => {
  bannerManager = new NotificationBannerManager();
  // Exponer globalmente para onclick handlers
  (window as any).bannerManager = bannerManager;
  
  // Ajustar padding después de cargar
  setTimeout(adjustBodyPadding, 600);
});
