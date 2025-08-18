/* ===== Data ===== */
const fmt = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });

const PRODUCTS = [
 { id: 'p1',  name: 'MHoodie', price: 499,  img: 'images/hoodie.jpg' },
  { id: 'p2',  name: 'Basic Jeans',    price: 899,  img: 'images/jeans.jpg' },
  { id: 'p3',  name: 'Vit T-shirt',     price: 299,  img: 'images/tshirt.jpg' },
  { id: 'p4',  name: 'Svart T-shirt',      price: 2499, img: 'images/svarttshirt.jpg' },
  { id: 'p5',  name: 'Vinterjacka',      price: 3499, img: 'images/vinterjacka.jpg' },
  { id: 'p6',  name: 'Sneakers',        price: 1299, img: 'images/sneakers.jpg' },
  { id: 'p7',  name: 'Tröja',   price: 699,  img: 'images/tröja.jpg' },
  { id: 'p8',  name: 'Keps',    price: 299, img: 'images/keps.jpg' },
  { id: 'p9', name: 'Coat',      price: 2299, img: 'images/coat.jpg' }
];

let cart = {};
let currentProducts = [...PRODUCTS];

/* ===== Helpers ===== */
const $ = (sel, root=document) => root.querySelector(sel);
const app = () => document.getElementById('app');

function updateCartBadge(){
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = count;
}

/* ===== Views ===== */
function viewHome(){
  app().innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h2 class="hero-title">BACK TO THE BASICS</h2>
        <p class="hero-sub">Jeans, skjortor och tidlösa plagg.</p>
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

  const sort = document.getElementById('sortSelect');
  if (sort){ sort.hidden = false; sort.value = ""; sort.onchange = e => sortProducts(e.target.value); }

  renderProducts();
}

/* Klickbara kort + defensiv routing */
function renderProducts(){
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';

  currentProducts.forEach(p=>{
    const a = document.createElement('a');
    a.className = 'card fade-in';
    a.href = `#product/${p.id}`;
    a.dataset.id = p.id;
    a.innerHTML = `
      <div class="media">
        <img src="${p.img}" alt="${p.name}" loading="lazy"
             onerror="this.onerror=null;this.src='images/fallback.jpg'">
      </div>
      <h3>${p.name}</h3>
      <p class="price">${fmt.format(p.price)}</p>
    `;
    grid.appendChild(a);
  });

  /* extra: event-delegering om något skulle blockera hashchange */
  grid.addEventListener('click', (e)=>{
    const link = e.target.closest('a.card');
    if (!link) return;
    e.preventDefault();
    navigateTo(link.getAttribute('href'));
    router(); // rendera direkt
  }, { once:true });
}

function viewProduct(id){
  const p = PRODUCTS.find(x=>x.id === id);
  if (!p){ navigateTo('#home'); return; }

  app().innerHTML = `
    <section class="product-view">
      <div class="breadcrumbs">
        <a href="#home">Hem</a> / <a href="#home" data-link="shop">Butik</a> / ${p.name}
      </div>

      <div class="product-grid">
        <div class="product-gallery">
          <img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='images/fallback.jpg'">
        </div>

        <div class="product-info">
          <h1>${p.name}</h1>
          <div class="product-price">${fmt.format(p.price)}</div>

          <div class="controls">
            <div class="field">
              <label for="size">Storlek</label>
              <select id="size" class="select" required>
                ${p.sizes.map(s=>`<option value="${s}">${s}</option>`).join('')}
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

  $('#addBtn').onclick = () => {
    const qty = Math.max(1, parseInt($('#qty').value || '1',10));
    cart[p.id] = (cart[p.id] || 0) + qty;
    updateCartBadge();
    $('#addBtn').textContent = 'Tillagd ✓';
    setTimeout(()=> $('#addBtn').textContent = 'Lägg i varukorgen', 1200);
  };

  $('#backBtn').onclick = () => navigateTo('#home');

  const sort = document.getElementById('sortSelect');
  if (sort) sort.hidden = true;
}

function viewAbout(){
  app().innerHTML = `
    <section class="container fade-in">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Om oss</h2>
      <p style="color:var(--muted);max-width:820px">
        MedieShoppen erbjuder tidlösa basplagg med modern passform. Vårt fokus är kvalitet,
        enkelhet och stilren design i ett mörkt, elegant uttryck.
      </p>
    </section>
  `;
  const sort = document.getElementById('sortSelect'); if (sort) sort.hidden = true;
}

function viewContact(){
  app().innerHTML = `
    <section class="container fade-in">
      <h2 style="font-family:'Cormorant',serif;margin-bottom:10px">Kontakt</h2>
      <p style="color:var(--muted)">Mail: support@medieshoppen.se · Tel: 010-123 45 67</p>
      <p style="color:var(--muted)">Öppettider: Vardagar 09–17</p>
    </section>
  `;
  const sort = document.getElementById('sortSelect'); if (sort) sort.hidden = true;
}

/* ===== Sortering ===== */
function sortProducts(type){
  if(type === 'price-asc'){
    currentProducts.sort((a,b)=> a.price - b.price);
  }else if(type === 'price-desc'){
    currentProducts.sort((a,b)=> b.price - a.price);
  }else if(type === 'name-asc'){
    currentProducts.sort((a,b)=> a.name.localeCompare(b.name, 'sv'));
  }else{
    currentProducts = [...PRODUCTS];
  }
  renderProducts();
}

/* ===== Router (robust) ===== */
function navigateTo(hash){ location.hash = hash; }

function router(){
  const h = location.hash || '#home';

  // matcha #product/ID på ett säkert sätt
  const m = h.match(/^#product\/(.+)$/);
  if (m){
    viewProduct(m[1]);
    return;
  }

  switch (h){
    case '#about':   return viewAbout();
    case '#contact': return viewContact();
    case '#home':
    default:         currentProducts = [...PRODUCTS]; return viewHome();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', ()=>{
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  updateCartBadge();
  router();

  // "Butik" i menyn: hem + scrolla till grid
  document.body.addEventListener('click', (e)=>{
    const link = e.target.closest('[data-link="shop"]');
    if (link){
      navigateTo('#home');
      setTimeout(()=>{
        const grid = document.getElementById('productGrid');
        if (grid) grid.scrollIntoView({behavior:'smooth', block:'start'});
      }, 50);
    }
  });
});
