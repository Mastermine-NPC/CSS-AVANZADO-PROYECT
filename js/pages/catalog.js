import { APP_CONFIG } from '../config/app-config.js';
import { listProducts } from '../repositories/product-repository.js';
import { addToCart } from '../repositories/cart-repository.js';
import { createProductCard } from '../components/product-card.js';
import { createEmptyState } from '../components/empty-state.js';
import { renderPagination } from '../components/pagination.js';
import { updateCartCount } from '../components/header.js';
import { showAlert } from '../components/alert.js';
import { getErrorMessage } from '../utils/errors.js';

let products=[],page=1;const form=document.querySelector('#filtersForm'),grid=document.querySelector('#productList'),count=document.querySelector('#resultCount');
const epoch=value=>value?.toMillis?.()||new Date(value||0).getTime();
function filtered(){const data=new FormData(form),q=String(data.get('q')||'').toLowerCase(),min=Number(data.get('min'))||0,max=Number(data.get('max'))||Infinity;const result=products.filter(product=>`${product.title} ${product.description} ${product.category}`.toLowerCase().includes(q)&&(!data.get('category')||product.category===data.get('category'))&&(!data.get('transactionType')||product.transactionType===data.get('transactionType'))&&(!data.get('condition')||product.condition===data.get('condition'))&&Number(product.price||0)>=min&&Number(product.price||0)<=max);if(data.get('sort')==='price-asc')result.sort((a,b)=>a.price-b.price);if(data.get('sort')==='price-desc')result.sort((a,b)=>b.price-a.price);if(data.get('sort')==='recent')result.sort((a,b)=>epoch(b.createdAt)-epoch(a.createdAt));return result;}
const add=async product=>{try{await addToCart(product);updateCartCount();showAlert('Producto agregado al carrito.','success');}catch(error){showAlert(getErrorMessage(error),'warning');}};
function render(){const result=filtered(),total=Math.max(1,Math.ceil(result.length/APP_CONFIG.pageSize));page=Math.min(page,total);grid.replaceChildren();count.textContent=`${result.length} ${result.length===1?'resultado':'resultados'}`;result.slice((page-1)*APP_CONFIG.pageSize,page*APP_CONFIG.pageSize).forEach(product=>grid.append(createProductCard(product,{onCart:add,onError:message=>showAlert(message,'warning')})));if(!result.length)grid.append(createEmptyState('Sin coincidencias','Cambia o limpia los filtros para volver a ver el catálogo.','bi-search'));renderPagination(document.querySelector('#catalogPagination'),page,total,next=>{page=next;render();scrollTo({top:0,behavior:'smooth'});});}
form.addEventListener('input',()=>{page=1;render();});form.addEventListener('reset',()=>setTimeout(()=>{page=1;render();},0));const query=new URLSearchParams(location.search).get('q');if(query)form.elements.q.value=query;
async function load(){grid.replaceChildren();const loader=document.createElement('div');loader.className='loader-state';loader.textContent='Cargando catálogo…';grid.append(loader);try{products=await listProducts({limit:100});render();}catch(error){console.error('No se pudo cargar el catálogo.',error);const state=createEmptyState('No pudimos cargar el catálogo',getErrorMessage(error),'bi-wifi-off');const retry=document.createElement('button');retry.className='btn btn-primary';retry.type='button';retry.textContent='Reintentar';retry.onclick=load;state.append(retry);grid.replaceChildren(state);}}await load();

