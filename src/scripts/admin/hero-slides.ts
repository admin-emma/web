// TypeScript para administración de Hero Slides
// Archivo: src/scripts/hero-slides-admin.ts

interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  background_image?: string;
  button_text?: string;
  button_link?: string;
  visual_type: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

let currentSlideId: number | null = null;

/**
 * Abre el modal para agregar o editar un slide
 * @param slideData - Datos del slide a editar, null para crear nuevo
 */
function openSlideModal(slideData: HeroSlide | null = null): void {
  const modal = document.getElementById('slideModal') as HTMLElement | null;
  const form = document.getElementById('slideForm') as HTMLFormElement | null;
  const modalTitle = document.getElementById('modalTitle') as HTMLElement | null;
  
  if (!modal || !form || !modalTitle) {
    console.error('Required modal elements not found');
    return;
  }
  
  if (slideData) {
    modalTitle.textContent = 'Editar Slide';
    form.action = '/api/hero-slides';
    const actionInput = form.querySelector('input[name="action"]') as HTMLInputElement | null;
    if (actionInput) actionInput.value = 'update';
    
    // Rellenar formulario con datos existentes
    const slideIdInput = document.getElementById('slideId') as HTMLInputElement | null;
    const titleInput = document.getElementById('title') as HTMLInputElement | null;
    const subtitleInput = document.getElementById('subtitle') as HTMLInputElement | null;
    const descriptionInput = document.getElementById('description') as HTMLTextAreaElement | null;
    const backgroundImageInput = document.getElementById('background_image') as HTMLInputElement | null;
    const buttonTextInput = document.getElementById('button_text') as HTMLInputElement | null;
    const buttonLinkInput = document.getElementById('button_link') as HTMLInputElement | null;
    const visualTypeInput = document.getElementById('visual_type') as HTMLSelectElement | null;
    const sortOrderInput = document.getElementById('sort_order') as HTMLInputElement | null;
    const isActiveInput = document.getElementById('is_active') as HTMLInputElement | null;
    
    if (slideIdInput) slideIdInput.value = slideData.id.toString();
    if (titleInput) titleInput.value = slideData.title;
    if (subtitleInput) subtitleInput.value = slideData.subtitle || '';
    if (descriptionInput) descriptionInput.value = slideData.description;
    if (backgroundImageInput) backgroundImageInput.value = slideData.background_image || '';
    if (buttonTextInput) buttonTextInput.value = slideData.button_text || '';
    if (buttonLinkInput) buttonLinkInput.value = slideData.button_link || '';
    if (visualTypeInput) visualTypeInput.value = slideData.visual_type || 'dashboard';
    if (sortOrderInput) sortOrderInput.value = slideData.sort_order.toString();
    if (isActiveInput) isActiveInput.checked = slideData.is_active === 1;
    
    // Mostrar vista previa de imagen existente si hay una
    if (slideData.background_image) {
      const preview = document.getElementById('imagePreview');
      const previewImg = document.getElementById('previewImg') as HTMLImageElement;
      
      if (preview && previewImg) {
        previewImg.src = slideData.background_image;
        preview.classList.remove('hidden');
        
        // Determinar si es URL externa o local para activar el tab correcto
        if (slideData.background_image.startsWith('http') || slideData.background_image.startsWith('//')) {
          switchImageMode('url');
          const externalUrl = document.getElementById('external_url') as HTMLInputElement;
          if (externalUrl) {
            externalUrl.value = slideData.background_image;
          }
        } else {
          switchImageMode('local');
        }
      }
    }
    
    currentSlideId = slideData.id;
  } else {
    modalTitle.textContent = 'Agregar Slide';
    form.action = '/api/hero-slides';
    const actionInput = form.querySelector('input[name="action"]') as HTMLInputElement | null;
    if (actionInput) actionInput.value = 'create';
    form.reset();
    const isActiveInput = document.getElementById('is_active') as HTMLInputElement | null;
    if (isActiveInput) isActiveInput.checked = true;
    
    // Limpiar la vista previa de imagen y resetear al modo local
    clearImage();
    switchImageMode('local');
    
    // Limpiar vista previa de imagen
    clearImage();
    // Activar tab de imágenes locales por defecto
    switchImageMode('local');
    
    currentSlideId = null;
  }
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de slide
 */
function closeSlideModal(): void {
  const modal = document.getElementById('slideModal') as HTMLElement | null;
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
  currentSlideId = null;
}

/**
 * Carga y abre el modal para editar un slide
 * @param slideId - ID del slide a editar
 */
function editSlide(slideId: number): void {
  // Buscar el slide en la página
  const slideElement = document.querySelector(`[data-slide-id="${slideId}"]`);
  if (!slideElement) {
    console.error('Slide element not found');
    return;
  }
  
  // Extraer datos del slide del DOM
  const slideData: HeroSlide = {
    id: slideId,
    title: slideElement.querySelector('.slide-title')?.textContent || '',
    subtitle: slideElement.querySelector('.slide-subtitle')?.textContent || '',
    description: slideElement.querySelector('.slide-description')?.textContent || '',
    background_image: (slideElement.querySelector('.slide-image') as HTMLImageElement)?.src || '',
    button_text: slideElement.querySelector('.slide-button-text')?.textContent || '',
    button_link: (slideElement.querySelector('.slide-button-link') as HTMLAnchorElement)?.href || '',
    visual_type: slideElement.getAttribute('data-visual-type') || 'dashboard',
    sort_order: parseInt(slideElement.getAttribute('data-sort-order') || '1'),
    is_active: slideElement.getAttribute('data-is-active') === '1' ? 1 : 0,
    created_at: '',
    updated_at: ''
  };
  
  openSlideModal(slideData);
}

/**
 * Cambia el estado activo/inactivo de un slide
 * @param slideId - ID del slide
 * @param currentStatus - Estado actual (1 = activo, 0 = inactivo)
 */
function toggleSlideStatus(slideId: number, currentStatus: number): void {
  if (!confirm('¿Estás seguro de que quieres cambiar el estado de este slide?')) {
    return;
  }
  
  const newStatus = currentStatus === 1 ? 0 : 1;
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/api/hero-slides';
  form.style.display = 'none';
  
  const fields = {
    action: 'toggle-status',
    slideId: slideId.toString(),
    status: newStatus.toString()
  };
  
  Object.keys(fields).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = fields[key as keyof typeof fields];
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
}

/**
 * Elimina un slide después de confirmación
 * @param slideId - ID del slide a eliminar
 * @param slideTitle - Título del slide para mostrar en la confirmación
 */
function deleteSlide(slideId: number, slideTitle: string): void {
  if (!confirm(`¿Estás seguro de que quieres eliminar el slide "${slideTitle}"? Esta acción no se puede deshacer.`)) {
    return;
  }
  
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/api/hero-slides';
  form.style.display = 'none';
  
  const fields = {
    action: 'delete',
    slideId: slideId.toString()
  };
  
  Object.keys(fields).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = fields[key as keyof typeof fields];
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
}

/**
 * Inicializa los event listeners del módulo
 */
function initializeHeroSlidesAdmin(): void {
  // Cerrar modal al hacer click en el fondo
  const slideModal = document.getElementById('slideModal');
  if (slideModal) {
    slideModal.addEventListener('click', function(e: Event) {
      if (e.target === this) {
        closeSlideModal();
      }
    });
  }
  
  // Cerrar modal con ESC
  document.addEventListener('keydown', function(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeSlideModal();
    }
  });

  // Cargar imágenes al inicializar
  loadImages();
  
  // Test básico para verificar que todo está funcionando
  console.log('Hero slides admin initialized successfully');
  
  // Verificar que todas las funciones están disponibles
  const requiredFunctions = ['openSlideModal', 'editSlide', 'toggleSlideStatus', 'deleteSlide'];
  requiredFunctions.forEach(funcName => {
    if (typeof (window as any)[funcName] === 'function') {
      console.log(`✓ Function ${funcName} is available`);
    } else {
      console.error(`✗ Function ${funcName} is missing`);
    }
  });
}

