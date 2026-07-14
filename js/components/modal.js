export function openRequestModal(product, type) {
  const element=document.querySelector('#requestModal'); if(!element)return;
  element.querySelector('[data-request-product]').textContent=product.title;
  element.querySelector('[name="type"]').value=type;
  bootstrap.Modal.getOrCreateInstance(element).show();
}

