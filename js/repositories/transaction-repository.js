import { usingFirebase } from './mode.js';
import { listTransactions as firebaseTransactions } from '../firebase/transaction-service.js';
import { listParticipantCollection } from '../firebase/participant-fallbacks.js';
import { mockRequests } from '../data/mock-requests.js';
export async function listTransactions(uid){if(!usingFirebase)return mockRequests.filter(item=>item.status==='completed'&&(item.ownerId===uid||item.requesterId===uid)).map(item=>({...item,type:{purchase:'sale',loan:'loan',exchange:'exchange'}[item.type],completedAt:item.updatedAt}));try{return await firebaseTransactions(uid);}catch(error){if(error.code!=='failed-precondition')throw error;const[owned,requested]=await Promise.all([listParticipantCollection('transactions','ownerId',uid),listParticipantCollection('transactions','requesterId',uid)]);return[...new Map([...owned,...requested].map(item=>[item.id,item])).values()];}}
