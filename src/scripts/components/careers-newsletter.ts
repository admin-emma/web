/**
 * Careers Newsletter Manager
 * Handles newsletter subscription functionality for the careers section
 */

class CareersNewsletterManager {
  private form: HTMLFormElement | null = null;
  private emailInput: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    this.form = document.getElementById('careers-newsletter-form') as HTMLFormElement;
    
    if (!this.form) {
      console.warn('Careers newsletter form not found');
      return;
    }

    this.emailInput = this.form.querySelector('input[name="email"]') as HTMLInputElement;
    this.submitButton = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;

    this.form.addEventListener('submit', (event) => this.handleSubmit(event));
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.form || !this.emailInput || !this.submitButton) {
      this.showNotification('Error: Formulario no encontrado', 'error');
      return;
    }

    const email = this.emailInput.value.trim();

    if (!this.validateEmail(email)) {
      this.showNotification('Por favor, ingresa un email válido', 'error');
      return;
    }

    // Show loading state
    this.setLoadingState(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: 'careers',
          source: 'careers-component',
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            page: window.location.pathname
          }
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.isNewSubscription) {
          this.showNotification('¡Te has suscrito exitosamente! Te notificaremos sobre nuevas oportunidades de carrera.', 'success');
        } else {
          this.showNotification('Ya estás suscrito a nuestro newsletter de carreras.', 'info');
        }
        this.form.reset();
      } else {
        throw new Error(result.error || 'Error al procesar la suscripción');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.showNotification('Error al procesar tu suscripción. Por favor, inténtalo nuevamente.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private setLoadingState(isLoading: boolean): void {
    if (!this.submitButton || !this.emailInput) return;

    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>Procesando...';
      this.emailInput.disabled = true;
    } else {
      this.submitButton.disabled = false;
      this.submitButton.innerHTML = '<i class="fas fa-bell mr-3"></i>Notificarme';
      this.emailInput.disabled = false;
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Remove any existing notification
    const existingNotification = document.querySelector('.careers-newsletter-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `careers-newsletter-notification fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
      case 'success':
        notification.className += ' bg-green-500 text-white';
        break;
      case 'error':
        notification.className += ' bg-red-500 text-white';
        break;
      case 'info':
        notification.className += ' bg-blue-500 text-white';
        break;
    }

    // Set notification content
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 'fas fa-info-circle';

    notification.innerHTML = `
      <div class="flex items-center">
        <i class="${icon} mr-3"></i>
        <span class="flex-1">${message}</span>
        <button class="ml-3 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  }
}

// Initialize the careers newsletter manager
new CareersNewsletterManager();
