/* =========================================
   DAN25 CLOTHING — SPA + favorites + checkout + simple auth (demo)
   ========================================= */

/* Currency */
const fmt = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" });

/* Products */
const PRODUCTS = [
  { id: "p1", name: "Hoodie",         price: 549,  img: "images/hoodie.jpg",      sizes: ["XS","S","M","L","XL"] },
  { id: "p2", name: "Svarta Jeans",   price: 899,  img: "images/jeans.jpg",       sizes: ["28","30","32","34","36"] },
  { id: "p3", name: "Vit T-shirt",    price: 299,  img: "images/tshirt.jpg",      sizes: ["XS","S","M","L","XL"] },
  { id: "p4", name: "Svart T-shirt",  price: 299,  img: "images/svarttshirt.jpg", sizes: ["XS","S","M","L","XL"] },
  { id: "p5", name: "Vinterjacka",    price: 3499, img: "images/vinterjacka.jpg", sizes: ["XS","S","M","L"] },
  { id: "p6", name: "Sneakers Adidas",price: 1299, img: "images/sneakers.jpg",    sizes: ["39","40","41","42","43","44"] },
  { id: "p7", name: "Tröja",          price: 679,  img: "images/troja.jpg",       sizes: ["XS","S","M","L","XL"] },
  { id: "p8", name: "Keps TNF",       price: 329,  img: "images/keps.jpg",        sizes: ["One Size"] },
  { id: "p9", name: "Kappa",          price: 2799, img: "images/coat.jpg",        sizes: ["XS","S","M","L"] },
];

/* ===== Member / Auth (demo, localStorage — ej för produktion) ===== */
const USERS_KEY = "dan25:users";           // { [email]: {email, name, pass, isMember:true, memberDiscountUsed:false, ...profile } }
const CURRENT_USER_KEY = "dan25:currentUser";

function loadUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY)||"{}"); }catch(_){ return {}; } }
function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getCurrentUserEmail(){ return localStorage.getItem(CURRENT_USER_KEY) || null; }
function setCurrentUserEmail(email){ localStorage.setItem(CURRENT_USER_KEY, email); }
function clearCurrentUserEmail(){ localStorage.removeItem(CURRENT_USER_KEY); }
function getCurrentUser(){ const users = loadUsers(); const email = getCurrentUserEmail(); return email ? users[email] || null : null; }

function registerUser({name, email, pass}){
  const users = loadUsers();
  if (users[email]) throw new Error("E-postadressen är redan registrerad.");
  users[email] = { email, name: name || "", pass, isMember: true, memberDiscountUsed: false };
  saveUsers(users);
  setCurrentUserEmail(email);
  return users[email];
}
function loginUser({email, pass}){
  const users = loadUsers();
  const u = users[email];
  if (!u || u.pass !== pass) throw new Error("Fel e-post eller lösenord.");
  setCurrentUserEmail(email);
  return u;
}
function logoutUser(){ clearCurrentUserEmail(); }

/* ===== Cart / Favs ===== */
const CART_KEY = "dan25:cart";
const FAV_KEY  = "dan25:favs";
let cart = {};
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}"); } catch(_) { cart = {}; }
let favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));

/* Helpers */
const $ = (sel, root=document) => root.querySelector(sel);
const appRoot = () => document.getElementById("app");
const safeSrc = (p) => p.img.split("/").map(encodeURIComponent).join("/");

const isFav = (id) => favs.has(id);
function toggleFav(id){
  favs.has(id) ? favs.delete(id) : favs.add(id);
  localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
  updateFavBadge();
}
function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function updateCartBadge(){
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  const badge = $("#cartCount");
  if (badge) badge.textContent = String(count);
}
function updateFavBadge(){
  const badge = $("#favCount");
  if (badge) badge.textContent = String(favs.size);
}
function addToCart(id, qty=1){
  cart[id] = (cart[id]||0) + qty;
  saveCart(); updateCartBadge();
}
function setQty(id, qty){
  if (qty<=0) delete cart[id]; else cart[id] = qty;
  saveCart(); updateCartBadge();
}
function getSubtotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return sum + (p ? p.price*qty : 0);
  }, 0);
}
function getShipping(subtotal){ return subtotal >= 499 ? 0 : 49; }

