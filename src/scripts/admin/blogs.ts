// Types
interface Blog {
  id: number;
  title: string;
  description?: string;
  content: string;
  author: string;
  slug: string;
  hero_image?: string;
  status: 'draft' | 'published';
  pub_date: string;
  updated_date: string;
}

interface ImageAsset {
  name: string;
  path: string;
  type: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  images?: T[];
}

// Variables globales
let blogs: Blog[] = [];
let editingBlog: Blog | null = null;

// Utility functions
const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id) as T;
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return element;
};

const getElementSafe = <T extends HTMLElement>(id: string): T | null => {
  return document.getElementById(id) as T | null;
};

// Función para obtener el token de autorización
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth-token');
};

// Función para hacer peticiones con autenticación
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

// Inicializar pestañas principales
const initializeMainTabs = (): void => {
  const mainTabButtons = document.querySelectorAll<HTMLButtonElement>('.main-tab-button');
  
  mainTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remover clase activa de todos los botones
      mainTabButtons.forEach(btn => {
        btn.className = 'main-tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base flex items-center';
      });

      // Añadir clase activa al botón clickeado
      button.className = 'main-tab-button bg-white border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base flex items-center';

      // Ocultar todos los paneles principales
      const mainPanels = document.querySelectorAll<HTMLDivElement>('.main-tab-panel');
      mainPanels.forEach(panel => {
        panel.classList.add('hidden');
      });

      // Mostrar el panel correspondiente
      const targetPanel = button.id.replace('-main-tab', '-main-panel');
      const targetPanelElement = getElementSafe<HTMLDivElement>(targetPanel);
      if (targetPanelElement) {
        targetPanelElement.classList.remove('hidden');
      }

      // Si es el panel del formulario, inicializar las sub-pestañas
      if (targetPanel === 'form-main-panel') {
        console.log('Initializing form sub-tabs...');
        setTimeout(() => {
          initializeTabs();
          setupComponentButtons();
          setupInlineComponents();
          setupSlugGeneration();
          loadAuthors();
          loadAssets();
          updatePreview();
          console.log('Form sub-tabs initialized');
        }, 100);
      }
    });
  });
};

// Inicializar pestañas del formulario
const initializeTabs = (): void => {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remover clase activa de todos los botones
      tabButtons.forEach(btn => {
        btn.className = 'tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';
      });

      // Añadir clase activa al botón clickeado
      button.className = 'tab-button border-indigo-500 text-indigo-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';

      // Ocultar todos los paneles
      const panels = document.querySelectorAll<HTMLDivElement>('.tab-panel');
      panels.forEach(panel => {
        panel.classList.add('hidden');
      });

      // Mostrar el panel correspondiente
      const targetPanel = button.id.replace('-tab', '-panel');
      const targetPanelElement = getElementSafe<HTMLDivElement>(targetPanel);
      if (targetPanelElement) {
        targetPanelElement.classList.remove('hidden');
      }

      // Actualizar vista previa si se cambia a la pestaña de vista previa
      if (targetPanel === 'preview-panel') {
        updatePreview();
      }
    });
  });
};

// Configurar botones de componentes
const setupComponentButtons = (): void => {
  const componentButtons = document.querySelectorAll<HTMLButtonElement>('.component-btn');
  
  componentButtons.forEach(button => {
    button.addEventListener('click', () => {
      const component = button.dataset.component;
      if (component) {
        insertIntoEditor(component);
      }
    });
  });
};

// Cargar usuarios para el select de autor
const loadAuthors = async (): Promise<void> => {
  try {
    const response = await fetch('/api/users/');

    const authorSelect = getElementSafe<HTMLSelectElement>('blogAuthor');
    if (!authorSelect) return;

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.users) {
        // Limpiar opciones existentes (excepto la primera)
        authorSelect.innerHTML = '<option value="">Seleccionar autor...</option>';
        
        // Agregar usuarios como opciones
        result.users.forEach((user: any) => {
          const option = document.createElement('option');
          option.value = user.username;
          option.textContent = `${user.username} (${user.role})`;
          authorSelect.appendChild(option);
        });
      } else {
        console.error('Error al cargar usuarios:', result.message);
        showNotification('Error al cargar la lista de autores', 'error');
      }
    } else {
      console.error('Error en la respuesta del servidor');
      showNotification('Error al cargar la lista de autores', 'error');
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    showNotification('Error al cargar la lista de autores', 'error');
  }
};

