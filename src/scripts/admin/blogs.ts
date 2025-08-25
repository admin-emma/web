// Types
interface Blog {
  id: number;
  title: string;
  description?: string;
  content: string;
  author: string;
  slug: string;
  hero_image?: string;
  status: "draft" | "published";
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

declare global {
  interface Window {
    openForm?: (blog: Blog | null) => void;
    editBlog?: (id: number) => void;
    deleteBlog?: (id: number) => void;
    clearBlogForm?: () => void;
  }
}
export {};

// Variables globales
let blogs: Blog[] = [];
let editingBlog: Blog | null = null;
let copiedComponent: string | null = null;

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
  return localStorage.getItem("auth-token");
};

// Función para hacer peticiones con autenticación
const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

// Inicializar pestañas principales
const initializeMainTabs = (): void => {
  const mainTabButtons =
    document.querySelectorAll<HTMLButtonElement>(".main-tab-button");

  mainTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remover clase activa de todos los botones
      mainTabButtons.forEach((btn) => {
        btn.className =
          "main-tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base flex items-center";
      });

      // Añadir clase activa al botón clickeado
      button.className =
        "main-tab-button bg-white border-blue-500 text-blue-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-base flex items-center";

      // Ocultar todos los paneles principales
      const mainPanels =
        document.querySelectorAll<HTMLDivElement>(".main-tab-panel");
      mainPanels.forEach((panel) => {
        panel.classList.add("hidden");
      });

      // Mostrar el panel correspondiente
      const targetPanel = button.id.replace("-main-tab", "-main-panel");
      const targetPanelElement = getElementSafe<HTMLDivElement>(targetPanel);
      if (targetPanelElement) {
        targetPanelElement.classList.remove("hidden");
      }

      // Si es el panel del formulario, inicializar las sub-pestañas
      if (targetPanel === "form-main-panel") {
        console.log("Initializing form sub-tabs...");
        setTimeout(() => {
          initializeTabs();
          setupComponentButtons();
          setupInlineComponents();
          setupSlugGeneration();
          loadAuthors();
          loadAssets();
          updatePreview();
          console.log("Form sub-tabs initialized");
        }, 100);
      }
    });
  });
};

// Inicializar pestañas del formulario
const initializeTabs = (): void => {
  const tabButtons =
    document.querySelectorAll<HTMLButtonElement>(".tab-button");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remover clase activa de todos los botones
      tabButtons.forEach((btn) => {
        btn.className =
          "tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";
      });

      // Añadir clase activa al botón clickeado
      button.className =
        "tab-button border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";

      // Ocultar todos los paneles
      const panels = document.querySelectorAll<HTMLDivElement>(".tab-panel");
      panels.forEach((panel) => {
        panel.classList.add("hidden");
      });

      // Mostrar el panel correspondiente
      const targetPanel = button.id.replace("-tab", "-panel");
      const targetPanelElement = getElementSafe<HTMLDivElement>(targetPanel);
      if (targetPanelElement) {
        targetPanelElement.classList.remove("hidden");
      }

      // Actualizar vista previa si se cambia a la pestaña de vista previa
      if (targetPanel === "preview-panel") {
        updatePreview();
      }
    });
  });
};

// Configurar botones de componentes
const setupComponentButtons = (): void => {
  const componentButtons =
    document.querySelectorAll<HTMLButtonElement>(".component-btn");

  componentButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const component = button.dataset.component;
      if (component) {
        copiedComponent = component;
        // Copiar al portapapeles
        navigator.clipboard.writeText(component).then(() => {
          showNotification("Componente copiado. Usa el botón 'Pegar componente' para insertarlo.", "success");
        });
        // Habilitar el botón de pegar
        const pasteBtn = getElementSafe<HTMLButtonElement>("pasteComponentBtn");
        if (pasteBtn) pasteBtn.disabled = false;
      }
    });
  });
}

// Botón para pegar componente en el editor
const setupPasteComponentButton = (): void => {
  let pasteBtn = getElementSafe<HTMLButtonElement>("pasteComponentBtn");
  if (!pasteBtn) {
    // Si no existe, lo creamos y lo insertamos cerca del editor
    const editor = getElementSafe<HTMLTextAreaElement>("blogContent");
    if (editor && editor.parentNode) {
      pasteBtn = document.createElement("button");
      pasteBtn.id = "pasteComponentBtn";
      pasteBtn.type = "button";
      pasteBtn.className = "px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded shadow disabled:opacity-50";
      pasteBtn.textContent = "🗏 Pegar componente";
      pasteBtn.disabled = true;
      editor.parentNode.insertBefore(pasteBtn, editor.nextSibling);
    }
  }
  if (pasteBtn) {
    pasteBtn.addEventListener("click", () => {
      if (copiedComponent) {
        insertIntoEditor(copiedComponent);
        pasteBtn.disabled = true;
        copiedComponent = null;
      } else {
        showNotification("No hay componente copiado.", "error");
      }
    });
  }
};