/* SVG icon (kundvagn) */
function cartSVG(){
  return `
<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.16 14h9.69c.83 0 1.56-.5 1.87-1.26l2.66-6.22A1 1 0 0 0 20.47 5H6.21L5.27 3H2v2h2l3.6 7.59-.94 2.03A2 2 0 0 0 6.6 17H19v-2H7.42l.74-1.6Z"/>
</svg>`;
}

/* Fly-to-cart animation */
function flyToCart(imgEl){
  const cartBtn = document.querySelector('.cart-btn');
  if (!imgEl || !cartBtn) return;

  const imgRect  = imgEl.getBoundingClientRect();
  const cartRect = cartBtn.getBoundingClientRect();

  const clone = imgEl.cloneNode(true);
  Object.assign(clone.style, {
    position: 'fixed', zIndex: 9999, top: imgRect.top+'px', left: imgRect.left+'px',
    width: imgRect.width+'px', height: imgRect.height+'px', borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,.35)', pointerEvents: 'none',
    transition: 'transform .8s cubic-bezier(0.22,0.61,0.36,1), opacity .8s ease'
  });
  document.body.appendChild(clone);

  const dx = (cartRect.left + cartRect.width/2)  - (imgRect.left + imgRect.width/2);
  const dy = (cartRect.top  + cartRect.height/2) - (imgRect.top  + imgRect.height/2);

  clone.getBoundingClientRect();
  clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
  clone.style.opacity = '0.4';

  clone.addEventListener('transitionend', () => {
    clone.remove();
    cartBtn.classList.add('cart-bounce');
    setTimeout(()=> cartBtn.classList.remove('cart-bounce'), 500);
  }, { once: true });
}

/* =========================================
   Views
   ========================================= */
function viewHome(){
  appRoot().innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h2 class="hero-title">BACK TO THE BASICS</h2>
        <p class="hero-sub">Jeans, t-shirts och tidlösa plagg.</p>
        <div class="hero-cta">
          <a href="#home" class="btn-pill" outline>DAM</a>
          <a href="#home" class="btn-pill outline">HERR</a>
          <a href="#home" class="btn-pill outline">UNISEX</a>
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

  const sort = $("#sortSelect");
  if (sort){
    sort.hidden = false;
    sort.value = "";
    sort.onchange = (e)=> sortProducts(e.target.value);
  }

  renderProducts();
}

/* Produktgrid */
let currentProducts = PRODUCTS.slice();

function renderProducts(){
  const grid = $("#productGrid");
  if (!grid) return;
  grid.innerHTML = "";

  currentProducts.forEach(p=>{
    const favActive  = isFav(p.id);
    const favIcon    = favActive ? "♥" : "♡";
    const ariaPressed= favActive ? "true" : "false";

    const card = document.createElement("article");
    card.className = "card fade-in";
    card.tabIndex = 0;
    card.setAttribute("role","link");
    card.dataset.id = p.id;

    card.innerHTML = `
      <button class="fav-btn${favActive ? " active" : ""}" aria-pressed="${ariaPressed}" aria-label="Spara som favorit" data-id="${p.id}">${favIcon}</button>
      <button class="quick-add" aria-label="Lägg i varukorgen" title="Lägg i varukorgen" data-id="${p.id}">${cartSVG()}</button>
      <div class="media">
        <img src="${safeSrc(p)}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='images/fallback.jpg'">
      </div>
      <h3>${p.name}</h3>
      <p class="price">${fmt.format(p.price)}</p>
    `;

    const open = () => { openProduct(p.id); };
    card.addEventListener("click", open);
    card.addEventListener("keydown", e=>{
      if (e.key==="Enter" || e.key===" "){ e.preventDefault(); open(); }
    });

    const favBtn = card.querySelector(".fav-btn");
    favBtn.addEventListener("click", (e)=>{
      e.stopPropagation();
      toggleFav(p.id);
      const active = isFav(p.id);
      favBtn.classList.toggle("active", active);
      favBtn.setAttribute("aria-pressed", active ? "true" : "false");
      favBtn.textContent = active ? "♥" : "♡";
    });

    const qa = card.querySelector(".quick-add");
    qa.addEventListener("click", (e)=>{
      e.stopPropagation();
      addToCart(p.id, 1);
      flyToCart(card.querySelector(".media img"));
      qa.classList.add("pulse");
      setTimeout(()=>qa.classList.remove("pulse"), 280);
    });

    grid.appendChild(card);
  });
}

