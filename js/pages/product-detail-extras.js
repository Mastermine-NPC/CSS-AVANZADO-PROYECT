import { createReport } from '../repositories/admin-repository.js';
import { createElement } from '../utils/dom.js';
import { showAlert } from '../components/alert.js';
import { getErrorMessage } from '../utils/errors.js';
import { route } from '../utils/routes.js';

const productId=new URLSearchParams(location.search).get('id'),owner=document.querySelector('[data-owner]');
function connect(){if(!owner.textContent||owner.textContent==='Cargando…')return;const contact=document.querySelector('.owner-card button');if(contact&&!contact.dataset.connected){contact.dataset.connected='true';contact.onclick=()=>showAlert('Envía una solicitud con un mensaje claro para coordinar con el propietario.','info');}const actions=document.querySelector('[data-actions]');if(actions&&!actions.querySelector('[data-report]')){const report=createElement('button',{className:'btn btn-link btn-sm text-secondary',text:'Reportar publicación',attrs:{type:'button','data-report':''}});report.onclick=async()=>{const reason=prompt('Motivo del reporte (información engañosa, contenido inapropiado u otro):');if(!reason)return;try{await createReport(productId,reason.trim(),'Reporte creado desde el detalle del producto.');showAlert('Reporte enviado para revisión.','success');}catch(error){showAlert(getErrorMessage(error),'danger');if(error.code==='auth/unauthenticated')location.href=route(`pages/login.html?next=${encodeURIComponent(location.pathname+location.search)}`);}};actions.append(report);}}
new MutationObserver(connect).observe(owner,{childList:true,characterData:true,subtree:true});connect();
