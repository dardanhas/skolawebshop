const fmt = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });

const PRODUCTS = [
  { id: 'p1',  name: 'MHoodie', price: 499,  img: 'images/hoodie.jpg' },
  { id: 'p2',  name: 'Basic Jeans',    price: 899,  img: 'images/jeans.jpg' },
  { id: 'p3',  name: 'Vit T-shirt',     price: 299,  img: 'images/tshirt.jpg' },
  { id: 'p4',  name: 'Svart T-shirt',      price: 2499, img: 'images/coat.jpg' },
  { id: 'p5',  name: 'Vinterjacka',      price: 3499, img: 'images/leather-jacket.jpg' },
  { id: 'p6',  name: 'Vit Skjorta',     price: 799,  img: 'images/shirt.jpg' },
  { id: 'p7',  name: 'Sneakers',        price: 1299, img: 'images/sneakers.jpg' },
  { id: 'p8',  name: 'Stickad Tröja',   price: 699,  img: 'images/sweater.jpg' },
  { id: 'p9',  name: 'Svart Kostym',    price: 4999, img: 'images/suit.jpg' },
  { id: 'p10', name: 'Trenchcoat',      price: 2299, img: 'images/trenchcoat.jpg' }
];

let cart = {};
let currentProducts = [...PRODUCTS];

function renderProducts(){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  currentProducts.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card fade-in';
    card.innerHTML = `
      <div class="media">
        <img src="${p.img}" alt="${p.name}" loading="lazy"
             onerror="this.onerror=null;this.src='images/fallback.jpg'">
      </div>
      <h3>${p.name}</h3>
      <p class="price">${fmt.format(p.price)}</p>
      <button type="button" onclick="addToCart('${p.id}')">Lägg i varukorgen</button>
    `;
    grid.appendChild(card);
  });
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

function renderCart(){
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = count;
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

window.addEventListener('DOMContentLoaded', ()=>{
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  renderProducts();
  renderCart();

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect){
    sortSelect.addEventListener('change', e => sortProducts(e.target.value));
  }
});