function openProduct(id){
  if (location.hash !== `#product/${id}`) location.hash = `#product/${id}`;
  viewProduct(id);
}

function viewProduct(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if (!p){ navigateTo("#home"); return; }

  appRoot().innerHTML = `
    <section class="product-view">
      <div class="breadcrumbs">
        <a href="#home">Hem</a> / <a href="#home" data-link="shop">Butik</a> / ${p.name}
      </div>

      <div class="product-grid">
        <div class="product-gallery">
          <img src="${safeSrc(p)}" alt="${p.name}" onerror="this.onerror=null;this.src='images/fallback.jpg'">
        </div>

        <div class="product-info">
          <h1>${p.name}</h1>
          <div class="product-price">${fmt.format(p.price)}</div>

          <div class="controls">
            <div class="field">
              <label for="size">Storlek</label>
              <select id="size" class="select" required>
                ${p.sizes.map(s=>`<option value="${s}">${s}</option>`).join("")}
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
              <input id="qty" class="qty" type="number" min="1" value="1"/>
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

  $("#addBtn").onclick = () => {
    const qty = Math.max(1, parseInt($("#qty").value || "1", 10));
    addToCart(p.id, qty);
    $("#addBtn").textContent = "Tillagd ✓";
    setTimeout(()=> $("#addBtn").textContent = "Lägg i varukorgen", 1200);
  };
  $("#backBtn").onclick = () => navigateTo("#home");

  const sort = $("#sortSelect"); if (sort) sort.hidden = true;
}

/* -------- FAVORITER -------- */
function viewFavorites(){
  const ids = [...favs];
  const favProducts = PRODUCTS.filter(p => ids.includes(p.id));

  appRoot().innerHTML = `
    <section class="container">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Favoriter</h2>
      ${favProducts.length ? `<div id="favGrid" class="grid"></div>` : `<p class="muted">Du har inga favoriter ännu.</p>`}
    </section>
  `;

  const grid = $("#favGrid");
  if (!grid) return;

  favProducts.forEach(p=>{
    const card = document.createElement("article");
    card.className = "card fade-in";
    card.innerHTML = `
      <button class="fav-btn active" aria-pressed="true" aria-label="Ta bort favorit" data-id="${p.id}">♥</button>
      <div class="media">
        <img src="${safeSrc(p)}" alt="${p.name}" onerror="this.onerror=null;this.src='images/fallback.jpg'">
      </div>
      <h3>${p.name}</h3>
      <p class="price">${fmt.format(p.price)}</p>
      <div style="display:flex; gap:8px; padding:0 16px 16px">
        <button class="btn primary" data-add="${p.id}">Lägg i varukorg</button>
        <button class="btn" data-remove="${p.id}">Ta bort</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.addEventListener("click", (e)=>{
    const idAdd = e.target.getAttribute("data-add");
    const idRem = e.target.getAttribute("data-remove");
    const favBtn = e.target.closest(".fav-btn");

    if (idAdd){
      addToCart(idAdd, 1);
    } else if (idRem){
      toggleFav(idRem);
      viewFavorites();
    } else if (favBtn){
      const id = favBtn.getAttribute("data-id");
      toggleFav(id);
      viewFavorites();
    }
  });
}

