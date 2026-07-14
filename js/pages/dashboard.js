import { getSession } from '../repositories/session-repository.js';
import { getStudentDashboard } from '../repositories/dashboard-repository.js';
import { getAdminStatistics } from '../repositories/admin-repository.js';
import { listAllProducts } from '../repositories/product-repository.js';
import { getPreferredName } from '../utils/profile.js';
import { showAlert } from '../components/alert.js';
import { getErrorMessage } from '../utils/errors.js';
import { createElement } from '../utils/dom.js';
import { statusLabel } from '../utils/formatters.js';

const page=document.body.dataset.page,setValue=(name,value)=>{const element=document.querySelector(`[data-${name}]`);if(element)element.textContent=String(value);};
const renderActivity=items=>{const timeline=document.querySelector('.timeline');timeline?.replaceChildren();if(!items.length)timeline?.append(createElement('p',{text:'Todavía no hay actividad reciente.'}));items.forEach(item=>{const row=createElement('p');row.append(createElement('i',{className:'bi bi-circle-fill'}),createElement('strong',{text:item.productTitle||item.title||'Actividad del marketplace'}),createElement('small',{text:item.moderationStatus?`Moderación: ${item.moderationStatus}`:`Estado: ${statusLabel(item.status||'completed')}`}));timeline.append(row);});};
try{const{profile}=await getSession();if(page==='student-dashboard'){setValue('name',getPreferredName(profile));const data=await getStudentDashboard(profile.uid);['products','active','sold','loaned','exchanged','received','sent','pending'].forEach(key=>setValue(key,data[key]||0));renderActivity(data.recent);}if(page==='admin-dashboard'){const[data,products]=await Promise.all([getAdminStatistics(),listAllProducts({limit:5})]);Object.entries(data).forEach(([key,value])=>setValue(key,value));renderActivity(products.slice(0,5));}}catch(error){console.error('No se pudo cargar el dashboard.',error);showAlert(getErrorMessage(error),'danger');renderActivity([]);}
