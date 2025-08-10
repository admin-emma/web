/**
 * Careers Page Manager
 * Handles career form submissions, CV upload validation, and image download functionality
 */

class CareersPageManager {
  constructor() {
    this.careerForm = null;
    this.cvInput = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    this.setupCVValidation();
    this.setupCareerForm();
  }

  setupCVValidation() {
    this.cvInput = document.getElementById('cv');
    
    if (this.cvInput) {
      this.cvInput.addEventListener('change', (e) => this.handleCVChange(e));
    }
  }

  handleCVChange(e) {
    const target = e.target;
    if (!target || !target.files) return;
    
    const file = target.files[0];
    const cvError = document.getElementById('cvError');
    const cvSuccess = document.getElementById('cvSuccess');
    const cvFileName = document.getElementById('cvFileName');
    const cvPlaceholder = document.getElementById('cvPlaceholder');
    
    // Limpiar mensajes previos
    if (cvError) cvError.classList.add('hidden');
    if (cvSuccess) cvSuccess.classList.add('hidden');
    
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        if (cvError) {
          cvError.textContent = 'Solo se permiten archivos PDF, DOC o DOCX';
          cvError.classList.remove('hidden');
        }
        target.value = '';
        if (cvPlaceholder) cvPlaceholder.classList.remove('hidden');
        return;
      }
      
      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        if (cvError) {
          cvError.textContent = 'El archivo no puede superar los 5MB';
          cvError.classList.remove('hidden');
        }
        target.value = '';
        if (cvPlaceholder) cvPlaceholder.classList.remove('hidden');
        return;
      }
      
      // Archivo válido
      if (cvFileName) cvFileName.textContent = file.name;
      if (cvSuccess) cvSuccess.classList.remove('hidden');
      if (cvPlaceholder) cvPlaceholder.classList.add('hidden');
    } else {
      if (cvPlaceholder) cvPlaceholder.classList.remove('hidden');
    }
  }

  setupCareerForm() {
    this.careerForm = document.getElementById('careerForm');
    
    if (this.careerForm) {
      this.careerForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const messageAlert = document.getElementById('messageAlert');
    
    // UI Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.classList.add('hidden');
    if (submitSpinner) submitSpinner.classList.remove('hidden');
    if (messageAlert) messageAlert.classList.add('hidden');
    
    try {
      const formData = new FormData(this.careerForm);
      
      // Agregar position_id si se seleccionó una posición específica
      const selectedPosition = formData.get('posicion');
      if (selectedPosition && selectedPosition !== 'other' && selectedPosition !== '') {
        formData.append('position_id', selectedPosition);
      }
      
      // Validar que se haya seleccionado un CV
      const cvFile = formData.get('cv');
      if (!cvFile || cvFile.size === 0) {
        throw new Error('Por favor selecciona tu CV');
      }
      
      const response = await fetch('/api/recruitment', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (messageAlert) {
          messageAlert.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
          messageAlert.innerHTML = `
            <div class="flex items-center">
              <i class="fas fa-check-circle mr-2"></i>
              <span>¡Aplicación enviada exitosamente! Te contactaremos pronto.</span>
            </div>
          `;
          messageAlert.classList.remove('hidden');
        }
        
        // Reset form
        this.careerForm.reset();
        
        // Reset CV upload UI
        const cvSuccess = document.getElementById('cvSuccess');
        const cvPlaceholder = document.getElementById('cvPlaceholder');
        if (cvSuccess) cvSuccess.classList.add('hidden');
        if (cvPlaceholder) cvPlaceholder.classList.remove('hidden');
        
        // Scroll to message
        if (messageAlert) messageAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        throw new Error(data.message || 'Error al enviar la aplicación');
      }
    } catch (error) {
      console.error('Error:', error);
      if (messageAlert) {
        messageAlert.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
        messageAlert.innerHTML = `
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${error.message || 'Error de conexión. Por favor intenta nuevamente.'}</span>
          </div>
        `;
        messageAlert.classList.remove('hidden');
      }
    } finally {
      // Reset UI
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.classList.remove('hidden');
      if (submitSpinner) submitSpinner.classList.add('hidden');
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CareersPageManager();
  });
} else {
  new CareersPageManager();
}

// Exportar para uso como módulo si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CareersPageManager;
}