/* -------- ACCOUNT (login / signup / logout) -------- */
function viewAccount(){
  const user = getCurrentUser();
  appRoot().innerHTML = `
    <section class="container">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Konto</h2>

      ${user ? `
        <div class="auth-card">
          <p>Inloggad som <strong>${user.email}</strong>${user.name ? ` (${user.name})` : ""}.</p>
          <p class="auth-small">Medlemsstatus: ${user.isMember ? "Member" : "—"} · Första orderns 15%: ${user.memberDiscountUsed ? "förbrukad" : "tillgänglig"}</p>
          <div class="auth-actions" style="margin-top:10px">
            <button class="btn" id="logoutBtn">Logga ut</button>
            <button class="btn primary" id="toCheckoutBtn">Till kassan</button>
          </div>
        </div>
      ` : `
        <div class="auth-grid">
          <div class="auth-card">
            <h3>Logga in</h3>
            <div class="field"><label>E-post</label><input id="loginEmail" type="email" autocomplete="email"></div>
            <div class="field"><label>Lösenord</label><input id="loginPass" type="password" autocomplete="current-password"></div>
            <div class="auth-actions">
              <button class="btn primary" id="loginBtn">Logga in</button>
              <span id="loginMsg" class="auth-small"></span>
            </div>
          </div>

          <div class="auth-card">
            <h3>Skapa konto</h3>
            <div class="field"><label>Namn</label><input id="regName" autocomplete="name"></div>
            <div class="field"><label>E-post</label><input id="regEmail" type="email" autocomplete="email"></div>
            <div class="field"><label>Lösenord</label><input id="regPass" type="password" autocomplete="new-password"></div>
            <div class="auth-actions">
              <button class="btn primary" id="regBtn">Sign up (15% first order)</button>
              <span id="regMsg" class="auth-small"></span>
            </div>
          </div>
        </div>
        <p class="auth-small" style="margin-top:10px">Demo-inloggning (lagras lokalt). För produktion: använd riktig backend/auth.</p>
      `}
    </section>
  `;

  $("#logoutBtn")?.addEventListener("click", ()=>{
    logoutUser();
    viewAccount();
  });
  $("#toCheckoutBtn")?.addEventListener("click", ()=> navigateTo("#checkout"));

  $("#loginBtn")?.addEventListener("click", ()=>{
    const email = $("#loginEmail").value.trim().toLowerCase();
    const pass  = $("#loginPass").value;
    const msg = $("#loginMsg");
    try{
      loginUser({email, pass});
      msg.textContent = "Inloggad ✔";
      navigateTo("#checkout");
    }catch(e){ msg.textContent = e.message; }
  });
  $("#regBtn")?.addEventListener("click", ()=>{
    const name  = $("#regName").value.trim();
    const email = $("#regEmail").value.trim().toLowerCase();
    const pass  = $("#regPass").value;
    const msg = $("#regMsg");
    if (!email || !pass){ msg.textContent = "Fyll i e-post och lösenord."; return; }
    try{
      registerUser({name, email, pass});
      msg.textContent = "Konto skapat ✔";
      navigateTo("#checkout");
    }catch(e){ msg.textContent = e.message; }
  });
}

