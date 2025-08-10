// TypeScript para administración de Testimonios
// Archivo: src/scripts/admin/testimonials.ts
//

interface Testimonial {
  id: number;
  name: string;
  position: string;
  company?: string;
  content: string;
  avatar_url?: string;
  rating: number;
  is_active: number;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

let currentTestimonialId: number | null = null;

/**
 * Abre el modal para agregar o editar un testimonio
 * @param testimonialData - Datos del testimonio a editar, null para crear nuevo
 */
function openTestimonialModal(testimonialData: Testimonial | null = null): void {
  const modal = document.getElementById('testimonialModal') as HTMLElement | null;
  const form = document.getElementById('testimonialForm') as HTMLFormElement | null;
  const modalTitle = document.getElementById('modalTitle') as HTMLElement | null;
  
  if (!modal || !form || !modalTitle) {
    console.error('Required modal elements not found');
    return;
  }
  
  if (testimonialData) {
    modalTitle.textContent = 'Editar Testimonio';
    form.action = '/api/testimonials';
    const actionInput = form.querySelector('input[name="action"]') as HTMLInputElement | null;
    if (actionInput) actionInput.value = 'update';
    
    // Rellenar formulario con datos existentes
    const testimonialIdInput = document.getElementById('testimonialId') as HTMLInputElement | null;
    const nameInput = document.getElementById('name') as HTMLInputElement | null;
    const positionInput = document.getElementById('position') as HTMLInputElement | null;
    const companyInput = document.getElementById('company') as HTMLInputElement | null;
    const contentInput = document.getElementById('content') as HTMLTextAreaElement | null;
    const avatarUrlInput = document.getElementById('avatar_url') as HTMLInputElement | null;
    const ratingInput = document.getElementById('rating') as HTMLSelectElement | null;
    const isActiveInput = document.getElementById('is_active') as HTMLInputElement | null;
    const isFeaturedInput = document.getElementById('is_featured') as HTMLInputElement | null;
    
    if (testimonialIdInput) testimonialIdInput.value = testimonialData.id.toString();
    if (nameInput) nameInput.value = testimonialData.name;
    if (positionInput) positionInput.value = testimonialData.position;
    if (companyInput) companyInput.value = testimonialData.company || '';
    if (contentInput) contentInput.value = testimonialData.content;
    if (avatarUrlInput) avatarUrlInput.value = testimonialData.avatar_url || '';
    if (ratingInput) ratingInput.value = testimonialData.rating.toString();
    if (isActiveInput) isActiveInput.checked = testimonialData.is_active === 1;
    if (isFeaturedInput) isFeaturedInput.checked = testimonialData.is_featured === 1;
    
    currentTestimonialId = testimonialData.id;
  } else {
    modalTitle.textContent = 'Agregar Testimonio';
    form.action = '/api/testimonials';
    const actionInput = form.querySelector('input[name="action"]') as HTMLInputElement | null;
    if (actionInput) actionInput.value = 'create';
    form.reset();
    const isActiveInput = document.getElementById('is_active') as HTMLInputElement | null;
    const isFeaturedInput = document.getElementById('is_featured') as HTMLInputElement | null;
    if (isActiveInput) isActiveInput.checked = true;
    if (isFeaturedInput) isFeaturedInput.checked = false;
    currentTestimonialId = null;
  }
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de testimonio
 */
function closeTestimonialModal(): void {
  const modal = document.getElementById('testimonialModal') as HTMLElement | null;
  if (modal) {
    modal.style.display = 'none';
  }
  document.body.style.overflow = 'auto';
  currentTestimonialId = null;
}

/**
 * Carga y abre el modal para editar un testimonio
 * @param testimonialId - ID del testimonio a editar
 */
async function editTestimonial(testimonialId: number): Promise<void> {
  try {
    const response = await fetch(`/api/testimonials?id=${testimonialId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const testimonialData = await response.json() as Testimonial;
    openTestimonialModal(testimonialData);
  } catch (error) {
    console.error('Error al cargar el testimonio:', error);
    alert('Error al cargar los datos del testimonio');
  }
}

/**
 * Cambia el estado destacado de un testimonio
 * @param testimonialId - ID del testimonio
 * @param currentFeatured - Estado destacado actual (1 = destacado, 0 = normal)
 */
async function toggleTestimonialFeatured(testimonialId: number, currentFeatured: number): Promise<void> {
  const newFeatured = currentFeatured ? 0 : 1;
  const action = newFeatured ? 'destacar' : 'quitar de destacados';
  
  if (!confirm(`¿Estás seguro de que quieres ${action} este testimonio?`)) {
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('action', 'toggle-featured');
    formData.append('testimonialId', testimonialId.toString());
    formData.append('featured', newFeatured.toString());
    
    const response = await fetch('/api/testimonials', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      window.location.reload();
    } else {
      throw new Error('Error en la respuesta del servidor');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el estado destacado del testimonio');
  }
}

/**
 * Cambia el estado activo/inactivo de un testimonio
 * @param testimonialId - ID del testimonio
 * @param currentStatus - Estado actual (1 = activo, 0 = inactivo)
 */
async function toggleTestimonialStatus(testimonialId: number, currentStatus: number): Promise<void> {
  const newStatus = currentStatus ? 0 : 1;
  const action = newStatus ? 'activar' : 'desactivar';
  
  if (!confirm(`¿Estás seguro de que quieres ${action} este testimonio?`)) {
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('action', 'toggle-status');
    formData.append('testimonialId', testimonialId.toString());
    formData.append('status', newStatus.toString());
    
    const response = await fetch('/api/testimonials', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      window.location.reload();
    } else {
      throw new Error('Error en la respuesta del servidor');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el estado del testimonio');
  }
}

/**
 * Elimina un testimonio después de confirmación
 * @param testimonialId - ID del testimonio a eliminar
 */
async function deleteTestimonial(testimonialId: number): Promise<void> {
  if (!confirm('¿Estás seguro de que quieres eliminar este testimonio? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('testimonialId', testimonialId.toString());
    
    const response = await fetch('/api/testimonials', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      window.location.reload();
    } else {
      throw new Error('Error en la respuesta del servidor');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el testimonio');
  }
}

/**
 * Inicializa los event listeners del módulo
 */
function initializeTestimonialsAdmin(): void {
  // Cerrar modal al hacer click en el fondo
  const testimonialModal = document.getElementById('testimonialModal');
  if (testimonialModal) {
    testimonialModal.addEventListener('click', function(e: Event) {
      if (e.target === this) {
        closeTestimonialModal();
      }
    });
  }
  
  // Cerrar modal con ESC
  document.addEventListener('keydown', function(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeTestimonialModal();
    }
  });
}

// Exponer funciones al scope global para uso en onclick
(window as any).openTestimonialModal = openTestimonialModal;
(window as any).closeTestimonialModal = closeTestimonialModal;
(window as any).editTestimonial = editTestimonial;
(window as any).toggleTestimonialFeatured = toggleTestimonialFeatured;
(window as any).toggleTestimonialStatus = toggleTestimonialStatus;
(window as any).deleteTestimonial = deleteTestimonial;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTestimonialsAdmin);
} else {
  initializeTestimonialsAdmin();
}
