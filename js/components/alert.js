export function showAlert(message, type = 'info', target = document.querySelector('#app-alerts')) {
  if (!target) return;
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.setAttribute('role', 'alert'); alert.textContent = message;
  const close = document.createElement('button'); close.type = 'button'; close.className = 'btn-close'; close.setAttribute('data-bs-dismiss', 'alert'); close.setAttribute('aria-label', 'Cerrar');
  alert.append(close); target.replaceChildren(alert);
}

