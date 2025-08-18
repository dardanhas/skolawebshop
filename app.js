/* =========================================
   DAN25 CLOTHING — Single Page App (SPA)
   ========================================= */

/* ----- Currency formatter ----- */
const fmt = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
});

/* ----- Product catalog ----- */
const PRODUCTS = [
  { id: "p1", name: "Hoodie",       price: 499,  img: "images/hoodie.jpg",      sizes: ["XS","S","M","L","XL"] },
  { id: "p2", name: "Svarta Jeans",   price: 899,  img: "images/jeans.jpg",       sizes: ["28","30","32","34","36"] },
  { id: "p3", name: "Vit T-shirt",   price: 299,  img: "images/tshirt.jpg",      sizes: ["XS","S","M","L","XL"] },
  { id: "p4", name: "Svart T-shirt", price: 2499, img: "images/svarttshirt.jpg", sizes: ["XS","S","M","L","XL"] },
  { id: "p5", name: "Vinterjacka",   price: 3499, img: "images/vinterjacka.jpg", sizes: ["XS","S","M","L"] },
  { id: "p6", name: "Sneakers Adidas",      price: 1299, img: "images/sneakers.jpg",    sizes: ["39","40","41","42","43","44"] },
  { id: "p7", name: "Tröja",         price: 699,  img: "images/tröja.jpg",       sizes: ["XS","S","M","L","XL"] },
  { id: "p8", name: "Keps North Face",          price: 299,  img: "images/keps.jpg",        sizes: ["One Size"] },
  { id: "p9", name: "Kappa",          price: 2299, img: "images/coat.jpg",        sizes: ["XS","S","M","L"] },
];

/* ----- State ----- */
let cart = {}; // {id: qty}
let currentProducts = PRODUCTS.slice();

/* ----- Favorites (hearts) ----- */
const FAV_KEY = "dan25:favs";
let favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
const isFav = (id) => favs.has(id);
function toggleFav(id) {
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
}

/* ----- Helpers ----- */
const $ = (sel, root = document) => root.querySelector(sel);
const appRoot = () => document.getElementById("app");
const safeSrc = (p) => encodeURI(p.img);

function updateCartBadge() {
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = String(count);
}

/* =========================================
   Views
   ========================================= */

function viewHome() {
  appRoot().innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h2 class="hero-title">BACK TO THE BASICS</h2>
        <p class="hero-sub">Jeans, t-shirts och tidlösa plagg.</p>
        <div class="hero-cta">
          <a href="#home" class="btn-pill">DAM</a>
          <a href="#home" class="btn-pill outline">HERR</a>
        </div>
      </div>
    </section>

    <section class="container">
      <div class="toolbar">
        <h3 style="margin-bottom:12px">Butik</h3>
      </div>
      <div id="productGrid" class="grid"></div>
    </section>
  `;

  const sort = document.getElementById("sortSelect");
  if (sort) {
    sort.hidden = false;
    sort.value = "";
    sort.onchange = (e) => sortProducts(e.target.value);
  }

  renderProducts();
}

/* Product grid (cards) */
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = "";

  currentProducts.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card fade-in";
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.dataset.id = p.id;

    const favActive = isFav(p.id) ? " active" : "";
    const ariaPressed = isFav(p.id) ? "true" : "false";

    card.innerHTML = `
      <button class="fav-btn${favActive}" aria-pressed="${ariaPressed}" aria-label="Spara som favorit" data-id="${p.id}">❤</button>

      <div class="media">
        <img src="${safeSrc(p)}" alt="${p.name}" loading="lazy"
             onerror="this.onerror=null;this.src='images/fallback.jpg'">
      </div>

      <h3>${p.name}</h3>
      <p class="price">${fmt.format(p.price)}</p>
    `;

    // open product
    const open = () => openProduct(p.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    // favorite heart — avoid opening product
    const favBtn = card.querySelector(".fav-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFav(p.id);
      const active = isFav(p.id);
      favBtn.classList.toggle("active", active);
      favBtn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    grid.appendChild(card);
  });
}

/* Product detail */
function openProduct(id) {
  if (location.hash !== `#product/${id}`) location.hash = `#product/${id}`;
  viewProduct(id);
}

