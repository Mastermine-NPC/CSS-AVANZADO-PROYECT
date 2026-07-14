import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { db } from './firebase.js';
import { addToCart } from './cart.js';
import { formatPrice, getImagePlaceholder, setupExpandableDescriptions, showAlert } from './ui.js';

const productsCollection = collection(db, 'products');
const fromSnapshot = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

export async function getProducts() {
  const snapshot = await getDocs(query(productsCollection, where('status', '==', 'active')));
  return snapshot.docs.map(fromSnapshot);
}

export async function getProductById(id) {
  const snapshot = await getDoc(doc(db, 'products', id));
  return snapshot.exists() ? fromSnapshot(snapshot) : null;
}

export async function getProductsByOwner(uid) {
  const snapshot = await getDocs(query(productsCollection, where('ownerId', '==', uid)));
  return snapshot.docs.map(fromSnapshot);
}

export async function createProduct(data) {
  return addDoc(productsCollection, {
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category,
    transactionType: data.transactionType,
    price: data.transactionType === 'sale' ? Number(data.price) : 0,
    condition: data.condition,
    imageUrl: data.imageUrl.trim() || getImagePlaceholder(),
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    status: 'active',
    createdAt: serverTimestamp()
  });
}

export function updateProductStatus(id, status) {
  return updateDoc(doc(db, 'products', id), { status });
}

export function transactionLabel(type) {
  return ({ sale: 'Venta', loan: 'Préstamo', exchange: 'Intercambio' })[type] || type;
}

export function renderProducts(products, container, options = {}) {
  container.replaceChildren();
  if (!products.length) {
    const message = document.createElement('p');
    message.className = 'empty-state';
    message.textContent = 'No hay productos para mostrar.';
    container.append(message);
    return;
  }

  products.forEach((product) => {
    const column = document.createElement('div');
    column.className = 'col-12 col-sm-6 col-lg-4 col-xl-3 d-flex fade-in';
    const card = document.createElement('article');
    card.className = 'card product-card h-100 w-100 d-flex flex-column';
    const image = document.createElement('img');
    image.className = 'card-img-top product-card__image';
    image.src = product.imageUrl || getImagePlaceholder();
    image.alt = product.name;
    image.addEventListener('error', () => { image.src = getImagePlaceholder(); }, { once: true });
    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';
    const labels = document.createElement('div');
    labels.className = 'd-flex flex-wrap gap-2 mb-2';
    const category = document.createElement('span');
    category.className = 'badge text-bg-light';
    category.textContent = product.category;
    const type = document.createElement('span');
    type.className = 'badge text-bg-primary';
    type.textContent = transactionLabel(product.transactionType);
    labels.append(category, type);
    if (options.manage) {
      const status = document.createElement('span');
      status.className = product.status === 'active' ? 'badge text-bg-success' : 'badge text-bg-secondary';
      status.textContent = product.status === 'active' ? 'Activo' : 'Inactivo';
      labels.append(status);
    }
    const title = document.createElement('h2');
    title.className = 'h5 card-title';
    title.textContent = product.name;
    const description = document.createElement('p');
    description.className = 'product-description';
    description.id = `product-description-${product.id}`;
    description.dataset.expandableDescription = '';
    description.textContent = product.description;
    const descriptionToggle = document.createElement('button');
    descriptionToggle.className = 'description-toggle';
    descriptionToggle.type = 'button';
    descriptionToggle.hidden = true;
    descriptionToggle.dataset.descriptionToggle = '';
    descriptionToggle.setAttribute('aria-controls', description.id);
    descriptionToggle.setAttribute('aria-expanded', 'false');
    descriptionToggle.textContent = 'Ver más';
    const price = document.createElement('p');
    price.className = 'product-card__price';
    price.textContent = product.transactionType === 'sale' ? formatPrice(product.price) : 'Consultar condiciones';
    const owner = document.createElement('p');
    owner.className = 'product-card__owner';
    owner.textContent = `Por ${product.ownerName}`;
    const actions = document.createElement('div');
    actions.className = 'd-flex flex-wrap gap-2 mt-auto';
    const link = document.createElement('a');
    link.className = 'btn btn-outline-primary flex-grow-1';
    link.href = `/pages/producto.html?id=${encodeURIComponent(product.id)}`;
    link.textContent = 'Ver detalle';
    actions.append(link);
    if (options.manage) {
      const statusButton = document.createElement('button');
      statusButton.className = 'btn btn-primary flex-grow-1';
      statusButton.type = 'button';
      statusButton.textContent = product.status === 'active' ? 'Desactivar' : 'Activar';
      statusButton.addEventListener('click', () => options.onStatusChange?.(product));
      actions.append(statusButton);
    } else if (product.transactionType === 'sale') {
      const cartButton = document.createElement('button');
      cartButton.className = 'btn btn-primary flex-grow-1';
      cartButton.type = 'button';
      cartButton.textContent = 'Agregar al carrito';
      cartButton.addEventListener('click', () => {
        addToCart(product);
        showAlert('Producto agregado al carrito.', 'success');
      });
      actions.append(cartButton);
    }
    body.append(labels, title, description, descriptionToggle, price, owner, actions);
    card.append(image, body);
    column.append(card);
    container.append(column);
  });
  setupExpandableDescriptions(container);
}