// Cargar usuarios para el select de autor
const loadAuthors = async (): Promise<void> => {
  try {
    const response = await fetch("/api/users/");

    const authorSelect = getElementSafe<HTMLSelectElement>("blogAuthor");
    if (!authorSelect) return;

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.users) {
        // Limpiar opciones existentes (excepto la primera)
        authorSelect.innerHTML =
          '<option value="">Seleccionar autor...</option>';

        // Agregar usuarios como opciones
        result.users.forEach((user: any) => {
          const option = document.createElement("option");
          option.value = user.username;
          option.textContent = `${user.username} (${user.role})`;
          authorSelect.appendChild(option);
        });
      } else {
        console.error("Error al cargar usuarios:", result.message);
        showNotification("Error al cargar la lista de autores", "error");
      }
    } else {
      console.error("Error en la respuesta del servidor");
      showNotification("Error al cargar la lista de autores", "error");
    }
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    showNotification("Error al cargar la lista de autores", "error");
  }
};

// Cargar assets/imágenes
const loadAssets = async (): Promise<void> => {
  try {
    const token = getAuthToken();

    // Cargar solo imágenes de uploads
    const uploadsResponse = await fetch("/api/assets/images?folder=uploads", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const grid = getElement<HTMLDivElement>("assets-grid");
    grid.innerHTML = "";

    if (uploadsResponse.ok) {
      const uploadsResult: ApiResponse<ImageAsset> =
        await uploadsResponse.json();
      if (
        uploadsResult.success &&
        uploadsResult.images &&
        uploadsResult.images.length > 0
      ) {
        uploadsResult.images.forEach((image) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "asset-image-btn relative group cursor-pointer";
          button.innerHTML = `
            <img src="${image.path}" alt="${image.name.replace(/"/g, "&quot;")}" class="w-full h-24 object-cover rounded border">
            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
              <span class="text-white text-sm">Usar como imagen principal</span>
            </div>
          `;

          button.addEventListener("click", () => {
            // Establecer como imagen principal del blog
            const heroImageInput =
              getElementSafe<HTMLInputElement>("blogHeroImage");
            if (heroImageInput) {
              heroImageInput.value = image.path;

              // Mostrar preview de la imagen seleccionada
              const preview =
                getElementSafe<HTMLDivElement>("hero-image-preview");
              if (preview) {
                preview.classList.remove("hidden");
                preview.innerHTML = `
                  <img src="${image.path}" alt="Vista previa" class="w-full h-32 object-cover rounded border">
                  <p class="text-sm text-gray-600 mt-2">Imagen principal: ${image.name}</p>
                `;
              }

              // Mostrar mensaje de confirmación
              showNotification(
                `Imagen "${image.name}" establecida como imagen principal`,
                "success"
              );
            }
          });

          grid.appendChild(button);
        });
      } else {
        grid.innerHTML =
          '<p class="text-gray-500 col-span-full text-center py-8">No hay imágenes disponibles. Sube imágenes desde la pestaña de subida.</p>';
      }
    } else {
      grid.innerHTML =
        '<p class="text-red-500 col-span-full text-center py-8">Error cargando imágenes</p>';
    }
  } catch (error) {
    console.error("Error cargando assets:", error);
    const grid = getElementSafe<HTMLDivElement>("assets-grid");
    if (grid) {
      grid.innerHTML =
        '<p class="text-red-500 col-span-full text-center py-8">Error cargando imágenes</p>';
    }
  }
};