// Cargar assets/imágenes
const loadAssets = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    
    // Cargar solo imágenes de uploads
    const uploadsResponse = await fetch('/api/assets/images?folder=uploads', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    const grid = getElement<HTMLDivElement>('assets-grid');
    grid.innerHTML = '';
    
    if (uploadsResponse.ok) {
      const uploadsResult: ApiResponse<ImageAsset> = await uploadsResponse.json();
      if (uploadsResult.success && uploadsResult.images && uploadsResult.images.length > 0) {
        uploadsResult.images.forEach(image => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'asset-image-btn relative group cursor-pointer';
          button.innerHTML = `
            <img src="${image.path}" alt="${image.name.replace(/"/g, '&quot;')}" class="w-full h-24 object-cover rounded border">
            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
              <span class="text-white text-sm">Usar como imagen principal</span>
            </div>
          `;
          
          button.addEventListener('click', () => {
            // Establecer como imagen principal del blog
            const heroImageInput = getElementSafe<HTMLInputElement>('blogHeroImage');
            if (heroImageInput) {
              heroImageInput.value = image.path;
              
              // Mostrar preview de la imagen seleccionada
              const preview = getElementSafe<HTMLDivElement>('hero-image-preview');
              if (preview) {
                preview.classList.remove('hidden');
                preview.innerHTML = `
                  <img src="${image.path}" alt="Vista previa" class="w-full h-32 object-cover rounded border">
                  <p class="text-sm text-gray-600 mt-2">Imagen principal: ${image.name}</p>
                `;
              }
              
              // Mostrar mensaje de confirmación
              showNotification(`Imagen "${image.name}" establecida como imagen principal`, 'success');
            }
          });
          
          grid.appendChild(button);
        });
      } else {
        grid.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No hay imágenes disponibles. Sube imágenes desde la pestaña de subida.</p>';
      }
    } else {
      grid.innerHTML = '<p class="text-red-500 col-span-full text-center py-8">Error cargando imágenes</p>';
    }
    
  } catch (error) {
    console.error('Error cargando assets:', error);
    const grid = getElementSafe<HTMLDivElement>('assets-grid');
    if (grid) {
      grid.innerHTML = '<p class="text-red-500 col-span-full text-center py-8">Error cargando imágenes</p>';
    }
  }
};

