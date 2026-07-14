import { getCurrentUser, getUserProfile, loginUser, registerUser } from './auth.js';
import { addToCart, initCartPage } from './cart.js';
import { initAdminPage } from './admin.js';
import { createProduct, getProductById, getProducts, getProductsByOwner, renderProducts, transactionLabel, updateProductStatus } from './products.js';
import { formatPrice, getImagePlaceholder, renderFooter, renderHeader, showAlert } from './ui.js';

renderHeader();
renderFooter();
const page = document.body.dataset.page;

try {
  if (page === 'home') await loadHome();
  if (page === 'catalog') await loadCatalog();
  if (page === 'product') await loadProduct();
  if (page === 'cart') initCartPage();
  if (page === 'login') initLogin();
  if (page === 'register') initRegister();
  if (page === 'publish') await initPublish();
  if (page === 'my-products') await loadMyProducts();
  if (page === 'profile') await loadProfile();
  if (page === 'admin') await initAdminPage();
} catch (error) {
  console.error(error);
  showAlert(error.message || 'No fue posible completar la operación.');
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/pages/login.html';
    return null;
  }
  const profile = await getUserProfile(user.uid);
  if (profile?.status !== 'active') throw new Error('Tu cuenta no está activa.');
  return { user, profile };
}

async function loadHome() {
  const products = await getProducts();
  renderProducts(products.slice(0, 4), document.querySelector('#latest-products'));
}

async function loadCatalog() {
  const products = await getProducts();
  const container = document.querySelector('#catalog-products');
  const controls = ['#search', '#category-filter', '#type-filter'].map((selector) => document.querySelector(selector));
  const applyFilters = () => {
    const [search, category, type] = controls.map((control) => control.value.toLowerCase());
    const filtered = products.filter((product) => {
      const matchesText = `${product.name} ${product.description}`.toLowerCase().includes(search);
      return matchesText && (!category || product.category.toLowerCase() === category) && (!type || product.transactionType === type);
    });
    renderProducts(filtered, container);
  };
  controls.forEach((control) => control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', applyFilters));
  applyFilters();
}

async function loadProduct() {
  const id = new URLSearchParams(window.location.search).get('id');
  const product = id ? await getProductById(id) : null;
  const host = document.querySelector('#product-detail');
  if (!product) {
    host.textContent = 'Producto no encontrado.';
    return;
  }
  const image = host.querySelector('[data-product-image]');
  image.src = product.imageUrl || getImagePlaceholder();
  image.alt = product.name;
  image.addEventListener('error', () => { image.src = getImagePlaceholder(); }, { once: true });
  host.querySelector('[data-product-name]').textContent = product.name;
  host.querySelector('[data-product-description]').textContent = product.description;
  host.querySelector('[data-product-category]').textContent = product.category;
  host.querySelector('[data-product-type]').textContent = transactionLabel(product.transactionType);
  host.querySelector('[data-product-condition]').textContent = product.condition;
  host.querySelector('[data-product-price]').textContent = product.transactionType === 'sale' ? formatPrice(product.price) : 'No aplica';
  host.querySelector('[data-product-owner]').textContent = product.ownerName;
  host.querySelector('[data-product-status]').textContent = product.status === 'active' ? 'Activo' : 'Inactivo';
  const addButton = host.querySelector('#add-to-cart');
  if (product.transactionType !== 'sale') addButton.remove();
  else addButton.addEventListener('click', () => {
    addToCart(product);
    showAlert('Producto agregado al carrito.', 'success');
  });
}

function initLogin() {
  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await loginUser(form.get('email'), form.get('password'));
      window.location.href = '/pages/catalogo.html';
    } catch (error) { showAlert(error.message); }
  });
}

function initRegister() {
  document.querySelector('#register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await registerUser(form);
      window.location.href = '/pages/catalogo.html';
    } catch (error) { showAlert(error.message); }
  });
}

async function initPublish() {
  const session = await requireUser();
  if (!session) return;
  const type = document.querySelector('#transactionType');
  const price = document.querySelector('#price');
  const description = document.querySelector('#description');
  const counter = document.querySelector('#description-count');
  const updateCounter = () => { counter.textContent = `${description.value.length} / 500 caracteres`; };
  description.addEventListener('input', updateCounter);
  updateCounter();
  const syncPrice = () => {
    price.disabled = type.value !== 'sale';
    price.required = type.value === 'sale';
    if (price.disabled) price.value = '';
  };
  type.addEventListener('change', syncPrice);
  syncPrice();
  document.querySelector('#publish-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    await createProduct({ ...data, ownerId: session.user.uid, ownerName: session.profile.name });
    window.location.href = '/pages/mis-productos.html';
  });
}

async function loadMyProducts() {
  const session = await requireUser();
  if (!session) return;
  const products = await getProductsByOwner(session.user.uid);
  const container = document.querySelector('#my-products-grid');
  if (!products.length) document.querySelector('#my-products-empty').classList.remove('d-none');
  const renderOwnedProducts = () => renderProducts(products, container, {
    manage: true,
    onStatusChange: async (product) => {
      const nextStatus = product.status === 'active' ? 'inactive' : 'active';
      await updateProductStatus(product.id, nextStatus);
      product.status = nextStatus;
      renderOwnedProducts();
    }
  });
  renderOwnedProducts();
}

async function loadProfile() {
  const session = await requireUser();
  if (!session) return;
  ['name', 'email', 'career', 'campus'].forEach((field) => {
    document.querySelector(`[data-profile-${field}]`).textContent = session.profile[field] || '—';
  });
  if (session.profile.role === 'admin') document.querySelector('#admin-link').classList.remove('d-none');
}
