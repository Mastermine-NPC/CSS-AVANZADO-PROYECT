export function getImagePlaceholder() { return '/assets/img/product-placeholder.svg'; }

export function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(Number(value || 0));
}

const expandableContainers = new Set();
let resizeTimer;

function refreshExpandableDescriptions(container) {
  container.querySelectorAll('[data-expandable-description]').forEach((description) => {
    const button = description.nextElementSibling;
    if (!button?.matches('[data-description-toggle]')) return;
    const wasExpanded = description.classList.contains('is-expanded');
    description.classList.remove('is-expanded');
    const isClipped = description.scrollHeight > description.clientHeight + 1;
    button.hidden = !isClipped;
    if (isClipped && wasExpanded) description.classList.add('is-expanded');
    if (!isClipped) {
      button.textContent = 'Ver más';
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

export function setupExpandableDescriptions(container) {
  if (!container) return;
  expandableContainers.add(container);
  container.querySelectorAll('[data-expandable-description]').forEach((description) => {
    const button = description.nextElementSibling;
    if (!button?.matches('[data-description-toggle]') || button.dataset.ready) return;
    button.dataset.ready = 'true';
    button.addEventListener('click', () => {
      const expanded = description.classList.toggle('is-expanded');
      button.textContent = expanded ? 'Ver menos' : 'Ver más';
      button.setAttribute('aria-expanded', String(expanded));
    });
  });
  requestAnimationFrame(() => refreshExpandableDescriptions(container));
}

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    expandableContainers.forEach((container) => {
      if (container.isConnected) refreshExpandableDescriptions(container);
      else expandableContainers.delete(container);
    });
  }, 150);
});

export function showAlert(message, type = 'danger') {
  const host = document.querySelector('#alert-container') || document.body;
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.setAttribute('role', 'alert');
  alert.textContent = message;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'btn-close';
  close.dataset.bsDismiss = 'alert';
  close.setAttribute('aria-label', 'Cerrar');
  alert.append(close);
  host.prepend(alert);
}

export function renderHeader() {
  const host = document.querySelector('#site-header');
  if (!host) return;
  host.innerHTML = `
    <nav class="navbar navbar-expand-lg site-navbar" aria-label="Navegación principal">
      <div class="container">
        <a class="navbar-brand fw-bold text-primary" href="/index.html">UTP Marketplace</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Abrir navegación"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="mainNav"><ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
          <li class="nav-item"><a class="nav-link" href="/pages/catalogo.html">Catálogo</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/mis-productos.html">Mis productos</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/publicar-producto.html">Publicar</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/carrito.html">Carrito</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/perfil.html">Perfil</a></li>
          <li class="nav-item" id="auth-nav"><a class="btn btn-primary ms-lg-2" href="/pages/login.html">Ingresar</a></li>
        </ul></div>
      </div>
    </nav>`;
  import('./auth.js').then(async ({ getCurrentUser, logoutUser }) => {
    const user = await getCurrentUser();
    if (!user) return;
    const button = document.createElement('button');
    button.className = 'btn btn-outline-primary ms-lg-2';
    button.type = 'button';
    button.textContent = 'Cerrar sesión';
    button.addEventListener('click', async () => {
      await logoutUser();
      window.location.href = '/index.html';
    });
    document.querySelector('#auth-nav').replaceChildren(button);
  }).catch(() => {});
}

export function renderFooter() {
  const host = document.querySelector('#site-footer');
  if (!host) return;
  host.className = 'site-footer mt-auto';
  const text = document.createElement('p');
  text.className = 'container mb-0 text-center';
  const brand = document.createElement('span');
  brand.className = 'site-footer__brand';
  brand.textContent = 'UTP Marketplace';
  text.append(brand, ` · Proyecto académico · ${new Date().getFullYear()}`);
  host.append(text);
}