// Mostrar notificaciones
const showNotification = (message: string, type: 'success' | 'error' = 'success'): void => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded shadow-lg z-50`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 3000);
};

// Insertar contenido en el editor
const insertIntoEditor = (content: string): void => {
  const editor = getElement<HTMLTextAreaElement>('blogContent');
  const cursorPos = editor.selectionStart;
  const textBefore = editor.value.substring(0, cursorPos);
  const textAfter = editor.value.substring(editor.selectionEnd);
  
  editor.value = textBefore + content + textAfter;
  editor.selectionStart = editor.selectionEnd = cursorPos + content.length;
  editor.focus();
  
  updatePreview();
};

// Importar función de markdown (simulada para TypeScript)
declare function markdownToHtml(markdown: string): string;

// Actualizar vista previa
const updatePreview = (): void => {
  const content = getElementSafe<HTMLTextAreaElement>('blogContent')?.value || '';
  const title = getElementSafe<HTMLInputElement>('blogTitle')?.value || 'Vista Previa del Blog';
  const description = getElementSafe<HTMLTextAreaElement>('blogDescription')?.value || '';
  const heroImage = getElementSafe<HTMLInputElement>('blogHeroImage')?.value || '';
  
  const previewContainer = getElementSafe<HTMLDivElement>('preview-content');
  if (!previewContainer) return;
  
  // Convertir markdown mejorado a HTML usando la misma función que el frontend
  const htmlContent = convertMarkdownToHtml(content);
  
  previewContainer.innerHTML = `
    <article class="max-w-none">
      ${heroImage ? `<img src="${heroImage}" alt="Imagen principal" class="w-full h-64 object-cover rounded-lg mb-6">` : ''}
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">${title}</h1>
        ${description ? `<p class="text-lg text-gray-600 leading-relaxed">${description}</p>` : ''}
      </header>
      <div class="prose prose-lg max-w-none">
        ${htmlContent}
      </div>
    </article>
  `;
};

// Función para convertir Markdown a HTML (duplicada para mantener consistencia)
const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  // Convertir markdown mejorado a HTML
  let htmlContent = markdown
    // Encabezados
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-3 mt-6">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-4 mt-8">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>')
    
    // Separadores horizontales
    .replace(/^---$/gim, '<hr class="border-t-2 border-gray-300 my-6">')
    
    // Imágenes
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full h-auto my-4 rounded">')
    
    // Texto en negrita y cursiva
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Listas numeradas (primero para evitar conflictos)
    .replace(/^\d+\.\s(.+)$/gim, '<li class="mb-2">$1</li>')
    
    // Listas con viñetas
    .replace(/^[-*]\s(.+)$/gim, '<li class="mb-2">$1</li>')
    
    // Citas
    .replace(/^>\s(.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2 my-4">$1</blockquote>')
    
    // Párrafos (dividir por dobles saltos de línea)
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';
      
      // Si contiene <li>, convertir en lista
      if (paragraph.includes('<li')) {
        const isNumbered = /^\d+\./.test(paragraph);
        const listItems = paragraph.split('\n').filter(line => line.trim());
        const listType = isNumbered ? 'ol' : 'ul';
        const listClass = isNumbered ? 'list-decimal list-inside space-y-2 mb-4' : 'list-disc list-inside space-y-2 mb-4';
        return `<${listType} class="${listClass}">${listItems.join('')}</${listType}>`;
      }
      
      // Si ya es un elemento HTML (h1, h2, hr, blockquote), devolverlo tal como está
      if (paragraph.startsWith('<h') || paragraph.startsWith('<hr') || paragraph.startsWith('<blockquote')) {
        return paragraph;
      }
      
      // Si no está vacío, convertir en párrafo
      if (paragraph && !paragraph.startsWith('<')) {
        return `<p class="mb-4 text-gray-800 leading-relaxed">${paragraph.replace(/\n/g, '<br>')}</p>`;
      }
      
      return paragraph;
    })
    .join('\n');

  return htmlContent;
};

// Cargar blogs
const loadBlogs = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    console.log('Loading blogs with token:', token ? 'present' : 'missing');
    
    const response = await fetch('/api/blog', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result: Blog[] = await response.json();
      console.log('Blogs loaded:', result);
      
      // La API devuelve directamente el array de blogs
      blogs = Array.isArray(result) ? result : [];
      renderBlogs();
    } else {
      const errorText = await response.text();
      console.error('Error cargando blogs:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Renderizar lista de blogs
const renderBlogs = (): void => {
  const container = getElement<HTMLDivElement>('blogsList');
  
  if (blogs.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-gray-500">
        <p>No hay blogs creados aún.</p>
        <button onclick="openForm()" class="mt-2 text-indigo-600 hover:text-indigo-800 font-medium">
          Crear tu primer blog
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = blogs.map(blog => `
    <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-semibold text-gray-900 truncate">${blog.title}</h3>
        <span class="ml-2 px-2 py-1 text-xs rounded-full ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
          ${blog.status === 'published' ? 'Publicado' : 'Borrador'}
        </span>
      </div>
      
      ${blog.description ? `<p class="text-gray-600 text-sm mb-3 line-clamp-2">${blog.description}</p>` : ''}
      
      <div class="flex justify-between items-center text-sm text-gray-500">
        <span>Por ${blog.author}</span>
        <span>${new Date(blog.pub_date).toLocaleDateString()}</span>
      </div>
      
      <div class="mt-3 flex space-x-2">
        <button onclick="editBlog(${blog.id})" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors">
          Editar
        </button>
        <button onclick="deleteBlog(${blog.id})" class="bg-red-500 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors">
          Eliminar
        </button>
      </div>
    </div>
  `).join('');
};

// Abrir formulario
const openForm = (blog: Blog | null = null): void => {
  console.log('openForm called with:', blog);
  editingBlog = blog;
  
  // Cambiar a la pestaña del formulario
  const formTab = getElementSafe<HTMLButtonElement>('form-main-tab');
  if (formTab) {
    formTab.click();
  }
  
  // Esperar un poco para que se muestre el formulario antes de rellenarlo
  setTimeout(() => {
    const title = getElementSafe<HTMLHeadingElement>('formTitle');
    
    if (blog) {
      if (title) title.textContent = 'Editar Blog';
      
      const blogId = getElementSafe<HTMLInputElement>('blogId');
      const blogTitle = getElementSafe<HTMLInputElement>('blogTitle');
      const blogAuthor = getElementSafe<HTMLSelectElement>('blogAuthor');
      const blogDescription = getElementSafe<HTMLTextAreaElement>('blogDescription');
      const blogContent = getElementSafe<HTMLTextAreaElement>('blogContent');
      const blogHeroImage = getElementSafe<HTMLInputElement>('blogHeroImage');
      const blogStatus = getElementSafe<HTMLSelectElement>('blogStatus');
      const blogSlug = getElementSafe<HTMLInputElement>('blogSlug');
      
      if (blogId) blogId.value = blog.id.toString();
      if (blogTitle) blogTitle.value = blog.title;
      if (blogAuthor) blogAuthor.value = blog.author;
      if (blogDescription) blogDescription.value = blog.description || '';
      if (blogContent) blogContent.value = blog.content;
      if (blogHeroImage) blogHeroImage.value = blog.hero_image || '';
      if (blogStatus) blogStatus.value = blog.status;
      if (blogSlug) blogSlug.value = blog.slug;
      
      // Mostrar vista previa si hay imagen
      const preview = getElementSafe<HTMLDivElement>('hero-image-preview');
      if (preview && blog.hero_image && blog.hero_image.trim() !== '') {
        preview.classList.remove('hidden');
        preview.innerHTML = `
          <img src="${blog.hero_image}" alt="Vista previa" class="w-full h-32 object-cover rounded border">
          <p class="text-sm text-gray-600 mt-2">Imagen principal actual</p>
        `;
      } else if (preview) {
        preview.classList.add('hidden');
        preview.innerHTML = '';
      }
    } else {
      if (title) title.textContent = 'Crear Nuevo Blog';
      
      const form = getElementSafe<HTMLFormElement>('blogFormElement');
      const blogAuthor = getElementSafe<HTMLSelectElement>('blogAuthor');
      
      if (form) form.reset();
      // No establecer valor por defecto para el autor, dejar que el usuario seleccione
      
      // Limpiar vista previa para nuevo blog
      const preview = getElementSafe<HTMLDivElement>('hero-image-preview');
      if (preview) {
        preview.classList.add('hidden');
        preview.innerHTML = '';
      }
    }
    
    // Inicializar sub-pestañas y componentes
    console.log('Initializing sub-tabs from openForm...');
    setupComponentButtons();
    setupSlugGeneration();
    loadAssets();
    updatePreview();
    console.log('Sub-tabs initialized from openForm');
  }, 150);
};

// Editar blog
const editBlog = (id: number): void => {
  const blog = blogs.find(b => b.id === id);
  if (blog) {
    openForm(blog);
  }
};

// Validar URL o ruta de imagen
const validateImagePath = (path: string): boolean => {
  if (!path) return true; // Campo opcional
  
  // Validar URL válida
  try {
    new URL(path);
    return true;
  } catch {
    // Si no es URL válida, verificar si es ruta de uploads
    const uploadsPattern = /^\/uploads\/[^\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i;
    return uploadsPattern.test(path);
  }
};

// Generar slug automáticamente desde el título
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    // Reemplazar caracteres especiales y acentos
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Reemplazar espacios y caracteres no permitidos con guiones
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    // Limitar longitud
    .substring(0, 60);
};

// Validar slug
const validateSlug = (slug: string): { valid: boolean; message?: string } => {
  if (!slug || slug.trim() === '') {
    return { valid: false, message: 'El slug es requerido' };
  }
  
  if (slug.length < 3) {
    return { valid: false, message: 'El slug debe tener al menos 3 caracteres' };
  }
  
  if (slug.length > 60) {
    return { valid: false, message: 'El slug no puede tener más de 60 caracteres' };
  }
  
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(slug)) {
    return { valid: false, message: 'El slug solo puede contener letras minúsculas, números y guiones' };
  }
  
  return { valid: true };
};

// Configurar generación automática de slug
const setupSlugGeneration = (): void => {
  const titleInput = getElementSafe<HTMLInputElement>('blogTitle');
  const slugInput = getElementSafe<HTMLInputElement>('blogSlug');
  
  if (titleInput && slugInput) {
    titleInput.addEventListener('input', function() {
      const title = this.value;
      if (title.trim() !== '') {
        const generatedSlug = generateSlug(title);
        slugInput.value = generatedSlug;
        
        // Validar slug generado
        const validation = validateSlug(generatedSlug);
        
        // Mostrar indicador visual de validación
        if (validation.valid) {
          slugInput.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
          slugInput.classList.add('border-green-300', 'focus:border-green-500', 'focus:ring-green-500');
          
          // Remover mensaje de error si existe
          const errorMsg = document.getElementById('slug-error');
          if (errorMsg) {
            errorMsg.remove();
          }
        } else {
          slugInput.classList.remove('border-green-300', 'focus:border-green-500', 'focus:ring-green-500');
          slugInput.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
          
          // Mostrar mensaje de error
          let errorMsg = document.getElementById('slug-error');
          if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.id = 'slug-error';
            errorMsg.className = 'text-red-600 text-xs mt-1';
            slugInput.parentNode?.appendChild(errorMsg);
          }
          errorMsg.textContent = validation.message || '';
        }
      } else {
        slugInput.value = '';
        slugInput.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500', 'border-green-300', 'focus:border-green-500', 'focus:ring-green-500');
        
        const errorMsg = document.getElementById('slug-error');
        if (errorMsg) {
          errorMsg.remove();
        }
      }
    });
    
    // También validar cuando se edite manualmente el slug
    slugInput.addEventListener('input', function() {
      const slug = this.value;
      const validation = validateSlug(slug);
      
      if (validation.valid) {
        this.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
        this.classList.add('border-green-300', 'focus:border-green-500', 'focus:ring-green-500');
        
        const errorMsg = document.getElementById('slug-error');
        if (errorMsg) {
          errorMsg.remove();
        }
      } else {
        this.classList.remove('border-green-300', 'focus:border-green-500', 'focus:ring-green-500');
        this.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
        
        let errorMsg = document.getElementById('slug-error');
        if (!errorMsg) {
          errorMsg = document.createElement('p');
          errorMsg.id = 'slug-error';
          errorMsg.className = 'text-red-600 text-xs mt-1';
          this.parentNode?.appendChild(errorMsg);
        }
        errorMsg.textContent = validation.message || '';
      }
    });
  }
};

// Guardar blog
const saveBlog = async (e: Event): Promise<void> => {
  e.preventDefault();
  
  const formData = {
    title: getElement<HTMLInputElement>('blogTitle').value,
    description: getElement<HTMLTextAreaElement>('blogDescription').value,
    content: getElement<HTMLTextAreaElement>('blogContent').value,
    heroImage: getElement<HTMLInputElement>('blogHeroImage').value,
    status: getElement<HTMLSelectElement>('blogStatus').value as 'draft' | 'published',
    author: getElement<HTMLSelectElement>('blogAuthor').value,
    slug: getElement<HTMLInputElement>('blogSlug').value
  };
  
  // Validar imagen principal
  if (formData.heroImage && !validateImagePath(formData.heroImage)) {
    showNotification('La imagen principal debe ser una URL válida o una ruta de uploads (/uploads/archivo.jpg)', 'error');
    return;
  }
  
  // Validar slug
  const slugValidation = validateSlug(formData.slug);
  if (!slugValidation.valid) {
    showNotification(`Error en el slug: ${slugValidation.message}`, 'error');
    return;
  }
  
  if (editingBlog) {
    (formData as any).id = getElement<HTMLInputElement>('blogId').value;
  }
  
  try {
    const method = editingBlog ? 'PUT' : 'POST';
    const url = editingBlog ? `/api/blog/${editingBlog.id}` : '/api/blog';
    
    const response = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      showNotification(editingBlog ? 'Blog actualizado exitosamente' : 'Blog creado exitosamente', 'success');
      
      // Recargar blogs y volver a la lista
      await loadBlogs();
      const listTab = getElementSafe<HTMLButtonElement>('list-main-tab');
      if (listTab) {
        listTab.click();
      }
    } else {
      const errorData = await response.json();
      showNotification(errorData.message || 'Error al guardar el blog', 'error');
    }
  } catch (error) {
    console.error('Error guardando blog:', error);
    showNotification('Error al guardar el blog', 'error');
  }
};

// Eliminar blog
const deleteBlog = async (id: number): Promise<void> => {
  if (!confirm('¿Estás seguro de que quieres eliminar este blog?')) {
    return;
  }
  
  try {
    const response = await fetchWithAuth(`/api/blog/${id}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      showNotification('Blog eliminado exitosamente', 'success');
      await loadBlogs();
    } else {
      const errorData = await response.json();
      showNotification(errorData.message || 'Error al eliminar el blog', 'error');
    }
  } catch (error) {
    console.error('Error eliminando blog:', error);
    showNotification('Error al eliminar el blog', 'error');
  }
};

