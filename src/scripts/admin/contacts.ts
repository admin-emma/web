// TypeScript para la gestión de contactos del admin

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
  company?: string;
  subject?: string;
}

interface ContactApiResponse {
  success: boolean;
  message?: string;
}

// Variables globales
let contactsList: Contact[] = [];
let currentContactMessage: Contact | null = null;

// Funciones utilitarias para elementos DOM específicas de contacts
function getContactPageElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T;
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return element;
}

function getContactPageElementSafe<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// Verificar autenticación para contacts
async function checkContactsAuth(): Promise<boolean> {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    window.location.href = '/admin';
    return false;
  }
  return true;
}

// Cargar contactos
async function loadContactMessages(): Promise<void> {
  const token = localStorage.getItem('auth-token');
  
  try {
    const response = await fetch('/api/contact', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Error cargando contactos');
    
    contactsList = await response.json();
    filterAndRenderContactMessages();
  } catch (error) {
    console.error('Error:', error);
    alert('Error cargando contactos');
  }
}

// Filtrar y renderizar contactos
function filterAndRenderContactMessages(): void {
  const statusFilter = getContactPageElement<HTMLSelectElement>('statusFilter');
  const selectedStatus = statusFilter.value;
  
  let filteredContacts = contactsList;
  if (selectedStatus !== 'all') {
    filteredContacts = contactsList.filter(contact => contact.status === selectedStatus);
  }
  
  renderContactMessages(filteredContacts);
}

// Renderizar lista de contactos
function renderContactMessages(contactsToRender: Contact[]): void {
  const container = getContactPageElement('contactsList');
  
  if (contactsToRender.length === 0) {
    const filterValue = getContactPageElement<HTMLSelectElement>('statusFilter').value;
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16">
          <i class="fas fa-envelope text-4xl text-blue-500 mb-4"></i>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">No hay mensajes de contacto</h2>
          <p class="text-gray-600 mb-6">Comienza agregando el primer mensaje de contacto recibido</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = contactsToRender.map(contact => {
    const statusColor = getContactMessageStatusColor(contact.status);
    const statusText = getContactMessageStatusText(contact.status);
    
    return `
      <div class="p-6 hover:bg-gray-50 cursor-pointer" onclick="window.viewContactMessage(${contact.id})">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <h3 class="text-lg font-medium text-gray-900">${contact.name}</h3>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                ${statusText}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1">${contact.email}</p>
            ${contact.company ? `<p class="text-sm text-gray-500">Empresa: ${contact.company}</p>` : ''}
            ${contact.subject ? `<p class="text-sm text-gray-700 mt-2 font-medium">${contact.subject}</p>` : ''}
            <p class="text-sm text-gray-600 mt-2 line-clamp-2">${contact.message.substring(0, 150)}${contact.message.length > 150 ? '...' : ''}</p>
            <p class="text-xs text-gray-500 mt-2">
              Recibido: ${new Date(contact.created_at).toLocaleString()}
            </p>
          </div>
          <div class="text-gray-400">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Obtener color del estado para contacts
function getContactMessageStatusColor(status: Contact['status']): string {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'read': return 'bg-yellow-100 text-yellow-800';
    case 'replied': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Obtener texto del estado para contacts
function getContactMessageStatusText(status: Contact['status']): string {
  switch (status) {
    case 'new': return 'Nuevo';
    case 'read': return 'Leído';
    case 'replied': return 'Respondido';
    default: return 'Desconocido';
  }
}

// Ver mensaje completo
function viewContactMessage(id: number): void {
  const contact = contactsList.find(c => c.id === id);
  if (!contact) return;
  
  currentContactMessage = contact;
  
  // Llenar los campos visuales del modal
  const setField = (id: string, value: string) => {
    const el = getContactPageElementSafe(id);
    if (el) el.textContent = value || '';
  };
  setField('contactName', contact.name);
  setField('contactEmail', contact.email);
  setField('contactPhone', contact.phone || '');
  setField('contactCompany', contact.company || '');
  setField('contactSubject', contact.subject || '');
  setField('contactDate', new Date(contact.created_at).toLocaleString());
  setField('contactMessage', contact.message);
  // Email como enlace
  const emailEl = getContactPageElementSafe('contactEmail');
  if (emailEl) {
    emailEl.setAttribute('href', `mailto:${contact.email}`);
    emailEl.textContent = contact.email;
  }
  
  // Establecer estado actual
  const statusSelect = getContactPageElement<HTMLSelectElement>('newStatus');
  statusSelect.value = contact.status;
  
  // Mostrar modal
  getContactPageElement('messageModal').classList.remove('hidden');
  
  // Marcar como leído si es nuevo
  if (contact.status === 'new') {
    updateContactMessageStatus(id, 'read');
  }
}

// Actualizar estado del contacto desde el modal
async function updateContactFromModalBtn(): Promise<void> {
  if (!currentContactMessage) return;
  
  const statusSelect = getContactPageElement<HTMLSelectElement>('newStatus');
  const newStatus = statusSelect.value as Contact['status'];
  
  await updateContactMessageStatus(currentContactMessage.id, newStatus);
}

// Función auxiliar para actualizar estado
async function updateContactMessageStatus(id: number, status: Contact['status']): Promise<void> {
  const token = localStorage.getItem('auth-token');
  
  try {
    const response = await fetch(`/api/contact?id=${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    const data: ContactApiResponse = await response.json();

    if (data.success) {
      // Actualizar contacto en la lista local
      const contactIndex = contactsList.findIndex(c => c.id === id);
      if (contactIndex !== -1) {
        contactsList[contactIndex].status = status;
        filterAndRenderContactMessages();
      }

      if (currentContactMessage && currentContactMessage.id === id) {
        currentContactMessage.status = status;
      }
      // Ocultar error visual si todo salió bien
      const modalError = getContactPageElementSafe('modalError');
      if (modalError) modalError.classList.add('hidden');
    } else {
      showModalError(data.message || 'Error actualizando estado');
    }
  } catch (error) {
    console.error('Error:', error);
    showModalError('Error actualizando estado');
  }
}

// Mostrar error visual en el modal con colores y estilos del patrón
function showModalError(msg: string) {
  const modalError = getContactPageElementSafe('modalError');
  const modalErrorText = getContactPageElementSafe('modalErrorText');
  if (modalError && modalErrorText) {
    modalErrorText.textContent = msg;
    modalError.classList.remove('hidden');
    modalError.classList.add('flex');
  }
}

// Eliminar mensaje
async function deleteContactMessage(): Promise<void> {
  if (!currentContactMessage) return;
  
  if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) return;
  
  const token = localStorage.getItem('auth-token');
  
  try {
    const response = await fetch(`/api/contact?id=${currentContactMessage.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data: ContactApiResponse = await response.json();
    
    if (data.success) {
      await loadContactMessages();
      closeContactMessageModal();
      alert('Mensaje eliminado exitosamente');
    } else {
      alert(data.message || 'Error eliminando mensaje');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error eliminando mensaje');
  }
}

// Cerrar modal de contacts
function closeContactMessageModal(): void {
  getContactPageElement('messageModal').classList.add('hidden');
  currentContactMessage = null;
}

// Exponer funciones al scope global para onclick handlers
(window as any).viewMessage = viewContactMessage;
(window as any).viewContactMessage = viewContactMessage;
(window as any).updateStatus = updateContactFromModalBtn;
(window as any).deleteMessage = deleteContactMessage;
(window as any).closeModal = closeContactMessageModal;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkContactsAuth();
  
  if (isAuthenticated) {
    const loadingScreen = getContactPageElementSafe('loadingScreen');
    const adminContent = getContactPageElementSafe('adminContent');
    
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');
    
    await loadContactMessages();
    
    // Event listeners
    const statusFilter = getContactPageElementSafe<HTMLSelectElement>('statusFilter');
    const closeModalBtn = getContactPageElementSafe('closeModal');
    const updateStatusBtn = getContactPageElementSafe('updateStatusBtn');
    const deleteMessageBtn = getContactPageElementSafe('deleteMessageBtn');
    
    if (statusFilter) {
      statusFilter.addEventListener('change', filterAndRenderContactMessages);
    }
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeContactMessageModal);
    }
    
    if (updateStatusBtn) {
      updateStatusBtn.addEventListener('click', updateContactFromModalBtn);
    }
    
    if (deleteMessageBtn) {
      deleteMessageBtn.addEventListener('click', deleteContactMessage);
    }
  }
});
