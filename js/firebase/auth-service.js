import { getFirebaseServices } from './firebase-app.js';
import { createUserProfile, getUserProfile } from './user-service.js';

export async function registerAccount(profile, password) {
  const { auth, authSdk } = await getFirebaseServices();
  const credential = await authSdk.createUserWithEmailAndPassword(auth, profile.email, password);
  try {
    await authSdk.updateProfile(credential.user, { displayName: profile.displayName });
    const savedProfile = await createUserProfile(credential.user.uid, profile);
    return { user: credential.user, profile: savedProfile };
  } catch (error) {
    try { await authSdk.deleteUser(credential.user); }
    catch (rollbackError) { console.error('No se pudo revertir la cuenta sin perfil.', rollbackError); }
    throw Object.assign(new Error('La cuenta no pudo completarse y fue revertida.'), { code: 'auth/profile-creation-failed', cause: error });
  }
}

export async function loginUser(email, password, remember = true) {
  const { auth, authSdk } = await getFirebaseServices();
  await authSdk.setPersistence(auth, remember ? authSdk.browserLocalPersistence : authSdk.browserSessionPersistence);
  const credential = await authSdk.signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  if (!profile) {
    await authSdk.signOut(auth);
    throw Object.assign(new Error('No existe un perfil asociado a esta cuenta.'), { code: 'auth/profile-not-found' });
  }
  if (profile.status !== 'active') {
    await authSdk.signOut(auth);
    throw Object.assign(new Error('Tu cuenta se encuentra bloqueada.'), { code: 'auth/user-blocked' });
  }
  return { user: credential.user, profile };
}

export async function logoutUser() { const { auth, authSdk } = await getFirebaseServices(); await authSdk.signOut(auth); }
export async function resetPassword(email) { const { auth, authSdk } = await getFirebaseServices(); await authSdk.sendPasswordResetEmail(auth, email); }
export async function observeAuth(callback) { const { auth, authSdk } = await getFirebaseServices(); return authSdk.onAuthStateChanged(auth, callback); }
export async function getAuthenticatedUser() {
  const { auth, authSdk } = await getFirebaseServices();
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve, reject) => {
    const unsubscribe = authSdk.onAuthStateChanged(auth, user => { unsubscribe(); resolve(user); }, reject);
  });
}
export async function registerUser(email, password) { const { auth, authSdk } = await getFirebaseServices(); return authSdk.createUserWithEmailAndPassword(auth, email, password); }

