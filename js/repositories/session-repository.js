import { usingFirebase } from './mode.js';
import { mockCurrentUser } from '../data/mock-users.js';
import { getAuthenticatedUser, loginUser, logoutUser, observeAuth, registerAccount, resetPassword } from '../firebase/auth-service.js';
import { getUserProfile } from '../firebase/user-service.js';

let mockProfile = mockCurrentUser;

export async function getSession() {
  if (!usingFirebase) return { user: { uid: mockProfile.uid, email: mockProfile.email, displayName: mockProfile.displayName }, profile: mockProfile };
  const user = await getAuthenticatedUser();
  return user ? { user, profile: await getUserProfile(user.uid) } : { user: null, profile: null };
}

export async function signIn(email, password, remember) {
  if (!usingFirebase) return getSession();
  return loginUser(email, password, remember);
}

export async function signUp(profile, password) {
  if (!usingFirebase) { mockProfile = { ...mockProfile, ...profile, role: 'student', status: 'active' }; return getSession(); }
  return registerAccount(profile, password);
}

export async function signOut() { if (usingFirebase) await logoutUser(); }
export async function sendPasswordReset(email) { if (usingFirebase) await resetPassword(email); }
export function watchSession(callback) {
  if (!usingFirebase) { callback({ user: { uid: mockProfile.uid }, profile: mockProfile }); return () => {}; }
  let unsubscribe = () => {};
  observeAuth(async user => callback({ user, profile: user ? await getUserProfile(user.uid) : null })).then(fn => { unsubscribe = fn; });
  return () => unsubscribe();
}

