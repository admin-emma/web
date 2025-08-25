// src/scripts/admin/banners.ts
declare global {
  interface Window {
    _banners?: any[];
  }
}
export {};

document.addEventListener("DOMContentLoaded", () => {
  const btnNuevoBanner = document.getElementById("btn-nuevo-banner");
  const bannerModal = document.getElementById(
    "banner-modal"
  ) as HTMLElement | null;
  const modalTitle = document.getElementById(
    "modal-title"
  ) as HTMLElement | null;
  const bannerForm = document.getElementById(
    "banner-form"
  ) as HTMLFormElement | null;

  const listEl = document.getElementById("banners-list");
  const totalEl = document.getElementById("total-banners");
  const activosEl = document.getElementById("banners-activos");
  const inactivosEl = document.getElementById("banners-inactivos");
  const conImagenEl = document.getElementById("banners-con-imagen");

  if (!btnNuevoBanner || !bannerModal || !modalTitle || !bannerForm) return;

  // Abrir modal
  btnNuevoBanner.addEventListener("click", () => {
    modalTitle.textContent = "Nuevo Banner";
    (document.getElementById("banner-id") as HTMLInputElement).value = "";
    bannerForm.reset();
    // Ya no existe el checkbox is_active
    bannerModal.classList.remove("hidden");
  });

  // Cerrar modal clic fuera
  bannerModal.addEventListener("click", (e) => {
    if (e.target === bannerModal) bannerModal.classList.add("hidden");
  });

  // Cerrar modal X
  document.getElementById("close-modal")?.addEventListener("click", () => {
    bannerModal.classList.add("hidden");
  });

  // Cancelar
  document.getElementById("cancel-btn")?.addEventListener("click", () => {
    bannerModal.classList.add("hidden");
  });

  // Submit crear/editar
  bannerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(bannerForm);
    const id = (document.getElementById("banner-id") as HTMLInputElement).value;

    let is_active = false;
    if (id) {
      // Si es edición, obtener el estado actual del banner
      const res = await fetch(`/api/notification-banner/${id}`);
      if (res.ok) {
        const b = await res.json();
        is_active = !!b.is_active;
      }
    }

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      banner_type: formData.get("banner_type"),
      show_on_pages: formData.get("show_on_pages"),
      image_url: formData.get("image_url"),
      action_url: formData.get("action_url"),
      action_text: formData.get("action_text"),
      is_active,
      dismissible: formData.get("dismissible") === "on",
      id: id || undefined,
    };

    try {
      const url = id
        ? `/api/notification-banner/${id}`
        : "/api/notification-banner";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al guardar");

      bannerModal.classList.add("hidden");
      bannerForm.reset();
      await actualizarBanners(); // <- re-render sin recargar
    } catch (err) {
      alert("Error al guardar el banner");
    }
  });

  // Delegación: editar / eliminar
  listEl?.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest("[data-action]") as HTMLElement | null;
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!id) return;

    if (action === "edit") {
      // Cargar banner y abrir modal en modo edición
      const res = await fetch(`/api/notification-banner/${id}`);
      if (!res.ok) return alert("No se pudo cargar el banner");
      const b = await res.json();

      (document.getElementById("banner-id") as HTMLInputElement).value = String(
        b.id ?? id
      );
      (document.getElementById("title") as HTMLInputElement).value =
        b.title ?? "";
      (document.getElementById("description") as HTMLTextAreaElement).value =
        b.description ?? "";
      (document.getElementById("banner_type") as HTMLSelectElement).value =
        b.banner_type ?? "system";
      (document.getElementById("show_on_pages") as HTMLSelectElement).value =
        b.show_on_pages ?? "all";
      (document.getElementById("image_url") as HTMLInputElement).value =
        b.image_url ?? "";
      (document.getElementById("action_url") as HTMLInputElement).value =
        b.action_url ?? "";
      (document.getElementById("action_text") as HTMLInputElement).value =
        b.action_text ?? "";
      // El checkbox de activo ya no existe
      (document.getElementById("dismissible") as HTMLInputElement).checked =
        !!b.dismissible;

      modalTitle.textContent = "Editar Banner";
      (document.getElementById("banner-modal") as HTMLElement).classList.remove(
        "hidden"
      );
    }

    if (action === "delete") {
      if (!confirm("¿Eliminar este banner?")) return;
      const res = await fetch(
        `/api/notification-banner?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) return alert("No se pudo eliminar");
      await actualizarBanners();
    }

    if (action === "toggle-active") {
      // Activar/desactivar banner
      const resBanner = await fetch(`/api/notification-banner/${id}`);
      if (!resBanner.ok) return alert("No se pudo cargar el banner");
      const b = await resBanner.json();
      if (b.is_active) {
        // Desactivar el banner
        await fetch(`/api/notification-banner/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...b, is_active: false }),
        });
      } else {
        // Activar este banner y desactivar los demás
        const resBanners = await fetch("/api/notification-banner");
        if (resBanners.ok) {
          const banners = await resBanners.json();
          await Promise.all(
            banners
              .filter((banner) => banner.is_active)
              .map((banner) =>
                fetch(`/api/notification-banner/${banner.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...banner, is_active: false }),
                })
              )
          );
        }
        await fetch(`/api/notification-banner/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...b, is_active: true }),
        });
      }
      await actualizarBanners();
    }
  });

  // ===== Render helpers =====
  function renderList(banners: any[]) {
    if (!listEl) return;
    if (!Array.isArray(banners) || banners.length === 0) {
      listEl.innerHTML = `<div class="col-span-full text-gray-500">Sin banners por ahora.</div>`;
      return;
    }
    listEl.innerHTML = banners
      .map(
        (b) => `
        <div class="border border-gray-200 rounded-xl shadow-sm bg-white flex flex-col">
          ${
            b.image_url
              ? `<div class="mb-4"><img src="${escapeAttr(b.image_url)}" alt="banner" class="w-full h-40 object-cover rounded-t-xl"/></div>`
              : `<div class="mb-4 w-full h-40 flex items-center justify-center bg-gray-100 rounded-t-xl">
                <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>`
          }
          <div class="flex-1 flex flex-col justify-between p-3">
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"/></svg>
                ${escapeHtml(b.title)}
              </h3>
              <p class="text-sm text-gray-600 mb-2">${escapeHtml(b.description ?? "")}</p>
              <div class="flex gap-2 text-xs mb-2">
                <span class="px-2 py-1 rounded-full bg-gray-100 text-gray-700">${escapeHtml(b.banner_type)}</span>
                ${
                  b.is_active
                    ? '<span class="px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><svg class=\"w-3 h-3\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"/></svg>Activo</span>'
                    : '<span class="px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1"><svg class=\"w-3 h-3\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"/></svg>Inactivo</span>'
                }
              </div>
            </div>

          </div>
            <div class="mt-4 p-2 bg-gradient-to-r from-blue-900 to-cyan-600">
              <div class="flex flex-wrap gap-2 justify-center">
                <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1" data-action="edit" data-id="${b.id}">
                  <i class="fas fa-edit text-xs"></i>
                  Editar
                </button>
                <button class="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${b.is_active ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700" : "bg-green-100 hover:bg-green-200 text-green-700"}" data-action="toggle-active" data-id="${b.id}">
                  <i class="fas ${b.is_active ? "fa-eye-slash" : "fa-eye"} text-xs"></i>
                  ${b.is_active ? "Desactivar" : "Activar"}
                </button>
                <button class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1" data-action="delete" data-id="${b.id}">
                  <i class="fas fa-trash text-xs"></i>
                  Eliminar
                </button>
              </div>
            </div>
        </div>`
      )
      .join("");
  }

  function renderStats(banners: any[]) {
    const total = banners.length;
    const activos = banners.filter((b) => !!b.is_active).length;
    const inactivos = total - activos;
    const conImagen = banners.filter((b) => !!b.image_url).length;

    if (totalEl) totalEl.textContent = String(total);
    if (activosEl) activosEl.textContent = String(activos);
    if (inactivosEl) inactivosEl.textContent = String(inactivos);
    if (conImagenEl) conImagenEl.textContent = String(conImagen);
  }

  function escapeHtml(s: string) {
    return (s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!
    );
  }
  function escapeAttr(s: string) {
    return escapeHtml(s);
  }

  // ===== Cargar / actualizar sin recargar la página =====
  async function actualizarBanners() {
    try {
      const res = await fetch("/api/notification-banner");
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      window._banners = data;
      renderList(data);
      renderStats(data);
    } catch (e) {
      console.error("Error loading banners", e);
      if (listEl)
        listEl.innerHTML = `<div class="col-span-full text-red-600">Error cargando banners</div>`;
    }
  }

  // Cargar al iniciar (SIN reload)
  actualizarBanners();
});