/* -------- Checkout (demo) med medlemsrabatt -------- */
function viewCheckout(){
  const items = Object.entries(cart).map(([id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return p ? { ...p, qty } : null;
  }).filter(Boolean);

  const subtotal = getSubtotal();
  const user = getCurrentUser();
  const eligibleMember = !!(user && user.isMember && !user.memberDiscountUsed);
  const memberDiscount = eligibleMember ? subtotal * 0.15 : 0;
  const subAfter = Math.max(0, subtotal - memberDiscount);
  const shipping = getShipping(subAfter);
  const total    = subAfter + shipping;

  appRoot().innerHTML = `
    <section class="container checkout">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Kassa</h2>

      <div class="checkout-grid">
        <div class="order-col">
          ${!user ? `
            <div class="notice">
              <span>Log in for quicker checkout and <strong>15% on your first order as a member</strong>.</span>
              <button class="btn" id="goLogin">Log in / Sign up</button>
            </div>
          ` : ""}

          ${items.length ? `
          <ul class="cart-list">
            ${items.map(it=>`
              <li class="cart-row" data-id="${it.id}">
                <img src="${safeSrc(it)}" alt="${it.name}" class="cart-thumb" onerror="this.onerror=null;this.src='images/fallback.jpg'">
                <div class="cart-meta">
                  <div class="cart-name">${it.name}</div>
                  <div class="cart-price">${fmt.format(it.price)}</div>
                </div>
                <div class="qty-controls">
                  <button class="qty-btn" data-dec>−</button>
                  <input class="qty-input" type="number" min="1" value="${it.qty}">
                  <button class="qty-btn" data-inc>+</button>
                </div>
                <button class="remove" title="Ta bort" aria-label="Ta bort">✕</button>
              </li>
            `).join("")}
          </ul>

          <div class="summary">
            <div><span>Delsumma</span><span>${fmt.format(subtotal)}</span></div>
            ${memberDiscount ? `<div><span>Member discount (first order)</span><span>−${fmt.format(memberDiscount)}</span></div>` : ``}
            <div><span>Frakt</span><span>${shipping ? fmt.format(shipping) : "0 kr (gratis)"}</span></div>
            <hr/>
            <div class="total"><span>Totalt</span><span>${fmt.format(total)}</span></div>
            <p class="muted" style="margin-top:6px">Fri frakt vid köp över 499 kr.</p>
          </div>
          ` : `
          <p class="muted">Din varukorg är tom.</p>
          `}
        </div>

        <form class="checkout-form" id="checkoutForm" novalidate>
          <h3>Leveransuppgifter</h3>

          <div class="form-grid">
            <div class="field">
              <label>Förnamn *</label>
              <input required name="firstName" autocomplete="given-name">
            </div>
            <div class="field">
              <label>Efternamn *</label>
              <input required name="lastName" autocomplete="family-name">
            </div>
            <div class="field">
              <label>E-post *</label>
              <input required type="email" name="email" autocomplete="email">
            </div>
            <div class="field">
              <label>Telefon</label>
              <input type="tel" name="phone" autocomplete="tel">
            </div>
            <div class="field wide">
              <label>Adress *</label>
              <input required name="address1" autocomplete="address-line1" placeholder="Gata och nummer">
            </div>
            <div class="field">
              <label>Postnr *</label>
              <input required name="zip" autocomplete="postal-code">
            </div>
            <div class="field">
              <label>Ort *</label>
              <input required name="city" autocomplete="address-level2">
            </div>
            <div class="field">
              <label>Land *</label>
              <select required name="country" class="select">
                <option value="SE" selected>Sverige</option>
                <option value="NO">Norge</option>
                <option value="DK">Danmark</option>
                <option value="FI">Finland</option>
              </select>
            </div>
          </div>

          <button class="btn primary full" type="submit"${items.length? "":" disabled"}>Slutför köp (demo)</button>
          <p class="muted" style="margin-top:8px">Detta är en demo–checkout (ingen betalning sker).</p>
        </form>
      </div>
    </section>
  `;

  // Prefill om inloggad och har sparade uppgifter
  if (user && user.profile){
    const f = $("#checkoutForm");
    if (f){
      for (const [k,v] of Object.entries(user.profile)){
        const el = f.querySelector(`[name="${k}"]`);
        if (el && v) el.value = v;
      }
      if (!f.querySelector('[name="email"]').value) f.querySelector('[name="email"]').value = user.email;
      // Fyll namn om saknas
      if (user.name && !f.querySelector('[name="firstName"]').value){
        const parts = user.name.split(" ");
        f.querySelector('[name="firstName"]').value = parts[0] || "";
        f.querySelector('[name="lastName"]').value  = parts.slice(1).join(" ");
      }
    }
  } else if (user){
    // fyll e-post åtminstone
    const emailEl = document.querySelector('[name="email"]');
    if (emailEl) emailEl.value = user.email;
  }

  // qty +/-, remove
  $(".order-col")?.addEventListener("click", (e)=>{
    const row = e.target.closest(".cart-row"); if (!row) return;
    const id = row.dataset.id;

    if (e.target.matches("[data-inc]")) {
      setQty(id, (cart[id]||1)+1);
      row.querySelector(".qty-input").value = cart[id];
      viewCheckout();
    } else if (e.target.matches("[data-dec]")) {
      setQty(id, (cart[id]||1)-1);
      if (!cart[id]) row.remove();
      viewCheckout();
    } else if (e.target.matches(".remove")) {
      setQty(id, 0);
      viewCheckout();
    }
  });
  $(".order-col")?.addEventListener("change", (e)=>{
    const row = e.target.closest(".cart-row");
    if (row && e.target.matches(".qty-input")){
      const id = row.dataset.id;
      const v = Math.max(1, parseInt(e.target.value||"1",10));
      setQty(id, v);
      viewCheckout();
    }
  });

  $("#goLogin")?.addEventListener("click", ()=> navigateTo("#account"));

  // submit (demo)
  $("#checkoutForm")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()){ form.reportValidity(); return; }

    // Spara profil till användaren för snabbare nästa gång
    const userNow = getCurrentUser();
    if (userNow){
      const users = loadUsers();
      users[userNow.email] = {
        ...userNow,
        profile: Object.fromEntries(new FormData(form).entries()),
        // Första ordern: markera rabatt som använd om den var aktiv
        memberDiscountUsed: userNow.memberDiscountUsed || eligibleMember
      };
      saveUsers(users);
    }

    cart = {}; saveCart(); updateCartBadge();
    appRoot().innerHTML = `
      <section class="container fade-in" style="text-align:center;max-width:720px">
        <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Tack för din beställning!</h2>
        <p class="muted">Du får ett bekräftelsemejl inom kort (demo-text).</p>
        <p style="margin-top:20px"><a class="btn" href="#home">Tillbaka till butiken</a></p>
      </section>
    `;
  });

  const sort = $("#sortSelect"); if (sort) sort.hidden = true;
}

