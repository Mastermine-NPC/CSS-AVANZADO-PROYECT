import { usingFirebase } from './mode.js';
import { getSession } from './session-repository.js';
import { getProductById } from './product-repository.js';
import { deleteProductImages as deleteStorageImages } from '../firebase/storage-service.js';
import { getFirebaseServices } from '../firebase/firebase-app.js';

export async function deleteProductImages(productId) {
  const [product, session] = await Promise.all([getProductById(productId), getSession()]);
  if (!product) throw Object.assign(new Error('Producto no encontrado.'), { code: 'not-found' });
  if (product.ownerId !== session.profile?.uid && session.profile?.role !== 'admin') throw Object.assign(new Error('No puedes eliminar estas imágenes.'), { code: 'permission-denied' });
  if (!usingFirebase) { product.imageURLs = []; return; }
  await deleteStorageImages(product.imageURLs || []);
  const { db, dbSdk } = await getFirebaseServices();
  await dbSdk.updateDoc(dbSdk.doc(db, 'products', productId), { imageURLs: [], updatedAt: dbSdk.serverTimestamp() });
}
