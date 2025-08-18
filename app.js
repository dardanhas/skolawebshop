const fmt = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK'
});

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Klassisk Hoodie',
    price: 499,
    category: 'Kläder',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'p2',
    name: 'T-shirt Unisex',
    price: 199,
    category: 'Kläder',
    img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'p3',
    name: 'Sweatshirt Relaxed',
    price: 399,
    category: 'Kläder',
    img: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1600&auto=format&fit=crop'
  }
];

let cart = {};

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
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
    Object.values(cart).reduce((a,b) => a+b, 0);
}

window.addEventListener('DOMContentLoaded', renderProducts);
