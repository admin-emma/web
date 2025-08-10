// TypeScript para la gestión de reclutamiento del admin
interface Recruitment {
  id: number;
  name: string;
  email: string;
  phone: string;
  position?: string;
  position_id?: number; // Nueva relación con job_positions
  experience: string;
  salary_expectation?: string;
  cv_path?: string;
  cover_letter?: string;
  status: 'new' | 'reviewing' | 'interview' | 'hired' | 'rejected';
  created_at: string;
}

interface RecruitmentApiResponse {
  success: boolean;
  message?: string;
}

interface JobPosition {
  id: number;
  title: string;
}

// Variables globales
let recruitments: Recruitment[] = [];
let currentRecruitment: Recruitment | null = null;
let allPositions: JobPosition[] = [];

// Funciones utilitarias para elementos DOM
function getRecruitmentElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T;
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return element;
}

function getRecruitmentElementSafe<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// Verificar autenticación para recruitment
async function checkRecruitmentAuth(): Promise<boolean> {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    window.location.href = '/admin';
    return false;
  }
  return true;
}

// Cargar posiciones disponibles
async function loadPositions(): Promise<void> {
  const token = localStorage.getItem('auth-token');
  
  try {
    const response = await fetch('/api/job-positions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Error cargando posiciones');
    
    allPositions = await response.json();
  } catch (error) {
    console.error('Error cargando posiciones:', error);
    // Continuar sin posiciones, usaremos fallback
  }
}

