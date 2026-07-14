import { listProducts } from '../repositories/product-repository.js';
import { addToCart } from '../repositories/cart-repository.js';
import { createProductCard } from '../components/product-card.js';
import { updateCartCount } from '../components/header.js';
import { showAlert } from '../components/alert.js';
import { getErrorMessage } from '../utils/errors.js';
import { createEmptyState } from '../components/empty-state.js';

const cardOptions={onCart:async product=>{try{await addToCart(product);updateCartCount();showAlert('Producto agregado al carrito.','success');}catch(error){showAlert(getErrorMessage(error),'warning');}},onError:message=>showAlert(message,'warning')};
try{const products=await listProducts({limit:24});const featured=document.querySelector('#featuredProducts'),recent=document.querySelector('#recentProducts');featured?.replaceChildren(...products.slice(0,4).map(product=>createProductCard(product,cardOptions)));recent?.replaceChildren(...products.slice(4,8).map(product=>createProductCard(product,cardOptions)));if(!products.length){featured?.append(createEmptyState('Aún no hay publicaciones','Vuelve pronto para descubrir nuevos productos.','bi-box'));recent?.closest('.section')?.setAttribute('hidden','');}}catch(error){console.error('No se pudo cargar el inicio.',error);document.querySelector('#featuredProducts')?.replaceChildren(createEmptyState('No pudimos cargar los productos',getErrorMessage(error),'bi-wifi-off'));}

