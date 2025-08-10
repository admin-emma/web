/**
 * Resources Newsletter Subscription
 * Manages newsletter subscription from the Resources section
 */

interface NotificationOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  dismissible?: boolean;
}

class ResourcesNewsletterManager {
  private form: HTMLFormElement | null = null;
  private notificationContainer: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.form = document.querySelector('#resources-newsletter-form') as HTMLFormElement;
    this.notificationContainer = document.querySelector('#notification-container') as HTMLElement;

    // Create notification container if it doesn't exist
    if (!this.notificationContainer) {
      this.notificationContainer = document.createElement('div');
      this.notificationContainer.id = 'notification-container';
      this.notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.notificationContainer);
    }
  }

  private attachEventListeners(): void {
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.form) return;

    const formData = new FormData(this.form);
    const email = formData.get('email') as string;

    if (!email || !this.isValidEmail(email)) {
      this.showNotification('Por favor ingresa un email válido', { type: 'error' });
      return;
    }

    const submitButton = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const emailInput = this.form.querySelector('input[type="email"]') as HTMLInputElement;
    const originalButtonText = submitButton.innerHTML;

    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Suscribiendo...';
    emailInput.disabled = true;

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          type: 'resources',
          source: 'resources-section',
          metadata: {
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            section: 'resources-footer'
          }
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.showNotification(result.message || '¡Gracias por suscribirte! Te mantendremos informado sobre nuestros recursos.', { type: 'success' });
        this.form.reset();
      } else {
        this.showNotification(result.message || 'Error al procesar la suscripción. Intenta nuevamente.', { type: 'error' });
      }

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.showNotification('Error de conexión. Por favor intenta nuevamente.', { type: 'error' });
    } finally {
      // Restore form state
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      emailInput.disabled = false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showNotification(message: string, options: NotificationOptions = {}): void {
    if (!this.notificationContainer) return;

    const { type = 'success', duration = 4000, dismissible = true } = options;

    const notification = document.createElement('div');
    notification.className = `max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 opacity-0 translate-x-full`;

    const iconMap = {
      success: { color: 'text-green-400', icon: 'M5 13l4 4L19 7', borderColor: 'border-green-500' },
      error: { color: 'text-red-400', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', borderColor: 'border-red-500' },
      warning: { color: 'text-yellow-400', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z', borderColor: 'border-yellow-500' },
      info: { color: 'text-blue-400', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', borderColor: 'border-blue-500' }
    };

    const config = iconMap[type];

    notification.innerHTML = `
      <div class="border-l-4 ${config.borderColor} p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 ${config.color}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${config.icon}"></path>
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">${message}</p>
          </div>
          ${dismissible ? `
            <div class="ml-4 flex-shrink-0 flex">
              <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.notificationContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('opacity-0', 'translate-x-full');
      notification.classList.add('opacity-100', 'translate-x-0');
    }, 100);

    // Dismiss button
    if (dismissible) {
      const dismissButton = notification.querySelector('button');
      if (dismissButton) {
        dismissButton.addEventListener('click', () => this.removeNotification(notification));
      }
    }

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.removeNotification(notification), duration);
    }
  }

  private removeNotification(notification: HTMLElement): void {
    notification.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ResourcesNewsletterManager();
});

// Export for potential external use
export { ResourcesNewsletterManager };
