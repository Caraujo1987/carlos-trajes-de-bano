const products = [
  {
    id: "aurora",
    name: "Enterizo Aurora",
    category: "mujer",
    label: "Nuevo",
    price: 189000,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Woman_in_a_swimsuit_in_water_%28Unsplash%29.jpg/960px-Woman_in_a_swimsuit_in_water_%28Unsplash%29.jpg",
    colors: ["#0f8e9b", "#f26f5f", "#13201f"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "bondi",
    name: "Bikini Bondi",
    category: "mujer",
    label: "Top ventas",
    price: 165000,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Woman_posing_in_swimsuit_%28Unsplash%29.jpg/500px-Woman_posing_in_swimsuit_%28Unsplash%29.jpg",
    colors: ["#f26f5f", "#c8db68", "#2a74a8"],
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "laguna",
    name: "Short Laguna",
    category: "hombre",
    label: "Secado rapido",
    price: 129000,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Man_in_swimshorts_entering_sea_%28Unsplash%29.jpg/960px-Man_in_swimshorts_entering_sea_%28Unsplash%29.jpg",
    colors: ["#0b4d55", "#f0dfc6", "#13201f"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "coral",
    name: "Bikini Coral",
    category: "mujer",
    label: "Mix & match",
    price: 152000,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Woman_in_a_swimsuit_in_water_%28Unsplash%29.jpg/960px-Woman_in_a_swimsuit_in_water_%28Unsplash%29.jpg",
    colors: ["#f26f5f", "#f6c7b9", "#ffe07d"],
    sizes: ["S", "M", "L"]
  },
  {
    id: "mini-mar",
    name: "Set Mini Mar",
    category: "ninos",
    label: "Proteccion UV",
    price: 118000,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Man_in_swimshorts_entering_sea_%28Unsplash%29.jpg/960px-Man_in_swimshorts_entering_sea_%28Unsplash%29.jpg",
    colors: ["#2a74a8", "#c8db68", "#f0dfc6"],
    sizes: ["2", "4", "6", "8"]
  },
  {
    id: "playa-pack",
    name: "Pack Playa",
    category: "accesorios",
    label: "Completa tu look",
    price: 89000,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Woman_posing_in_swimsuit_%28Unsplash%29.jpg/500px-Woman_posing_in_swimsuit_%28Unsplash%29.jpg",
    colors: ["#f0dfc6", "#0f8e9b", "#f26f5f"],
    sizes: ["Unica"]
  }
];

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const filterLinks = [...document.querySelectorAll("[data-filter-link]")];
const cartButton = document.getElementById("cartButton");
const closeCartButton = document.getElementById("closeCartButton");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const checkoutButton = document.getElementById("checkoutButton");

const cart = new Map();
let activeFilter = "todos";

function formatCategory(category) {
  const labels = {
    mujer: "Mujer",
    hombre: "Hombre",
    ninos: "Ninos",
    accesorios: "Accesorios"
  };
  return labels[category] || category;
}

function filteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = products.filter((product) => {
    const matchesFilter = activeFilter === "todos" || product.category === activeFilter;
    const matchesQuery = !query || `${product.name} ${product.category} ${product.label}`.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  return visible.sort((a, b) => {
    if (sortSelect.value === "price-asc") return a.price - b.price;
    if (sortSelect.value === "price-desc") return b.price - a.price;
    return products.indexOf(a) - products.indexOf(b);
  });
}

function productCard(product) {
  const swatches = product.colors.map((color) => `<span class="swatch" style="background:${color}" aria-label="Color ${color}"></span>`).join("");
  const sizes = product.sizes.map((size) => `<span class="size-pill">${size}</span>`).join("");

  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="badge">${product.label}</span>
      </div>
      <div class="product-info">
        <div class="product-topline">
          <div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-category">${formatCategory(product.category)}</p>
          </div>
          <span class="price">${currency.format(product.price)}</span>
        </div>
        <div class="swatches" aria-label="Colores disponibles">${swatches}</div>
        <div class="sizes" aria-label="Tallas disponibles">${sizes}</div>
        <button type="button" data-add="${product.id}">Agregar al carrito</button>
      </div>
    </article>
  `;
}

function renderProducts() {
  const visible = filteredProducts();
  productGrid.innerHTML = visible.map(productCard).join("");
  emptyState.classList.toggle("is-visible", visible.length === 0);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const current = cart.get(productId);
  cart.set(productId, {
    product,
    quantity: current ? current.quantity + 1 : 1
  });

  renderCart();
  openCart();
}

function updateQuantity(productId, amount) {
  const current = cart.get(productId);
  if (!current) return;

  const nextQuantity = current.quantity + amount;
  if (nextQuantity <= 0) {
    cart.delete(productId);
  } else {
    current.quantity = nextQuantity;
  }

  renderCart();
}

function renderCart() {
  const entries = [...cart.values()];
  const totalItems = entries.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = entries.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartSubtotal.textContent = currency.format(subtotal);
  cartEmpty.classList.toggle("is-visible", entries.length === 0);

  cartItems.innerHTML = entries.map(({ product, quantity }) => `
    <article class="cart-line">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <h3>${product.name}</h3>
        <p>${currency.format(product.price)} - ${formatCategory(product.category)}</p>
        <div class="quantity">
          <button type="button" data-dec="${product.id}" aria-label="Quitar una unidad de ${product.name}">-</button>
          <strong>${quantity}</strong>
          <button type="button" data-inc="${product.id}" aria-label="Agregar una unidad de ${product.name}">+</button>
        </div>
      </div>
    </article>
  `).join("");
}

function setFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });
  renderProducts();
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("is-locked");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("is-locked");
}

function checkout() {
  const entries = [...cart.values()];
  if (!entries.length) return;

  const lines = entries.map(({ product, quantity }) => `${quantity} x ${product.name} - ${currency.format(product.price)}`);
  const subtotal = entries.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const message = [
    "Hola Carlos trajes de bano, quiero hacer este pedido:",
    ...lines,
    `Subtotal: ${currency.format(subtotal)}`
  ].join("\n");

  window.open(`https://wa.me/573001112233?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

cartItems.addEventListener("click", (event) => {
  const increment = event.target.closest("[data-inc]");
  const decrement = event.target.closest("[data-dec]");
  if (increment) updateQuantity(increment.dataset.inc, 1);
  if (decrement) updateQuantity(decrement.dataset.dec, -1);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

filterLinks.forEach((link) => {
  link.addEventListener("click", () => setFilter(link.dataset.filterLink));
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
checkoutButton.addEventListener("click", checkout);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) closeCart();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

renderProducts();
renderCart();
