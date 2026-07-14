export function renderPagination(target, current, total, onChange) {
  if (!target) return; target.replaceChildren();
  const nav = document.createElement('nav'); nav.setAttribute('aria-label', 'Paginación del catálogo');
  const list = document.createElement('ul'); list.className = 'pagination justify-content-center';
  for (let page = 1; page <= total; page += 1) {
    const item = document.createElement('li'); item.className = `page-item${page === current ? ' active' : ''}`;
    const button = document.createElement('button'); button.className = 'page-link'; button.textContent = page; button.type = 'button'; button.setAttribute('aria-label', `Ir a la página ${page}`); button.addEventListener('click', () => onChange(page)); item.append(button); list.append(item);
  }
  nav.append(list); target.append(nav);
}

