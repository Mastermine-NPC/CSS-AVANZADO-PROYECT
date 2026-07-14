import { getSession } from '../repositories/session-repository.js';
import { listTransactions } from '../repositories/transaction-repository.js';
import { createElement } from '../utils/dom.js';
import { formatDate,transactionLabel,statusLabel } from '../utils/formatters.js';
import { showAlert } from '../components/alert.js';
import { getErrorMessage } from '../utils/errors.js';

const root=document.querySelector('.surface');root?.replaceChildren(createElement('p',{className:'p-4',text:'Cargando historial…'}));
try{const{profile}=await getSession();const items=await listTransactions(profile.uid);root.replaceChildren();if(!items.length)root.append(createElement('p',{className:'p-4 text-secondary',text:'Aún no tienes transacciones completadas.'}));items.forEach(item=>{const row=createElement('div',{className:'history-item'});row.append(createElement('i',{className:'bi bi-check-circle'}));const content=document.createElement('div');content.append(createElement('h2',{className:'h6',text:item.productTitle||'Producto'}),createElement('p',{text:`${transactionLabel(item.type)} · ${statusLabel(item.status)}`}),createElement('small',{text:formatDate(item.completedAt)}));row.append(content);root.append(row);});}catch(error){showAlert(getErrorMessage(error),'danger');root?.replaceChildren(createElement('p',{className:'p-4 text-danger',text:'No se pudo cargar el historial.'}));}