// Mostrar notificaciones
const showNotification = (
  message: string,
  type: "success" | "error" = "success"
): void => {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-4 py-2 rounded shadow-lg z-50`;
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
  const editor = getElement<HTMLTextAreaElement>("blogContent");
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
  const content =
    getElementSafe<HTMLTextAreaElement>("blogContent")?.value || "";
  const title =
    getElementSafe<HTMLInputElement>("blogTitle")?.value ||
    "Vista Previa del Blog";
  const description =
    getElementSafe<HTMLTextAreaElement>("blogDescription")?.value || "";
  const heroImage =
    getElementSafe<HTMLInputElement>("blogHeroImage")?.value || "";

  const previewContainer = getElementSafe<HTMLDivElement>("preview-content");
  if (!previewContainer) return;

  // Convertir markdown mejorado a HTML usando la misma función que el frontend
  const htmlContent = convertMarkdownToHtml(content);

  previewContainer.innerHTML = `
    <article class="max-w-none">
      ${heroImage ? `<img src="${heroImage}" alt="Imagen principal" class="w-full h-64 object-cover rounded-lg mb-6">` : ""}
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">${title}</h1>
        ${description ? `<p class="text-lg text-gray-600 leading-relaxed">${description}</p>` : ""}
      </header>
      <div class="prose prose-lg max-w-none">
        ${htmlContent}
      </div>
    </article>
  `;
};

// Función para convertir Markdown a HTML (duplicada para mantener consistencia)
const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return "";

  // Convertir markdown mejorado a HTML
  let htmlContent = markdown
    // Encabezados
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-semibold mb-3 mt-6">$1</h3>'
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-semibold mb-4 mt-8">$1</h2>'
    )
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>')

    // Separadores horizontales
    .replace(/^---$/gim, '<hr class="border-t-2 border-gray-300 my-6">')

    // Imágenes
    .replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<img src="$2" alt="$1" class="w-full h-auto my-4 rounded">'
    )

    // Texto en negrita y cursiva
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

    // Listas numeradas (primero para evitar conflictos)
    .replace(/^\d+\.\s(.+)$/gim, '<li class="mb-2">$1</li>')

    // Listas con viñetas
    .replace(/^[-*]\s(.+)$/gim, '<li class="mb-2">$1</li>')

    // Citas
    .replace(
      /^>\s(.+)$/gim,
      '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2 my-4">$1</blockquote>'
    )

    // Párrafos (dividir por dobles saltos de línea)
    .split("\n\n")
    .map((paragraph) => {
      paragraph = paragraph.trim();
      if (!paragraph) return "";

      // Si contiene <li>, convertir en lista
      if (paragraph.includes("<li")) {
        const isNumbered = /^\d+\./.test(paragraph);
        const listItems = paragraph.split("\n").filter((line) => line.trim());
        const listType = isNumbered ? "ol" : "ul";
        const listClass = isNumbered
          ? "list-decimal list-inside space-y-2 mb-4"
          : "list-disc list-inside space-y-2 mb-4";
        return `<${listType} class="${listClass}">${listItems.join("")}</${listType}>`;
      }

      // Si ya es un elemento HTML (h1, h2, hr, blockquote), devolverlo tal como está
      if (
        paragraph.startsWith("<h") ||
        paragraph.startsWith("<hr") ||
        paragraph.startsWith("<blockquote")
      ) {
        return paragraph;
      }

      // Si no está vacío, convertir en párrafo
      if (paragraph && !paragraph.startsWith("<")) {
        return `<p class="mb-4 text-gray-800 leading-relaxed">${paragraph.replace(/\n/g, "<br>")}</p>`;
      }

      return paragraph;
    })
    .join("\n");

  return htmlContent;
};

// Cargar blogs
const loadBlogs = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    console.log("Loading blogs with token:", token ? "present" : "missing");

    const response = await fetch("/api/blog", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const result: Blog[] = await response.json();
      console.log("Blogs loaded:", result);

      // La API devuelve directamente el array de blogs
      blogs = Array.isArray(result) ? result : [];
      renderBlogs();
    } else {
      const errorText = await response.text();
      console.error("Error cargando blogs:", response.status, errorText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Renderizar lista de blogs
const renderBlogs = (): void => {
  const container = getElement<HTMLDivElement>("blogsList");

  if (blogs.length === 0) {
    container.innerHTML = `
      <div class="p-6 border-b border-gray-200 flex justify-center">
        <div class="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-xl">
          <i class="fas fa-blog text-4xl text-blue-500 mb-4"></i>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">No hay blogs configurados</h2>
          <p class="text-gray-600 mb-6">Comienza agregando el primer blog para tu plataforma</p>
        </div>
      </div>
    `;
    return;
  }


  // Mostrar los blogs en un grid responsive con cards mejoradas (azul → cyan)
container.innerHTML = `
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    ${blogs.map((blog) => {
      const isPublished = blog.status === "published";
      const statusLabel = isPublished ? "Publicado" : "Borrador";
      const statusClass = isPublished
        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
        : "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200";
      const hero = blog.hero_image && blog.hero_image.trim() !== ""
        ? `
          <div class="relative">
            <img src="${blog.hero_image}"
                 alt="Imagen de ${blog.title}"
                 class="h-36 w-full object-cover rounded-2xl border border-blue-100/50"
                 onerror="this.parentElement.innerHTML='<div class=&quot;h-36 w-full rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center text-blue-400&quot;><svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;currentColor&quot; class=&quot;w-8 h-8&quot;><path d=&quot;M4.5 5.25a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 5.25v13.5A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25zM6 6v9l3.75-3.75a1.5 1.5 0 012.122 0L18 15V6H6z&quot; /></svg></div>';">
            <div class="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/10 to-transparent rounded-t-2xl"></div>
          </div>
        `
        : `
          <div class="h-36 w-full rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 5.25a2.25 2.25 0 012.25-2.25h10.5A2.25 2.25 0 0119.5 5.25v13.5A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25zM6 6v9l3.75-3.75a1.5 1.5 0 012.122 0L18 15V6H6z"/>
            </svg>
          </div>
        `;

      const authorInitial = (blog.author || "?").charAt(0).toUpperCase();

      return `
        <div class="group bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          ${hero}
          <div class="p-4">
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-base font-semibold text-gray-900 line-clamp-2">
                ${blog.title}
              </h3>
              <span class="shrink-0 ml-1 px-2 py-1 text-[11px] rounded-full ${statusClass}">
                ${statusLabel}
              </span>
            </div>

            ${blog.description
              ? `<p class="mt-2 text-sm text-gray-600 line-clamp-3">${blog.description}</p>`
              : ""}

            <div class="mt-3 flex items-center justify-between text-xs text-gray-500">
              <div class="flex items-center gap-2">
                <div class="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center text-[11px] font-semibold shadow-sm">
                  ${authorInitial}
                </div>
                <span class="max-w-[9rem] truncate">Por ${blog.author}</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200">
                ${new Date(blog.pub_date).toLocaleDateString()}
              </span>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <button
                class="edit-blog-btn inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm hover:shadow transition-shadow"
                data-id="${blog.id}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712z"/>
                  <path d="M3 17.25V21h3.75L19.065 8.685l-3.712-3.712L3 17.25z"/>
                </svg>
                Editar
              </button>
              <button
                onclick="deleteBlog(${blog.id})"
                class="inline-flex items-center gap-2 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 bg-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 3.75A1.5 1.5 0 0110.5 2.25h3A1.5 1.5 0 0115 3.75V4.5h4.5a.75.75 0 010 1.5H4.5a.75.75 0 010-1.5H9V3.75z"/>
                  <path d="M6.75 7.5h10.5l-.69 11.04a2.25 2.25 0 01-2.24 2.1H9.68a2.25 2.25 0 01-2.24-2.1L6.75 7.5z"/>
                </svg>
                Eliminar
              </button>
            </div>
          </div>

          <!-- borde de realce al hover con gradiente -->
          <div class="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-2 group-hover:ring-offset-0 group-hover:ring-blue-300/60"></div>
        </div>
      `;
    }).join("")}
  </div>
`;

  // Asignar evento a los botones de editar
  const editBtns = container.querySelectorAll(".edit-blog-btn");
  editBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const target = e.currentTarget as HTMLButtonElement;
      const id = Number(target.dataset.id);
      editBlog(id);
      // Mostrar el formulario y ocultar la lista
      const blogsListView = getElementSafe<HTMLDivElement>("blogsListView");
      const blogFormView = getElementSafe<HTMLDivElement>("blogFormView");
      if (blogsListView && blogFormView) {
        blogsListView.classList.add("hidden");
        blogFormView.classList.remove("hidden");
      }
      // Activar la pestaña de editor por defecto
      const editorTab = getElementSafe<HTMLButtonElement>("editor-tab");
      if (editorTab) editorTab.click();
    });
  });
};

// Abre el formulario en modo creación (null) o edición (con Blog)
const openForm = (blog: Blog | null = null): void => {
  editingBlog = blog;

  // Alternar vistas: ocultar lista, mostrar formulario
  const blogsListView = getElementSafe<HTMLDivElement>("blogsListView");
  const blogFormView = getElementSafe<HTMLDivElement>("blogFormView");
  if (blogsListView && blogFormView) {
    blogsListView.classList.add("hidden");
    blogFormView.classList.remove("hidden");
  }

  // Pequeño delay para asegurar que el DOM del form esté visible
  setTimeout(() => {
    const formTitle = getElementSafe<HTMLHeadingElement>("formTitle");

    if (blog) {
      // ----- MODO EDICIÓN -----
      if (formTitle) formTitle.textContent = "Editar Blog";

      const blogId = getElementSafe<HTMLInputElement>("blogId");
      const blogTitle = getElementSafe<HTMLInputElement>("blogTitle");
      const blogAuthor = getElementSafe<HTMLSelectElement>("blogAuthor");
      const blogDescription =
        getElementSafe<HTMLTextAreaElement>("blogDescription");
      const blogContent = getElementSafe<HTMLTextAreaElement>("blogContent");
      const blogHeroImage = getElementSafe<HTMLInputElement>("blogHeroImage");
      const blogStatus = getElementSafe<HTMLSelectElement>("blogStatus");
      const blogSlug = getElementSafe<HTMLInputElement>("blogSlug");

      if (blogId) blogId.value = String(blog.id);
      if (blogTitle) blogTitle.value = blog.title;
      if (blogAuthor) blogAuthor.value = blog.author;
      if (blogDescription) blogDescription.value = blog.description || "";
      if (blogContent) blogContent.value = blog.content;
      if (blogHeroImage) blogHeroImage.value = blog.hero_image || "";
      if (blogStatus) blogStatus.value = blog.status;
      if (blogSlug) blogSlug.value = blog.slug;

      // Preview de imagen si existe
      const heroPrev = getElementSafe<HTMLDivElement>("hero-image-preview");
      if (heroPrev) {
        if (blog.hero_image && blog.hero_image.trim() !== "") {
          heroPrev.classList.remove("hidden");
          heroPrev.innerHTML = `
            <img src="${blog.hero_image}" alt="Vista previa" class="w-full h-32 object-cover rounded border">
            <p class="text-sm text-gray-600 mt-2">Imagen principal actual</p>
          `;
        } else {
          heroPrev.classList.add("hidden");
          heroPrev.innerHTML = "";
        }
      }
    } else {
      // ----- MODO CREACIÓN -----
      clearBlogForm(); // limpia todo
      // (opcional) asegurar autores cargados para que el select no quede vacío
      loadAuthors();
    }

  // Inicializaciones de UI/UX propias del form
  setupComponentButtons();
  setupPasteComponentButton();
  setupSlugGeneration();
  loadAssets();
  updatePreview();

  // Asegurar pestaña Editor activa visualmente (por si venimos desde otra)
  const editorTab = getElementSafe<HTMLButtonElement>("editor-tab");
  if (editorTab) editorTab.click();
  }, 150);
};

// Editar blog
const editBlog = (id: number): void => {
  const blog = blogs.find((b) => b.id === id);
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
  return (
    title
      .toLowerCase()
      .trim()
      // Reemplazar caracteres especiales y acentos
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Reemplazar espacios y caracteres no permitidos con guiones
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      // Limitar longitud
      .substring(0, 60)
  );
};

// Validar slug
const validateSlug = (slug: string): { valid: boolean; message?: string } => {
  if (!slug || slug.trim() === "") {
    return { valid: false, message: "El slug es requerido" };
  }

  if (slug.length < 3) {
    return {
      valid: false,
      message: "El slug debe tener al menos 3 caracteres",
    };
  }

  if (slug.length > 60) {
    return {
      valid: false,
      message: "El slug no puede tener más de 60 caracteres",
    };
  }

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(slug)) {
    return {
      valid: false,
      message:
        "El slug solo puede contener letras minúsculas, números y guiones",
    };
  }

  return { valid: true };
};

// Configurar generación automática de slug
const setupSlugGeneration = (): void => {
  const titleInput = getElementSafe<HTMLInputElement>("blogTitle");
  const slugInput = getElementSafe<HTMLInputElement>("blogSlug");

  if (titleInput && slugInput) {
    titleInput.addEventListener("input", function () {
      const title = this.value;
      if (title.trim() !== "") {
        const generatedSlug = generateSlug(title);
        slugInput.value = generatedSlug;

        // Validar slug generado
        const validation = validateSlug(generatedSlug);

        // Mostrar indicador visual de validación
        if (validation.valid) {
          slugInput.classList.remove(
            "border-red-300",
            "focus:border-red-500",
            "focus:ring-red-500"
          );
          slugInput.classList.add(
            "border-green-300",
            "focus:border-green-500",
            "focus:ring-green-500"
          );

          // Remover mensaje de error si existe
          const errorMsg = document.getElementById("slug-error");
          if (errorMsg) {
            errorMsg.remove();
          }
        } else {
          slugInput.classList.remove(
            "border-green-300",
            "focus:border-green-500",
            "focus:ring-green-500"
          );
          slugInput.classList.add(
            "border-red-300",
            "focus:border-red-500",
            "focus:ring-red-500"
          );

          // Mostrar mensaje de error
          let errorMsg = document.getElementById("slug-error");
          if (!errorMsg) {
            errorMsg = document.createElement("p");
            errorMsg.id = "slug-error";
            errorMsg.className = "text-red-600 text-xs mt-1";
            slugInput.parentNode?.appendChild(errorMsg);
          }
          errorMsg.textContent = validation.message || "";
        }
      } else {
        slugInput.value = "";
        slugInput.classList.remove(
          "border-red-300",
          "focus:border-red-500",
          "focus:ring-red-500",
          "border-green-300",
          "focus:border-green-500",
          "focus:ring-green-500"
        );

        const errorMsg = document.getElementById("slug-error");
        if (errorMsg) {
          errorMsg.remove();
        }
      }
    });

    // También validar cuando se edite manualmente el slug
    slugInput.addEventListener("input", function () {
      const slug = this.value;
      const validation = validateSlug(slug);

      if (validation.valid) {
        this.classList.remove(
          "border-red-300",
          "focus:border-red-500",
          "focus:ring-red-500"
        );
        this.classList.add(
          "border-green-300",
          "focus:border-green-500",
          "focus:ring-green-500"
        );

        const errorMsg = document.getElementById("slug-error");
        if (errorMsg) {
          errorMsg.remove();
        }
      } else {
        this.classList.remove(
          "border-green-300",
          "focus:border-green-500",
          "focus:ring-green-500"
        );
        this.classList.add(
          "border-red-300",
          "focus:border-red-500",
          "focus:ring-red-500"
        );

        let errorMsg = document.getElementById("slug-error");
        if (!errorMsg) {
          errorMsg = document.createElement("p");
          errorMsg.id = "slug-error";
          errorMsg.className = "text-red-600 text-xs mt-1";
          this.parentNode?.appendChild(errorMsg);
        }
        errorMsg.textContent = validation.message || "";
      }
    });
  }
};

// Limpia por completo el formulario y estado de edición
// Limpia por completo el formulario y el estado de edición
const clearBlogForm = (): void => {
  // Estado
  editingBlog = null;

  // Título del formulario
  const title = getElementSafe<HTMLHeadingElement>("formTitle");
  if (title) title.textContent = "Crear Nuevo Blog";

  // Reset nativo del form
  const form = getElementSafe<HTMLFormElement>("blogFormElement");
  if (form) form.reset();

  // Asegurar que TODOS los campos queden vacíos
  const ids = [
    "blogId",
    "blogTitle",
    "blogAuthor",
    "blogDescription",
    "blogContent",
    "blogHeroImage",
    "blogSlug",
  ];
  ids.forEach((id) => {
    const el = getElementSafe<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(id);
    if (el) (el as HTMLInputElement | HTMLTextAreaElement).value = "";
  });

  // Valor por defecto opcional (recomendado): status = draft
  const status = getElementSafe<HTMLSelectElement>("blogStatus");
  if (status) status.value = "draft";

  // Quitar clases de validación del slug y borrar error
  const slugInput = getElementSafe<HTMLInputElement>("blogSlug");
  if (slugInput) {
    slugInput.classList.remove(
      "border-red-300",
      "focus:border-red-500",
      "focus:ring-red-500",
      "border-green-300",
      "focus:border-green-500",
      "focus:ring-green-500"
    );
  }
  const slugErr = document.getElementById("slug-error");
  if (slugErr) slugErr.remove();

  // Ocultar preview de imagen principal
  const heroPrev = getElementSafe<HTMLDivElement>("hero-image-preview");
  if (heroPrev) {
    heroPrev.classList.add("hidden");
    heroPrev.innerHTML = "";
  }

  // Forzar pestaña "Editor" activa y ocultar las demás
  const editorTab = getElementSafe<HTMLButtonElement>("editor-tab");
  const tabs = [
    getElementSafe<HTMLButtonElement>("editor-tab"),
    getElementSafe<HTMLButtonElement>("components-tab"),
    getElementSafe<HTMLButtonElement>("images-tab"),
    getElementSafe<HTMLButtonElement>("preview-tab"),
  ];
  const panels = [
    getElementSafe<HTMLDivElement>("editor-panel"),
    getElementSafe<HTMLDivElement>("components-panel"),
    getElementSafe<HTMLDivElement>("images-panel"),
    getElementSafe<HTMLDivElement>("preview-panel"),
  ];

  // Marcar visualmente el tab activo
  if (tabs.length) {
    tabs.forEach((t, i) => {
      if (!t) return;
      if (i === 0) {
        t.classList.add("border-blue-500", "text-blue-600");
        t.classList.remove("border-transparent", "text-gray-500");
      } else {
        t.classList.remove("border-blue-500", "text-blue-600");
        t.classList.add("border-transparent", "text-gray-500");
      }
    });
  }

  // Mostrar solo panel de editor
  panels.forEach((p, i) => {
    if (p) p.classList.toggle("hidden", i !== 0);
  });

  // Refrescar vista previa (queda en blanco/estado inicial)
  updatePreview();
};

// Guardar blog
const saveBlog = async (e: Event): Promise<void> => {
  e.preventDefault();

  const formData = {
    title: getElement<HTMLInputElement>("blogTitle").value,
    description: getElement<HTMLTextAreaElement>("blogDescription").value,
    content: getElement<HTMLTextAreaElement>("blogContent").value,
    heroImage: getElement<HTMLInputElement>("blogHeroImage").value,
    status: getElement<HTMLSelectElement>("blogStatus").value as
      | "draft"
      | "published",
    author: getElement<HTMLSelectElement>("blogAuthor").value,
    slug: getElement<HTMLInputElement>("blogSlug").value,
  };

  // Validar imagen principal
  if (formData.heroImage && !validateImagePath(formData.heroImage)) {
    showNotification(
      "La imagen principal debe ser una URL válida o una ruta de uploads (/uploads/archivo.jpg)",
      "error"
    );
    return;
  }

  // Validar slug
  const slugValidation = validateSlug(formData.slug);
  if (!slugValidation.valid) {
    showNotification(`Error en el slug: ${slugValidation.message}`, "error");
    return;
  }

  if (editingBlog) {
    (formData as any).id = getElement<HTMLInputElement>("blogId").value;
  }

  try {
    const method = editingBlog ? "PUT" : "POST";
    const url = editingBlog ? `/api/blog/${editingBlog.id}` : "/api/blog";

    const response = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      showNotification(
        editingBlog
          ? "Blog actualizado exitosamente"
          : "Blog creado exitosamente",
        "success"
      );

      // Recargar blogs y volver a la lista
      await loadBlogs();

      const blogsListView = getElementSafe<HTMLDivElement>("blogsListView");
      const blogFormView = getElementSafe<HTMLDivElement>("blogFormView");
      if (blogsListView && blogFormView) {
        blogFormView.classList.add("hidden");
        blogsListView.classList.remove("hidden");
      }
      clearBlogForm();

      const listTab = getElementSafe<HTMLButtonElement>("list-main-tab");
      if (listTab) {
        listTab.click();
      }

      return;
    } else {
      const errorData = await response.json();
      showNotification(
        errorData.message || "Error al guardar el blog",
        "error"
      );
    }
  } catch (error) {
    console.error("Error guardando blog:", error);
    showNotification("Error al guardar el blog", "error");
  }
};

// Eliminar blog
const deleteBlog = async (id: number): Promise<void> => {
  if (!confirm("¿Estás seguro de que quieres eliminar este blog?")) {
    return;
  }

  try {
    const response = await fetchWithAuth(`/api/blog/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showNotification("Blog eliminado exitosamente", "success");
      await loadBlogs();
    } else {
      const errorData = await response.json();
      showNotification(
        errorData.message || "Error al eliminar el blog",
        "error"
      );
    }
  } catch (error) {
    console.error("Error eliminando blog:", error);
    showNotification("Error al eliminar el blog", "error");
  }
};