// Subir imagen
const uploadImage = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const token = getAuthToken();
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      showNotification('Imagen subida exitosamente', 'success');
      
      // Recargar assets
      await loadAssets();
    } else {
      const errorData = await response.json();
      showNotification(errorData.message || 'Error al subir la imagen', 'error');
    }
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    showNotification('Error al subir la imagen', 'error');
  }
};

// Insertar imagen por URL
const insertImageByUrl = (): void => {
  const url = prompt('Ingresa la URL de la imagen:');
  if (url && url.trim() !== '') {
    const markdown = `![Imagen](${url.trim()})\n\n`;
    insertIntoEditor(markdown);
  }
};

// Exponer funciones al scope global para onclick handlers
(window as any).openForm = openForm;
(window as any).editBlog = editBlog;
(window as any).deleteBlog = deleteBlog;

// Configurar componentes inline en el editor
const setupInlineComponents = (): void => {
  const componentBtnsInline = document.querySelectorAll<HTMLButtonElement>('.component-btn-inline');
  const insertImageBtnInline = getElementSafe<HTMLButtonElement>('insertImageBtnInline');
  const previewDiv = getElementSafe<HTMLDivElement>('inline-component-preview');
  
  if (componentBtnsInline.length > 0) {
    componentBtnsInline.forEach(btn => {
      // Vista previa al pasar el cursor
      btn.addEventListener('mouseenter', function() {
        const componentData = this.getAttribute('data-component');
        if (componentData && previewDiv) {
          const previewHtml = convertMarkdownToPreviewHTML(componentData.trim());
          previewDiv.innerHTML = `<div class="prose prose-xs">${previewHtml}</div>`;
        }
      });
      
      // Limpiar vista previa al salir
      btn.addEventListener('mouseleave', function() {
        if (previewDiv) {
          previewDiv.innerHTML = '<p class="text-gray-400 italic">Pasa el cursor sobre un componente para ver la vista previa</p>';
        }
      });
      
      // Insertar componente al hacer clic
      btn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevenir envío del formulario
        const componentData = this.getAttribute('data-component');
        if (componentData) {
          insertIntoEditor(componentData);
        }
      });
    });
  }

  // Botón de insertar imagen inline
  if (insertImageBtnInline) {
    insertImageBtnInline.addEventListener('click', function(e) {
      e.preventDefault(); // Prevenir envío del formulario
      // Cambiar a la tab de imágenes para seleccionar
      const imagesTab = getElementSafe<HTMLButtonElement>('images-tab');
      if (imagesTab) {
        imagesTab.click();
      }
    });
  }
};