// Cargar aplicaciones
async function loadRecruitments(): Promise<void> {
  const token = localStorage.getItem('auth-token');
  
  try {
    const response = await fetch('/api/recruitment', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Error cargando aplicaciones');
    
    recruitments = await response.json();
    filterAndRenderRecruitments();
  } catch (error) {
    console.error('Error:', error);
    alert('Error cargando aplicaciones');
  }
}

// Filtrar y renderizar aplicaciones
function filterAndRenderRecruitments(): void {
  const statusFilter = getRecruitmentElement<HTMLSelectElement>('statusFilter');
  const positionFilter = getRecruitmentElement<HTMLSelectElement>('positionFilter');
  
  let filteredRecruitments = recruitments;
  
  if (statusFilter.value !== 'all') {
    filteredRecruitments = filteredRecruitments.filter(r => r.status === statusFilter.value);
  }
  
  if (positionFilter.value !== 'all') {
    filteredRecruitments = filteredRecruitments.filter(r => {
      // Primero intentar filtrar por position_id (nuevos registros)
      if (r.position_id) {
        return r.position_id.toString() === positionFilter.value;
      }
      // Si no hay position_id, usar position (registros antiguos)
      return r.position === positionFilter.value;
    });
  }
  
  renderRecruitments(filteredRecruitments);
}

// Renderizar lista de aplicaciones
function renderRecruitments(recruitmentsToRender: Recruitment[]): void {
  const container = getRecruitmentElement('recruitmentsList');
  
  if (recruitmentsToRender.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-gray-500">
        <p>No hay aplicaciones que coincidan con los filtros seleccionados.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = recruitmentsToRender.map(recruitment => {
    const statusColor = getRecruitmentStatusColor(recruitment.status);
    const statusText = getRecruitmentStatusText(recruitment.status);
    const positionText = getPositionText(recruitment);
    
    return `
      <div class="p-6 hover:bg-gray-50 cursor-pointer" onclick="viewApplication(${recruitment.id})">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <h3 class="text-lg font-medium text-gray-900">${recruitment.name}</h3>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                ${statusText}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1">${recruitment.email}</p>
            <p class="text-sm text-gray-500">Teléfono: ${recruitment.phone}</p>
            <p class="text-sm text-gray-700 mt-2 font-medium">${positionText}</p>
            <p class="text-sm text-gray-600">Experiencia: ${recruitment.experience}</p>
            ${recruitment.salary_expectation ? `<p class="text-sm text-gray-600">Expectativa salarial: ${formatSalaryExpectation(recruitment.salary_expectation)}</p>` : ''}
            <p class="text-xs text-gray-500 mt-2">
              Aplicó: ${new Date(recruitment.created_at).toLocaleString()}
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

// Obtener color del estado para recruitment
function getRecruitmentStatusColor(status: Recruitment['status']): string {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'reviewing': return 'bg-yellow-100 text-yellow-800';
    case 'interview': return 'bg-purple-100 text-purple-800';
    case 'hired': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Obtener texto del estado para recruitment
function getRecruitmentStatusText(status: Recruitment['status']): string {
  switch (status) {
    case 'new': return 'Nuevo';
    case 'reviewing': return 'En revisión';
    case 'interview': return 'Entrevista';
    case 'hired': return 'Contratado';
    case 'rejected': return 'Rechazado';
    default: return status;
  }
}

// Ver aplicación completa
function viewApplication(id: number): void {
  const recruitment = recruitments.find(r => r.id === id);
  if (!recruitment) return;
  
  currentRecruitment = recruitment;
  
  // Llenar modal con datos de la aplicación
  const applicationContent = getRecruitmentElement('applicationContent');
  applicationContent.innerHTML = `
    <div class="space-y-3">
      <div><strong>Nombre:</strong> ${recruitment.name}</div>
      <div><strong>Email:</strong> <a href="mailto:${recruitment.email}" class="text-indigo-600 hover:text-indigo-500">${recruitment.email}</a></div>
      <div><strong>Teléfono:</strong> <a href="tel:${recruitment.phone}" class="text-indigo-600 hover:text-indigo-500">${recruitment.phone}</a></div>
      <div><strong>Posición:</strong> ${getPositionText(recruitment)}</div>
      <div><strong>Experiencia:</strong> ${recruitment.experience}</div>
      ${recruitment.salary_expectation ? `<div><strong>Expectativa salarial:</strong> ${formatSalaryExpectation(recruitment.salary_expectation)}</div>` : ''}
      <div><strong>Fecha de aplicación:</strong> ${new Date(recruitment.created_at).toLocaleString()}</div>
      ${recruitment.cv_path ? `<div><strong>CV:</strong> <a href="/${recruitment.cv_path}" target="_blank" class="text-indigo-600 hover:text-indigo-500">Descargar CV</a></div>` : ''}
      ${recruitment.cover_letter ? `
        <div class="pt-3 border-t">
          <strong>Carta de presentación:</strong>
          <div class="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">${recruitment.cover_letter}</div>
        </div>
      ` : ''}
    </div>
  `;
  
  // Establecer estado actual
  const statusSelect = getRecruitmentElement<HTMLSelectElement>('newStatus');
  statusSelect.value = recruitment.status;
  
  // Mostrar modal
  getRecruitmentElement('applicationModal').classList.remove('hidden');
}

// Actualizar estado de la aplicación desde modal
async function updateRecruitmentFromModal(): Promise<void> {
  if (!currentRecruitment) return;
  
  const statusSelect = getRecruitmentElement<HTMLSelectElement>('newStatus');
  const newStatus = statusSelect.value as Recruitment['status'];
  
  await updateRecruitmentStatus(currentRecruitment.id, newStatus);
}

// Función auxiliar para actualizar estado
async function updateRecruitmentStatus(id: number, status: Recruitment['status']): Promise<void> {
  const token = localStorage.getItem('auth-token');
  
  try {
    const response = await fetch('/api/recruitment', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, status })
    });
    
    const data: RecruitmentApiResponse = await response.json();
    
    if (data.success) {
      // Actualizar aplicación en la lista local
      const recruitmentIndex = recruitments.findIndex(r => r.id === id);
      if (recruitmentIndex !== -1) {
        recruitments[recruitmentIndex].status = status;
        filterAndRenderRecruitments();
      }
      
      if (currentRecruitment && currentRecruitment.id === id) {
        currentRecruitment.status = status;
      }
      
      alert('Estado actualizado exitosamente');
    } else {
      alert(data.message || 'Error actualizando estado');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error actualizando estado');
  }
}

// Eliminar aplicación
async function deleteApplication(): Promise<void> {
  if (!currentRecruitment) return;
  
  if (!confirm('¿Estás seguro de que quieres eliminar esta aplicación?')) return;
  
  const token = localStorage.getItem('auth-token');
  
  try {
    const response = await fetch(`/api/recruitment?id=${currentRecruitment.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data: RecruitmentApiResponse = await response.json();
    
    if (data.success) {
      await loadRecruitments();
      closeRecruitmentModal();
      alert('Aplicación eliminada exitosamente');
    } else {
      alert(data.message || 'Error eliminando aplicación');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error eliminando aplicación');
  }
}

// Cerrar modal
// Cerrar modal de recruitment
function closeRecruitmentModal(): void {
  getRecruitmentElement('applicationModal').classList.add('hidden');
  currentRecruitment = null;
}

// Exponer funciones al scope global para onclick handlers
(window as any).viewApplication = viewApplication;
(window as any).updateStatus = updateRecruitmentFromModal;
(window as any).deleteApplication = deleteApplication;
(window as any).closeModal = closeRecruitmentModal;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await checkRecruitmentAuth();
  
  if (isAuthenticated) {
    const loadingScreen = getRecruitmentElementSafe('loadingScreen');
    const adminContent = getRecruitmentElementSafe('adminContent');
    
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');
    
    await loadPositions();
    await loadRecruitments();
    
    // Event listeners
    const statusFilter = getRecruitmentElementSafe<HTMLSelectElement>('statusFilter');
    const positionFilter = getRecruitmentElementSafe<HTMLSelectElement>('positionFilter');
    const closeModalBtn = getRecruitmentElementSafe('closeModal');
    const updateStatusBtn = getRecruitmentElementSafe('updateStatusBtn');
    const deleteApplicationBtn = getRecruitmentElementSafe('deleteApplicationBtn');
    
    if (statusFilter) {
      statusFilter.addEventListener('change', filterAndRenderRecruitments);
    }
    
    if (positionFilter) {
      positionFilter.addEventListener('change', filterAndRenderRecruitments);
    }
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeRecruitmentModal);
    }
    
    if (updateStatusBtn) {
      updateStatusBtn.addEventListener('click', updateRecruitmentFromModal);
    }
    
    if (deleteApplicationBtn) {
      deleteApplicationBtn.addEventListener('click', deleteApplication);
    }

    // Configurar pestañas
    setupRecruitmentTabs();
    
    // Configurar formulario de creación
    setupCreateForm();
  }
});

// Configurar pestañas
function setupRecruitmentTabs(): void {
  const listTab = getRecruitmentElementSafe('list-tab');
  const createTab = getRecruitmentElementSafe('create-tab');

  if (listTab) {
    listTab.addEventListener('click', () => switchRecruitmentTab('list'));
  }

  if (createTab) {
    createTab.addEventListener('click', () => switchRecruitmentTab('create'));
  }
}

function switchRecruitmentTab(tabName: string): void {
  // Ocultar todos los paneles
  const panels = document.querySelectorAll('.main-tab-panel');
  panels.forEach(panel => panel.classList.add('hidden'));

  // Remover clase activa de todos los botones
  const buttons = document.querySelectorAll('.main-tab-button');
  buttons.forEach(button => {
    button.classList.remove('bg-white', 'border-indigo-500', 'text-indigo-600');
    button.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
  });

  // Mostrar panel activo
  const activePanel = document.getElementById(`${tabName}-panel`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
  }

  // Activar botón correspondiente
  const activeButton = document.getElementById(`${tabName}-tab`);
  if (activeButton) {
    activeButton.classList.add('bg-white', 'border-indigo-500', 'text-indigo-600');
    activeButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
  }

  // Cargar contenido específico si es necesario
  if (tabName === 'list') {
    loadRecruitments();
  }
}

// Configurar formulario de creación
function setupCreateForm(): void {
  const createForm = getRecruitmentElementSafe('create-recruitment-form');
  const cancelBtn = getRecruitmentElementSafe('cancelCreate');

  if (createForm) {
    createForm.addEventListener('submit', createRecruitment);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      switchRecruitmentTab('list');
      if (createForm) {
        (createForm as HTMLFormElement).reset();
      }
    });
  }
}

