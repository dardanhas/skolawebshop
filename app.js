const fmt = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK'
});

const PRODUCTS = [
  { id: 'p1', name: 'Klassisk Hoodie', price: 499, img: 'https://images.unsplash.com/photo-1618354691373-d851c9965e1b?w=800&q=80' },
  { id: 'p2', name: 'Svarta Jeans', price: 899, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80' },
  { id: 'p3', name: 'Vit T-shirt', price: 299, img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80' },
  { id: 'p4', name: 'Lång Kappa', price: 2499, img: 'https://images.unsplash.com/photo-1617127365659-65b3d6dc63c0?w=800&q=80' },
  { id: 'p5', name: 'Läderjacka', price: 3499, img: 'https://images.unsplash.com/photo-1618354691299-78cb40cc5a9e?w=800&q=80' },
  { id: 'p6', name: 'Vit Skjorta', price: 799, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
  { id: 'p7', name: 'Sneakers', price: 1299, img: 'https://images.unsplash.com/photo-1606813909355-9e5c13fae249?w=800&q=80' },
  { id: 'p8', name: 'Stickad Tröja', price: 699, img: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80' },
  { id: 'p9', name: 'Kostymbyxor', price: 1599, img: 'https://images.unsplash.com/photo-1528701800489-20be9c7e6a43?w=800&q=80' },
  { id: 'p10', name: 'Svart Kostym', price: 4999, img: 'https://images.unsplash.com/photo-1520975698519-59c05e88a30e?w=800&q=80' },
  { id: 'p11', name: 'Trenchcoat', price: 2299, img: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?w=800&q=80' },
  { id: 'p12', name: 'Silkestopp', price: 999, img: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80' }
];

let cart = {};

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
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
    Object.values(cart).reduce((a,b) => a+b, 0);
}

window.addEventListener('DOMContentLoaded', renderProducts);