// Convertir markdown a HTML para la vista previa inline
const convertMarkdownToPreviewHTML = (markdown: string): string => {
  let html = markdown;
  
  if (markdown.includes('## ')) {
    html = '<h3 class="text-lg font-semibold text-gray-900 mb-2">Subtítulo</h3><p class="text-gray-600">Texto del subtítulo...</p>';
  } else if (markdown.includes('**') && markdown.includes('**')) {
    html = '<p><strong class="font-bold">Texto en negrita</strong></p>';
  } else if (markdown.includes('*') && markdown.includes('*')) {
    html = '<p><em class="italic">Texto en cursiva</em></p>';
  } else if (markdown.includes('- ')) {
    html = `
      <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>Elemento 1</li>
        <li>Elemento 2</li>
        <li>Elemento 3</li>
      </ul>`;
  } else if (markdown.includes('1. ')) {
    html = `
      <ol class="list-decimal list-inside space-y-1 text-gray-700">
        <li>Primer paso</li>
        <li>Segundo paso</li>
        <li>Tercer paso</li>
      </ol>`;
  } else if (markdown.includes('> ')) {
    html = `
      <blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2">
        Esta es una cita importante que quiero destacar en mi artículo.
      </blockquote>`;
  } else if (markdown.includes('---')) {
    html = '<hr class="border-t-2 border-gray-300 my-4">';
  } else if (markdown.includes('&nbsp;')) {
    html = '<div class="py-2"><p class="text-gray-500 text-xs">Espacio en blanco</p></div>';
  } else {
    html = '<p class="text-gray-600">Vista previa del componente</p>';
  }
  
  return html;
};

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar pestañas principales
  initializeMainTabs();
  
  // Cargar blogs
  loadBlogs();
  
  // Botones del formulario
  const cancelBtn = getElementSafe<HTMLButtonElement>('cancelFormBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const listTab = getElementSafe<HTMLButtonElement>('list-main-tab');
      if (listTab) {
        listTab.click();
      }
    });
  }
  
  const form = getElementSafe<HTMLFormElement>('blogFormElement');
  if (form) {
    form.addEventListener('submit', saveBlog);
  }
  
  // Cerrar formulario con tecla Escape
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const blogForm = getElementSafe<HTMLElement>('blogForm');
    if (e.key === 'Escape' && blogForm && !blogForm.classList.contains('hidden')) {
      const listTab = getElementSafe<HTMLButtonElement>('list-main-tab');
      if (listTab) {
        listTab.click();
      }
    }
  });

  // Subida de imágenes
  const imageUpload = getElementSafe<HTMLInputElement>('imageUpload');
  if (imageUpload) {
    imageUpload.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    });
  }

  // Insertar imagen por URL
  const insertImageBtn = getElementSafe<HTMLButtonElement>('insertImageBtn');
  if (insertImageBtn) {
    insertImageBtn.addEventListener('click', insertImageByUrl);
  }

  // Event listener para el campo de imagen principal
  const heroImageInput = getElementSafe<HTMLInputElement>('blogHeroImage');
  if (heroImageInput) {
    heroImageInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const url = target.value;
      const preview = getElementSafe<HTMLDivElement>('hero-image-preview');
      
      if (preview) {
        if (url && url.trim() !== '') {
          // Mostrar vista previa si hay URL
          preview.classList.remove('hidden');
          preview.innerHTML = `
            <img src="${url}" alt="Vista previa" class="w-full h-32 object-cover rounded border" 
                 onerror="this.parentElement.innerHTML='<div class=&quot;w-full h-32 bg-gray-200 rounded border flex items-center justify-center&quot;><span class=&quot;text-gray-500&quot;>Error cargando imagen</span></div>'">
            <p class="text-sm text-gray-600 mt-2">Imagen principal seleccionada</p>
          `;
        } else {
          // Ocultar vista previa si no hay URL
          preview.classList.add('hidden');
          preview.innerHTML = '';
        }
      }
    });
  }

  // Vista previa en tiempo real
  const contentTextarea = getElementSafe<HTMLTextAreaElement>('blogContent');
  if (contentTextarea) {
    contentTextarea.addEventListener('input', updatePreview);
  }
  
  const titleInput = getElementSafe<HTMLInputElement>('blogTitle');
  if (titleInput) {
    titleInput.addEventListener('input', updatePreview);
  }
  
  const descriptionTextarea = getElementSafe<HTMLTextAreaElement>('blogDescription');
  if (descriptionTextarea) {
    descriptionTextarea.addEventListener('input', updatePreview);
  }

  // Vista previa de componentes
  const componentButtons = document.querySelectorAll('.component-btn');
  componentButtons.forEach(button => {
    button.addEventListener('click', () => {
      const componentData = button.getAttribute('data-component');
      if (componentData) {
        showComponentPreview(componentData);
      }
    });

    // También mostrar vista previa al hacer hover
    button.addEventListener('mouseenter', () => {
      const componentData = button.getAttribute('data-component');
      if (componentData) {
        showComponentPreview(componentData);
      }
    });
  });
});