/* Static pages */
function viewAbout(){
  appRoot().innerHTML = `
    <section class="container fade-in">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Om Oss</h2>
      <p style="color:var(--muted);max-width:820px">
        DAN25 CLOTHING erbjuder tidlösa basplagg med modern passform. Fokus på kvalitet,
        enkelhet och stilren design i ett mörkt, elegant uttryck.
      </p>
    </section>
  `;
  const sort = $("#sortSelect"); if (sort) sort.hidden = true;
}
function viewContact(){
  appRoot().innerHTML = `
    <section class="container fade-in">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Kontakt</h2>
      <p style="color:var(--muted)">Mail: support@dan25clothing.se · Tel: 010-123 45 67</p>
      <p style="color:var(--muted)">Öppettider: Vardagar 09–17</p>
    </section>
  `;
  const sort = $("#sortSelect"); if (sort) sort.hidden = true;
}

/* Sorting */
function sortProducts(type){
  if(type === "price-asc")      currentProducts.sort((a,b)=> a.price-b.price);
  else if(type === "price-desc")currentProducts.sort((a,b)=> b.price-a.price);
  else if(type === "name-asc")  currentProducts.sort((a,b)=> a.name.localeCompare(b.name,"sv"));
  else                          currentProducts = PRODUCTS.slice();
  renderProducts();
}

/* Mobile nav + Router & Init */
function setupMobileNav(){
  const toggle = document.querySelector(".nav-toggle");
  const nav    = document.querySelector(".main-nav");
  if(!toggle || !nav) return;

  const open  = ()=>{ document.body.classList.add("nav-open");  toggle.setAttribute("aria-expanded","true"); };
  const close = ()=>{ document.body.classList.remove("nav-open");toggle.setAttribute("aria-expanded","false"); };

  toggle.addEventListener("click", ()=> document.body.classList.contains("nav-open") ? close() : open());
  nav.addEventListener("click", e=>{ if (e.target.matches("a")) close(); });
  window.addEventListener("keydown", e=>{ if (e.key==="Escape") close(); });
  window.addEventListener("resize", ()=>{ if (innerWidth>640) close(); });
}
function setupCartButton(){
  document.querySelector(".cart-btn")?.addEventListener("click", ()=>{ navigateTo("#checkout"); });
}
function setupFavListButton(){
  document.querySelector(".favlist-btn")?.addEventListener("click", ()=>{ navigateTo("#favorites"); });
}

/* Visa/dölj kupongraden beroende på route */
function updateCouponBarVisibility(hash){
  const h = hash || (location.hash || "#home");
  const bar = document.getElementById("couponBar");
  if (!bar) return;
  bar.style.display = (h === "#home") ? "" : "none";
}

function navigateTo(hash){ location.hash === hash ? router() : (location.hash = hash); }
function router(){
  const h = location.hash || "#home";
  updateCouponBarVisibility(h);

  const m = h.match(/^#product[\/-]([^/?#]+)$/);
  if (m){ viewProduct(m[1]); return; }
  switch(h){
    case "#about":     return viewAbout();
    case "#contact":   return viewContact();
    case "#checkout":  return viewCheckout();
    case "#favorites": return viewFavorites();
    case "#account":   return viewAccount();
    case "#home":
    default:           currentProducts = PRODUCTS.slice(); return viewHome();
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", ()=>{
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  updateCartBadge(); updateFavBadge();
  setupMobileNav(); setupCartButton(); setupFavListButton();
  updateCouponBarVisibility();
  router();

  // “Butik” → scroll till grid
  document.body.addEventListener("click",(e)=>{
    const toShop = e.target.closest('[data-link="shop"]');
    if (toShop){
      navigateTo("#home");
      setTimeout(()=>{ $("#productGrid")?.scrollIntoView({behavior:"smooth", block:"start"}); }, 50);
    }
  });

  // Navigera via data-nav (t.ex. “Sign up here”)
  document.body.addEventListener("click",(e)=>{
    const btn = e.target.closest('[data-nav]');
    if (!btn) return;
    const dest = btn.getAttribute('data-nav');
    if (dest) navigateTo(dest);
  });
});
