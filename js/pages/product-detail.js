import { getProductById, getRelatedProducts } from '../repositories/product-repository.js';
import { createRequest } from '../repositories/request-repository.js';
import { isFavorite, toggleFavorite } from '../repositories/favorite-repository.js';
import { addToCart } from '../repositories/cart-repository.js';
import { getSession } from '../repositories/session-repository.js';
import { createProductCard } from '../components/product-card.js';
import { formatCurrency, formatDate, transactionLabel } from '../utils/formatters.js';
import { updateCartCount } from '../components/header.js';
import { showAlert } from '../components/alert.js';
import { getErrorMessage } from '../utils/errors.js';
import { createElement } from '../utils/dom.js';
import { route } from '../utils/routes.js';

const id=new URLSearchParams(location.search).get('id'),root=document.querySelector('#productDetail');
const addMeta=(target,icon,value)=>{const span=createElement('span');span.append(createElement('i',{className:`bi ${icon}`}),document.createTextNode(` ${value}`));target.append(span);};
try{
  const[product,session]=await Promise.all([getProductById(id),getSession()]);
  if(!product)throw Object.assign(new Error('Producto no encontrado.'),{code:'not-found'});
  const privileged=session.profile&&(session.profile.role==='admin'||session.profile.uid===product.ownerId);
  if(!privileged&&(product.status!=='active'||product.moderationStatus!=='approved'))throw Object.assign(new Error('Esta publicación no está disponible.'),{code:'not-found'});
  document.title=`${product.title} | UTP Marketplace`;const gallery=root.querySelector('[data-gallery]');gallery.replaceChildren();(product.imageURLs?.length?product.imageURLs:['../assets/img/placeholders/product.svg']).forEach((src,index)=>gallery.append(createElement('img',{attrs:{src,alt:`${product.title}, imagen ${index+1}`,...(index?{loading:'lazy'}:{})}})));
  root.querySelector('[data-title]').textContent=product.title;root.querySelector('[data-price]').textContent=product.transactionType==='sale'?formatCurrency(product.price):transactionLabel(product.transactionType);root.querySelector('[data-description]').textContent=product.description;root.querySelector('[data-owner]').textContent=product.ownerDisplayName||'Estudiante';const meta=root.querySelector('[data-meta]');meta.replaceChildren();addMeta(meta,'bi-tag',product.category);addMeta(meta,'bi-stars',product.condition);addMeta(meta,'bi-geo-alt',product.campus);addMeta(meta,'bi-calendar3',formatDate(product.createdAt));
  const actions=root.querySelector('[data-actions]');actions.replaceChildren();
  if(product.transactionType==='sale'){const button=createElement('button',{className:'btn btn-primary btn-lg',text:'Agregar al carrito',attrs:{type:'button'}});button.onclick=async()=>{try{await addToCart(product);updateCartCount();showAlert('Producto agregado al carrito.','success');}catch(error){showAlert(getErrorMessage(error),'warning');}};actions.append(button);}
  if(['loan','exchange'].includes(product.transactionType)){const button=createElement('button',{className:'btn btn-primary btn-lg',text:product.transactionType==='loan'?'Solicitar préstamo':'Proponer intercambio',attrs:{type:'button','data-bs-toggle':'modal','data-bs-target':'#requestModal'}});actions.append(button);}
  const favorite=createElement('button',{className:'btn btn-outline-primary btn-lg',attrs:{type:'button'}});const paint=active=>{favorite.replaceChildren(createElement('i',{className:`bi ${active?'bi-heart-fill':'bi-heart'}`}),document.createTextNode(' Favorito'));};paint(false);isFavorite(product.id).then(paint).catch(()=>{});favorite.onclick=async()=>{try{paint(await toggleFavorite(product.id));}catch(error){showAlert(getErrorMessage(error),'warning');if(error.code==='auth/unauthenticated')location.href=route(`pages/login.html?next=${encodeURIComponent(location.pathname+location.search)}`);}};actions.append(favorite);
  const related=await getRelatedProducts(product);document.querySelector('#relatedProducts').replaceChildren(...related.map(item=>createProductCard(item,{onError:message=>showAlert(message,'warning')})));
  const requestForm=document.querySelector('#requestForm');requestForm?.addEventListener('submit',async event=>{event.preventDefault();const submit=requestForm.querySelector('[type="submit"]');submit.disabled=true;try{await createRequest({productId:product.id,type:product.transactionType,message:requestForm.elements.message.value,offeredProductId:requestForm.elements.offeredProductId?.value||''});bootstrap.Modal.getInstance(document.querySelector('#requestModal'))?.hide();showAlert('Solicitud enviada correctamente.','success');requestForm.reset();}catch(error){showAlert(getErrorMessage(error),'danger');}finally{submit.disabled=false;}});
}catch(error){console.error('No se pudo cargar el producto.',error);showAlert(getErrorMessage(error),'danger');setTimeout(()=>location.replace('404.html'),900);}
