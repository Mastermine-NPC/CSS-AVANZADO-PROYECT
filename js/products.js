const mockDatabase = {
    "1": {
        id: 1,
        title: "Calculo de una variable - Stewart",
        price: 45.00,
        category: "Libros",
        condition: "Usado - Buen estado",
        status: "Usado",
        description: "Libro de Calculo de una variable, septima edicion de James Stewart. Ideal para cursos de matematica basica y calculo diferencial.",
        seller: "Juan Perez (Ing. de Sistemas)",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
    },
    "2": {
        id: 2,
        title: "Arduino Mega 2560",
        price: 35.00,
        category: "Electronica",
        condition: "Usado - Como nuevo",
        status: "Usado",
        description: "Usado para un solo ciclo. Incluye cable de conexion y sirve para practicas de laboratorio, sensores y prototipos.",
        seller: "Maria Gomez (Ing. Electronica)",
        imageUrl: "https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?auto=format&fit=crop&w=800&q=80"
    },
    "3": {
        id: 3,
        title: "Kit de arquitectura",
        price: 60.00,
        category: "Proyectos",
        condition: "Nuevo",
        status: "Nuevo",
        description: "Escalimetro, escuadras y mesa de corte A3. Material listo para maquetas, laminas y trabajos de taller.",
        seller: "Carlos Ruiz (Arquitectura)",
        imageUrl: "https://images.unsplash.com/photo-1595877244574-e90ce41ce089?auto=format&fit=crop&w=800&q=80"
    },
    "4": {
        id: 4,
        title: "Mochila universitaria resistente",
        price: 50.00,
        category: "Accesorios",
        condition: "Usado - Buen estado",
        status: "Usado",
        description: "Mochila amplia con compartimiento para laptop, cuadernos y materiales de clase.",
        seller: "Andrea Torres (Administracion)",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    },
    "5": {
        id: 5,
        title: "Asesoria de fisica basica",
        price: 25.00,
        category: "Servicios",
        condition: "Intercambio o pago por hora",
        status: "Intercambio",
        description: "Apoyo academico para ejercicios de fisica basica, preparacion de practicas y repaso de temas clave.",
        seller: "Luis Medina (Ing. Industrial)",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
    }
};

function getProducts() {
    return Object.values(mockDatabase);
}

function saveProductToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Producto guardado en el carrito.');
}

function renderCatalog(products = getProducts()) {
    const productList = document.getElementById('productList');
    const resultCount = document.getElementById('resultCount');
    if (!productList) return;

    productList.innerHTML = '';

    if (!products.length) {
        productList.innerHTML = '<div class="catalog-state catalog-state--empty"><h3>No se encontraron productos</h3><p>Prueba con otra palabra o limpia los filtros para ver todo el catalogo.</p></div>';
        if (resultCount) resultCount.textContent = '0 productos encontrados';
        return;
    }

    products.forEach(product => {
        productList.innerHTML += `
            <article class="market-product-card catalog-card fade-in-element">
                <img src="${product.imageUrl}" alt="${product.title}">
                <div>
                    <span>${product.category}</span>
                    <strong>S/ ${product.price.toFixed(2)}</strong>
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <small>${product.condition}</small>
                    <div class="catalog-card__actions">
                        <a href="producto.html?id=${product.id}" class="btn btn-outline-market btn-sm">Ver detalle</a>
                        <button type="button" class="btn btn-market btn-sm" data-product-id="${product.id}">Guardar en carrito</button>
                    </div>
                </div>
            </article>
        `;
    });

    productList.querySelectorAll('[data-product-id]').forEach(button => {
        button.addEventListener('click', () => saveProductToCart(mockDatabase[button.dataset.productId]));
    });

    if (resultCount) {
        resultCount.textContent = products.length === 1 ? '1 producto encontrado' : `${products.length} productos encontrados`;
    }
}

function applyCatalogFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const conditionFilter = document.getElementById('conditionFilter');
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';

    if (searchInput && initialQuery && !searchInput.value) {
        searchInput.value = initialQuery;
    }

    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const priceValue = priceFilter ? Number(priceFilter.value) : 0;
    const conditionValue = conditionFilter ? conditionFilter.value : '';

    const filteredProducts = getProducts().filter(product => {
        const matchesText = product.title.toLowerCase().includes(searchValue) || product.description.toLowerCase().includes(searchValue) || product.category.toLowerCase().includes(searchValue);
        const matchesCategory = !categoryValue || product.category === categoryValue;
        const matchesPrice = !priceValue || product.price <= priceValue;
        const matchesCondition = !conditionValue || product.status === conditionValue;
        return matchesText && matchesCategory && matchesPrice && matchesCondition;
    });

    renderCatalog(filteredProducts);
}

function clearCatalogFilters() {
    ['searchInput', 'categoryFilter', 'priceFilter', 'conditionFilter'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    renderCatalog();
}

function setupCatalogFilters() {
    const btnFilter = document.getElementById('btnFilter');
    const btnClearFilters = document.getElementById('btnClearFilters');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const conditionFilter = document.getElementById('conditionFilter');

    if (btnFilter) btnFilter.addEventListener('click', applyCatalogFilters);
    if (btnClearFilters) btnClearFilters.addEventListener('click', clearCatalogFilters);
    [searchInput, categoryFilter, priceFilter, conditionFilter].forEach(field => {
        if (field) field.addEventListener('change', applyCatalogFilters);
    });
    if (searchInput) searchInput.addEventListener('input', applyCatalogFilters);
}

function loadProductDetails() {
    const titleElement = document.getElementById('product-title');
    if (!titleElement) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || '1';
    const product = mockDatabase[productId] || mockDatabase['1'];

    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-price').textContent = `S/ ${product.price.toFixed(2)}`;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('breadcrumb-category').textContent = product.category;
    document.getElementById('product-condition').textContent = product.condition;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-seller').textContent = product.seller;

    const productImage = document.getElementById('product-image');
    if (productImage) {
        productImage.src = product.imageUrl;
        productImage.alt = product.title;
    }

    const btnAddCart = document.getElementById('btn-add-cart');
    if (btnAddCart) {
        btnAddCart.addEventListener('click', () => saveProductToCart(product));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productList')) {
        setTimeout(() => applyCatalogFilters(), 250);
        setupCatalogFilters();
    }
    loadProductDetails();
});
