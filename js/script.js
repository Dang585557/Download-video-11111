// Load products from JSON data
let products = [];
let cart = [];
let currentSlide = 0;

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    loadProducts();
    loadCart();
    setupEventListeners();
    startHeroSlider();
});

// Load products from data file
async function loadProducts() {
    try {
        const response = await fetch("data/products.json");
        products = await response.json();
        
        // Display products based on current page
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        
        if (currentPage === "index.html" || currentPage === "") {
            displayFeaturedProducts();
        } else if (currentPage === "product.html") {
            displayAllProducts();
        }
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// Display featured products on homepage
function displayFeaturedProducts() {
    const container = document.getElementById("featured-products");
    if (!container) return;
    
    const featured = products.slice(0, 3);
    container.innerHTML = featured.map(product => createProductCard(product)).join("");
    attachAddToCartListeners();
}

// Display all products on product page
function displayAllProducts() {
    const container = document.getElementById("products-container");
    if (!container) return;
    
    container.innerHTML = products.map(product => createProductCard(product)).join("");
    attachAddToCartListeners();
    setupFilterListener();
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="images/${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">฿${product.price.toLocaleString("th-TH")}</p>
                <p class="product-description">${product.description}</p>
                <button class="btn-add-to-cart" data-id="${product.id}">เพิ่มลงตะกร้า</button>
            </div>
        </div>
    `;
}

// Attach event listeners to add to cart buttons
function attachAddToCartListeners() {
    document.querySelectorAll(".btn-add-to-cart").forEach(button => {
        button.addEventListener("click", function() {
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
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    alert(`${product.name} เพิ่มลงตะกร้าแล้ว!`);
}

// Display cart items on cart page
function displayCartItems() {
    const container = document.getElementById("cart-items");
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">ตะกร้าของคุณว่างเปล่า</p>';
        document.getElementById("total-price").textContent = '฿0.00';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="images/${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">฿${item.price.toLocaleString("th-TH")}</div>
                <div>จำนวน: ${item.quantity}</div>
            </div>
            <button class="btn btn-primary" onclick="removeFromCart(${item.id})">ลบ</button>
        </div>
    `).join("");
    
    updateTotalPrice();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCartItems();
}

// Update total price
function updateTotalPrice() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.getElementById("total-price");
    if (totalElement) {
        totalElement.textContent = `฿${total.toLocaleString("th-TH")}`;
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    // Display cart if on cart page
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    if (currentPage === "cart.html") {
        displayCartItems();
    }
}

// Setup filter listener for product page
function setupFilterListener() {
    const filterSelect = document.getElementById("brand-filter");
    if (!filterSelect) return;
    
    filterSelect.addEventListener("change", function() {
        const selectedBrand = this.value;
        filterProducts(selectedBrand);
    });
}

// Filter products by brand
function filterProducts(brand) {
    const container = document.getElementById("products-container");
    if (!container) return;
    
    let filtered = products;
    if (brand) {
        filtered = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }
    
    container.innerHTML = filtered.map(product => createProductCard(product)).join("");
    attachAddToCartListeners();
}

// Setup event listeners
function setupEventListeners() {
    const checkoutButton = document.querySelector(".btn-checkout");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", function() {
            if (cart.length === 0) {
                alert("ตะกร้าของคุณว่างเปล่า");
                return;
            }
            alert("ขอบคุณสำหรับการสั่งซื้อ! (นี่เป็นเว็บไซต์ตัวอย่าง)");
        });
    }
}

// Hero Image Slider
function startHeroSlider() {
    const slides = document.querySelectorAll(".hero-image-slider img");
    if (slides.length === 0) return;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });
    }

    showSlide(currentSlide);

    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000); // Change image every 5 seconds
}
