import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { auth, db } from './firebase.js';

export async function registerUser(formData) {
  const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    name: formData.name.trim(),
    email: formData.email.trim(),
    career: formData.career.trim(),
    campus: formData.campus.trim(),
    role: 'student',
    status: 'active',
    createdAt: serverTimestamp()
  });
  return credential.user;
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  if (profile?.status === 'blocked') {
    await signOut(auth);
    throw new Error('Tu cuenta está bloqueada. Contacta al administrador.');
  }
  return credential.user;
}

export function logoutUser() { return signOut(auth); }

export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}
