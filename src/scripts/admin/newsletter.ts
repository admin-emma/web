/**
 * Newsletter Admin Manager
 * Manages newsletter subscription administration functionality
 */

interface NewsletterSubscription {
  id: number;
  email: string;
  type: string;
  status: string;
  source: string;
  subscribed_at: string;
  unsubscribed_at?: string;
}

interface NotificationOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  dismissible?: boolean;
}

class NewsletterAdminManager {
  private addForm: HTMLFormElement | null = null;
  private exportButton: HTMLButtonElement | null = null;
  private unsubscribeButtons: NodeListOf<HTMLButtonElement> | null = null;
  private reactivateButtons: NodeListOf<HTMLButtonElement> | null = null;
  private deleteButtons: NodeListOf<HTMLButtonElement> | null = null;
  private notificationContainer: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.addForm = document.querySelector('#add-subscription-form') as HTMLFormElement;
    this.exportButton = document.querySelector('#export-csv') as HTMLButtonElement;
    this.unsubscribeButtons = document.querySelectorAll('.unsubscribe-btn') as NodeListOf<HTMLButtonElement>;
    this.reactivateButtons = document.querySelectorAll('.reactivate-btn') as NodeListOf<HTMLButtonElement>;
    this.deleteButtons = document.querySelectorAll('.delete-btn') as NodeListOf<HTMLButtonElement>;
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
    // Add subscription form
    if (this.addForm) {
      this.addForm.addEventListener('submit', this.handleAddSubscription.bind(this));
    }

    // Export CSV button
    if (this.exportButton) {
      this.exportButton.addEventListener('click', this.handleExportCSV.bind(this));
    }

    // Unsubscribe buttons
    if (this.unsubscribeButtons) {
      this.unsubscribeButtons.forEach(button => {
        button.addEventListener('click', this.handleUnsubscribe.bind(this));
      });
    }

    // Reactivate buttons
    if (this.reactivateButtons) {
      this.reactivateButtons.forEach(button => {
        button.addEventListener('click', this.handleReactivate.bind(this));
      });
    }

    // Delete buttons
    if (this.deleteButtons) {
      this.deleteButtons.forEach(button => {
        button.addEventListener('click', this.handleDelete.bind(this));
      });
    }
  }

  private async handleAddSubscription(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.addForm) return;

    const formData = new FormData(this.addForm);
    const email = formData.get('email') as string;
    const type = formData.get('type') as string;

    if (!email || !this.isValidEmail(email)) {
      this.showNotification('Por favor ingresa un email válido', { type: 'error' });
      return;
    }

    const submitButton = this.addForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitButton.textContent;

    try {
      // Show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Agregando...';

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          type: type,
          source: 'admin-panel',
          metadata: {
            addedBy: 'admin',
            timestamp: new Date().toISOString()
          }
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.showNotification(result.message || 'Suscripción agregada exitosamente', { type: 'success' });
        this.addForm.reset();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        this.showNotification(result.message || 'Error al agregar la suscripción', { type: 'error' });
      }

    } catch (error) {
      console.error('Error adding subscription:', error);
      this.showNotification('Error de conexión. Intenta nuevamente.', { type: 'error' });
    } finally {
      // Restore button state
      submitButton.disabled = false;
      submitButton.innerHTML = originalText || '<i class="fas fa-plus mr-2"></i>Agregar';
    }
  }

  private async handleUnsubscribe(e: Event): Promise<void> {
    const button = e.target as HTMLButtonElement;
    const email = button.dataset.email;
    const type = button.dataset.type;

    if (!email) return;

    if (!confirm(`¿Estás seguro de dar de baja la suscripción de ${email}?`)) {
      return;
    }

    try {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.showNotification(result.message || 'Suscripción dada de baja exitosamente', { type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        this.showNotification(result.message || 'Error al dar de baja la suscripción', { type: 'error' });
      }

    } catch (error) {
      console.error('Error unsubscribing:', error);
      this.showNotification('Error de conexión. Intenta nuevamente.', { type: 'error' });
    } finally {
      button.disabled = false;
      button.innerHTML = 'Dar de baja';
    }
  }

  private async handleReactivate(e: Event): Promise<void> {
    const button = e.target as HTMLButtonElement;
    const email = button.dataset.email;
    const type = button.dataset.type || 'general';

    if (!email) return;

    if (!confirm(`¿Estás seguro de reactivar la suscripción de ${email}?`)) {
      return;
    }

    try {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: type,
          source: 'admin-reactivation'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.showNotification(result.message || 'Suscripción reactivada exitosamente', { type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        this.showNotification(result.message || 'Error al reactivar la suscripción', { type: 'error' });
      }

    } catch (error) {
      console.error('Error reactivating:', error);
      this.showNotification('Error de conexión. Intenta nuevamente.', { type: 'error' });
    } finally {
      button.disabled = false;
      button.innerHTML = 'Reactivar';
    }
  }

  private async handleDelete(e: Event): Promise<void> {
    const button = e.target as HTMLButtonElement;
    const id = button.dataset.id;
    const email = button.dataset.email;

    if (!id || !email) return;

    if (!confirm(`¿Estás seguro de eliminar permanentemente la suscripción de ${email}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      const response = await fetch(`/api/newsletter/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.showNotification(result.message || 'Suscripción eliminada exitosamente', { type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        this.showNotification(result.message || 'Error al eliminar la suscripción', { type: 'error' });
      }

    } catch (error) {
      console.error('Error deleting:', error);
      this.showNotification('Error de conexión. Intenta nuevamente.', { type: 'error' });
    } finally {
      button.disabled = false;
      button.innerHTML = 'Eliminar';
    }
  }

  private handleExportCSV(): void {
    try {
      const table = document.querySelector('table tbody');
      if (!table) {
        this.showNotification('No se encontraron datos para exportar', { type: 'warning' });
        return;
      }

      const rows = table.querySelectorAll('tr');
      const headers = ['Email', 'Tipo', 'Estado', 'Fuente', 'Fecha de Suscripción'];
      
      let csvContent = headers.join(',') + '\n';

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          const rowData = [
            this.escapeCSV(cells[0]?.textContent?.trim() || ''),
            this.escapeCSV(cells[1]?.textContent?.trim() || ''),
            this.escapeCSV(cells[2]?.textContent?.trim() || ''),
            this.escapeCSV(cells[3]?.textContent?.trim() || ''),
            this.escapeCSV(cells[4]?.textContent?.trim() || '')
          ];
          csvContent += rowData.join(',') + '\n';
        }
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.showNotification(`CSV exportado exitosamente (${rows.length} registros)`, { type: 'success' });

    } catch (error) {
      console.error('Error exporting CSV:', error);
      this.showNotification('Error al exportar CSV', { type: 'error' });
    }
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
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
  new NewsletterAdminManager();
});

// Export for potential external use
export { NewsletterAdminManager };
