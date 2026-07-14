import { getFirebaseServices } from './firebase-app.js';

const EDITABLE_PROFILE_FIELDS = ['firstName', 'lastName', 'displayName', 'studentCode', 'career', 'campus', 'phone', 'bio', 'photoURL'];
const cleanFields = (data, allowed) => Object.fromEntries(allowed.filter(key => data[key] !== undefined).map(key => [key, data[key]]));
const withId = snapshot => snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null;

export async function createUserProfile(uid, data) {
  const { db, dbSdk } = await getFirebaseServices();
  const profile = cleanFields(data, [...EDITABLE_PROFILE_FIELDS, 'email']);
  await dbSdk.setDoc(dbSdk.doc(db, 'users', uid), {
    ...profile,
    uid,
    role: 'student',
    status: 'active',
    createdAt: dbSdk.serverTimestamp(),
    updatedAt: dbSdk.serverTimestamp()
  });
  return { ...profile, uid, role: 'student', status: 'active' };
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  const { db, dbSdk } = await getFirebaseServices();
  return withId(await dbSdk.getDoc(dbSdk.doc(db, 'users', uid)));
}

export async function getCurrentUserProfile() {
  const { auth } = await getFirebaseServices();
  return auth.currentUser ? getUserProfile(auth.currentUser.uid) : null;
}

export async function updateUserProfile(uid, data) {
  const { db, dbSdk } = await getFirebaseServices();
  const changes = cleanFields(data, EDITABLE_PROFILE_FIELDS);
  await dbSdk.updateDoc(dbSdk.doc(db, 'users', uid), { ...changes, updatedAt: dbSdk.serverTimestamp() });
  return getUserProfile(uid);
}

export async function updateCurrentUserProfile(data) {
  const { auth, authSdk } = await getFirebaseServices();
  if (!auth.currentUser) throw Object.assign(new Error('Debes iniciar sesión.'), { code: 'auth/unauthenticated' });
  const profile = await updateUserProfile(auth.currentUser.uid, data);
  if (profile.displayName && auth.currentUser.displayName !== profile.displayName) {
    await authSdk.updateProfile(auth.currentUser, { displayName: profile.displayName, photoURL: profile.photoURL || null });
  }
  return profile;
}

export async function listUsers(filters = {}) {
  const { db, dbSdk } = await getFirebaseServices();
  const snapshot = await dbSdk.getDocs(dbSdk.query(dbSdk.collection(db, 'users'), dbSdk.orderBy('createdAt', 'desc'), dbSdk.limit(filters.limit || 200)));
  const search = String(filters.search || '').trim().toLowerCase();
  return snapshot.docs.map(withId).filter(user =>
    (!filters.role || user.role === filters.role) &&
    (!filters.status || user.status === filters.status) &&
    (!filters.campus || user.campus === filters.campus) &&
    (!search || `${user.displayName || ''} ${user.email || ''}`.toLowerCase().includes(search))
  );
}

export async function updateUserStatus(uid, status) {
  if (!['active', 'blocked'].includes(status)) throw new Error('Estado de usuario inválido.');
  const { db, dbSdk } = await getFirebaseServices();
  await dbSdk.updateDoc(dbSdk.doc(db, 'users', uid), { status, updatedAt: dbSdk.serverTimestamp() });
}

export async function updateUserRole(uid, role) {
  if (!['student', 'admin'].includes(role)) throw new Error('Rol inválido.');
  const { db, dbSdk } = await getFirebaseServices();
  await dbSdk.updateDoc(dbSdk.doc(db, 'users', uid), { role, updatedAt: dbSdk.serverTimestamp() });
}

export const getUser = getUserProfile;
export const updateUser = updateUserProfile;