// Función para mostrar vista previa de componentes
function showComponentPreview(componentMarkdown: string): void {
  const previewElement = getElementSafe<HTMLDivElement>('component-preview');
  if (!previewElement) return;

  // Simular cómo se vería el componente
  let previewHtml = '';
  
  if (componentMarkdown.includes('## ')) {
    previewHtml = `<h2 class="text-xl font-semibold text-gray-900 mb-3">Subtítulo</h2><p class="text-gray-600">Texto del subtítulo...</p>`;
  } else if (componentMarkdown.includes('**') && componentMarkdown.includes('**')) {
    previewHtml = `<p><strong class="font-bold">Texto en negrita</strong></p>`;
  } else if (componentMarkdown.includes('*') && componentMarkdown.includes('*')) {
    previewHtml = `<p><em class="italic">Texto en cursiva</em></p>`;
  } else if (componentMarkdown.includes('- ')) {
    previewHtml = `
      <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>Elemento 1</li>
        <li>Elemento 2</li>
        <li>Elemento 3</li>
      </ul>`;
  } else if (componentMarkdown.includes('1. ')) {
    previewHtml = `
      <ol class="list-decimal list-inside space-y-1 text-gray-700">
        <li>Primer paso</li>
        <li>Segundo paso</li>
        <li>Tercer paso</li>
      </ol>`;
  } else if (componentMarkdown.includes('> ')) {
    previewHtml = `
      <blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2">
        Esta es una cita importante que quiero destacar en mi artículo.
      </blockquote>`;
  } else if (componentMarkdown.includes('---')) {
    previewHtml = `<hr class="border-t-2 border-gray-300 my-4">`;
  } else if (componentMarkdown.includes('&nbsp;')) {
    previewHtml = `<div class="py-4"><p class="text-gray-500 text-sm">Espacio en blanco</p></div>`;
  } else {
    previewHtml = `<p class="text-gray-600">Vista previa del componente</p>`;
  }
  
  previewElement.innerHTML = previewHtml;
}