// Exponer funciones al scope global para uso en onclick
(window as any).openSlideModal = openSlideModal;
(window as any).closeSlideModal = closeSlideModal;
(window as any).editSlide = editSlide;
(window as any).toggleSlideStatus = toggleSlideStatus;
(window as any).deleteSlide = deleteSlide;
(window as any).switchImageMode = switchImageMode;
(window as any).loadImages = loadImages;
(window as any).selectImage = selectImage;
(window as any).setImageFromUrl = setImageFromUrl;
(window as any).clearImage = clearImage;

/**
 * Cambiar entre modo de selección de imagen local y URL
 */
function switchImageMode(mode: 'local' | 'url'): void {
  const localPanel = document.getElementById('localImagePanel');
  const urlPanel = document.getElementById('urlImagePanel');
  const localTab = document.getElementById('localTab');
  const urlTab = document.getElementById('urlTab');
  
  if (!localPanel || !urlPanel || !localTab || !urlTab) return;
  
  // Ocultar todos los paneles
  localPanel.classList.add('hidden');
  urlPanel.classList.add('hidden');
  
  // Remover clases activas
  localTab.classList.remove('active', 'border-blue-500', 'text-blue-600');
  urlTab.classList.remove('active', 'border-blue-500', 'text-blue-600');
  localTab.classList.add('border-transparent', 'text-gray-500');
  urlTab.classList.add('border-transparent', 'text-gray-500');
  
  if (mode === 'local') {
    localPanel.classList.remove('hidden');
    localTab.classList.add('active', 'border-blue-500', 'text-blue-600');
    localTab.classList.remove('border-transparent', 'text-gray-500');
    // Cargar imágenes automáticamente
    loadImages();
  } else {
    urlPanel.classList.remove('hidden');
    urlTab.classList.add('active', 'border-blue-500', 'text-blue-600');
    urlTab.classList.remove('border-transparent', 'text-gray-500');
  }
}

