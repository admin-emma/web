// users.ts - Gestión de usuarios

// Funciones de gestión de usuarios
function initializeUsersPage(): void {
  setupUsersTabs();
  setupUsersForms();
  showUsersListFunc();
}

function setupUsersTabs(): void {
  const tabButtons = document.querySelectorAll('.main-tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const buttonId = (e.target as HTMLElement).id;
      const tabName = buttonId.replace('-tab', '');
      switchUsersTabFunc(tabName);
    });
  });
}

function setupUsersForms(): void {
  const createForm = document.getElementById('create-user-form');
  const passwordForm = document.getElementById('change-password-form');

  if (createForm) {
    createForm.addEventListener('submit', createUserFunc);
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', changePasswordFunc);
  }
}

function switchUsersTabFunc(tabName: string): void {
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
  if (tabName === 'list-users') {
    showUsersListFunc();
  }
}

async function showUsersListFunc(): Promise<void> {
  try {
    const response = await fetch('/api/users/');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al cargar usuarios');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al cargar usuarios');
    }

    const users = result.users;
    const usersList = document.getElementById('users-list');
    
    if (!usersList) return;

    if (users.length === 0) {
      usersList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-users text-4xl mb-4"></i>
          <p>No hay usuarios registrados</p>
        </div>
      `;
      return;
    }

    usersList.innerHTML = users.map((user: any) => `
      <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-indigo-600"></i>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-medium text-gray-900">${user.username}</h4>
            <p class="text-sm text-gray-500">
              Rol: <span class="capitalize">${user.role || 'admin'}</span>
            </p>
            <p class="text-xs text-gray-400">
              Creado: ${new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          ${user.id !== 1 ? `
            <button
              onclick="deleteUserFunc(${user.id})"
              class="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
            >
              <i class="fas fa-trash mr-1"></i>
              Eliminar
            </button>
          ` : `
            <span class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">
              <i class="fas fa-crown mr-1"></i>
              Admin Principal
            </span>
          `}
        </div>
      </div>
    `).join('');

  } catch (error: any) {
    console.error('Error:', error);
    const usersList = document.getElementById('users-list');
    if (usersList) {
      if (error.message.includes('sesión')) {
        usersList.innerHTML = `
          <div class="text-center py-8 text-yellow-600">
            <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p class="text-lg font-medium mb-2">Sesión requerida</p>
            <p class="text-sm mb-4">${error.message}</p>
            <a href="/admin" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              <i class="fas fa-sign-in-alt mr-2"></i>
              Ir al Login
            </a>
          </div>
        `;
      } else {
        usersList.innerHTML = `
          <div class="text-center py-8 text-red-500">
            <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p>Error al cargar usuarios: ${error.message}</p>
          </div>
        `;
      }
    }
  }
}

async function createUserFunc(event: Event): Promise<void> {
  event.preventDefault();
  
  const form = event.target as HTMLFormElement;
  
  const username = (document.getElementById('new-username') as HTMLInputElement).value;
  const password = (document.getElementById('new-password') as HTMLInputElement).value;
  const role = (document.getElementById('new-role') as HTMLSelectElement).value;

  if (!username || !password || !role) {
    alert('Todos los campos son obligatorios');
    return;
  }

  try {
    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        role
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear usuario');
    }

    // Limpiar formulario
    form.reset();
    
    // Mostrar mensaje de éxito
    alert('Usuario creado exitosamente');
    
    // Cambiar a la pestaña de lista y recargar
    switchUsersTabFunc('list-users');
    
  } catch (error: any) {
    console.error('Error:', error);
    alert(error.message || 'Error al crear usuario');
  }
}

async function changePasswordFunc(event: Event): Promise<void> {
  event.preventDefault();
  
  const form = event.target as HTMLFormElement;
  
  const currentPassword = (document.getElementById('current-password') as HTMLInputElement).value;
  const newPassword = (document.getElementById('new-user-password') as HTMLInputElement).value;
  const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('Todos los campos son obligatorios');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  if (newPassword.length < 6) {
    alert('La nueva contraseña debe tener al menos 6 caracteres');
    return;
  }

  try {
    const response = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cambiar contraseña');
    }

    // Limpiar formulario
    form.reset();
    
    // Mostrar mensaje de éxito
    alert('Contraseña cambiada exitosamente');
    
  } catch (error: any) {
    console.error('Error:', error);
    alert(error.message || 'Error al cambiar contraseña');
  }
}

async function deleteUserFunc(userId: number): Promise<void> {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    return;
  }

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar usuario');
    }

    alert('Usuario eliminado exitosamente');
    showUsersListFunc(); // Recargar lista
    
  } catch (error: any) {
    console.error('Error:', error);
    alert(error.message || 'Error al eliminar usuario');
  }
}

// Exponer funciones al contexto global para uso en HTML
(window as any).deleteUserFunc = deleteUserFunc;

// Inicializar la página cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initializeUsersPage();
});
