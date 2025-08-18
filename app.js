const fmt = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK'
});

let PRODUCTS = [
  { id: 'p1', name: 'Klassisk Hoodie', price: 499, img: 'https://source.unsplash.com/600x800/?hoodie,fashion' },
  { id: 'p2', name: 'Svarta Jeans', price: 899, img: 'https://source.unsplash.com/600x800/?jeans,fashion' },
  { id: 'p3', name: 'Vit T-shirt', price: 299, img: 'https://source.unsplash.com/600x800/?tshirt,fashion' },
  { id: 'p4', name: 'Lång Kappa', price: 2499, img: 'https://source.unsplash.com/600x800/?coat,fashion' },
  { id: 'p5', name: 'Läderjacka', price: 3499, img: 'https://source.unsplash.com/600x800/?leather-jacket,fashion' },
  { id: 'p6', name: 'Vit Skjorta', price: 799, img: 'https://source.unsplash.com/600x800/?shirt,fashion' },
  { id: 'p7', name: 'Sneakers', price: 1299, img: 'https://source.unsplash.com/600x800/?sneakers,fashion' },
  { id: 'p8', name: 'Stickad Tröja', price: 699, img: 'https://source.unsplash.com/600x800/?sweater,fashion' },
  { id: 'p9', name: 'Svart Kostym', price: 4999, img: 'https://source.unsplash.com/600x800/?suit,fashion' },
  { id: 'p10', name: 'Trenchcoat', price: 2299, img: 'https://source.unsplash.com/600x800/?trenchcoat,fashion' }
];

let cart = {};
let currentProducts = [...PRODUCTS];

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  currentProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
      <div class="media">
        <img src="${p.img}" alt="${p.name}">
      </div>
      <h3>${p.name}</h3>
      <p class="price">${fmt.format(p.price)}</p>
      <button onclick="addToCart('${p.id}')">Lägg i varukorgen</button>
    `;
    grid.appendChild(card);
  });
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

function renderCart() {
  document.getElementById('cartCount').textContent =
    Object.values(cart).reduce((a, b) => a + b, 0);
}

/* ===== Sortering ===== */
function sortProducts(type) {
  if (type === 'price-asc') {
    currentProducts.sort((a, b) => a.price - b.price);
  } else if (type === 'price-desc') {
    currentProducts.sort((a, b) => b.price - a.price);
  } else if (type === 'name-asc') {
    currentProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    currentProducts = [...PRODUCTS];
  }
  renderProducts();
}

window.addEventListener('DOMContentLoaded', () => {
  renderProducts();

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      sortProducts(e.target.value);
    });
  }
});