// Subir imagen
const uploadImage = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const token = getAuthToken();
    const response = await fetch("/api/upload/image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      showNotification("Imagen subida exitosamente", "success");

      // Recargar assets
      await loadAssets();
    } else {
      const errorData = await response.json();
      showNotification(
        errorData.message || "Error al subir la imagen",
        "error"
      );
    }
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    showNotification("Error al subir la imagen", "error");
  }
};

// Insertar imagen por URL
const insertImageByUrl = (): void => {
  const url = prompt("Ingresa la URL de la imagen:");
  if (url && url.trim() !== "") {
    const markdown = `![Imagen](${url.trim()})\n\n`;
    insertIntoEditor(markdown);
  }
};

// Exponer funciones al scope global para onclick handlers
window.openForm = openForm;
window.editBlog = editBlog;
window.deleteBlog = deleteBlog;
window.clearBlogForm = clearBlogForm;

// Configurar componentes inline en el editor
const setupInlineComponents = (): void => {
  const componentBtnsInline = document.querySelectorAll<HTMLButtonElement>(
    ".component-btn-inline"
  );
  const insertImageBtnInline = getElementSafe<HTMLButtonElement>(
    "insertImageBtnInline"
  );
  const previewDiv = getElementSafe<HTMLDivElement>("inline-component-preview");

  if (componentBtnsInline.length > 0) {
    componentBtnsInline.forEach((btn) => {
      // Vista previa al pasar el cursor
      btn.addEventListener("mouseenter", function () {
        const componentData = this.getAttribute("data-component");
        if (componentData && previewDiv) {
          const previewHtml = convertMarkdownToPreviewHTML(
            componentData.trim()
          );
          previewDiv.innerHTML = `<div class="prose prose-xs">${previewHtml}</div>`;
        }
      });

      // Limpiar vista previa al salir
      btn.addEventListener("mouseleave", function () {
        if (previewDiv) {
          previewDiv.innerHTML =
            '<p class="text-gray-400 italic">Pasa el cursor sobre un componente para ver la vista previa</p>';
        }
      });

      // Insertar componente al hacer clic
      btn.addEventListener("click", function (e) {
        e.preventDefault(); // Prevenir envío del formulario
        const componentData = this.getAttribute("data-component");
        if (componentData) {
          insertIntoEditor(componentData);
        }
      });
    });
  }

  // Botón de insertar imagen inline
  if (insertImageBtnInline) {
    insertImageBtnInline.addEventListener("click", function (e) {
      e.preventDefault(); // Prevenir envío del formulario
      // Cambiar a la tab de imágenes para seleccionar
      const imagesTab = getElementSafe<HTMLButtonElement>("images-tab");
      if (imagesTab) {
        imagesTab.click();
      }
    });
  }
};