// Crear nueva aplicación de reclutamiento
async function createRecruitment(event: Event): Promise<void> {
  event.preventDefault();
  
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  
  // Obtener los valores del formulario
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const position = formData.get('position') as string;
  const experience = formData.get('experience') as string;
  const salaryExpectation = formData.get('salaryExpectation') as string;
  const coverLetter = formData.get('coverLetter') as string;

  // Validación básica
  if (!name || !email || !position) {
    alert('Por favor completa todos los campos requeridos');
    return;
  }

  // Crear FormData para envío (compatible con API que maneja archivos)
  const submitData = new FormData();
  submitData.append('nombre', name);
  submitData.append('email', email);
  submitData.append('telefono', phone || '');
  submitData.append('posicion', position);
  submitData.append('position_id', position); // El valor ya es el ID de la posición
  submitData.append('experiencia', experience || '');
  submitData.append('salario', salaryExpectation || '');
  submitData.append('carta', coverLetter || '');

  try {
    const response = await fetch('/api/recruitment', {
      method: 'POST',
      body: submitData // Enviar como FormData, no JSON
    });

    const result = await response.json();

    if (result.success) {
      alert('Candidato agregado exitosamente');
      form.reset();
      switchRecruitmentTab('list');
      await loadRecruitments();
    } else {
      alert(result.message || 'Error al agregar candidato');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al agregar candidato');
  }
}

// Obtener texto de la posición
function getPositionText(recruitment: Recruitment): string {
  // Si tiene position_id, buscar en allPositions
  if (recruitment.position_id && allPositions) {
    const position = allPositions.find((p: JobPosition) => p.id === recruitment.position_id);
    return position ? position.title : 'Posición no encontrada';
  }
  
  // Si no, usar position (datos antiguos)
  if (recruitment.position) {
    const positions: { [key: string]: string } = {
      'backend-junior-net': 'Backend Junior .NET',
      'frontend-react-senior': 'Frontend React Senior',
      'frontend-react-junior': 'Frontend React Junior',
      'desarrollador-kotlin': 'Desarrollador Kotlin + React Native',
      'arquitecto-software': 'Arquitecto de Software',
      'tech-lead': 'Tech Lead',
      'desarrollador-fullstack': 'Desarrollador Fullstack',
      'ui-ux-designer': 'UI/UX Designer',
      'product-manager': 'Product Manager',
      'data-analyst': 'Analista de Datos',
      'hr-specialist': 'Especialista en RRHH',
      'sales-executive': 'Ejecutivo de Ventas',
      'customer-success': 'Customer Success',
      'qa-engineer': 'QA Engineer',
      'devops-engineer': 'DevOps Engineer',
      'marketing-specialist': 'Especialista en Marketing'
    };
    
    return positions[recruitment.position] || recruitment.position;
  }
  
  return 'Sin posición';
}

// Formatear expectativa salarial
function formatSalaryExpectation(salary: string): string {
  if (!salary) return '';
  
  const salaryMap: { [key: string]: string } = {
    '2000-3000': 'S/ 2,000 - S/ 3,000',
    '3000-4500': 'S/ 3,000 - S/ 4,500', 
    '4500-6000': 'S/ 4,500 - S/ 6,000',
    '6000-8000': 'S/ 6,000 - S/ 8,000',
    '8000-10000': 'S/ 8,000 - S/ 10,000',
    '10000+': 'S/ 10,000+',
    'negociable': 'A negociar',
    // Mapeo para valores antiguos en dólares (por retrocompatibilidad)
    '600-800': 'S/ 2,000 - S/ 3,000',
    '800-1200': 'S/ 3,000 - S/ 4,500',
    '1200-1600': 'S/ 4,500 - S/ 6,000',
    '1600-2000': 'S/ 6,000 - S/ 8,000',
    '2000-2500': 'S/ 8,000 - S/ 10,000',
    '2500+': 'S/ 10,000+'
  };
  
  return salaryMap[salary] || salary;
}
