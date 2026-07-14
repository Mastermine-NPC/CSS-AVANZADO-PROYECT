import { APP_CONFIG } from '../config/app-config.js';
import { getFirebaseServices } from './firebase-app.js';
import { getCurrentUserProfile } from './user-service.js';
import { uploadProductImages, deleteProductImages as removeImages } from './storage-service.js';

const ALLOWED_FIELDS = ['title', 'description', 'category', 'transactionType', 'price', 'condition', 'campus', 'quantity', 'exchangePreferences', 'loanConditions'];
const cleanProduct = data => Object.fromEntries(ALLOWED_FIELDS.map(key => [key, data[key] ?? (['price', 'quantity'].includes(key) ? 0 : '')]));
const fromDoc = snapshot => ({ id: snapshot.id, ...snapshot.data() });
const timestampValue = value => value?.toMillis?.() || new Date(value || 0).getTime();

async function activeContext() {
  const { auth } = await getFirebaseServices();
  if (!auth.currentUser) throw Object.assign(new Error('Debes iniciar sesión.'), { code: 'auth/unauthenticated' });
  const profile = await getCurrentUserProfile();
  if (!profile || profile.status !== 'active') throw Object.assign(new Error('Tu cuenta no está activa.'), { code: 'auth/user-blocked' });
  return { user: auth.currentUser, profile };
}

export async function createProduct(data, files, onProgress) {
  const { user, profile } = await activeContext();
  const { db, dbSdk } = await getFirebaseServices();
  const reference = dbSdk.doc(dbSdk.collection(db, 'products'));
  let uploads = [];
  try {
    uploads = await uploadProductImages(reference.id, files, onProgress);
    const payload = cleanProduct(data);
    await dbSdk.setDoc(reference, {
      ...payload,
      normalizedTitle: payload.title.trim().toLowerCase(),
      price: payload.transactionType === 'sale' ? Number(payload.price) : 0,
      quantity: Number(payload.quantity) || 1,
      imageURLs: uploads.map(item => item.url),
      ownerId: user.uid,
      ownerDisplayName: profile.displayName || user.displayName || profile.email,
      ownerPhotoURL: profile.photoURL || '',
      status: 'active',
      moderationStatus: 'pending',
      createdAt: dbSdk.serverTimestamp(),
      updatedAt: dbSdk.serverTimestamp()
    });
    return reference.id;
  } catch (error) {
    if (uploads.length) await removeImages(uploads.map(item => item.path));
    throw error;
  }
}

export async function getProductById(id) {
  if (!id) return null;
  const { db, dbSdk } = await getFirebaseServices();
  const snapshot = await dbSdk.getDoc(dbSdk.doc(db, 'products', id));
  return snapshot.exists() ? fromDoc(snapshot) : null;
}

export async function listProducts(filters = {}) {
  const { db, dbSdk } = await getFirebaseServices();
  const constraints = [
    dbSdk.where('status', '==', 'active'),
    dbSdk.where('moderationStatus', '==', 'approved'),
    dbSdk.orderBy('createdAt', 'desc'),
    dbSdk.limit(filters.limit || 100)
  ];
  const snapshot = await dbSdk.getDocs(dbSdk.query(dbSdk.collection(db, 'products'), ...constraints));
  const search = String(filters.search || '').trim().toLowerCase();
  const min = Number(filters.minPrice) || 0;
  const max = Number(filters.maxPrice) || Infinity;
  const products = snapshot.docs.map(fromDoc).filter(product =>
    (!filters.category || product.category === filters.category) &&
    (!filters.transactionType || product.transactionType === filters.transactionType) &&
    (!filters.condition || product.condition === filters.condition) &&
    Number(product.price || 0) >= min && Number(product.price || 0) <= max &&
    (!search || `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(search))
  );
  if (filters.sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  return products;
}

export async function listProductsByOwner(uid, filters = {}) {
  const { db, dbSdk } = await getFirebaseServices();
  const snapshot = await dbSdk.getDocs(dbSdk.query(dbSdk.collection(db, 'products'), dbSdk.where('ownerId', '==', uid), dbSdk.orderBy('createdAt', 'desc'), dbSdk.limit(filters.limit || 100)));
  const search = String(filters.search || '').toLowerCase();
  return snapshot.docs.map(fromDoc).filter(product => (!filters.status || product.status === filters.status) && (!search || product.title.toLowerCase().includes(search)));
}

export async function updateProduct(id, data) {
  const { user } = await activeContext();
  const current = await getProductById(id);
  if (!current) throw Object.assign(new Error('Producto no encontrado.'), { code: 'not-found' });
  if (current.ownerId !== user.uid) throw Object.assign(new Error('No puedes editar este producto.'), { code: 'permission-denied' });
  const { db, dbSdk } = await getFirebaseServices();
  const changes = cleanProduct(data);
  changes.normalizedTitle = changes.title.trim().toLowerCase();
  changes.price = changes.transactionType === 'sale' ? Number(changes.price) : 0;
  changes.quantity = Number(changes.quantity) || 1;
  await dbSdk.updateDoc(dbSdk.doc(db, 'products', id), { ...changes, updatedAt: dbSdk.serverTimestamp() });
}

export async function updateProductStatus(id, status) {
  if (!['active', 'reserved', 'sold', 'loaned', 'exchanged', 'inactive'].includes(status)) throw new Error('Estado de producto inválido.');
  const { user } = await activeContext();
  const current = await getProductById(id);
  if (!current || current.ownerId !== user.uid) throw Object.assign(new Error('No puedes modificar este producto.'), { code: 'permission-denied' });
  const { db, dbSdk } = await getFirebaseServices();
  await dbSdk.updateDoc(dbSdk.doc(db, 'products', id), { status, updatedAt: dbSdk.serverTimestamp() });
}

export const softDeleteProduct = id => updateProductStatus(id, 'inactive');

export async function updateModerationStatus(id, moderationStatus) {
  if (!['pending', 'approved', 'hidden', 'rejected'].includes(moderationStatus)) throw new Error('Estado de moderación inválido.');
  const { db, dbSdk } = await getFirebaseServices();
  await dbSdk.updateDoc(dbSdk.doc(db, 'products', id), { moderationStatus, updatedAt: dbSdk.serverTimestamp() });
}

export async function deleteProductImages(imageURLs) { return removeImages(imageURLs); }
export async function getRelatedProducts(product) { return (await listProducts({ limit: 40 })).filter(item => item.category === product.category && item.id !== product.id).slice(0, 4); }
export async function listAllProducts(filters = {}) {
  const { db, dbSdk } = await getFirebaseServices();
  const snapshot = await dbSdk.getDocs(dbSdk.query(dbSdk.collection(db, 'products'), dbSdk.orderBy('createdAt', 'desc'), dbSdk.limit(filters.limit || 200)));
  const search = String(filters.search || '').toLowerCase();
  return snapshot.docs.map(fromDoc).filter(item => (!filters.moderationStatus || item.moderationStatus === filters.moderationStatus) && (!search || `${item.title} ${item.ownerDisplayName}`.toLowerCase().includes(search)));
}

export const getProduct = getProductById;
export const saveProduct = async (data, id) => id ? updateProduct(id, data) : createProduct(data, []);