// Convertir markdown a HTML para la vista previa inline
const convertMarkdownToPreviewHTML = (markdown: string): string => {
  let html = markdown;

  if (markdown.includes("## ")) {
    html =
      '<h3 class="text-lg font-semibold text-gray-900 mb-2">Subtítulo</h3><p class="text-gray-600">Texto del subtítulo...</p>';
  } else if (markdown.includes("**") && markdown.includes("**")) {
    html = '<p><strong class="font-bold">Texto en negrita</strong></p>';
  } else if (markdown.includes("*") && markdown.includes("*")) {
    html = '<p><em class="italic">Texto en cursiva</em></p>';
  } else if (markdown.includes("- ")) {
    html = `
      <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>Elemento 1</li>
        <li>Elemento 2</li>
        <li>Elemento 3</li>
      </ul>`;
  } else if (markdown.includes("1. ")) {
    html = `
      <ol class="list-decimal list-inside space-y-1 text-gray-700">
        <li>Primer paso</li>
        <li>Segundo paso</li>
        <li>Tercer paso</li>
      </ol>`;
  } else if (markdown.includes("> ")) {
    html = `
      <blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2">
        Esta es una cita importante que quiero destacar en mi artículo.
      </blockquote>`;
  } else if (markdown.includes("---")) {
    html = '<hr class="border-t-2 border-gray-300 my-4">';
  } else if (markdown.includes("&nbsp;")) {
    html =
      '<div class="py-2"><p class="text-gray-500 text-xs">Espacio en blanco</p></div>';
  } else {
    html = '<p class="text-gray-600">Vista previa del componente</p>';
  }

  return html;
};

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar pestañas principales
  initializeMainTabs();

  // Cargar blogs
  loadBlogs();

  // Botones del formulario
  const cancelBtn = getElementSafe<HTMLButtonElement>("cancelFormBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      const blogsListView = getElementSafe<HTMLDivElement>("blogsListView");
      const blogFormView = getElementSafe<HTMLDivElement>("blogFormView");
      if (blogsListView && blogFormView) {
        blogFormView.classList.add("hidden");
        blogsListView.classList.remove("hidden");
      }
      clearBlogForm();
    });
  }
  const form = getElementSafe<HTMLFormElement>("blogFormElement");
  if (form) {
    form.addEventListener("submit", saveBlog);
  }

  // Subida de imágenes
  const imageUpload = getElementSafe<HTMLInputElement>("imageUpload");
  if (imageUpload) {
    imageUpload.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    });
  }

  // Insertar imagen por URL
  const insertImageBtn = getElementSafe<HTMLButtonElement>("insertImageBtn");
  if (insertImageBtn) {
    insertImageBtn.addEventListener("click", insertImageByUrl);
  }

  // Event listener para el campo de imagen principal
  const heroImageInput = getElementSafe<HTMLInputElement>("blogHeroImage");
  if (heroImageInput) {
    heroImageInput.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      const url = target.value;
      const preview = getElementSafe<HTMLDivElement>("hero-image-preview");

      if (preview) {
        if (url && url.trim() !== "") {
          // Mostrar vista previa si hay URL
          preview.classList.remove("hidden");
          preview.innerHTML = `
            <img src="${url}" alt="Vista previa" class="w-full h-32 object-cover rounded border" 
                 onerror="this.parentElement.innerHTML='<div class=&quot;w-full h-32 bg-gray-200 rounded border flex items-center justify-center&quot;><span class=&quot;text-gray-500&quot;>Error cargando imagen</span></div>'">
            <p class="text-sm text-gray-600 mt-2">Imagen principal seleccionada</p>
          `;
        } else {
          // Ocultar vista previa si no hay URL
          preview.classList.add("hidden");
          preview.innerHTML = "";
        }
      }
    });
  }

  // Vista previa en tiempo real
  const contentTextarea = getElementSafe<HTMLTextAreaElement>("blogContent");
  if (contentTextarea) {
    contentTextarea.addEventListener("input", updatePreview);
  }

  const titleInput = getElementSafe<HTMLInputElement>("blogTitle");
  if (titleInput) {
    titleInput.addEventListener("input", updatePreview);
  }

  const descriptionTextarea =
    getElementSafe<HTMLTextAreaElement>("blogDescription");
  if (descriptionTextarea) {
    descriptionTextarea.addEventListener("input", updatePreview);
  }

  // ...existing code...
  // Vista previa al pasar el mouse
  const componentButtons = document.querySelectorAll(".component-btn");
  componentButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      const componentData = button.getAttribute("data-component");
      if (componentData) {
        showComponentPreview(componentData);
      }
    });
  });
});

