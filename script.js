
/*

 Updated code: 
      Editor: Francis Pepito
      Date: May 22. 2026

New features:
- Added user authentication with role-based access control (Admin and Cashier roles).
- Implemented password strength validation and toggle visibility for password fields.
- Enhanced audit logging to track user actions and changes in the system.
- Improved

*/


const productStorageKey = "beveragePosProductsV3";
const oldPriceStorageKey = "beveragePosProductPricesV2";
const materialStorageKey = "beveragePosMaterialsV1";
const recipeStorageKey = "beveragePosRecipesV1";
const supplierStorageKey = "beveragePosSuppliersV1";
const locationStorageKey = "beveragePosStorageLocationsV1";
const replenishmentStorageKey = "beveragePosReplenishmentsV1";
const transactionStorageKey = "beveragePosTransactionHistory";
const auditStorageKey = "beveragePosAuditRecords";

const defaultProducts = [
    { id: "coffee-americano", name: "Americano", category: "Coffee", price: 80, image: "images/coffee/americano.png", active: true },
    { id: "coffee-latte", name: "Latte", category: "Coffee", price: 95, image: "images/coffee/latte.png", active: true },
    { id: "coffee-cappuccino", name: "Cappuccino", category: "Coffee", price: 95, image: "images/coffee/cappuccino.png", active: true },
    { id: "coffee-mocha", name: "Mocha", category: "Coffee", price: 100, image: "images/coffee/mocha.png", active: true },
    { id: "coffee-caramel-macchiato", name: "Caramel Macchiato", category: "Coffee", price: 110, image: "images/coffee/caramel-macchiato.png", active: true },
    { id: "coffee-spanish-latte", name: "Spanish Latte", category: "Coffee", price: 110, image: "images/coffee/spanish-latte.png", active: true },
    { id: "coffee-biscoff-latte", name: "Biscoff Latte", category: "Coffee", price: 120, image: "images/coffee/biscoff-latte.png", active: true },
    { id: "coffee-hazelnut-latte", name: "Hazelnut Latte", category: "Coffee", price: 110, image: "images/coffee/hazelnut-latte.png", active: true },
    { id: "coffee-vanilla-latte", name: "Vanilla Latte", category: "Coffee", price: 110, image: "images/coffee/vanilla-latte.png", active: true },
    { id: "juice-lychee", name: "Lychee", category: "Juice", sizes: { Small: 35, Medium: 45, Large: 55, XL: 65 }, image: "images/juice/lychee.png", active: true },
    { id: "juice-blue-lemonade", name: "Blue Lemonade", category: "Juice", sizes: { Small: 35, Medium: 45, Large: 55, XL: 65 }, image: "images/juice/blue-lemonade.png", active: true },
    { id: "juice-green-apple", name: "Green Apple", category: "Juice", sizes: { Small: 35, Medium: 45, Large: 55, XL: 65 }, image: "images/juice/green-apple.png", active: true },
    { id: "juice-blueberry", name: "Blueberry", category: "Juice", sizes: { Small: 35, Medium: 45, Large: 55, XL: 65 }, image: "images/juice/blueberry.png", active: true },
    { id: "juice-strawberry", name: "Strawberry", category: "Juice", sizes: { Small: 35, Medium: 45, Large: 55, XL: 65 }, image: "images/juice/strawberry.png", active: true },
    { id: "milktea-brown-sugar", name: "Brown Sugar", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/brown-sugar.png", active: true },
    { id: "milktea-matcha", name: "Matcha", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/matcha.png", active: true },
    { id: "milktea-okinawa", name: "Okinawa", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/okinawa.png", active: true },
    { id: "milktea-taro", name: "Taro", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/taro.png", active: true },
    { id: "milktea-wintermelon", name: "Wintermelon", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/wintermelon.png", active: true },
    { id: "milktea-tiramisu", name: "Tiramisu", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/tiramisu.png", active: true },
    { id: "milktea-hokkaido", name: "Hokkaido", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/hokkaido.png", active: true },
    { id: "milktea-salted-caramel", name: "Salted Caramel", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/salted-caramel.png", active: true },
    { id: "milktea-dark-belgian-choco", name: "Dark Belgian Choco", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/dark-belgian-choco.png", active: true },
    { id: "milktea-oreo-cheesecake", name: "Oreo Cheesecake", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/oreo-cheesecake.png", active: true },
    { id: "milktea-blueberry-cheesecake", name: "Blueberry Cheesecake", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/blueberry-cheesecake.png", active: true },
    { id: "milktea-strawberry-cheesecake", name: "Strawberry Cheesecake", category: "Milk Tea", sizes: { Medium: 80, Large: 90 }, image: "images/milktea/strawberry-cheesecake.png", active: true }
];

const defaultMaterials = [
    { id: "tea", name: "Tea", quantity: 120, unit: "servings", lowStockThreshold: 10, active: true },
    { id: "milk", name: "Milk", quantity: 120, unit: "servings", lowStockThreshold: 10, active: true },
    { id: "sugar", name: "Sugar", quantity: 120, unit: "servings", lowStockThreshold: 10, active: true },
    { id: "pearls", name: "Pearls", quantity: 120, unit: "servings", lowStockThreshold: 10, active: true },
    { id: "coffee", name: "Coffee", quantity: 120, unit: "servings", lowStockThreshold: 10, active: true },
    { id: "cups", name: "Cups", quantity: 120, unit: "pieces", lowStockThreshold: 10, active: true },
    { id: "ice", name: "Ice", quantity: 120, unit: "servings", lowStockThreshold: 10, active: true },
    { id: "syrups", name: "Syrups", quantity: 120, unit: "servings", lowStockThreshold: 10, active: true }
];

const defaultSuppliers = [
    { id: "supplier-1", name: "Default Beverage Supplier", contact: "0912-000-0000", notes: "Reference supplier for demo replenishments." }
];

const defaultStorageLocations = [
    { id: "location-shelf", name: "Shelf", notes: "Front counter supplies" },
    { id: "location-stock-room", name: "Stock Room", notes: "Dry storage" },
    { id: "location-refrigerator", name: "Refrigerator", notes: "Cold ingredients" }
];

const recipeDefaults = {
    "Milk Tea": {
        Medium: { tea: 1, milk: 1, sugar: 1, pearls: 1, cups: 1, ice: 1 },
        Large: { tea: 2, milk: 2, sugar: 1, pearls: 2, cups: 1, ice: 2 }
    },
    Coffee: {
        Regular: { coffee: 1, milk: 1, sugar: 1, cups: 1, ice: 1 }
    },
    Juice: {
        Small: { syrups: 1, ice: 1, cups: 1 },
        Medium: { syrups: 2, ice: 2, cups: 1 },
        Large: { syrups: 3, ice: 3, cups: 1 },
        XL: { syrups: 4, ice: 4, cups: 1 }
    }
};


let products;
let materials;
let recipes;
let suppliers;
let storageLocations;
let replenishments;
let transactionHistory;
let auditRecords;
let cart = [];
let currentCategory = "All";
let currentUser = null;

const loginScreen = document.getElementById("loginScreen");
const posApp = document.getElementById("posApp") || document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("loginPasswordInput");
const signupUsernameInput = document.getElementById("signupUsernameInput");
const signupRoleSelect = document.getElementById("signupRoleSelect");
const signupPasswordInput = document.getElementById("signupPasswordInput");
const signupConfirmPasswordInput = document.getElementById("signupConfirmPasswordInput");
const signupBtn = document.getElementById("signupBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const showSignupBtn = document.getElementById("showSignupBtn");
const loginPanel = document.getElementById("loginPanel");
const signupPanel = document.getElementById("signupPanel");
const loginMessage = document.getElementById("loginMessage");
const passwordToggleButtons = document.querySelectorAll(".password-toggle");
const passwordStrengthText = document.getElementById("passwordStrengthText");
const passwordStrengthBar = document.getElementById("passwordStrengthBar");
const loggedRole = document.getElementById("loggedRole") || document.getElementById("roleDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanel = document.getElementById("adminPanel");
const productGrid = document.getElementById("productGrid");
const categoryButtons = document.querySelectorAll(".category-btn");
const cartItems = document.getElementById("cartItems");
const totalAmount = document.getElementById("totalAmount");
const cashInput = document.getElementById("cashInput");
const changeDisplay = document.getElementById("changeDisplay") || document.getElementById("changeAmount");
const message = document.getElementById("message");
const completeBtn = document.getElementById("completeBtn");
const cancelBtn = document.getElementById("cancelBtn");
const resetBtn = document.getElementById("resetBtn");
const cashierMaterialStatus = document.getElementById("cashierMaterialStatus");
const beverageForm = document.getElementById("beverageForm");
const beverageEditId = document.getElementById("beverageEditId");
const beverageNameInput = document.getElementById("beverageNameInput");
const beverageCategorySelect = document.getElementById("beverageCategorySelect");
const beverageImageInput = document.getElementById("beverageImageInput");
const beverageStatusSelect = document.getElementById("beverageStatusSelect");
const clearBeverageFormBtn = document.getElementById("clearBeverageFormBtn");
const beverageList = document.getElementById("beverageList");
const priceForm = document.getElementById("priceForm");
const priceProductSelect = document.getElementById("priceProductSelect");
const priceFields = document.getElementById("priceFields");
const materialForm = document.getElementById("materialForm");
const materialEditId = document.getElementById("materialEditId");
const materialNameInput = document.getElementById("materialNameInput");
const materialQuantityInput = document.getElementById("materialQuantityInput");
const materialUnitInput = document.getElementById("materialUnitInput");
const materialThresholdInput = document.getElementById("materialThresholdInput");
const clearMaterialFormBtn = document.getElementById("clearMaterialFormBtn");
const materialList = document.getElementById("materialList");
const replenishmentForm = document.getElementById("replenishmentForm");
const replenishMaterialSelect = document.getElementById("replenishMaterialSelect");
const replenishQuantityInput = document.getElementById("replenishQuantityInput");
const replenishSupplierSelect = document.getElementById("replenishSupplierSelect");
const replenishLocationSelect = document.getElementById("replenishLocationSelect");
const replenishmentList = document.getElementById("replenishmentList");
const recipeForm = document.getElementById("recipeForm");
const recipeProductSelect = document.getElementById("recipeProductSelect");
const recipeSizeSelect = document.getElementById("recipeSizeSelect");
const recipeMaterialFields = document.getElementById("recipeMaterialFields");
const supplierForm = document.getElementById("supplierForm");
const supplierEditId = document.getElementById("supplierEditId");
const supplierNameInput = document.getElementById("supplierNameInput");
const supplierContactInput = document.getElementById("supplierContactInput");
const supplierNotesInput = document.getElementById("supplierNotesInput");
const clearSupplierFormBtn = document.getElementById("clearSupplierFormBtn");
const supplierList = document.getElementById("supplierList");
const locationForm = document.getElementById("locationForm");
const locationEditId = document.getElementById("locationEditId");
const locationNameInput = document.getElementById("locationNameInput");
const locationNotesInput = document.getElementById("locationNotesInput");
const clearLocationFormBtn = document.getElementById("clearLocationFormBtn");
const locationList = document.getElementById("locationList");
const reportTotalSales = document.getElementById("reportTotalSales");
const reportTransactionCount = document.getElementById("reportTransactionCount");
const reportMostSold = document.getElementById("reportMostSold");
const transactionHistoryList = document.getElementById("transactionHistoryList");
const auditList = document.getElementById("auditList");
const clearAuditBtn = document.getElementById("clearAuditBtn");

initializeApp();

async function initializeApp() {
    await loadAllData();
    ensureDefaultProductsArePresent();
    ensureRecipes();
    renderProducts();
    renderCart();
    renderMaterialStatus();
    bindEvents();
}

async function loadAllData() {
    const storage = await fetchStorageAll();
    products = loadProducts(storage);
    materials = loadMaterials(storage);
    recipes = loadRecipes(storage);
    suppliers = loadSuppliers(storage);
    storageLocations = loadStorageLocations(storage);
    replenishments = loadReplenishments(storage);
    transactionHistory = loadTransactionHistory(storage);
    auditRecords = loadAuditRecords(storage);
}

async function fetchStorageAll() {
    try {
        const response = await fetch('/api/storage/all');
        if (!response.ok) throw new Error('Unable to load server storage');
        const data = await response.json();
        return data || {};
    } catch (error) {
        return {
            products: readStorage(productStorageKey, null),
            materials: readStorage(materialStorageKey, null),
            recipes: readStorage(recipeStorageKey, {}),
            suppliers: readStorage(supplierStorageKey, null),
            storageLocations: readStorage(locationStorageKey, null),
            replenishments: readStorage(replenishmentStorageKey, []),
            transactionHistory: readStorage(transactionStorageKey, []),
            auditRecords: readStorage(auditStorageKey, [])
        };
    }
}

function persistStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        // ignore localStorage failures
    }

    fetch(`/api/storage/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: data })
    }).catch((error) => {
        console.error('Failed to save to server storage:', error);
    });
}

function bindEvents() {
    loginForm.addEventListener("submit", handleLogin);
    signupBtn.addEventListener("click", handleSignup);
    showLoginBtn.addEventListener("click", () => switchAuthPanel("login"));
    showSignupBtn.addEventListener("click", () => switchAuthPanel("signup"));
    passwordToggleButtons.forEach((button) => button.addEventListener("click", handlePasswordToggle));
    signupPasswordInput.addEventListener("input", updatePasswordStrengthDisplay);
    logoutBtn.addEventListener("click", handleLogout);
    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            currentCategory = button.dataset.category;
            categoryButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            renderProducts();
        });
    });
    cashInput.addEventListener("input", updateChange);
    completeBtn.addEventListener("click", completeTransaction);
    cancelBtn.addEventListener("click", cancelTransaction);
    resetBtn.addEventListener("click", resetTransaction);
    if (beverageForm) beverageForm.addEventListener("submit", saveBeverageFromForm);
    if (clearBeverageFormBtn) clearBeverageFormBtn.addEventListener("click", clearBeverageForm);
    if (priceForm) priceForm.addEventListener("submit", updatePriceFromForm);
    if (priceProductSelect) priceProductSelect.addEventListener("change", renderPriceFields);
    if (materialForm) materialForm.addEventListener("submit", saveMaterialFromForm);
    if (clearMaterialFormBtn) clearMaterialFormBtn.addEventListener("click", clearMaterialForm);
    if (replenishmentForm) replenishmentForm.addEventListener("submit", saveReplenishmentFromForm);
    if (recipeForm) recipeForm.addEventListener("submit", saveRecipeFromForm);
    if (recipeProductSelect) recipeProductSelect.addEventListener("change", populateRecipeSizeSelect);
    if (recipeSizeSelect) recipeSizeSelect.addEventListener("change", renderRecipeFields);
    if (supplierForm) supplierForm.addEventListener("submit", saveSupplierFromForm);
    if (clearSupplierFormBtn) clearSupplierFormBtn.addEventListener("click", clearSupplierForm);
    if (locationForm) locationForm.addEventListener("submit", saveLocationFromForm);
    if (clearLocationFormBtn) clearLocationFormBtn.addEventListener("click", clearLocationForm);
    if (clearAuditBtn) clearAuditBtn.addEventListener("click", clearAuditRecords);
}

async function handleLogin(event) {
    event.preventDefault();
    const username = normalizeUsername(usernameInput.value);
    const password = passwordInput.value;
    if (!username || !password) {
        loginMessage.textContent = "Enter both username and password.";
        return;
    }
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (!response.ok) {
            loginMessage.textContent = result.message || "Invalid username or password.";
            return;
        }
        currentUser = { username: result.username, role: result.role };
        loginMessage.textContent = "";
        loginForm.reset();
        switchAuthPanel("login");
        loginScreen.classList.add("hidden");
        posApp.classList.remove("hidden");
        loggedRole.textContent = `Role: ${result.role}`;
        adminPanel.classList.toggle("hidden", result.role !== "Admin");
        addAuditLog("Login", `${capitalize(result.username)} logged in.`, {});
        renderAll();
    } catch (error) {
        loginMessage.textContent = "Unable to contact server. Please start the local host and try again.";
        console.error(error);
    }
}

async function handleSignup(event) {
    if (event) event.preventDefault();
    const username = normalizeUsername(signupUsernameInput.value);
    const password = signupPasswordInput.value;
    const confirmPassword = signupConfirmPasswordInput.value;
    const role = signupRoleSelect ? signupRoleSelect.value : "Cashier";
    if (!username || !password || !confirmPassword) {
        loginMessage.textContent = "Please complete all signup fields.";
        return;
    }
    if (password !== confirmPassword) {
        loginMessage.textContent = "Passwords do not match.";
        return;
    }
    try {
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role })
        });
        const result = await response.json();
        if (!response.ok) {
            loginMessage.textContent = result.message || "Unable to create account.";
            return;
        }
        loginMessage.textContent = "Account created successfully. Please log in.";
        signupUsernameInput.value = "";
        signupPasswordInput.value = "";
        signupConfirmPasswordInput.value = "";
        switchAuthPanel("login");
    } catch (error) {
        loginMessage.textContent = "Unable to contact server. Please start the local host and try again.";
        console.error(error);
    }
}

function switchAuthPanel(mode) {
    const isLogin = mode === "login";
    loginPanel.classList.toggle("hidden", !isLogin);
    signupPanel.classList.toggle("hidden", isLogin);
    showLoginBtn.classList.toggle("active", isLogin);
    showSignupBtn.classList.toggle("active", !isLogin);
    loginMessage.textContent = "";
}

function handlePasswordToggle(event) {
    const button = event.currentTarget;
    const targetId = button.dataset.target;
    const targetInput = document.getElementById(targetId);
    if (!targetInput) return;
    const isPassword = targetInput.type === "password";
    targetInput.type = isPassword ? "text" : "password";
    button.textContent = isPassword ? "Hide" : "Show";
}

function updatePasswordStrengthDisplay() {
    const password = signupPasswordInput.value;
    const score = calculatePasswordStrength(password);
    const strength = score.label;
    passwordStrengthText.textContent = `Strength: ${strength}`;
    passwordStrengthBar.style.width = `${score.width}%`;
    passwordStrengthBar.style.background = score.color;
}

function calculatePasswordStrength(password) {
    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    if (length === 0) return { label: "Very weak", width: 0, color: "#f7a8d7" };
    let score = 0;
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (hasLower && hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;
    if (score <= 1) return { label: "Very weak", width: 20, color: "#f5627e" };
    if (score === 2) return { label: "Weak", width: 40, color: "#f7a8d7" };
    if (score === 3) return { label: "Fair", width: 60, color: "#f2c94c" };
    if (score === 4) return { label: "Good", width: 80, color: "#68a88a" };
    return { label: "Strong", width: 100, color: "#6f59e0" };
}

function handleLogout() {
    if (currentUser) addAuditLog("Logout", `${capitalize(currentUser.username)} logged out.`, {});
    currentUser = null;
    cart = [];
    cashInput.value = "";
    message.textContent = "";
    loginScreen.classList.remove("hidden");
    posApp.classList.add("hidden");
    adminPanel.classList.add("hidden");
    renderCart();
}

function renderAll() {
    renderProducts();
    renderCart();
    renderMaterialStatus();
    renderAdminSections();
}

function renderProducts() {
    const activeProducts = products.filter((product) => product.active !== false);
    const filteredProducts = currentCategory === "All"
        ? activeProducts
        : activeProducts.filter((product) => product.category === currentCategory);
    productGrid.innerHTML = "";
    filteredProducts.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        const selectedSize = getProductSizes(product)[0];
        const price = getProductPrice(product, selectedSize);
        const recipeStatus = getRecipeStatusLabel(product, selectedSize);
        productCard.innerHTML = `
            <div class="product-image-box">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');">
                <div class="drink-placeholder hidden">${getDrinkSticker(product.category)}</div>
            </div>
            <div class="product-info">
                <div class="product-topline">
                    <span>${product.category}</span>
                    <span class="stock-badge ${recipeStatus.className}">${recipeStatus.label}</span>
                </div>
                <h3>${product.name}</h3>
                ${product.sizes ? renderSizeSelect(product, selectedSize) : ""}
                <p class="price" data-price-for="${product.id}">${formatCurrency(price)}</p>
                <button class="add-btn" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
    productGrid.querySelectorAll(".size-select").forEach((select) => select.addEventListener("change", updateProductCardPrice));
    productGrid.querySelectorAll(".add-btn").forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.productId)));
}

function renderSizeSelect(product, selectedSize) {
    return `
        <label class="size-label">
            Size
            <select class="size-select" data-product-id="${product.id}">
                ${Object.keys(product.sizes).map((size) => `<option value="${size}" ${size === selectedSize ? "selected" : ""}>${size}</option>`).join("")}
            </select>
        </label>
    `;
}

function updateProductCardPrice(event) {
    const select = event.target;
    const product = findProduct(select.dataset.productId);
    const priceElement = document.querySelector(`[data-price-for="${product.id}"]`);
    const recipeStatus = getRecipeStatusLabel(product, select.value);
    const badge = select.closest(".product-card").querySelector(".stock-badge");
    priceElement.textContent = formatCurrency(getProductPrice(product, select.value));
    badge.textContent = recipeStatus.label;
    badge.className = `stock-badge ${recipeStatus.className}`;
}

function addToCart(productId) {
    const product = findProduct(productId);
    if (!product || product.active === false) {
        message.textContent = "This beverage is not active.";
        return;
    }
    const card = document.querySelector(`[data-product-id="${productId}"]`)?.closest(".product-card");
    const sizeSelect = card?.querySelector(".size-select");
    const size = sizeSelect ? sizeSelect.value : "Regular";
    const price = getProductPrice(product, size);
    const cartId = `${product.id}-${size}`;
    const existingItem = cart.find((item) => item.cartId === cartId);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ cartId, productId: product.id, name: product.name, category: product.category, size, price, quantity: 1 });
    message.textContent = "Item added to cart.";
    renderCart();
}

function renderCart() {
    cartItems.innerHTML = "";
    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart">No items added yet.</p>`;
    } else {
        cart.forEach((item) => {
            const cartRow = document.createElement("div");
            cartRow.className = "cart-row";
            cartRow.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <span>${item.size} x ${formatCurrency(item.price)}</span>
                </div>
                <div class="quantity-controls">
                    <button data-cart-id="${item.cartId}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button data-cart-id="${item.cartId}" data-action="increase">+</button>
                </div>
                <p>${formatCurrency(item.price * item.quantity)}</p>
            `;
            cartItems.appendChild(cartRow);
        });
    }
    cartItems.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => updateQuantity(button.dataset.cartId, button.dataset.action)));
    totalAmount.textContent = formatCurrency(calculateTotal());
    updateChange();
}

function updateQuantity(cartId, action) {
    const item = cart.find((cartItem) => cartItem.cartId === cartId);
    if (!item) return;
    if (action === "increase") item.quantity += 1;
    else item.quantity -= 1;
    if (item.quantity <= 0) cart = cart.filter((cartItem) => cartItem.cartId !== cartId);
    message.textContent = "";
    renderCart();
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateChange() {
    const cash = Number(cashInput.value);
    const total = calculateTotal();
    const change = cash - total;
    changeDisplay.textContent = formatCurrency(change > 0 ? change : 0);
}

function completeTransaction() {
    if (cart.length === 0) {
        message.textContent = "Please add items before completing the transaction.";
        return;
    }
    const total = calculateTotal();
    const cash = Number(cashInput.value);
    if (!cashInput.value || cash < total) {
        message.textContent = "Cash paid is not enough.";
        return;
    }
    const requiredMaterials = calculateRequiredMaterials(cart);
    const shortage = findMaterialShortage(requiredMaterials);
    if (shortage.length > 0) {
        message.textContent = `Insufficient materials: ${shortage.join(", ")}.`;
        addAuditLog("Transaction Blocked", "Transaction blocked because material stock was insufficient.", { newValue: shortage.join(", ") });
        return;
    }
    deductMaterials(requiredMaterials);
    const transaction = {
        id: generateTransactionId(),
        dateTime: new Date().toLocaleString(),
        items: cart.map((item) => ({
            productId: item.productId,
            name: item.name,
            category: item.category,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        })),
        total,
        cash,
        change: cash - total
    };
    transactionHistory.unshift(transaction);
    saveTransactionHistory();
    addAuditLog("Complete Transaction", `${currentUserLabel()} completed transaction ${transaction.id}.`, {
        transactionId: transaction.id,
        oldValue: "Materials before deduction",
        newValue: summarizeRequiredMaterials(requiredMaterials)
    });
    cart = [];
    cashInput.value = "";
    message.textContent = `Transaction ${transaction.id} completed. Materials were deducted.`;
    renderAll();
}

function cancelTransaction() {
    if (cart.length === 0) {
        message.textContent = "No transaction to cancel.";
        return;
    }
    cart = [];
    cashInput.value = "";
    message.textContent = "Current transaction cancelled.";
    addAuditLog("Cancel Transaction", `${currentUserLabel()} cancelled current transaction.`, {});
    renderCart();
}

function resetTransaction() {
    cart = [];
    cashInput.value = "";
    message.textContent = "Ready for a new transaction.";
    addAuditLog("Reset/New Transaction", `${currentUserLabel()} reset the transaction screen.`, {});
    renderCart();
}

function calculateRequiredMaterials(items) {
    const required = {};
    items.forEach((item) => {
        const product = findProduct(item.productId);
        if (!product) return;
        const recipe = getRecipeForProduct(product, item.size);
        Object.entries(recipe).forEach(([materialId, amount]) => {
            required[materialId] = (required[materialId] || 0) + Number(amount) * item.quantity;
        });
    });
    return required;
}

function findMaterialShortage(requiredMaterials) {
    return Object.entries(requiredMaterials).map(([materialId, needed]) => {
        const material = findMaterial(materialId);
        const available = material && material.active !== false ? Number(material.quantity) : 0;
        if (available < needed) return `${material ? material.name : materialId} needs ${needed}, available ${available}`;
        return null;
    }).filter(Boolean);
}

function deductMaterials(requiredMaterials) {
    Object.entries(requiredMaterials).forEach(([materialId, needed]) => {
        const material = findMaterial(materialId);
        if (material) material.quantity = Math.max(0, Number(material.quantity) - Number(needed));
    });
    saveMaterials();
}

function renderMaterialStatus() {
    if (!cashierMaterialStatus) return;
    const activeMaterials = materials.filter((material) => material.active !== false);
    cashierMaterialStatus.innerHTML = activeMaterials.map((material) => {
        const status = getMaterialStatus(material);
        return `<span class="status-chip ${status.className}">${material.name}: ${formatNumber(material.quantity)} ${material.unit} - ${status.label}</span>`;
    }).join("");
}

function getRecipeStatusLabel(product, size) {
    const recipe = getRecipeForProduct(product, size);
    const shortage = findMaterialShortage(recipe);
    const lowMaterials = Object.keys(recipe).filter((materialId) => {
        const material = findMaterial(materialId);
        return material && Number(material.quantity) <= Number(material.lowStockThreshold || 10) && Number(material.quantity) > 0;
    });
    if (shortage.length > 0) return { label: "Insufficient Materials", className: "out" };
    if (lowMaterials.length > 0) return { label: "Low Materials", className: "low" };
    return { label: "Recipe Ready", className: "available" };
}

function renderAdminSections() {
    if (!currentUser || currentUser.role !== "Admin") return;
    renderBeverageList();
    populatePriceProductSelect();
    renderPriceFields();
    renderMaterialList();
    populateReplenishmentSelects();
    renderReplenishmentList();
    populateRecipeProductSelect();
    populateRecipeSizeSelect();
    renderSupplierList();
    renderLocationList();
    renderSalesReport();
    renderTransactionHistory();
    renderAuditRecords();
}

function saveBeverageFromForm(event) {
    event.preventDefault();
    const name = beverageNameInput.value.trim();
    const category = beverageCategorySelect.value;
    const image = beverageImageInput.value.trim();
    const isActive = beverageStatusSelect.value === "active";
    if (!name || !image) {
        message.textContent = "Please complete beverage name and image path.";
        return;
    }
    const editId = beverageEditId.value;
    if (editId) {
        const product = findProduct(editId);
        if (!product) return;
        const oldValue = `${product.name} / ${product.category} / ${product.active === false ? "Inactive" : "Active"}`;
        const categoryChanged = product.category !== category;
        product.name = name;
        product.category = category;
        product.image = image;
        product.active = isActive;
        if (categoryChanged) {
            resetProductPricing(product);
            recipes[product.id] = createDefaultRecipesForProduct(product);
            saveRecipes();
        }
        addAuditLog("Beverage Update", `Admin updated beverage ${name}.`, {
            productName: name,
            oldValue,
            newValue: `${name} / ${category} / ${isActive ? "Active" : "Inactive"}`
        });
    } else {
        const product = { id: createUniqueProductId(category, name), name, category, image, active: isActive };
        resetProductPricing(product);
        products.push(product);
        recipes[product.id] = createDefaultRecipesForProduct(product);
        addAuditLog("Beverage Add", `Admin added beverage ${name}.`, { productName: name, newValue: category });
    }
    saveProducts();
    saveRecipes();
    clearBeverageForm();
    renderAll();
    message.textContent = "Beverage saved.";
}

function renderBeverageList() {
    if (!beverageList) return;
    beverageList.innerHTML = renderTable(
        ["Beverage", "Category", "Pricing", "Status", "Actions"],
        products.map((product) => [
            product.name,
            product.category,
            getProductPriceSummary(product),
            product.active === false ? "Inactive" : "Active",
            `<div class="inline-actions"><button type="button" class="small-btn" onclick="editBeverage('${product.id}')">Edit</button><button type="button" class="small-btn danger-lite" onclick="toggleBeverageStatus('${product.id}')">${product.active === false ? "Activate" : "Deactivate"}</button></div>`
        ])
    );
}

function editBeverage(productId) {
    const product = findProduct(productId);
    if (!product) return;
    beverageEditId.value = product.id;
    beverageNameInput.value = product.name;
    beverageCategorySelect.value = product.category;
    beverageImageInput.value = product.image;
    beverageStatusSelect.value = product.active === false ? "inactive" : "active";
    beverageNameInput.focus();
}

function toggleBeverageStatus(productId) {
    const product = findProduct(productId);
    if (!product) return;
    product.active = product.active === false;
    saveProducts();
    addAuditLog("Beverage Update", `Admin ${product.active ? "activated" : "deactivated"} ${product.name}.`, {
        productName: product.name,
        oldValue: product.active ? "Inactive" : "Active",
        newValue: product.active ? "Active" : "Inactive"
    });
    renderAll();
}

function clearBeverageForm() {
    beverageForm.reset();
    beverageEditId.value = "";
}

function populatePriceProductSelect() {
    if (!priceProductSelect) return;
    const selected = priceProductSelect.value;
    priceProductSelect.innerHTML = products.map((product) => `<option value="${product.id}">${product.name}</option>`).join("");
    if (products.some((product) => product.id === selected)) priceProductSelect.value = selected;
}

function renderPriceFields() {
    if (!priceFields || !priceProductSelect) return;
    const product = findProduct(priceProductSelect.value) || products[0];
    if (!product) {
        priceFields.innerHTML = "";
        return;
    }
    priceFields.innerHTML = getProductSizes(product).map((size) => `
        <label>${size} Price<input type="number" min="0" step="1" data-price-size="${size}" value="${getProductPrice(product, size)}"></label>
    `).join("");
}

function updatePriceFromForm(event) {
    event.preventDefault();
    const product = findProduct(priceProductSelect.value);
    if (!product) return;
    const oldValue = getProductPriceSummary(product);
    const inputs = priceFields.querySelectorAll("[data-price-size]");
    if (product.price !== undefined) product.price = Number(inputs[0].value);
    else inputs.forEach((input) => product.sizes[input.dataset.priceSize] = Number(input.value)); 
    saveProducts();
    addAuditLog("Price Update", `Admin updated ${product.name} price.`, {
        productName: product.name,
        oldValue,
        newValue: getProductPriceSummary(product)
    });
    renderAll();
    message.textContent = "Price updated.";
}

function saveMaterialFromForm(event) {
    event.preventDefault();
    const name = materialNameInput.value.trim();
    const quantity = Number(materialQuantityInput.value);
    const unit = materialUnitInput.value.trim() || "servings";
    const lowStockThreshold = Number(materialThresholdInput.value || 10);
    if (!name || Number.isNaN(quantity) || quantity < 0) {
        message.textContent = "Please enter a valid material name and quantity.";
        return;
    }
    const editId = materialEditId.value;
    if (editId) {
        const material = findMaterial(editId);
        if (!material) return;
        const oldValue = `${material.quantity} ${material.unit}, threshold ${material.lowStockThreshold}`;
        material.name = name;
        material.quantity = quantity;
        material.unit = unit;
        material.lowStockThreshold = lowStockThreshold;
        addAuditLog("Material Update", `Admin updated ${material.name}.`, {
            productName: material.name,
            oldValue,
            newValue: `${quantity} ${unit}, threshold ${lowStockThreshold}`
        });
    } else {
        const material = { id: createUniqueMaterialId(name), name, quantity, unit, lowStockThreshold, active: true };
        materials.push(material);
        addAuditLog("Material Add", `Admin added material ${name}.`, { productName: name, newValue: `${quantity} ${unit}` });
    }
    saveMaterials();
    clearMaterialForm();
    renderAll();
    message.textContent = "Material saved.";
}

function renderMaterialList() {
    if (!materialList) return;
    materialList.innerHTML = renderTable(
        ["Material", "Quantity", "Threshold", "Status", "Actions"],
        materials.map((material) => {
            const status = getMaterialStatus(material);
            return [
                material.name,
                `${formatNumber(material.quantity)} ${material.unit}`,
                `${formatNumber(material.lowStockThreshold)} ${material.unit}`,
                `<span class="status-chip ${status.className}">${material.active === false ? "Inactive" : status.label}</span>`,
                `<div class="inline-actions"><button type="button" class="small-btn" onclick="editMaterial('${material.id}')">Edit</button><button type="button" class="small-btn danger-lite" onclick="toggleMaterialStatus('${material.id}')">${material.active === false ? "Activate" : "Deactivate"}</button></div>`
            ];
        })
    );
}

function editMaterial(materialId) {
    const material = findMaterial(materialId);
    if (!material) return;
    materialEditId.value = material.id;
    materialNameInput.value = material.name;
    materialQuantityInput.value = material.quantity;
    materialUnitInput.value = material.unit;
    materialThresholdInput.value = material.lowStockThreshold;
    materialNameInput.focus();
}

function toggleMaterialStatus(materialId) {
    const material = findMaterial(materialId);
    if (!material) return;
    material.active = material.active === false;
    saveMaterials();
    addAuditLog("Material Update", `Admin ${material.active ? "activated" : "deactivated"} material ${material.name}.`, {
        productName: material.name,
        oldValue: material.active ? "Inactive" : "Active",
        newValue: material.active ? "Active" : "Inactive"
    });
    renderAll();
}

function clearMaterialForm() {
    materialForm.reset();
    materialEditId.value = "";
}

function populateReplenishmentSelects() {
    fillSelect(replenishMaterialSelect, materials.filter((material) => material.active !== false), "id", "name");
    fillSelect(replenishSupplierSelect, suppliers, "id", "name");
    fillSelect(replenishLocationSelect, storageLocations, "id", "name");
}

function saveReplenishmentFromForm(event) {
    event.preventDefault();
    const material = findMaterial(replenishMaterialSelect.value);
    const supplier = suppliers.find((item) => item.id === replenishSupplierSelect.value);
    const location = storageLocations.find((item) => item.id === replenishLocationSelect.value);
    const quantityAdded = Number(replenishQuantityInput.value);
    if (!material || Number.isNaN(quantityAdded) || quantityAdded <= 0) {
        message.textContent = "Please select a material and valid replenishment quantity.";
        return;
    }
    const oldValue = `${material.quantity} ${material.unit}`;
    material.quantity = Number(material.quantity) + quantityAdded;
    replenishments.unshift({
        id: generateRecordId("REP"),
        dateTime: new Date().toLocaleString(),
        materialId: material.id,
        materialName: material.name,
        quantity: quantityAdded,
        unit: material.unit,
        supplierId: supplier ? supplier.id : "",
        supplierName: supplier ? supplier.name : "No supplier selected",
        locationId: location ? location.id : "",
        locationName: location ? location.name : "No location selected",
        username: currentUser ? currentUser.username : "unknown"
    });
    saveMaterials();
    saveReplenishments();
    replenishmentForm.reset();
    addAuditLog("Stock Update", `Admin added ${quantityAdded} ${material.unit} to ${material.name}.`, {
        productName: material.name,
        oldValue,
        newValue: `${material.quantity} ${material.unit}`
    });
    renderAll();
    message.textContent = "Stock replenishment saved.";
}

function renderReplenishmentList() {
    if (!replenishmentList) return;
    if (replenishments.length === 0) {
        replenishmentList.innerHTML = `<p class="empty-cart">No replenishment records yet.</p>`;
        return;
    }
    replenishmentList.innerHTML = renderTable(
        ["Date", "Material", "Qty", "Supplier", "Location"],
        replenishments.slice(0, 10).map((record) => [record.dateTime, record.materialName, `${formatNumber(record.quantity)} ${record.unit}`, record.supplierName, record.locationName])
    );
}

function populateRecipeProductSelect() {
    if (!recipeProductSelect) return;
    const selected = recipeProductSelect.value;
    recipeProductSelect.innerHTML = products.map((product) => `<option value="${product.id}">${product.name}</option>`).join("");
    if (products.some((product) => product.id === selected)) recipeProductSelect.value = selected;
}

function populateRecipeSizeSelect() {
    if (!recipeSizeSelect || !recipeProductSelect) return;
    const product = findProduct(recipeProductSelect.value) || products[0];
    const selected = recipeSizeSelect.value;
    recipeSizeSelect.innerHTML = getProductSizes(product).map((size) => `<option value="${size}">${size}</option>`).join("");
    if (getProductSizes(product).includes(selected)) recipeSizeSelect.value = selected;
    renderRecipeFields();
}

function renderRecipeFields() {
    if (!recipeMaterialFields || !recipeProductSelect || !recipeSizeSelect) return;
    const product = findProduct(recipeProductSelect.value) || products[0];
    if (!product) return;
    const size = recipeSizeSelect.value || getProductSizes(product)[0];
    const recipe = getRecipeForProduct(product, size);
    recipeMaterialFields.innerHTML = materials.filter((material) => material.active !== false).map((material) => `
        <label>${material.name} (${material.unit})<input type="number" min="0" step="1" data-recipe-material="${material.id}" value="${recipe[material.id] || 0}"></label>
    `).join("");
}

function saveRecipeFromForm(event) {
    event.preventDefault();
    const product = findProduct(recipeProductSelect.value);
    const size = recipeSizeSelect.value;
    if (!product || !size) return;
    const oldValue = summarizeRecipe(getRecipeForProduct(product, size));
    const recipe = {};
    recipeMaterialFields.querySelectorAll("[data-recipe-material]").forEach((input) => {
        const amount = Number(input.value);
        if (amount > 0) recipe[input.dataset.recipeMaterial] = amount;
    });
    if (!recipes[product.id]) recipes[product.id] = {};
    recipes[product.id][size] = recipe;
    saveRecipes();
    addAuditLog("Recipe Update", `Admin updated recipe for ${product.name} (${size}).`, {
        productName: `${product.name} (${size})`,
        oldValue,
        newValue: summarizeRecipe(recipe)
    });
    renderAll();
    message.textContent = "Recipe mapping saved.";
}

function saveSupplierFromForm(event) {
    event.preventDefault();
    const name = supplierNameInput.value.trim();
    const contact = supplierContactInput.value.trim();
    const notes = supplierNotesInput.value.trim();
    if (!name) {
        message.textContent = "Please enter supplier name.";
        return;
    }
    const editId = supplierEditId.value;
    if (editId) {
        const supplier = suppliers.find((item) => item.id === editId);
        if (!supplier) return;
        const oldValue = `${supplier.name} / ${supplier.contact}`;
        supplier.name = name;
        supplier.contact = contact;
        supplier.notes = notes;
        addAuditLog("Supplier Update", `Admin updated supplier ${name}.`, { productName: name, oldValue, newValue: `${name} / ${contact}` });
    } else {
        suppliers.push({ id: generateRecordId("SUP"), name, contact, notes });
        addAuditLog("Supplier Add", `Admin added supplier ${name}.`, { productName: name, newValue: contact });
    }
    saveSuppliers();
    clearSupplierForm();
    renderAll();
    message.textContent = "Supplier saved.";
}

function renderSupplierList() {
    if (!supplierList) return;
    supplierList.innerHTML = renderTable(
        ["Supplier", "Contact", "Notes", "Actions"],
        suppliers.map((supplier) => [supplier.name, supplier.contact || "-", supplier.notes || "-", `<button type="button" class="small-btn" onclick="editSupplier('${supplier.id}')">Edit</button>`])
    );
}

function editSupplier(supplierId) {
    const supplier = suppliers.find((item) => item.id === supplierId);
    if (!supplier) return;
    supplierEditId.value = supplier.id;
    supplierNameInput.value = supplier.name;
    supplierContactInput.value = supplier.contact || "";
    supplierNotesInput.value = supplier.notes || "";
    supplierNameInput.focus();
}

function clearSupplierForm() {
    supplierForm.reset();
    supplierEditId.value = "";
}

function saveLocationFromForm(event) {
    event.preventDefault();
    const name = locationNameInput.value.trim();
    const notes = locationNotesInput.value.trim();
    if (!name) {
        message.textContent = "Please enter storage location name.";
        return;
    }
    const editId = locationEditId.value;
    if (editId) {
        const location = storageLocations.find((item) => item.id === editId);
        if (!location) return;
        const oldValue = `${location.name} / ${location.notes || ""}`;
        location.name = name;
        location.notes = notes;
        addAuditLog("Storage Update", `Admin updated storage location ${name}.`, { productName: name, oldValue, newValue: `${name} / ${notes}` });
    } else {
        storageLocations.push({ id: generateRecordId("LOC"), name, notes });
        addAuditLog("Storage Add", `Admin added storage location ${name}.`, { productName: name, newValue: notes });
    }
    saveStorageLocations();
    clearLocationForm();
    renderAll();
    message.textContent = "Storage location saved.";
}

function renderLocationList() {
    if (!locationList) return;
    locationList.innerHTML = renderTable(
        ["Location", "Notes", "Actions"],
        storageLocations.map((location) => [location.name, location.notes || "-", `<button type="button" class="small-btn" onclick="editLocation('${location.id}')">Edit</button>`])
    );
}

function editLocation(locationId) {
    const location = storageLocations.find((item) => item.id === locationId);
    if (!location) return;
    locationEditId.value = location.id;
    locationNameInput.value = location.name;
    locationNotesInput.value = location.notes || "";
    locationNameInput.focus();
}

function clearLocationForm() {
    locationForm.reset();
    locationEditId.value = "";
}

function renderSalesReport() {
    if (!reportTotalSales) return;
    const totalSales = transactionHistory.reduce((sum, transaction) => sum + transaction.total, 0);
    const itemCounts = {};
    transactionHistory.forEach((transaction) => {
        transaction.items.forEach((item) => itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity);
    });
    const mostSold = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
    reportTotalSales.textContent = formatCurrency(totalSales);
    reportTransactionCount.textContent = transactionHistory.length;
    reportMostSold.textContent = mostSold ? `${mostSold[0]} (${mostSold[1]})` : "None yet";
}

function renderTransactionHistory() {
    if (!transactionHistoryList) return;
    if (transactionHistory.length === 0) {
        transactionHistoryList.innerHTML = `<p class="empty-cart">No completed transactions yet.</p>`;
        return;
    }
    transactionHistoryList.innerHTML = transactionHistory.map((transaction) => `
        <div class="history-item">
            <div><strong>${transaction.id}</strong><span>${transaction.dateTime}</span></div>
            <p>${transaction.items.map((item) => `${item.quantity}x ${item.name} (${item.size})`).join(", ")}</p>
            <p>Total: ${formatCurrency(transaction.total)} | Cash: ${formatCurrency(transaction.cash)} | Change: ${formatCurrency(transaction.change)}</p>
        </div>
    `).join("");
}

function addAuditLog(actionType, description, details = {}) {
    const record = {
        id: generateAuditId(),
        dateTime: new Date().toLocaleString(),
        username: currentUser ? currentUser.username : "unknown",
        role: currentUser ? currentUser.role : "Unknown",
        actionType,
        description,
        transactionId: details.transactionId || "-",
        productName: details.productName || details.relatedProduct || "-",
        oldValue: details.oldValue || "-",
        newValue: details.newValue || "-"
    };
    auditRecords.unshift(record);
    saveAuditRecords();
    renderAuditRecords();
}

function renderAuditRecords() {
    if (!auditList) return;
    if (auditRecords.length === 0) {
        auditList.innerHTML = `<p class="empty-cart">No audit records yet.</p>`;
        return;
    }
    auditList.innerHTML = renderTable(
        ["Audit ID", "Date/Time", "User", "Role", "Action", "Description", "Txn", "Product/Material", "Old", "New"],
        auditRecords.map((record) => [record.id, record.dateTime, record.username, record.role, record.actionType, record.description, record.transactionId, record.productName, record.oldValue, record.newValue])
    );
}

function clearAuditRecords() {
    if (!currentUser || currentUser.role !== "Admin") return;
    auditRecords = [];
    saveAuditRecords();
    renderAuditRecords();
    message.textContent = "Audit records cleared.";
}

function getProductSizes(product) {
    if (product?.sizes) return Object.keys(product.sizes);
    return ["Regular"];
}

function getProductPrice(product, size) {
    if (!product) return 0;
    if (product.sizes) return Number(product.sizes[size] || Object.values(product.sizes)[0] || 0);
    return Number(product.price || 0);
}

function getProductPriceSummary(product) {
    if (product.sizes) return Object.entries(product.sizes).map(([size, price]) => `${size}: ${formatCurrency(price)}`).join(" / ");
    return formatCurrency(product.price || 0);
}

function getRecipeForProduct(product, size) {
    if (!recipes[product.id]) recipes[product.id] = {};
    if (!recipes[product.id][size]) {
        recipes[product.id][size] = clone(defaultRecipeFor(product.category, size));
        saveRecipes();
    }
    return recipes[product.id][size];
}

function createDefaultRecipesForProduct(product) {
    const productRecipes = {};
    getProductSizes(product).forEach((size) => productRecipes[size] = clone(defaultRecipeFor(product.category, size)));
    return productRecipes;
}

function defaultRecipeFor(category, size) {
    return clone(recipeDefaults[category]?.[size] || recipeDefaults[category]?.Regular || { cups: 1 });
}

function summarizeRecipe(recipe) {
    if (!recipe || Object.keys(recipe).length === 0) return "No materials";
    return Object.entries(recipe).map(([materialId, amount]) => {
        const material = findMaterial(materialId);
        return `${material ? material.name : materialId}: ${amount}`;
    }).join(", ");
}

function summarizeRequiredMaterials(requiredMaterials) {
    return summarizeRecipe(requiredMaterials);
}

function getMaterialStatus(material) {
    if (material.active === false) return { label: "Inactive", className: "status-out" };
    if (Number(material.quantity) <= 0) return { label: "Out of Stock", className: "status-out" };
    if (Number(material.quantity) <= Number(material.lowStockThreshold || 10)) return { label: "Low Stock", className: "status-low" };
    return { label: "Available", className: "status-ok" };
}

function resetProductPricing(product) {
    if (product.category === "Coffee") {
        product.price = product.price || 80;
        delete product.sizes;
    } else if (product.category === "Juice") {
        product.sizes = product.sizes || { Small: 35, Medium: 45, Large: 55, XL: 65 };
        delete product.price;
    } else {
        product.sizes = product.sizes || { Medium: 80, Large: 90 };
        delete product.price;
    }
}

function findProduct(productId) {
    return products.find((product) => product.id === productId);
}

function findMaterial(materialId) {
    return materials.find((material) => material.id === materialId);
}

function fillSelect(select, items, valueKey, labelKey) {
    if (!select) return;
    const selected = select.value;
    select.innerHTML = items.map((item) => `<option value="${item[valueKey]}">${item[labelKey]}</option>`).join("");
    if (items.some((item) => item[valueKey] === selected)) select.value = selected;
}

function renderTable(headers, rows) {
    if (rows.length === 0) return `<p class="empty-cart">No records yet.</p>`;
    return `
        <table class="admin-table">
            <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
            <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
    `;
}

function getDrinkSticker(category) {
    if (category === "Coffee") return "Coffee";
    if (category === "Juice") return "Juice";
    return "Milk Tea";
}

function formatCurrency(amount) {
    return `PHP ${Number(amount || 0).toFixed(2)}`;
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function currentUserLabel() {
    return currentUser ? capitalize(currentUser.username) : "User";
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
}

function createUniqueProductId(category, name) {
    const base = `${slugify(category)}-${slugify(name)}`;
    let id = base;
    let counter = 1;
    while (products.some((product) => product.id === id)) {
        id = `${base}-${counter}`;
        counter += 1;
    }
    return id;
}

function createUniqueMaterialId(name) {
    const base = slugify(name);
    let id = base;
    let counter = 1;
    while (materials.some((material) => material.id === id)) {
        id = `${base}-${counter}`;
        counter += 1;
    }
    return id;
}

function generateTransactionId() {
    return `TXN-${String(transactionHistory.length + 1).padStart(3, "0")}`;
}

function generateAuditId() {
    return `AUD-${String(auditRecords.length + 1).padStart(3, "0")}`;
}

function generateRecordId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function loadProducts(storage = {}) {
    const savedProducts = storage.products ?? readStorage(productStorageKey, null);
    if (Array.isArray(savedProducts) && savedProducts.length > 0) return savedProducts.map(normalizeProduct);
    const oldPrices = readStorage(oldPriceStorageKey, {});
    return defaultProducts.map((product) => {
        const copy = normalizeProduct(product);
        if (oldPrices[copy.id]) {
            if (copy.sizes) copy.sizes = { ...copy.sizes, ...oldPrices[copy.id] };
            else copy.price = oldPrices[copy.id];
        }
        return copy;
    });
}

function normalizeProduct(product) {
    const copy = clone(product);
    copy.active = copy.active !== false;
    if (!copy.image) copy.image = `images/${slugify(copy.category)}/${slugify(copy.name)}.png`;
    resetProductPricing(copy);
    return copy;
} 

function ensureDefaultProductsArePresent() {
    let changed = false;
    defaultProducts.forEach((defaultProduct) => {
        if (!products.some((product) => product.id === defaultProduct.id)) {
            products.push(normalizeProduct(defaultProduct));
            changed = true;
        }
    });
    if (changed) saveProducts();
}

function loadMaterials(storage = {}) {
    const savedMaterials = storage.materials ?? readStorage(materialStorageKey, null);
    if (Array.isArray(savedMaterials) && savedMaterials.length > 0) {
        const normalized = savedMaterials.map((material) => ({
            ...material,
            quantity: Number(material.quantity || 0),
            lowStockThreshold: Number(material.lowStockThreshold || 10),
            active: material.active !== false
        }));
        defaultMaterials.forEach((defaultMaterial) => {
            if (!normalized.some((material) => material.id === defaultMaterial.id)) normalized.push(clone(defaultMaterial));
        });
        return normalized;
    }
    return clone(defaultMaterials);
}

function loadRecipes(storage = {}) {
    return storage.recipes ?? readStorage(recipeStorageKey, {});
}

function ensureRecipes() {
    let changed = false;
    products.forEach((product) => {
        if (!recipes[product.id]) {
            recipes[product.id] = createDefaultRecipesForProduct(product);
            changed = true;
        }
        getProductSizes(product).forEach((size) => {
            if (!recipes[product.id][size]) {
                recipes[product.id][size] = clone(defaultRecipeFor(product.category, size));
                changed = true;
            }
        });
    });
    if (changed) saveRecipes();
}

function loadSuppliers(storage = {}) {
    const savedSuppliers = storage.suppliers ?? readStorage(supplierStorageKey, null);
    return Array.isArray(savedSuppliers) && savedSuppliers.length > 0 ? savedSuppliers : clone(defaultSuppliers);
}

function loadStorageLocations(storage = {}) {
    const savedLocations = storage.storageLocations ?? readStorage(locationStorageKey, null);
    return Array.isArray(savedLocations) && savedLocations.length > 0 ? savedLocations : clone(defaultStorageLocations);
}

function loadReplenishments(storage = {}) {
    const savedReplenishments = storage.replenishments ?? readStorage(replenishmentStorageKey, []);
    return Array.isArray(savedReplenishments) ? savedReplenishments : [];
}

function loadTransactionHistory(storage = {}) {
    const savedTransactions = storage.transactionHistory ?? readStorage(transactionStorageKey, []);
    return Array.isArray(savedTransactions) ? savedTransactions : [];
}

function loadAuditRecords(storage = {}) {
    const savedRecords = storage.auditRecords ?? readStorage(auditStorageKey, []);
    return Array.isArray(savedRecords) ? savedRecords : [];
}

function normalizeUsername(username) {
    return String(username).trim().toLowerCase();
}

function readStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveProducts() {
    persistStorage(productStorageKey, products);
}

function saveMaterials() {
    persistStorage(materialStorageKey, materials);
}

function saveRecipes() {
    persistStorage(recipeStorageKey, recipes);
}

function saveSuppliers() {
    persistStorage(supplierStorageKey, suppliers);
}

function saveStorageLocations() {
    persistStorage(locationStorageKey, storageLocations);
}

function saveReplenishments() {
    persistStorage(replenishmentStorageKey, replenishments);
}

function saveTransactionHistory() {
    persistStorage(transactionStorageKey, transactionHistory);
}

function saveAuditRecords() {
    persistStorage(auditStorageKey, auditRecords);
}

window.editBeverage = editBeverage;
window.toggleBeverageStatus = toggleBeverageStatus;
window.editMaterial = editMaterial;
window.toggleMaterialStatus = toggleMaterialStatus;
window.editSupplier = editSupplier;
window.editLocation = editLocation;
