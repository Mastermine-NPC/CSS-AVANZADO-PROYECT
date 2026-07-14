import { getFirebaseServices } from './firebase-app.js';
const fromDoc=doc=>({id:doc.id,...doc.data()});const time=item=>(item.updatedAt||item.createdAt||item.completedAt)?.toMillis?.()||0;
export async function listParticipantCollection(collection,field,uid,filters={}){const{db,dbSdk}=await getFirebaseServices();const snapshot=await dbSdk.getDocs(dbSdk.query(dbSdk.collection(db,collection),dbSdk.where(field,'==',uid),dbSdk.limit(filters.limit||100)));return snapshot.docs.map(fromDoc).filter(item=>!filters.status||item.status===filters.status).sort((a,b)=>time(b)-time(a));}
