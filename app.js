const fmt = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' });

const PRODUCTS = [
  { id: 'p1', name: 'Klassisk Hoodie', price: 499 },
  { id: 'p2', name: 'T-shirt Unisex', price: 199 },
  { id: 'p3', name: 'Kaffemugg', price: 149 }
];

let cart = {};

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>${fmt.format(p.price)}</p>
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

window.addEventListener('DOMContentLoaded', renderProducts);
