import { getFirebaseServices } from './firebase-app.js';

const fromDoc = snapshot => ({ id: snapshot.id, ...snapshot.data() });
export async function listTransactions(uid, filters = {}) {
  const { db, dbSdk } = await getFirebaseServices();
  const [owned, requested] = await Promise.all([
    dbSdk.getDocs(dbSdk.query(dbSdk.collection(db, 'transactions'), dbSdk.where('ownerId', '==', uid), dbSdk.orderBy('completedAt', 'desc'), dbSdk.limit(filters.limit || 50))),
    dbSdk.getDocs(dbSdk.query(dbSdk.collection(db, 'transactions'), dbSdk.where('requesterId', '==', uid), dbSdk.orderBy('completedAt', 'desc'), dbSdk.limit(filters.limit || 50)))
  ]);
  return [...new Map([...owned.docs, ...requested.docs].map(doc => [doc.id, fromDoc(doc)])).values()].sort((a, b) => (b.completedAt?.toMillis?.() || 0) - (a.completedAt?.toMillis?.() || 0));
}

