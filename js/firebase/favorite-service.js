import { getFirebaseServices } from './firebase-app.js';
import { getAuthenticatedUser } from './auth-service.js';
import { getProductById } from './product-service.js';
async function context(){const[{db,dbSdk},user]=await Promise.all([getFirebaseServices(),getAuthenticatedUser()]);if(!user)throw Object.assign(new Error('Inicia sesión para guardar favoritos.'),{code:'auth/unauthenticated'});return{uid:user.uid,db,dbSdk};}
export async function addFavorite(productId){const{uid,db,dbSdk}=await context();await dbSdk.setDoc(dbSdk.doc(db,'users',uid,'favorites',productId),{productId,createdAt:dbSdk.serverTimestamp()});}
export async function removeFavorite(productId){const{uid,db,dbSdk}=await context();await dbSdk.deleteDoc(dbSdk.doc(db,'users',uid,'favorites',productId));}
export async function isFavorite(productId){const{uid,db,dbSdk}=await context();return(await dbSdk.getDoc(dbSdk.doc(db,'users',uid,'favorites',productId))).exists();}
export async function listFavoriteIds(){const{uid,db,dbSdk}=await context();const snapshot=await dbSdk.getDocs(dbSdk.collection(db,'users',uid,'favorites'));return snapshot.docs.map(doc=>doc.id);}
export async function listFavorites(){const results=await Promise.allSettled((await listFavoriteIds()).map(getProductById));return results.filter(result=>result.status==='fulfilled'&&result.value).map(result=>result.value);}
