import { getFirebaseServices } from './firebase-app.js';
import { listUsers, updateUserRole, updateUserStatus } from './user-service.js';
import { listAllProducts, updateModerationStatus } from './product-service.js';

const fromDoc = snapshot => ({ id: snapshot.id, ...snapshot.data() });

export async function setUserStatus(uid, status) {
  const { auth } = await getFirebaseServices();
  if (auth.currentUser?.uid === uid && status === 'blocked') throw Object.assign(new Error('No puedes bloquear tu propia cuenta.'), { code: 'admin/self-block' });
  return updateUserStatus(uid, status);
}

export const setUserRole = updateUserRole;
export const moderateProduct = updateModerationStatus;

export async function listReports(filters = {}) {
  const { db, dbSdk } = await getFirebaseServices();
  const snapshot = await dbSdk.getDocs(dbSdk.query(dbSdk.collection(db, 'reports'), dbSdk.orderBy('createdAt', 'desc'), dbSdk.limit(filters.limit || 100)));
  return snapshot.docs.map(fromDoc).filter(report => !filters.status || report.status === filters.status);
}

export async function updateReportStatus(id, status) {
  if (!['reviewed', 'dismissed'].includes(status)) throw new Error('Estado de reporte inválido.');
  const { auth, db, dbSdk } = await getFirebaseServices();
  await dbSdk.updateDoc(dbSdk.doc(db, 'reports', id), { status, reviewedAt: dbSdk.serverTimestamp(), reviewedBy: auth.currentUser.uid });
}

export async function createReport(productId, reason, description = '') {
  const { auth, db, dbSdk } = await getFirebaseServices();
  if (!auth.currentUser) throw Object.assign(new Error('Debes iniciar sesión.'), { code: 'auth/unauthenticated' });
  return dbSdk.addDoc(dbSdk.collection(db, 'reports'), { reporterId: auth.currentUser.uid, productId, reason, description, status: 'pending', createdAt: dbSdk.serverTimestamp(), reviewedAt: null, reviewedBy: '' });
}

export async function getAdminStatistics() {
  const [users, products, reports] = await Promise.all([listUsers({ limit: 500 }), listAllProducts({ limit: 500 }), listReports({ limit: 500 })]);
  const { db, dbSdk } = await getFirebaseServices();
  const requests = await dbSdk.getCountFromServer(dbSdk.collection(db, 'requests'));
  return {
    users: users.length,
    activeUsers: users.filter(user => user.status === 'active').length,
    blocked: users.filter(user => user.status === 'blocked').length,
    products: products.length,
    activeProducts: products.filter(product => product.status === 'active').length,
    pending: products.filter(product => product.moderationStatus === 'pending').length,
    requests: requests.data().count,
    pendingReports: reports.filter(report => report.status === 'pending').length
  };
}

