import { getFirebaseServices } from './firebase-app.js';
import { listProductsByOwner } from './product-service.js';
import { listReceivedRequests, listSentRequests } from './request-service.js';
import { listTransactions } from './transaction-service.js';

export async function getStudentDashboard(uid) {
  const [products, received, sent, transactions] = await Promise.all([
    listProductsByOwner(uid, { limit: 200 }),
    listReceivedRequests(uid, { limit: 100 }),
    listSentRequests(uid, { limit: 100 }),
    listTransactions(uid, { limit: 30 })
  ]);
  return {
    products: products.length,
    active: products.filter(item => item.status === 'active').length,
    sold: products.filter(item => item.status === 'sold').length,
    loaned: products.filter(item => item.status === 'loaned').length,
    exchanged: products.filter(item => item.status === 'exchanged').length,
    received: received.length,
    sent: sent.length,
    pending: [...received, ...sent].filter(item => item.status === 'pending').length,
    recent: [...received, ...sent, ...transactions].sort((a, b) => ((b.updatedAt || b.completedAt)?.toMillis?.() || 0) - ((a.updatedAt || a.completedAt)?.toMillis?.() || 0)).slice(0, 5)
  };
}
