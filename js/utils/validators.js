export const validators = {
  required: value => String(value || '').trim().length > 0,
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()),
  password: value => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value),
  match: (value, other) => value === other,
  price: value => Number(value) >= 0,
  quantity: value => Number.isInteger(Number(value)) && Number(value) > 0,
  image: file => !file || (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024)
};

export function validateForm(form) {
  let valid = true;
  [...form.elements].forEach(field => {
    if (!field.name || field.disabled || ['submit', 'button'].includes(field.type)) return;
    let ok = !field.required || (field.type === 'checkbox' ? field.checked : validators.required(field.value));
    if (ok && field.type === 'email') ok = validators.email(field.value);
    if (ok && field.name === 'password') ok = validators.password(field.value);
    if (ok && field.name === 'confirmPassword') ok = validators.match(field.value, form.elements.password?.value);
    field.classList.toggle('is-invalid', !ok);
    valid = valid && ok;
  });
  return valid;
}

export const firebaseErrorMessage = code => ({
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/weak-password': 'Usa al menos 8 caracteres, incluyendo letras y números.',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde.'
}[code] || 'No pudimos completar la operación. Inténtalo nuevamente.');

