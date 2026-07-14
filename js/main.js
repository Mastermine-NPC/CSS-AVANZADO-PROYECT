import { APP_CONFIG } from './config/app-config.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { showAlert } from './components/alert.js';
renderHeader();renderFooter();
if(APP_CONFIG.useMockData)showAlert('Modo demostración: los datos son simulados y Firebase no está conectado.','warning');
const page=document.body.dataset.page;
if(page==='product')await import('./pages/product-detail-extras.js');
if(page==='history'){const{requireStudent}=await import('./utils/guards.js');if(await requireStudent())await import('./pages/history.js');}
if(page==='admin-user-detail'||page==='admin-reports'){const{requireAdmin}=await import('./utils/guards.js');if(await requireAdmin())await import(page==='admin-user-detail'?'./pages/admin-user-detail.js':'./pages/reports.js');}
