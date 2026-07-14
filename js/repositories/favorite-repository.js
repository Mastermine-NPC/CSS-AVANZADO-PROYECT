import { usingFirebase } from './mode.js';
import * as service from '../firebase/favorite-service.js';
import { favoriteStore } from '../utils/storage.js';
import { mockProducts } from '../data/mock-products.js';

export async function isFavorite(id) { return usingFirebase ? service.isFavorite(id) : favoriteStore.has(id); }
export async function toggleFavorite(id) { if(usingFirebase){const active=await service.isFavorite(id);active?await service.removeFavorite(id):await service.addFavorite(id);return !active;}return favoriteStore.toggle(id); }
export async function listFavorites() { return usingFirebase ? service.listFavorites() : mockProducts.filter(product=>favoriteStore.has(product.id)); }

