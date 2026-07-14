import { getSession, signOut } from '../repositories/session-repository.js';
import { usingFirebase } from '../repositories/mode.js';
import { route } from './routes.js';

function beginGuard(){document.documentElement.classList.add('auth-pending');let loader=document.querySelector('#auth-guard-loader');if(!loader){loader=document.createElement('div');loader.id='auth-guard-loader';loader.className='auth-guard-loader';loader.setAttribute('role','status');const spinner=document.createElement('span');spinner.className='app-loader';const label=document.createElement('span');label.textContent='Validando sesión…';loader.append(spinner,label);document.body.prepend(loader);}}
function finishGuard(){document.documentElement.classList.remove('auth-pending');document.documentElement.classList.add('auth-resolved');document.querySelector('#auth-guard-loader')?.remove();}
function redirect(path){if(!location.pathname.endsWith(path.split('/').pop()))location.replace(route(path));}
async function resolveSession(){beginGuard();try{return await getSession();}catch(error){console.error('No fue posible validar la sesión.',error);return{user:null,profile:null};}}
export async function requireAuth(){const session=await resolveSession();if(!session.user||!session.profile){redirect('pages/login.html');return null;}if(session.profile.status!=='active'){await signOut();redirect('pages/login.html?reason=blocked');return null;}finishGuard();return session.profile;}
export async function requireGuest(){const session=await resolveSession();if(session.user&&session.profile?.status==='active'&&usingFirebase){redirect(session.profile.role==='admin'?'pages/admin/dashboard.html':'pages/estudiante/dashboard.html');return null;}finishGuard();return null;}
export async function requireStudent(){const profile=await requireAuth();if(!profile)return null;if(usingFirebase&&profile.role!=='student'){redirect('pages/admin/dashboard.html');return null;}return profile;}
export async function requireAdmin(){const profile=await requireAuth();if(!profile)return null;if(usingFirebase&&profile.role!=='admin'){redirect('pages/estudiante/dashboard.html');return null;}return profile;}
