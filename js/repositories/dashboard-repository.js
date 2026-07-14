import { usingFirebase } from './mode.js';
import { getStudentDashboard as firebaseDashboard } from '../firebase/dashboard-service.js';
import { listProductsByOwner } from './product-repository.js';
import { listReceivedRequests,listSentRequests } from './request-repository.js';
export async function getStudentDashboard(uid){if(usingFirebase)return firebaseDashboard(uid);const[products,received,sent]=await Promise.all([listProductsByOwner(uid),listReceivedRequests(uid),listSentRequests(uid)]);return{products:products.length,active:products.filter(p=>p.status==='active').length,sold:products.filter(p=>p.status==='sold').length,loaned:products.filter(p=>p.status==='loaned').length,exchanged:products.filter(p=>p.status==='exchanged').length,received:received.length,sent:sent.length,pending:[...received,...sent].filter(r=>r.status==='pending').length,recent:[...received,...sent].slice(0,5)};}