/**
 * Cargar imágenes de la carpeta uploads
 */
async function loadImages(): Promise<void> {
  try {
    const response = await fetch('/api/assets/images?folder=uploads');
    const data = await response.json();
    
    const grid = document.getElementById('imagesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (!data.success || !data.images || data.images.length === 0) {
      grid.innerHTML = '<p class="col-span-full text-center text-gray-500">No hay imágenes disponibles</p>';
      return;
    }
    
    data.images.forEach((imageData: { name: string; path: string; type: string }) => {
      const div = document.createElement('div');
      div.className = 'relative group cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden';
      div.onclick = () => selectImage(imageData.path);
      
      div.innerHTML = `
        <img src="${imageData.path}" alt="${imageData.name}" class="w-full h-20 object-cover">
        <div class="absolute inset-0 bg-black/20 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <i class="fas fa-check text-white opacity-0 group-hover:opacity-100 text-xl"></i>
        </div>
        <p class="text-xs text-center p-1 truncate">${imageData.name}</p>
      `;
      
      grid.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading images:', error);
    const grid = document.getElementById('imagesGrid');
    if (grid) {
      grid.innerHTML = '<p class="col-span-full text-center text-red-500">Error al cargar imágenes</p>';
    }
  }
}

/**
 * Seleccionar una imagen local
 */
function selectImage(imagePath: string): void {
  const input = document.getElementById('background_image') as HTMLInputElement;
  const preview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg') as HTMLImageElement;
  
  if (!input || !preview || !previewImg) return;
  
  input.value = imagePath;
  previewImg.src = imagePath;
  preview.classList.remove('hidden');
  
  // Limpiar URL externa si estaba seleccionada
  const externalUrl = document.getElementById('external_url') as HTMLInputElement;
  if (externalUrl) {
    externalUrl.value = '';
  }
}

/**
 * Establecer imagen desde URL externa
 */
function setImageFromUrl(url: string): void {
  const input = document.getElementById('background_image') as HTMLInputElement;
  const preview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg') as HTMLImageElement;
  
  if (!input || !preview || !previewImg) return;
  
  if (url.trim() === '') {
    clearImage();
    return;
  }
  
  input.value = url;
  previewImg.src = url;
  preview.classList.remove('hidden');
  
  // Verificar si la imagen carga correctamente
  previewImg.onerror = () => {
    preview.classList.add('hidden');
    input.value = '';
  };
}

/**
 * Limpiar selección de imagen
 */
function clearImage(): void {
  const input = document.getElementById('background_image') as HTMLInputElement;
  const preview = document.getElementById('imagePreview');
  const externalUrl = document.getElementById('external_url') as HTMLInputElement;
  
  if (input) input.value = '';
  if (preview) preview.classList.add('hidden');
  if (externalUrl) externalUrl.value = '';
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHeroSlidesAdmin);
} else {
  initializeHeroSlidesAdmin();
}
