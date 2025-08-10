/**
 * Careers Interest Form Handler
 * Manages career notification subscription functionality
 */

interface CareerSubscriptionResponse {
  success: boolean;
  message: string;
}

class CareerInterestManager {
  private form: HTMLFormElement | null = null;
  private emailInput: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.form = document.querySelector('#career-interest-form') as HTMLFormElement;
    this.emailInput = this.form?.querySelector('input[name="email"]') as HTMLInputElement;
    this.submitButton = this.form?.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  private attachEventListeners(): void {
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.emailInput || !this.submitButton) return;

    const email = this.emailInput.value.trim();

    if (!email) {
      this.showNotification('Por favor ingresa tu email', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showNotification('Por favor ingresa un email válido', 'error');
      return;
    }

    // Mostrar estado de carga
    this.setLoadingState(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: 'career',
          source: 'careers-component',
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct'
          }
        })
      });

      const result: CareerSubscriptionResponse = await response.json();

      if (result.success) {
        this.showNotification(result.message, 'success');
        this.resetForm();
      } else {
        this.showNotification(result.message || 'Error al procesar la suscripción', 'error');
      }

    } catch (error) {
      console.error('Error submitting career interest:', error);
      this.showNotification('Error de conexión. Por favor intenta nuevamente.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  private setLoadingState(loading: boolean): void {
    if (!this.submitButton || !this.emailInput) return;

    if (loading) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>Procesando...';
      this.emailInput.disabled = true;
    } else {
      this.submitButton.disabled = false;
      this.submitButton.innerHTML = '<i class="fas fa-bell mr-3"></i>Notificarme';
      this.emailInput.disabled = false;
    }
  }

  private resetForm(): void {
    if (this.form) {
      this.form.reset();
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.career-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `career-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 max-w-sm ${
      type === 'success' 
        ? 'bg-[#038C7F] text-white' 
        : 'bg-red-500 text-white'
    }`;

    // Create notification content
    const content = document.createElement('div');
    content.className = 'flex items-start gap-3';

    const icon = document.createElement('div');
    icon.className = 'flex-shrink-0 mt-0.5';
    icon.innerHTML = type === 'success' 
      ? '<i class="fas fa-check-circle"></i>'
      : '<i class="fas fa-exclamation-triangle"></i>';

    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex-1';
    messageDiv.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = 'flex-shrink-0 ml-2 text-white/80 hover:text-white';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.onclick = () => removeNotification();

    content.appendChild(icon);
    content.appendChild(messageDiv);
    content.appendChild(closeButton);
    notification.appendChild(content);

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);

    // Auto remove after 5 seconds
    const removeTimer = setTimeout(removeNotification, 5000);

    function removeNotification() {
      clearTimeout(removeTimer);
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CareerInterestManager();
});

// Export for potential external use
export { CareerInterestManager };
