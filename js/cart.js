import { formatPrice, getImagePlaceholder, showAlert } from './ui.js';

const CART_KEY = 'utpMarketplaceCart';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}

export function addToCart(product) {
  const cart = getCart();
  if (!cart.some((item) => item.id === product.id)) {
    cart.push({ id: product.id, name: product.name, price: Number(product.price), imageUrl: product.imageUrl });
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}

export function clearCart() { localStorage.removeItem(CART_KEY); }

export function calculateTotal() {
  return getCart().reduce((total, item) => total + Number(item.price || 0), 0);
}

export function renderCart() {
  const container = document.querySelector('#cart-items');
  const total = document.querySelector('#cart-total');
  if (!container || !total) return;
  const cart = getCart();
  container.replaceChildren();
  if (!cart.length) container.textContent = 'Tu carrito está vacío.';
  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item d-flex align-items-center gap-3';
    const image = document.createElement('img');
    image.className = 'product-thumbnail';
    image.src = item.imageUrl || getImagePlaceholder();
    image.alt = item.name;
    const info = document.createElement('div');
    info.className = 'flex-grow-1';
    const name = document.createElement('h2');
    name.className = 'h6 mb-1';
    name.textContent = item.name;
    const price = document.createElement('p');
    price.className = 'mb-0';
    price.textContent = formatPrice(item.price);
    const remove = document.createElement('button');
    remove.className = 'btn btn-sm btn-outline-danger';
    remove.type = 'button';
    remove.textContent = 'Eliminar';
    remove.addEventListener('click', () => { removeFromCart(item.id); renderCart(); });
    info.append(name, price);
    row.append(image, info, remove);
    container.append(row);
  });
  total.textContent = formatPrice(calculateTotal());
}

export function initCartPage() {
  renderCart();
  document.querySelector('#clear-cart')?.addEventListener('click', () => {
    clearCart();
    renderCart();
    showAlert('Carrito vaciado.', 'success');
  });
}
