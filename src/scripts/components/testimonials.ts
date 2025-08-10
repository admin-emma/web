import type { TestimonialData } from '../../types/testimonial';

interface TestimonialsManager {
  initializeTestimonials(): void;
  loadMoreTestimonials(): Promise<void>;
  displayTestimonials(testimonials: TestimonialData[]): void;
}

class TestimonialsController implements TestimonialsManager {
  private container: HTMLElement | null = null;
  private loadMoreButton: HTMLButtonElement | null = null;
  private currentPage: number = 1;
  private isLoading: boolean = false;

  constructor() {
    this.initializeTestimonials();
  }

  initializeTestimonials(): void {
    this.container = document.querySelector('#testimonials-container');
    this.loadMoreButton = document.querySelector('#load-more-button') as HTMLButtonElement;
    
    if (this.loadMoreButton) {
      this.loadMoreButton.addEventListener('click', () => this.loadMoreTestimonials());
    }

    // Initialize animations
    this.setupAnimations();
  }

  private setupAnimations(): void {
    const cards = document.querySelectorAll('.testimonial-card');
    
    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
  }

  async loadMoreTestimonials(): Promise<void> {
    if (this.isLoading || !this.loadMoreButton) return;

    this.isLoading = true;
    this.loadMoreButton.disabled = true;
    this.loadMoreButton.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Cargando...
    `;

    try {
      this.currentPage++;
      const response = await fetch(`/api/testimonials?page=${this.currentPage}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar testimonios');
      }

      const data = await response.json();
      
      if (data.testimonials && data.testimonials.length > 0) {
        this.displayTestimonials(data.testimonials);
        
        // Hide load more button if no more testimonials
        if (data.testimonials.length < 6) {
          this.loadMoreButton.style.display = 'none';
        }
      } else {
        this.loadMoreButton.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      this.loadMoreButton.innerHTML = 'Error al cargar';
      this.loadMoreButton.classList.add('bg-red-500', 'hover:bg-red-600');
    } finally {
      this.isLoading = false;
      if (this.loadMoreButton.style.display !== 'none') {
        this.loadMoreButton.disabled = false;
        this.loadMoreButton.innerHTML = `
          <i class="fas fa-plus mr-2"></i>
          Cargar más testimonios
        `;
      }
    }
  }

  displayTestimonials(testimonials: TestimonialData[]): void {
    if (!this.container) return;

    testimonials.forEach((testimonial) => {
      const card = this.createTestimonialCard(testimonial);
      this.container!.appendChild(card);
    });

    // Re-setup animations for new cards
    this.setupAnimations();
  }

  private createTestimonialCard(testimonial: TestimonialData): HTMLElement {
    const card = document.createElement('div');
    card.className = 'testimonial-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 opacity-0 transform translate-y-4';
    
    const starsHtml = this.generateStarsHtml(testimonial.rating);
    const featuredBadge = testimonial.is_featured ? `
      <div class="absolute -top-3 -right-3">
        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          <i class="fas fa-star mr-1"></i>
          Destacado
        </div>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="relative">
        ${featuredBadge}
        
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              ${testimonial.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-lg">${testimonial.name}</h3>
              ${testimonial.position ? `<p class="text-gray-600 text-sm">${testimonial.position}</p>` : ''}
              ${testimonial.company ? `<p class="text-gray-500 text-xs">${testimonial.company}</p>` : ''}
            </div>
          </div>
          
          <div class="flex items-center space-x-1">
            ${starsHtml}
          </div>
        </div>

        <blockquote class="text-gray-700 text-base leading-relaxed mb-6 italic">
          "${testimonial.content}"
        </blockquote>

        <div class="flex items-center justify-between text-sm text-gray-500">
          <span class="flex items-center">
            <i class="fas fa-calendar mr-2"></i>
            ${new Date(testimonial.created_at).toLocaleDateString('es-ES')}
          </span>
          ${testimonial.is_active ? `
            <span class="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <i class="fas fa-check-circle mr-1"></i>
              Verificado
            </span>
          ` : ''}
        </div>
      </div>
    `;

    // Add animation after a short delay
    setTimeout(() => {
      card.classList.remove('opacity-0', 'translate-y-4');
      card.classList.add('opacity-100', 'translate-y-0');
    }, 100);

    return card;
  }

  private generateStarsHtml(rating: number): string {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHtml += '<i class="fas fa-star text-yellow-400"></i>';
      } else if (i - 0.5 <= rating) {
        starsHtml += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
      } else {
        starsHtml += '<i class="far fa-star text-gray-300"></i>';
      }
    }
    return starsHtml;
  }
}

// Export for use in Astro component
export { TestimonialsController };

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TestimonialsController();
});
