function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCartSummary(count, total) {
    const totalEl = document.getElementById('cart-total');
    const subtotalEl = document.getElementById('cart-subtotal');
    const countEl = document.getElementById('cart-count');
    const countLabel = document.getElementById('cart-count-label');

    if (totalEl) totalEl.textContent = `S/ ${total.toFixed(2)}`;
    if (subtotalEl) subtotalEl.textContent = `S/ ${total.toFixed(2)}`;
    if (countEl) countEl.textContent = count;
    if (countLabel) countLabel.textContent = count === 1 ? '1 producto' : `${count} productos`;
}

function displayCart() {
    const cartItems = getCartItems();
    const container = document.getElementById('cart-items');
    if (!container) return;

    let total = 0;
    container.innerHTML = '';

    if (!cartItems.length) {
        container.innerHTML = '<div class="cart-empty"><h3>Tu carrito esta vacio</h3><p>Explora el catalogo y guarda productos para la simulacion de compra.</p><a class="btn btn-primary" href="catalogo.html">Explorar productos</a></div>';
        updateCartSummary(0, 0);
        return;
    }

    cartItems.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <article class="cart-item">
                <img src="${item.imageUrl}" alt="${item.title}">
                <div class="cart-item__content">
                    <span class="badge product-badge">${item.category}</span>
                    <h3>${item.title}</h3>
                    <p>${item.condition}</p>
                </div>
                <strong>S/ ${item.price.toFixed(2)}</strong>
                <button class="btn btn-outline-danger btn-sm hover-zoom" onclick="removeItem(${index})">Quitar</button>
            </article>
        `;
    });

    updateCartSummary(cartItems.length, total);
}

function removeItem(index) {
    const cart = getCartItems();
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function clearCart() {
    localStorage.removeItem('cart');
    displayCart();
}

document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    const clearButton = document.getElementById('btn-clear-cart');
    if (clearButton) clearButton.addEventListener('click', clearCart);
});
