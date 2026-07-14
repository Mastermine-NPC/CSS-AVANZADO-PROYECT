import { collection, doc, getDocs, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { getCurrentUser, getUserProfile } from './auth.js';
import { db } from './firebase.js';
import { transactionLabel } from './products.js';

export async function initAdminPage() {
  const user = await getCurrentUser();
  const profile = user ? await getUserProfile(user.uid) : null;
  if (!user) {
    window.location.replace('/pages/login.html');
    return;
  }
  if (!profile || profile.status !== 'active' || profile.role !== 'admin') {
    window.location.replace('/index.html');
    return;
  }
  document.querySelector('#admin-status').hidden = true;
  document.querySelector('#admin-content').hidden = false;
  const [userTotal, productTotal] = await Promise.all([renderUsers(user.uid), renderAdminProducts()]);
  document.querySelector('#users-total').textContent = userTotal;
  document.querySelector('#products-total').textContent = productTotal;
}

async function renderUsers(currentUid) {
  const body = document.querySelector('#users-table-body');
  const snapshot = await getDocs(collection(db, 'users'));
  body.replaceChildren();
  snapshot.docs.forEach((snapshotDoc) => {
    const user = snapshotDoc.data();
    const isCurrentUser = snapshotDoc.id === currentUid;
    body.append(makeRow([user.name, user.email, user.career, user.campus, user.role, user.status], isCurrentUser ? 'Tu cuenta' : user.status === 'active' ? 'Bloquear' : 'Activar', async () => {
      if (isCurrentUser) return;
      await updateDoc(doc(db, 'users', snapshotDoc.id), { status: user.status === 'active' ? 'blocked' : 'active' });
      await renderUsers(currentUid);
    }, isCurrentUser));
  });
  return snapshot.size;
}

async function renderAdminProducts() {
  const body = document.querySelector('#products-table-body');
  const snapshot = await getDocs(collection(db, 'products'));
  body.replaceChildren();
  snapshot.docs.forEach((snapshotDoc) => {
    const product = snapshotDoc.data();
    body.append(makeRow([product.name, product.ownerName, product.category, transactionLabel(product.transactionType), product.status], product.status === 'active' ? 'Desactivar' : 'Activar', async () => {
      await updateDoc(doc(db, 'products', snapshotDoc.id), { status: product.status === 'active' ? 'inactive' : 'active' });
      await renderAdminProducts();
    }));
  });
  return snapshot.size;
}

function makeRow(values, actionLabel, action, disabled = false) {
  const row = document.createElement('tr');
  values.forEach((value) => {
    const cell = document.createElement('td');
    cell.textContent = value || '—';
    row.append(cell);
  });
  const actionCell = document.createElement('td');
  const button = document.createElement('button');
  button.className = 'btn btn-sm btn-outline-primary';
  button.type = 'button';
  button.textContent = actionLabel;
  button.disabled = disabled;
  button.addEventListener('click', action);
  actionCell.append(button);
  row.append(actionCell);
  return row;
}
