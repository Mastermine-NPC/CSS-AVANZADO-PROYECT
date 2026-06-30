const mockDatabase = {
    "1": {
        id: 1,
        title: "Cálculo de una variable - Stewart",
        price: 45.00,
        category: "Libros",
        badgeColor: "primary",
        condition: "Usado - Buen estado",
        description: "Libro de Cálculo de una variable, 7ma edición de James Stewart.",
        seller: "Juan Pérez (Ing. de Sistemas)",
        imageText: "Imagen 1"
    },
    "2": {
        id: 2,
        title: "Arduino Mega 2560",
        price: 35.00,
        category: "Electrónica",
        badgeColor: "info",
        condition: "Usado - Como nuevo",
        description: "Usado para un solo ciclo. Incluye cable de conexión original.",
        seller: "María Gómez (Ing. Electrónica)",
        imageText: "Imagen 2"
    },
    "3": {
        id: 3,
        title: "Kit de Arquitectura",
        price: 60.00,
        category: "Proyectos",
        badgeColor: "success",
        condition: "Nuevo",
        description: "Escalímetro, escuadras y mesa de corte A3. Sin uso.",
        seller: "Carlos Ruiz (Arquitectura)",
        imageText: "Imagen 3"
    }
};

function renderCatalog() {
    const productList = document.getElementById('productList');
    if (!productList) return;

    setTimeout(() => {
        productList.innerHTML = '';
        Object.values(mockDatabase).forEach(product => {
            const productCard = `
                <div class="col-md-6 col-xl-4 fade-in-element">
                    <div class="card product-card h-100 shadow-sm border-0">
                        <div class="product-img-wrapper bg-secondary bg-opacity-10 d-flex justify-content-center align-items-center" style="height: 200px;">
                            <span class="text-muted">${product.imageText}</span>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <span class="badge bg-${product.badgeColor} align-self-start mb-2">${product.category}</span>
                            <h5 class="card-title text-truncate">${product.title}</h5>
                            <p class="card-text text-muted small mb-3">Condición: ${product.condition}</p>
                            <div class="mt-auto d-flex justify-content-between align-items-center">
                                <span class="fs-5 fw-bold text-primary">S/ ${product.price.toFixed(2)}</span>
                                <a href="producto.html?id=${product.id}" class="btn btn-sm btn-outline-primary hover-zoom">Ver Detalle</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productList.innerHTML += productCard;
        });
    }, 500);
}

function loadProductDetails() {
    const titleElement = document.getElementById('product-title');
    if (!titleElement) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || "1";

    setTimeout(() => {
        const product = mockDatabase[productId];

        if (product) {
            document.getElementById('product-title').textContent = product.title;
            document.getElementById('product-price').textContent = `S/ ${product.price.toFixed(2)}`;
            document.getElementById('product-category').textContent = product.category;
            document.getElementById('breadcrumb-category').textContent = product.category;
            document.getElementById('product-condition').textContent = product.condition;
            document.getElementById('product-description').textContent = product.description;
            document.getElementById('product-seller').textContent = product.seller;
            document.getElementById('product-image-text').textContent = product.imageText;
            
            const categoryBadge = document.getElementById('product-category');
            categoryBadge.className = `badge bg-${product.badgeColor} me-2`;

            const btnAddCart = document.getElementById('btn-add-cart');
            if (btnAddCart) {
                btnAddCart.onclick = null; 
                btnAddCart.onclick = () => {
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    cart.push(product);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    alert('¡Producto añadido al carrito!');
                };
            }
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
    loadProductDetails();
});