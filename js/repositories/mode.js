import { APP_CONFIG } from '../config/app-config.js';

if (APP_CONFIG.useFirebase === APP_CONFIG.useMockData) {
  throw new Error('Configura exactamente un origen de datos: Firebase o mock.');
}
export const DATA_MODE = APP_CONFIG.useFirebase ? 'firebase' : 'mock';
export const usingFirebase = DATA_MODE === 'firebase';

