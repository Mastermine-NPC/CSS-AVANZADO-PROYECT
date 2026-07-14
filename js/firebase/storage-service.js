import { APP_CONFIG } from '../config/app-config.js';
import { getFirebaseServices } from './firebase-app.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGES = APP_CONFIG.maxProductImages || 5;

export function validateImage(file) {
  if (!file || !ALLOWED_TYPES.has(file.type)) throw Object.assign(new Error('Usa imágenes JPG, PNG o WebP.'), { code: 'storage/invalid-type' });
  if (file.size > APP_CONFIG.maxImageSize) throw Object.assign(new Error('Cada imagen debe pesar menos de 5 MB.'), { code: 'storage/invalid-size' });
}

async function currentUid() {
  const { auth } = await getFirebaseServices();
  if (!auth.currentUser) throw Object.assign(new Error('Debes iniciar sesión.'), { code: 'auth/unauthenticated' });
  return auth.currentUser.uid;
}

const safeName = name => name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');

export async function uploadProfileImage(file) {
  validateImage(file);
  const uid = await currentUid();
  const { storage, storageSdk } = await getFirebaseServices();
  const path = `users/${uid}/profile/${crypto.randomUUID()}-${safeName(file.name)}`;
  const reference = storageSdk.ref(storage, path);
  await storageSdk.uploadBytes(reference, file, { contentType: file.type });
  return { url: await storageSdk.getDownloadURL(reference), path };
}

export async function uploadProductImages(productId, files, onProgress = () => {}) {
  const items = [...files];
  if (!items.length) throw Object.assign(new Error('Agrega al menos una imagen.'), { code: 'storage/no-files' });
  if (items.length > MAX_IMAGES) throw Object.assign(new Error(`Puedes subir como máximo ${MAX_IMAGES} imágenes.`), { code: 'storage/too-many-files' });
  items.forEach(validateImage);
  const uid = await currentUid();
  const { storage, storageSdk } = await getFirebaseServices();
  const uploaded = [];
  try {
    for (const [index, file] of items.entries()) {
      const path = `products/${uid}/${productId}/${crypto.randomUUID()}-${safeName(file.name)}`;
      const reference = storageSdk.ref(storage, path);
      await storageSdk.uploadBytes(reference, file, { contentType: file.type });
      uploaded.push({ path, url: await storageSdk.getDownloadURL(reference) });
      onProgress(Math.round(((index + 1) / items.length) * 100));
    }
    return uploaded;
  } catch (error) {
    await Promise.allSettled(uploaded.map(item => deleteFile(item.path)));
    throw error;
  }
}

export async function deleteFile(pathOrUrl) {
  const { storage, storageSdk } = await getFirebaseServices();
  const reference = pathOrUrl.startsWith('http') ? storageSdk.ref(storage, pathOrUrl) : storageSdk.ref(storage, pathOrUrl);
  await storageSdk.deleteObject(reference);
}

export async function deleteProductImages(paths) { return Promise.allSettled((paths || []).map(deleteFile)); }
export async function uploadProductImage(uid, productId, file) { const [item] = await uploadProductImages(productId, [file]); return item.url; }
