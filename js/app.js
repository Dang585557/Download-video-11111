// Global variables
let products = [];
let cart = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    updateCartBadge();
    setupEventListeners();
    renderPage();
});

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        products = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load cart from localStorage
function loadCart() {
    const saved = localStorage.getItem('luxe_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
    updateCartBadge();
}

// Update cart badge
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = count;
    }
}

// Render page based on current location
function renderPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        renderFeaturedProducts();
    } else if (currentPage === 'shop.html') {
        renderShop();
    } else if (currentPage === 'cart.html') {
        renderCart();
    }
}

// Render featured products on homepage
function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    const featured = products.slice(0, 4);
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
    attachAddToCartListeners();
}

// Render shop page with filtering
function renderShop() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = products.map(product => createProductCard(product)).join('');
    attachAddToCartListeners();
    setupFilterButtons();
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card" data-brand="${product.brand}">
            <div class="product-image-container">
                <img src="images/${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">฿${product.price.toLocaleString('th-TH')}</span>
                    <button class="btn-add-cart" data-id="${product.id}">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Attach add to cart listeners
function attachAddToCartListeners() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            addToCart(productId);
        });
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification(`${product.name} เพิ่มลงตะกร้าแล้ว!`);
}

// Show notification
function showNotification(message) {
    alert(message);
}

// Setup filter buttons
function setupFilterButtons() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterProducts(filter);
        });
    });
}

// Filter products by brand
function filterProducts(brand) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (brand === 'all' || card.dataset.brand === brand) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Render cart page
function renderCart() {
    renderCartItems();
    renderCartSummary();
    setupCheckoutListener();
}

// Render cart items
function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #666; margin-bottom: 1rem;"></i>
                <p>ตะกร้าของคุณว่างเปล่า</p>
                <a href="shop.html" class="btn">เลือกซื้อสินค้า</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="images/${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>${item.brand}</p>
                <p class="cart-item-price">฿${item.price.toLocaleString('th-TH')}</p>
                <p>จำนวน: ${item.quantity}</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i> ลบ
            </button>
        </div>
    `).join('');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

// Render cart summary
function renderCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 5000 ? 0 : 100;
    const total = subtotal + shipping;
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `฿${subtotal.toLocaleString('th-TH')}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'ฟรี' : `฿${shipping.toLocaleString('th-TH')}`;
    if (totalEl) totalEl.textContent = `฿${total.toLocaleString('th-TH')}`;
}

// Setup checkout listener
function setupCheckoutListener() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('ตะกร้าของคุณว่างเปล่า');
                return;
            }
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            alert(`ขอบคุณสำหรับการสั่งซื้อ!\n\nรวมทั้งสิ้น: ฿${total.toLocaleString('th-TH')}\n\n(นี่เป็นเว็บไซต์ตัวอย่าง)`);
            
            cart = [];
            saveCart();
            renderCart();
        });
    }
}
