const messages = {
  'permission-denied': 'No tienes permiso para realizar esta acción.',
  unauthenticated: 'Debes iniciar sesión para continuar.',
  'auth/unauthenticated': 'Debes iniciar sesión para continuar.',
  unavailable: 'El servicio no está disponible. Revisa tu conexión.',
  'not-found': 'No encontramos la información solicitada.',
  'already-exists': 'Ya existe un registro pendiente para esta operación.',
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/weak-password': 'Usa al menos 8 caracteres, incluyendo letras y números.',
  'auth/network-request-failed': 'No pudimos conectar con Firebase. Revisa tu conexión.',
  'auth/user-blocked': 'Tu cuenta se encuentra bloqueada. Contacta a soporte.',
  'auth/profile-not-found': 'La cuenta no tiene un perfil válido. Contacta a soporte.',
  'auth/profile-creation-failed': 'No se pudo completar el registro. La cuenta fue revertida.',
  'storage/unauthorized': 'No tienes permiso para gestionar este archivo.',
  'storage/quota-exceeded': 'El almacenamiento alcanzó su límite.',
  'storage/retry-limit-exceeded': 'La carga tardó demasiado. Inténtalo nuevamente.',
  'storage/invalid-type': 'Usa imágenes JPG, PNG o WebP.',
  'storage/invalid-size': 'Cada imagen debe pesar menos de 5 MB.',
  'storage/too-many-files': 'Superaste el máximo de imágenes permitido.',
  'request/own-product': 'No puedes solicitar tu propio producto.',
  'failed-precondition': 'La operación ya no es válida para el estado actual.'
};
export const getErrorMessage = error => messages[error?.code] || error?.message || 'No pudimos completar la operación. Inténtalo nuevamente.';
