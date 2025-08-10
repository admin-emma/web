// TypeScript para el login del admin
interface LoginResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

// Funciones utilitarias para elementos DOM
function getLoginElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T;
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return element;
}

// Manejar el formulario de login
async function handleLogin(e: Event): Promise<void> {
  e.preventDefault();
  
  const form = e.target as HTMLFormElement;
  const button = getLoginElement<HTMLButtonElement>('loginButton');
  const loginText = getLoginElement('loginText');
  const loginSpinner = getLoginElement('loginSpinner');
  const errorMessage = getLoginElement('errorMessage');
  
  // UI Loading state
  button.disabled = true;
  loginText.classList.add('hidden');
  loginSpinner.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  
  try {
    const formData = new FormData(form);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password')
      })
    });
    
    const data: LoginResponse = await response.json();
    
    if (data.success) {
      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Redirigir al dashboard
      window.location.href = '/admin/dashboard';
    } else {
      errorMessage.textContent = data.message || 'Error de autenticación';
      errorMessage.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error:', error);
    errorMessage.textContent = 'Error de conexión. Intenta nuevamente.';
    errorMessage.classList.remove('hidden');
  } finally {
    // Reset UI
    button.disabled = false;
    loginText.classList.remove('hidden');
    loginSpinner.classList.add('hidden');
  }
}

// Verificar si ya está logueado
function checkExistingAuth(): void {
  const token = localStorage.getItem('auth-token');
  if (token) {
    window.location.href = '/admin/dashboard';
  }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  checkExistingAuth();
  
  const loginForm = getLoginElement<HTMLFormElement>('loginForm');
  loginForm.addEventListener('submit', handleLogin);
});