function viewProduct(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) {
    navigateTo("#home");
    return;
  }

  appRoot().innerHTML = `
    <section class="product-view">
      <div class="breadcrumbs">
        <a href="#home">Hem</a> / <a href="#home" data-link="shop">Butik</a> / ${p.name}
      </div>

      <div class="product-grid">
        <div class="product-gallery">
          <img src="${safeSrc(p)}" alt="${p.name}"
               onerror="this.onerror=null;this.src='images/fallback.jpg'">
        </div>

        <div class="product-info">
          <h1>${p.name}</h1>
          <div class="product-price">${fmt.format(p.price)}</div>

          <div class="controls">
            <div class="field">
              <label for="size">Storlek</label>
              <select id="size" class="select" required>
                ${p.sizes.map((s) => `<option value="${s}">${s}</option>`).join("")}
              </select>
              <div class="sizeguide">
                <details>
                  <summary>Storleksguide</summary>
                  <div style="margin-top:8px;color:var(--muted);font-size:.95rem">
                    Välj din vanliga storlek. Mellan två storlekar? Ta den större för en lösare passform.
                  </div>
                </details>
              </div>
            </div>

            <div class="field">
              <label for="qty">Antal</label>
              <input id="qty" class="qty" type="number" min="1" value="1" />
            </div>
          </div>

          <div class="p-actions">
            <button class="btn primary" id="addBtn">Lägg i varukorgen</button>
            <button class="btn" id="backBtn">Tillbaka</button>
          </div>
        </div>
      </div>
    </section>
  `;

  const addBtn = document.getElementById("addBtn");
  if (addBtn) {
    addBtn.onclick = () => {
      const qtyInput = document.getElementById("qty");
      const qty = Math.max(1, parseInt((qtyInput && qtyInput.value) || "1", 10));
      cart[p.id] = (cart[p.id] || 0) + qty;
      updateCartBadge();
      addBtn.textContent = "Tillagd ✓";
      setTimeout(() => (addBtn.textContent = "Lägg i varukorgen"), 1200);
    };
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) backBtn.onclick = () => navigateTo("#home");

  const sort = document.getElementById("sortSelect");
  if (sort) sort.hidden = true;
}

/* Static pages */
function viewAbout() {
  appRoot().innerHTML = `
    <section class="container fade-in">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Om Oss</h2>
      <p style="color:var(--muted);max-width:820px">
        DAN25 CLOTHING erbjuder tidlösa basplagg med modern passform. Fokus på kvalitet,
        enkelhet och stilren design i ett mörkt, elegant uttryck.
      </p>
    </section>
  `;
  const sort = document.getElementById("sortSelect");
  if (sort) sort.hidden = true;
}

function viewContact() {
  appRoot().innerHTML = `
    <section class="container fade-in">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Kontakt</h2>
      <p style="color:var(--muted)">Mail: support@dan25clothing.se · Tel: 010-123 45 67</p>
      <p style="color:var(--muted)">Öppettider: Vardagar 09–17</p>
    </section>
  `;
  const sort = document.getElementById("sortSelect");
  if (sort) sort.hidden = true;
}

/* Sorting */
function sortProducts(type) {
  if (type === "price-asc") {
    currentProducts.sort((a, b) => a.price - b.price);
  } else if (type === "price-desc") {
    currentProducts.sort((a, b) => b.price - a.price);
  } else if (type === "name-asc") {
    currentProducts.sort((a, b) => a.name.localeCompare(b.name, "sv"));
  } else {
    currentProducts = PRODUCTS.slice();
  }
  renderProducts();
}

/* =========================================
   Router
   ========================================= */
function navigateTo(hash) {
  if (location.hash === hash) {
    router();
  } else {
    location.hash = hash;
  }
}

function router() {
  const h = location.hash || "#home";
  const m = h.match(/^#product[\/-]([^/?#]+)$/);
  if (m) {
    viewProduct(m[1]);
    return;
  }

  switch (h) {
    case "#about":
      viewAbout();
      break;
    case "#contact":
      viewContact();
      break;
    case "#home":
    default:
      currentProducts = PRODUCTS.slice();
      viewHome();
      break;
  }
}

/* =========================================
   Init
   ========================================= */
window.addEventListener("hashchange", router);

window.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  updateCartBadge();
  router();

  // “Butik” i nav scrollar till grid när vi är på Hem
  document.body.addEventListener("click", (e) => {
    const toShop = e.target.closest('[data-link="shop"]');
    if (toShop) {
      navigateTo("#home");
      setTimeout(() => {
        const grid = document.getElementById("productGrid");
        if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  });
});
