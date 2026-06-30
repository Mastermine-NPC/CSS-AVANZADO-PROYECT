function displayCart() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    let total = 0;

    container.innerHTML = '';
    cartItems.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <tr>
                <td>${item.title}</td>
                <td>S/ ${item.price.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeItem(${index})">Eliminar</button></td>
            </tr>
        `;
    });
    totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

document.addEventListener('DOMContentLoaded', displayCart);