import { listFavorites } from '../repositories/favorite-repository.js';
import { addToCart } from '../repositories/cart-repository.js';
import { createProductCard } from '../components/product-card.js';
import { createEmptyState } from '../components/empty-state.js';
import { updateCartCount } from '../components/header.js';
import { showAlert } from '../components/alert.js';
import { getErrorMessage } from '../utils/errors.js';
import { route } from '../utils/routes.js';

const root=document.querySelector('#favoritesList');
async function render(){root.replaceChildren();const loading=document.createElement('div');loading.className='loader-state';loading.textContent='Cargando favoritos…';root.append(loading);try{const items=await listFavorites();root.replaceChildren();if(!items.length)root.append(createEmptyState('Aún no tienes favoritos','Usa el corazón de las tarjetas para guardar productos.','bi-heart'));items.forEach(product=>root.append(createProductCard(product,{onCart:async item=>{try{await addToCart(item);updateCartCount();}catch(error){showAlert(getErrorMessage(error),'warning');}},onFavorite:render,onError:message=>showAlert(message,'warning')})));}catch(error){if(error.code==='auth/unauthenticated'){location.replace(route(`pages/login.html?next=${encodeURIComponent(location.pathname)}`));return;}root.replaceChildren(createEmptyState('No pudimos cargar tus favoritos',getErrorMessage(error),'bi-wifi-off'));}}await render();

