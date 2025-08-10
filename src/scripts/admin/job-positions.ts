// Tipos TypeScript
interface JobPosition {
  id: number;
  title: string;
  description: string;
  department: string;
  location: string;
  employment_type: string;
  salary_min: number;
  salary_max: number;
  requirements: string[];
  responsibilities: string[];
  experience_min: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface FilterState {
  status: string;
  department: string;
}

class JobPositionsManager {
  private positions: JobPosition[] = [];
  private currentPosition: JobPosition | null = null;
  private filters: FilterState = { status: '', department: '' };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadPositions();
    this.setupEventListeners();
    this.renderPositions();
  }

  private async loadPositions(): Promise<void> {
    try {
      const response = await fetch('/api/job-positions?active=false');
      if (response.ok) {
        const data = await response.json();
        this.positions = data.positions || [];
      } else {
        console.error('Error cargando posiciones');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  private setupEventListeners(): void {
    // Botones principales
    document.getElementById('addPositionBtn')?.addEventListener('click', () => this.openModal());
    document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeModal());

    // Formulario
    document.getElementById('positionForm')?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Filtros
    document.getElementById('filterStatus')?.addEventListener('change', (e) => {
      this.filters.status = (e.target as HTMLSelectElement).value;
      this.renderPositions();
    });

    document.getElementById('filterDepartment')?.addEventListener('change', (e) => {
      this.filters.department = (e.target as HTMLSelectElement).value;
      this.renderPositions();
    });

    // Requisitos y responsabilidades dinámicos
    document.getElementById('addRequirement')?.addEventListener('click', () => this.addRequirementField());
    document.getElementById('addResponsibility')?.addEventListener('click', () => this.addResponsibilityField());

    // Cerrar modal con escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    // Cerrar modal al hacer clic fuera
    document.getElementById('positionModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });
  }

  private updateStats(): void {
    const totalEl = document.getElementById('totalPositions');
    const activeEl = document.getElementById('activePositions');
    const featuredEl = document.getElementById('featuredPositions');
    const applicationsEl = document.getElementById('totalApplications');

    if (totalEl) totalEl.textContent = this.positions.length.toString();
    if (activeEl) activeEl.textContent = this.positions.filter(p => p.is_active).length.toString();
    if (featuredEl) featuredEl.textContent = this.positions.filter(p => p.is_featured).length.toString();
    if (applicationsEl) applicationsEl.textContent = '0'; // TODO: Obtener desde API de recruitment
  }

  private renderPositions(): void {
    this.updateStats();
    
    const container = document.getElementById('positionsContainer');
    const emptyState = document.getElementById('emptyState');
    if (!container) return;

    let filteredPositions = this.positions;

    // Aplicar filtros
    if (this.filters.status === 'active') {
      filteredPositions = filteredPositions.filter(p => p.is_active);
    } else if (this.filters.status === 'inactive') {
      filteredPositions = filteredPositions.filter(p => !p.is_active);
    }

    if (this.filters.department) {
      filteredPositions = filteredPositions.filter(p => p.department === this.filters.department);
    }

    // Mostrar/ocultar empty state
    if (this.positions.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      container.innerHTML = '';
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    if (filteredPositions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <i class="fas fa-search text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No se encontraron posiciones</h3>
          <p class="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredPositions.map(position => this.renderPositionCard(position)).join('');

    // Agregar event listeners a los botones de las tarjetas
    filteredPositions.forEach(position => {
      document.getElementById(`edit-${position.id}`)?.addEventListener('click', () => this.editPosition(position));
      document.getElementById(`delete-${position.id}`)?.addEventListener('click', () => this.deletePosition(position));
      document.getElementById(`toggle-active-${position.id}`)?.addEventListener('click', () => this.toggleActive(position));
      document.getElementById(`toggle-featured-${position.id}`)?.addEventListener('click', () => this.toggleFeatured(position));
    });
  }

  private renderPositionCard(position: JobPosition): string {
    const statusColor = position.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const featuredBadge = position.is_featured ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Destacada</span>' : '';
    
    return `
      <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">${position.title}</h3>
              <span class="${statusColor} text-xs px-2 py-1 rounded-full">
                ${position.is_active ? 'Activa' : 'Inactiva'}
              </span>
              ${featuredBadge}
            </div>
            <div class="text-sm text-gray-600 space-y-1">
              <p><i class="fas fa-building w-4"></i> ${position.department}</p>
              <p><i class="fas fa-map-marker-alt w-4"></i> ${position.location}</p>
              <p><i class="fas fa-clock w-4"></i> ${position.employment_type}</p>
              ${position.salary_min && position.salary_max ? 
                `<p><i class="fas fa-money-bill-wave w-4"></i> S/ ${position.salary_min.toLocaleString()} - S/ ${position.salary_max.toLocaleString()} PEN</p>` : ''
              }
            </div>
          </div>
          <div class="flex gap-2">
            <button id="edit-${position.id}" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button id="toggle-active-${position.id}" class="p-2 ${position.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} rounded-lg" 
              title="${position.is_active ? 'Desactivar' : 'Activar'}">
              <i class="fas ${position.is_active ? 'fa-eye-slash' : 'fa-eye'}"></i>
            </button>
            <button id="toggle-featured-${position.id}" class="p-2 ${position.is_featured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-600 hover:bg-gray-50'} rounded-lg" 
              title="${position.is_featured ? 'Quitar destacado' : 'Destacar'}">
              <i class="fas fa-star"></i>
            </button>
            <button id="delete-${position.id}" class="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <p class="text-gray-700 text-sm mb-4">${position.description}</p>
        
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="font-medium text-gray-700 mb-2">Requisitos:</p>
            <ul class="text-gray-600 space-y-1">
              ${position.requirements.slice(0, 3).map(req => `<li>• ${req}</li>`).join('')}
              ${position.requirements.length > 3 ? `<li class="text-gray-500">... y ${position.requirements.length - 3} más</li>` : ''}
            </ul>
          </div>
          <div>
            <p class="font-medium text-gray-700 mb-2">Responsabilidades:</p>
            <ul class="text-gray-600 space-y-1">
              ${position.responsibilities.slice(0, 3).map(resp => `<li>• ${resp}</li>`).join('')}
              ${position.responsibilities.length > 3 ? `<li class="text-gray-500">... y ${position.responsibilities.length - 3} más</li>` : ''}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  private openModal(position?: JobPosition): void {
    this.currentPosition = position || null;
    const modal = document.getElementById('positionModal');
    const title = document.getElementById('modalTitle');
    
    if (modal && title) {
      title.textContent = position ? 'Editar Posición' : 'Agregar Posición';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      
      if (position) {
        this.populateForm(position);
      } else {
        this.resetForm();
      }
    }
  }

  private closeModal(): void {
    const modal = document.getElementById('positionModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      this.resetForm();
      this.currentPosition = null;
    }
  }

  private populateForm(position: JobPosition): void {
    (document.getElementById('positionId') as HTMLInputElement).value = position.id.toString();
    (document.getElementById('title') as HTMLInputElement).value = position.title;
    (document.getElementById('description') as HTMLTextAreaElement).value = position.description;
    (document.getElementById('department') as HTMLSelectElement).value = position.department;
    (document.getElementById('location') as HTMLInputElement).value = position.location;
    (document.getElementById('employmentType') as HTMLSelectElement).value = position.employment_type;
    (document.getElementById('experienceMin') as HTMLInputElement).value = position.experience_min.toString();
    (document.getElementById('salaryMin') as HTMLInputElement).value = position.salary_min?.toString() || '';
    (document.getElementById('salaryMax') as HTMLInputElement).value = position.salary_max?.toString() || '';
    (document.getElementById('isActive') as HTMLInputElement).checked = position.is_active;
    (document.getElementById('isFeatured') as HTMLInputElement).checked = position.is_featured;

    // Poblar requisitos
    this.populateFields('requirements', position.requirements);
    
    // Poblar responsabilidades
    this.populateFields('responsibilities', position.responsibilities);
  }

  private populateFields(type: 'requirements' | 'responsibilities', items: string[]): void {
    const container = document.getElementById(`${type}Container`);
    if (!container) return;

    container.innerHTML = '';
    
    items.forEach((item, index) => {
      this.addField(type, item);
    });

    if (items.length === 0) {
      this.addField(type);
    }
  }

  private resetForm(): void {
    const form = document.getElementById('positionForm') as HTMLFormElement;
    if (form) {
      form.reset();
      (document.getElementById('positionId') as HTMLInputElement).value = '';
      
      // Reset dinámicos
      this.populateFields('requirements', ['']);
      this.populateFields('responsibilities', ['']);
    }
  }

  private addRequirementField(): void {
    this.addField('requirements');
  }

  private addResponsibilityField(): void {
    this.addField('responsibilities');
  }

  private addField(type: 'requirements' | 'responsibilities', value = ''): void {
    const container = document.getElementById(`${type}Container`);
    if (!container) return;

    // Convertir el tipo a singular correctamente
    const singularType = type === 'requirements' ? 'requirement' : 'responsibility';

    const div = document.createElement('div');
    div.className = 'flex gap-2';
    div.innerHTML = `
      <input type="text" class="${singularType}-input flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
        placeholder="ej: ${type === 'requirements' ? 'React Native' : 'Desarrollar aplicaciones móviles'}" value="${value}"
      />
      <button type="button" class="remove-${singularType} px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
        <i class="fas fa-trash"></i>
      </button>
    `;

    container.appendChild(div);

    // Agregar event listener al botón de eliminar
    div.querySelector(`.remove-${singularType}`)?.addEventListener('click', () => {
      div.remove();
    });
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
    const saveText = document.getElementById('saveText');
    const saveSpinner = document.getElementById('saveSpinner');
    
    if (saveBtn && saveText && saveSpinner) {
      saveBtn.disabled = true;
      saveText.classList.add('hidden');
      saveSpinner.classList.remove('hidden');
    }

    try {
      const formData = this.getFormData();
      const isEdit = !!this.currentPosition;
      
      const response = await fetch(
        isEdit ? `/api/job-positions/${this.currentPosition!.id}` : '/api/job-positions',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();
      
      if (result.success) {
        await this.loadPositions();
        this.renderPositions();
        this.closeModal();
        this.showMessage(result.message, 'success');
      } else {
        this.showMessage(result.message || 'Error al guardar la posición', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showMessage('Error de conexión', 'error');
    } finally {
      if (saveBtn && saveText && saveSpinner) {
        saveBtn.disabled = false;
        saveText.classList.remove('hidden');
        saveSpinner.classList.add('hidden');
      }
    }
  }

  private getFormData(): Partial<JobPosition> {
    const requirements = Array.from(document.querySelectorAll('.requirement-input'))
      .map(input => (input as HTMLInputElement).value.trim())
      .filter(val => val);

    const responsibilities = Array.from(document.querySelectorAll('.responsibility-input'))
      .map(input => (input as HTMLInputElement).value.trim())
      .filter(val => val);

    return {
      title: (document.getElementById('title') as HTMLInputElement).value,
      description: (document.getElementById('description') as HTMLTextAreaElement).value,
      department: (document.getElementById('department') as HTMLSelectElement).value,
      location: (document.getElementById('location') as HTMLInputElement).value,
      employment_type: (document.getElementById('employmentType') as HTMLSelectElement).value,
      experience_min: parseInt((document.getElementById('experienceMin') as HTMLInputElement).value) || 0,
      salary_min: parseInt((document.getElementById('salaryMin') as HTMLInputElement).value) || 0,
      salary_max: parseInt((document.getElementById('salaryMax') as HTMLInputElement).value) || 0,
      requirements,
      responsibilities,
      is_active: (document.getElementById('isActive') as HTMLInputElement).checked,
      is_featured: (document.getElementById('isFeatured') as HTMLInputElement).checked
    };
  }

  private editPosition(position: JobPosition): void {
    this.openModal(position);
  }

  private async deletePosition(position: JobPosition): Promise<void> {
    if (!confirm(`¿Estás seguro de que quieres eliminar la posición "${position.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/job-positions/${position.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        await this.loadPositions();
        this.renderPositions();
        this.showMessage(result.message, 'success');
      } else {
        this.showMessage(result.message || 'Error al eliminar la posición', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showMessage('Error de conexión', 'error');
    }
  }

  private async toggleActive(position: JobPosition): Promise<void> {
    try {
      const response = await fetch(`/api/job-positions/${position.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !position.is_active })
      });

      const result = await response.json();
      
      if (result.success) {
        await this.loadPositions();
        this.renderPositions();
        this.showMessage(result.message, 'success');
      } else {
        this.showMessage(result.message || 'Error al cambiar estado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showMessage('Error de conexión', 'error');
    }
  }

  private async toggleFeatured(position: JobPosition): Promise<void> {
    try {
      const response = await fetch(`/api/job-positions/${position.id}/toggle-featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !position.is_featured })
      });

      const result = await response.json();
      
      if (result.success) {
        await this.loadPositions();
        this.renderPositions();
        this.showMessage(result.message, 'success');
      } else {
        this.showMessage(result.message || 'Error al cambiar destacado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showMessage('Error de conexión', 'error');
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new JobPositionsManager();
});
