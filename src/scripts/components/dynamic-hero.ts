// TypeScript interfaces
interface HeroSlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  visual_type: 'dashboard' | 'analytics' | 'team' | 'growth' | 'innovation';
  background_image?: string;
  is_active: boolean;
  order_position: number;
}

interface DashboardMetric {
  label: string;
  value: string;
  trend: number;
  color: string;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  status: string;
}

// Datos de ejemplo para las visualizaciones
const dashboardMetrics: DashboardMetric[] = [
  { label: "Empleados Activos", value: "2,847", trend: 12, color: "text-blue-600" },
  { label: "Nuevas Contrataciones", value: "156", trend: 8, color: "text-green-600" },
  { label: "Retención", value: "94.2%", trend: 5, color: "text-purple-600" },
  { label: "Satisfacción", value: "4.8", trend: 3, color: "text-orange-600" }
];

const teamMembers: TeamMember[] = [
  { name: "Ana García", role: "HR Manager", avatar: "AG", status: "En línea" },
  { name: "Carlos López", role: "Recruiter", avatar: "CL", status: "Ocupado" },
  { name: "María Silva", role: "Analyst", avatar: "MS", status: "En línea" },
  { name: "David Chen", role: "Specialist", avatar: "DC", status: "Ausente" }
];

class HeroSliderManager {
  private currentSlide: number = 0;
  private slides: HeroSlideData[] = [];
  private autoplayInterval: number | null = null;
  private container: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    try {
      await this.loadSlides();
      this.setupDOM();
      this.startAutoplay();
      this.startAnimations();
    } catch (error) {
      console.error('Error initializing hero slider:', error);
    }
  }

  async loadSlides(): Promise<void> {
    try {
      const response = await fetch('/api/hero-slides');
      if (response.ok) {
        this.slides = await response.json();
      } else {
        console.error('Failed to load slides');
      }
    } catch (error) {
      console.error('Error loading slides:', error);
    }
  }

  setupDOM(): void {
    this.container = document.getElementById('hero-container');
    if (!this.container) return;

    this.renderSlide();
    this.setupNavigation();
  }

  renderSlide(): void {
    if (!this.container || this.slides.length === 0) return;

    const slide = this.slides[this.currentSlide];
    if (!slide) return;

    // Actualizar fondo de la sección
    this.updateBackground(slide);

    const contentHtml = `
      <div class="text-content opacity-0 translate-y-4 transition-all duration-700 ease-out">
        <h1 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          ${slide.title}
        </h1>
        <p class="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
          ${slide.subtitle}
        </p>
        <p class="text-lg text-gray-500 mb-8 leading-relaxed">
          ${slide.description}
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <button class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            Comenzar Demo
          </button>
          <button class="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
            Ver Características
          </button>
        </div>
      </div>
    `;

    const visualHtml = this.renderVisualization(slide.visual_type);

    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        ${contentHtml}
        ${visualHtml}
      </div>
    `;

    // Animar entrada
    setTimeout(() => {
      const textContent = this.container?.querySelector('.text-content') as HTMLElement;
      const visualization = this.container?.querySelector('.visualization') as HTMLElement;
      
      textContent?.classList.remove('opacity-0', 'translate-y-4');
      textContent?.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        visualization?.classList.remove('opacity-0', 'scale-95');
        visualization?.classList.add('opacity-100', 'scale-100');
      }, 200);
    }, 100);
  }

  updateBackground(slide: HeroSlideData): void {
    const heroSection = document.querySelector('section') as HTMLElement;
    if (!heroSection) return;

    const decorativeElements = heroSection.querySelector('.absolute.inset-0') as HTMLElement;
    
    if (slide.background_image && slide.background_image.trim() !== '') {
      // Si hay imagen de fondo, ocultamos los elementos decorativos y mostramos la imagen
      if (decorativeElements) {
        decorativeElements.style.display = 'none';
      }
      
      heroSection.style.backgroundImage = `url('${slide.background_image}')`;
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
      heroSection.style.backgroundRepeat = 'no-repeat';
      
      // Agregar overlay para mejor legibilidad del texto
      if (!heroSection.querySelector('.bg-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'bg-overlay absolute inset-0 bg-black/20';
        heroSection.appendChild(overlay);
      }
    } else {
      // Si no hay imagen, mostramos los elementos decorativos
      if (decorativeElements) {
        decorativeElements.style.display = 'block';
      }
      
      heroSection.style.backgroundImage = '';
      heroSection.style.backgroundSize = '';
      heroSection.style.backgroundPosition = '';
      heroSection.style.backgroundRepeat = '';
      
      // Remover overlay si existe
      const overlay = heroSection.querySelector('.bg-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  }

  renderVisualization(type: string): string {
    const baseClasses = "visualization opacity-0 scale-95 transition-all duration-700 ease-out";
    
    switch (type) {
      case 'dashboard':
        return `
          <div class="${baseClasses}">
            <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div class="grid grid-cols-2 gap-4">
                ${dashboardMetrics.map(metric => `
                  <div class="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div class="text-sm text-gray-600 mb-1">${metric.label}</div>
                    <div class="text-2xl font-bold ${metric.color} mb-1">${metric.value}</div>
                    <div class="flex items-center text-xs">
                      <span class="text-green-500">↗ ${metric.trend}%</span>
                      <span class="text-gray-400 ml-1">vs mes anterior</span>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="mt-6">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Rendimiento General</span>
                  <span>87%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse" style="width: 87%"></div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'analytics':
        return `
          <div class="${baseClasses}">
            <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Analytics Overview</h3>
                <div class="flex gap-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-100"></div>
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Productividad</span>
                    <span class="text-sm font-semibold text-blue-600">92%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full animate-pulse" style="width: 92%"></div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Engagement</span>
                    <span class="text-sm font-semibold text-green-600">85%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full animate-pulse" style="width: 85%"></div>
                  </div>
                </div>
                <div class="flex items-center justify-center">
                  <div class="relative w-24 h-24">
                    <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-lg font-bold text-blue-600">80%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'team':
        return `
          <div class="${baseClasses}">
            <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Equipo Activo</h3>
                <span class="text-sm text-green-600 font-medium">4 en línea</span>
              </div>
              <div class="space-y-3">
                ${teamMembers.map((member, index) => `
                  <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors animate-pulse" style="animation-delay: ${index * 0.1}s">
                    <div class="relative">
                      <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        ${member.avatar}
                      </div>
                      <div class="absolute -bottom-1 -right-1 w-4 h-4 ${member.status === 'En línea' ? 'bg-green-500' : member.status === 'Ocupado' ? 'bg-yellow-500' : 'bg-gray-400'} rounded-full border-2 border-white"></div>
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium text-gray-800">${member.name}</div>
                      <div class="text-xs text-gray-500">${member.role}</div>
                    </div>
                    <div class="text-xs text-gray-400">${member.status}</div>
                  </div>
                `).join('')}
              </div>
              <div class="mt-4 pt-4 border-t border-gray-100">
                <div class="text-xs text-gray-500 text-center">Colaboración en tiempo real</div>
              </div>
            </div>
          </div>
        `;

      case 'growth':
        return `
          <div class="${baseClasses}">
            <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Crecimiento Empresarial</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Ingresos</span>
                  <span class="text-sm font-semibold text-green-600">+32%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full animate-pulse" style="width: 78%"></div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Productividad</span>
                  <span class="text-sm font-semibold text-blue-600">+28%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full animate-pulse" style="width: 68%"></div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Satisfacción</span>
                  <span class="text-sm font-semibold text-purple-600">+25%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full animate-pulse" style="width: 85%"></div>
                </div>
              </div>
              
              <div class="mt-6 grid grid-cols-3 gap-3 text-center">
                <div class="p-3 bg-green-50 rounded-lg">
                  <div class="text-lg font-bold text-green-600">156</div>
                  <div class="text-xs text-gray-600">Nuevos empleados</div>
                </div>
                <div class="p-3 bg-blue-50 rounded-lg">
                  <div class="text-lg font-bold text-blue-600">2.8K</div>
                  <div class="text-xs text-gray-600">Total empleados</div>
                </div>
                <div class="p-3 bg-purple-50 rounded-lg">
                  <div class="text-lg font-bold text-purple-600">94%</div>
                  <div class="text-xs text-gray-600">Retención</div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'innovation':
        return `
          <div class="${baseClasses}">
            <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Stack Tecnológico</h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-blue-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg mb-2 flex items-center justify-center">
                    <span class="text-white text-sm font-bold">AI</span>
                  </div>
                  <div class="text-sm font-medium text-gray-800">Inteligencia Artificial</div>
                  <div class="text-xs text-gray-500">Machine Learning</div>
                </div>
                
                <div class="p-3 bg-green-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div class="w-8 h-8 bg-green-500 rounded-lg mb-2 flex items-center justify-center">
                    <span class="text-white text-sm font-bold">☁</span>
                  </div>
                  <div class="text-sm font-medium text-gray-800">Cloud Computing</div>
                  <div class="text-xs text-gray-500">AWS/Azure</div>
                </div>
                
                <div class="p-3 bg-purple-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div class="w-8 h-8 bg-purple-500 rounded-lg mb-2 flex items-center justify-center">
                    <span class="text-white text-sm font-bold">📊</span>
                  </div>
                  <div class="text-sm font-medium text-gray-800">Analytics</div>
                  <div class="text-xs text-gray-500">Big Data</div>
                </div>
                
                <div class="p-3 bg-orange-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div class="w-8 h-8 bg-orange-500 rounded-lg mb-2 flex items-center justify-center">
                    <span class="text-white text-sm font-bold">🔒</span>
                  </div>
                  <div class="text-sm font-medium text-gray-800">Security</div>
                  <div class="text-xs text-gray-500">Enterprise</div>
                </div>
              </div>
              
              <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Uptime</span>
                  <span class="text-green-600 font-semibold">99.9%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div class="bg-green-500 h-2 rounded-full animate-pulse" style="width: 99.9%"></div>
                </div>
              </div>
            </div>
          </div>
        `;

      default:
        return `<div class="${baseClasses}">
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">Visualización no disponible</h3>
          </div>
        </div>`;
    }
  }

  setupNavigation(): void {
    if (this.slides.length <= 1) return;

    // Crear indicadores de navegación
    const indicators = document.createElement('div');
    indicators.className = 'absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2';
    
    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${
        index === this.currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
      }`;
      dot.addEventListener('click', () => this.goToSlide(index));
      indicators.appendChild(dot);
    });

    this.container?.appendChild(indicators);
  }

  goToSlide(index: number): void {
    if (index < 0 || index >= this.slides.length) return;
    this.currentSlide = index;
    this.renderSlide();
    this.updateIndicators();
  }

  updateIndicators(): void {
    const indicators = this.container?.querySelectorAll('button');
    indicators?.forEach((dot, index) => {
      dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${
        index === this.currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
      }`;
    });
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.renderSlide();
    this.updateIndicators();
  }

  startAutoplay(): void {
    if (this.slides.length <= 1) return;
    
    this.autoplayInterval = window.setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  startAnimations(): void {
    // Las animaciones ahora son puramente CSS con Tailwind
    console.log('Animaciones CSS iniciadas');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new HeroSliderManager();
});
