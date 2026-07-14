import { usingFirebase } from './mode.js';
import { mockRequests } from '../data/mock-requests.js';
import * as service from '../firebase/request-service.js';
import { listParticipantCollection } from '../firebase/participant-fallbacks.js';
import { getSession } from './session-repository.js';
import { getProductById } from './product-repository.js';
let requests=mockRequests.map(item=>({...item}));
export async function createRequest(data){if(usingFirebase)return service.createRequest(data);const{profile}=await getSession(),product=await getProductById(data.productId);if(product.ownerId===profile.uid)throw Object.assign(new Error('No puedes solicitar tu propio producto.'),{code:'request/own-product'});if(requests.some(item=>item.productId===data.productId&&item.requesterId===profile.uid&&item.status==='pending'))throw Object.assign(new Error('Ya existe una solicitud pendiente.'),{code:'already-exists'});const id=`request-${Date.now()}`;requests.unshift({...data,id,productTitle:product.title,ownerId:product.ownerId,requesterId:profile.uid,requesterDisplayName:profile.displayName,status:'pending',createdAt:new Date(),updatedAt:new Date()});return id;}
async function firebaseList(method,field,uid,filters){try{return await method(uid,filters);}catch(error){if(error.code==='failed-precondition')return listParticipantCollection('requests',field,uid,filters);throw error;}}
export async function listReceivedRequests(uid,filters={}){return usingFirebase?firebaseList(service.listReceivedRequests,'ownerId',uid,filters):requests.filter(item=>item.ownerId===uid&&(!filters.status||item.status===filters.status));}
export async function listSentRequests(uid,filters={}){return usingFirebase?firebaseList(service.listSentRequests,'requesterId',uid,filters):requests.filter(item=>item.requesterId===uid&&(!filters.status||item.status===filters.status));}
const change=async(id,status)=>{const item=requests.find(request=>request.id===id);if(item){item.status=status;item.updatedAt=new Date();}};
export async function acceptRequest(id){return usingFirebase?service.acceptRequest(id):change(id,'accepted');}
export async function rejectRequest(id){return usingFirebase?service.rejectRequest(id):change(id,'rejected');}
export async function cancelRequest(id){return usingFirebase?service.cancelRequest(id):change(id,'cancelled');}
export async function completeRequest(id){return usingFirebase?service.completeRequest(id):change(id,'completed');}

