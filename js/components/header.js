import { route, currentPage } from '../utils/routes.js';
import { cartStore } from '../utils/storage.js';
import { createElement } from '../utils/dom.js';
import { getSession, signOut } from '../repositories/session-repository.js';
import { getPreferredName } from '../utils/profile.js';

const icon = name => createElement('i', { className: `bi ${name}`, attrs: { 'aria-hidden': 'true' } });
const link = (label, path, className = '') => createElement('a', { className, text: label, attrs: { href: route(path) } });

export function renderHeader() {
  const target = document.querySelector('#app-header'); if (!target) return;
  const header = createElement('header', { className: 'site-header' });
  const nav = createElement('nav', { className: 'navbar navbar-expand-lg', attrs: { 'aria-label': 'Navegación principal' } });
  const container = createElement('div', { className: 'container' });
  const brand = link('', 'index.html', 'navbar-brand');
  brand.append(createElement('span', { className: 'brand-mark', text: 'UTP' }));
  const brandText = createElement('span', { text: 'Marketplace' }); brandText.append(createElement('small', { text: 'Comunidad universitaria' })); brand.append(brandText);
  const toggler = createElement('button', { className: 'navbar-toggler', attrs: { type:'button','data-bs-toggle':'collapse','data-bs-target':'#mainNav','aria-controls':'mainNav','aria-expanded':'false','aria-label':'Abrir menú' } }); toggler.append(createElement('span',{className:'navbar-toggler-icon'}));
  const collapse=createElement('div',{className:'collapse navbar-collapse',attrs:{id:'mainNav'}});
  const search=createElement('form',{className:'header-search',attrs:{action:route('pages/catalogo.html')}});const searchLabel=createElement('label',{className:'visually-hidden',text:'Buscar productos',attrs:{for:'headerSearch'}});const input=createElement('input',{className:'form-control',attrs:{id:'headerSearch',type:'search',name:'q',placeholder:'¿Qué necesitas para el ciclo?'}});const searchButton=createElement('button',{className:'btn btn-primary',attrs:{type:'submit','aria-label':'Buscar'}});searchButton.append(icon('bi-search'));search.append(searchLabel,input,searchButton);
  const menu=createElement('ul',{className:'navbar-nav ms-auto align-items-lg-center'});
  [['home','Inicio','index.html'],['catalog','Catálogo','pages/catalogo.html'],['favorites','Favoritos','pages/favoritos.html'],['contact','Contacto','pages/contacto.html']].forEach(([id,label,path])=>{const li=createElement('li',{className:'nav-item'});li.append(link(label,path,`nav-link ${currentPage()===id?'active':''}`));menu.append(li);});
  const cartLi=createElement('li',{className:'nav-item'});const cart=link('', 'pages/carrito.html','nav-link cart-link');cart.setAttribute('aria-label','Carrito');cart.append(icon('bi-cart3'),createElement('span',{className:'cart-count',text:String(cartStore.all().reduce((n,item)=>n+item.quantity,0))}));cartLi.append(cart);menu.append(cartLi);
  const account=createElement('li',{className:'nav-item ms-lg-2',attrs:{'data-account-menu':''}});account.append(link('Ingresar','pages/login.html','btn btn-outline-primary btn-sm'));menu.append(account);
  collapse.append(search,menu);container.append(brand,toggler,collapse);nav.append(container);header.append(nav);target.replaceChildren(header);
  updateAccountMenu(account);
}

async function updateAccountMenu(target) {
  try {
    const { profile } = await getSession();
    if (!profile) return;
    const wrapper=createElement('div',{className:'dropdown'});const button=createElement('button',{className:'btn btn-outline-primary btn-sm dropdown-toggle',text:getPreferredName(profile),attrs:{type:'button','data-bs-toggle':'dropdown','aria-expanded':'false'}});const menu=createElement('ul',{className:'dropdown-menu dropdown-menu-end'});const dashboard=profile.role==='admin'?'pages/admin/dashboard.html':'pages/estudiante/dashboard.html';const dashboardItem=createElement('li');dashboardItem.append(link('Mi panel',dashboard,'dropdown-item'));const logoutItem=createElement('li');const logout=createElement('button',{className:'dropdown-item',text:'Cerrar sesión',attrs:{type:'button'}});logout.addEventListener('click',async()=>{await signOut();location.href=route('index.html');});logoutItem.append(logout);menu.append(dashboardItem,logoutItem);wrapper.append(button,menu);target.replaceChildren(wrapper);
  } catch (error) { console.error('No se pudo actualizar el menú de cuenta.',error); }
}

export function updateCartCount(){document.querySelectorAll('.cart-count').forEach(element=>{element.textContent=cartStore.all().reduce((n,item)=>n+item.quantity,0);});}

