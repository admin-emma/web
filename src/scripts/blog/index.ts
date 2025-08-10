/**
 * Blog Index Page Scripts
 * Manages blog list functionality, search, filtering, and newsletter subscription
 */

interface BlogPost {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    heroImage: string;
  };
  slug: string;
  content: string;
}

interface BlogManager {
  posts: BlogPost[];
  filteredPosts: BlogPost[];
  currentFilter: string;
  searchQuery: string;
}

class BlogIndexManager implements BlogManager {
  posts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  currentFilter: string = '';
  searchQuery: string = '';
  
  private searchInput: HTMLInputElement | null = null;
  private filterButtons: NodeListOf<HTMLButtonElement> | null = null;
  private postsContainer: HTMLElement | null = null;
  private newsletterForms: NodeListOf<HTMLFormElement> | null = null;

  constructor() {
    this.initializeElements();
    this.loadPosts();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.searchInput = document.querySelector('#blog-search') as HTMLInputElement;
    this.filterButtons = document.querySelectorAll('[data-filter]') as NodeListOf<HTMLButtonElement>;
    this.postsContainer = document.querySelector('#posts-container') as HTMLElement;
    this.newsletterForms = document.querySelectorAll('form[id*="newsletter"]') as NodeListOf<HTMLFormElement>;
  }

  private async loadPosts(): Promise<void> {
    try {
      const response = await fetch('/api/blog?published=true');
      if (response.ok) {
        const blogsData = await response.json();
        this.posts = blogsData.map((blog: any) => ({
          id: blog.slug,
          data: {
            title: blog.title,
            description: blog.description,
            pubDate: new Date(blog.pub_date),
            heroImage: blog.hero_image
          },
          slug: blog.slug,
          content: blog.content
        })).sort((a: BlogPost, b: BlogPost) => 
          b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
        );
        
        this.filteredPosts = [...this.posts];
        this.renderPosts();
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      this.showError('Error cargando los artículos del blog');
    }
  }

  private attachEventListeners(): void {
    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.searchQuery = target.value.toLowerCase();
        this.filterPosts();
      });
    }

    // Category filter functionality
    if (this.filterButtons) {
      this.filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const target = e.target as HTMLButtonElement;
          const filter = target.dataset.filter || '';
          this.setActiveFilter(filter);
          this.currentFilter = filter;
          this.filterPosts();
        });
      });
    }

    // Newsletter subscription
    if (this.newsletterForms && this.newsletterForms.length > 0) {
      this.newsletterForms.forEach(form => {
        form.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
      });
    }

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e: Event) {
        e.preventDefault();
        const element = e.target as HTMLAnchorElement;
        const target = document.querySelector(element.getAttribute('href') || '');
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  private filterPosts(): void {
    this.filteredPosts = this.posts.filter(post => {
      const matchesSearch = this.searchQuery === '' || 
        post.data.title.toLowerCase().includes(this.searchQuery) ||
        post.data.description.toLowerCase().includes(this.searchQuery);
      
      const matchesFilter = this.currentFilter === '' || 
        post.data.title.toLowerCase().includes(this.currentFilter.toLowerCase());
      
      return matchesSearch && matchesFilter;
    });

    this.renderPosts();
  }

  private renderPosts(): void {
    if (!this.postsContainer) return;

    if (this.filteredPosts.length === 0) {
      this.postsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-gray-400 mb-4">
            <i class="fas fa-search text-4xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-[#0D0D0D] mb-2">No se encontraron artículos</h3>
          <p class="text-gray-600">Intenta con otros términos de búsqueda o categorías.</p>
        </div>
      `;
      return;
    }

    // Re-render posts would typically be handled by Astro's reactive components
    // This is a placeholder for client-side filtering enhancement
    console.log(`Showing ${this.filteredPosts.length} posts`);
  }

  private setActiveFilter(filter: string): void {
    if (this.filterButtons) {
      this.filterButtons.forEach(button => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle('bg-[#035AA6]', isActive);
        button.classList.toggle('text-white', isActive);
        button.classList.toggle('bg-white', !isActive);
        button.classList.toggle('text-gray-700', !isActive);
      });
    }
  }

  private async handleNewsletterSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;

    if (!this.isValidEmail(email)) {
      this.showError('Por favor ingresa un email válido');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;

    // Show loading state
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Suscribiendo...';
    }
    if (emailInput) emailInput.disabled = true;

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          type: 'blog',
          source: 'blog-index',
          metadata: {
            timestamp: new Date().toISOString(),
            page: window.location.pathname
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        this.showSuccess(result.message);
        form.reset();
      } else {
        this.showError(result.message || 'Error al procesar la suscripción');
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.showError('Error de conexión. Intenta nuevamente.');
    } finally {
      // Restore form state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Suscribirme gratis';
      }
      if (emailInput) emailInput.disabled = false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showError(message: string): void {
    this.showNotification(message, 'error');
  }

  private showSuccess(message: string): void {
    this.showNotification(message, 'success');
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
      type === 'success' 
        ? 'bg-[#038C7F] text-white' 
        : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BlogIndexManager();
});

// Export for potential external use
export { BlogIndexManager };