// Función para mostrar vista previa de componentes
function showComponentPreview(componentMarkdown: string): void {
  const previewElement = getElementSafe<HTMLDivElement>("component-preview");
  if (!previewElement) return;

  // Simular cómo se vería el componente
  let previewHtml = "";

  if (componentMarkdown.includes("## ")) {
    previewHtml = `<h2 class="text-xl font-semibold text-gray-900 mb-3">Subtítulo</h2><p class="text-gray-600">Texto del subtítulo...</p>`;
  } else if (
    componentMarkdown.includes("**") &&
    componentMarkdown.includes("**")
  ) {
    previewHtml = `<p><strong class="font-bold">Texto en negrita</strong></p>`;
  } else if (
    componentMarkdown.includes("*") &&
    componentMarkdown.includes("*")
  ) {
    previewHtml = `<p><em class="italic">Texto en cursiva</em></p>`;
  } else if (componentMarkdown.includes("- ")) {
    previewHtml = `
      <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>Elemento 1</li>
        <li>Elemento 2</li>
        <li>Elemento 3</li>
      </ul>`;
  } else if (componentMarkdown.includes("1. ")) {
    previewHtml = `
      <ol class="list-decimal list-inside space-y-1 text-gray-700">
        <li>Primer paso</li>
        <li>Segundo paso</li>
        <li>Tercer paso</li>
      </ol>`;
  } else if (componentMarkdown.includes("> ")) {
    previewHtml = `
      <blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 py-2">
        Esta es una cita importante que quiero destacar en mi artículo.
      </blockquote>`;
  } else if (componentMarkdown.includes("---")) {
    previewHtml = `<hr class="border-t-2 border-gray-300 my-4">`;
  } else if (componentMarkdown.includes("&nbsp;")) {
    previewHtml = `<div class="py-4"><p class="text-gray-500 text-sm">Espacio en blanco</p></div>`;
  }  else {
    previewHtml = `<p class="text-gray-600">Vista previa del componente</p>`;
  }

  previewElement.innerHTML = previewHtml;
}
