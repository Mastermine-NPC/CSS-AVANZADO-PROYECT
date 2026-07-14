import { APP_CONFIG } from '../config/app-config.js';

const SDK_VERSION = '10.12.5';
let initializationPromise = null;

export let app = null;
export let auth = null;
export let db = null;
export let storage = null;

export async function initializeFirebase() {
  if (!APP_CONFIG.useFirebase) return null;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      const [{ firebaseConfig }, appSdk, authSdk, dbSdk, storageSdk] = await Promise.all([
        import('../config/firebase-config.js'),
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-storage.js`)
      ]);
      app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
      auth = authSdk.getAuth(app);
      db = dbSdk.getFirestore(app);
      storage = storageSdk.getStorage(app);
      return { app, auth, db, storage, appSdk, authSdk, dbSdk, storageSdk };
    } catch (error) {
      initializationPromise = null;
      console.error('No fue posible inicializar Firebase.', error);
      throw Object.assign(new Error('Firebase no está configurado correctamente.'), { code: 'app/initialization-failed', cause: error });
    }
  })();
  return initializationPromise;
}

export const getFirebaseServices = initializeFirebase;

