const utils = {
  // Format peso
  peso: (amount) => `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,

  // Status badge color
  statusColor: (status) => ({
    'Pending':          '#f59e0b',
    'Preparing':        '#3b82f6',
    'Ready':            '#8b5cf6',
    'Out for Delivery': '#f97316',
    'Delivered':        '#10b981',
  }[status] || '#888'),

  // Size multiplier
  sizePrice: (basePrice, size) => {
    const mult = { Small: 1.0, Medium: 1.25, Large: 1.5 };
    return Math.round(basePrice * (mult[size] || 1));
  },

  // Show a toast notification
  toast: (msg, type = 'success') => {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3000);
  },

  // Save / get session (simple localStorage)
  setUser: (user) => localStorage.setItem('pizza_user', JSON.stringify(user)),
  getUser: ()     => JSON.parse(localStorage.getItem('pizza_user') || 'null'),
  clearUser: ()   => localStorage.removeItem('pizza_user'),

  // Cart helpers
  getCart: ()          => JSON.parse(localStorage.getItem('pizza_cart') || '[]'),
  setCart: (cart)      => localStorage.setItem('pizza_cart', JSON.stringify(cart)),
  clearCart: ()        => localStorage.removeItem('pizza_cart'),
  addToCart: (item)    => {
    const cart = utils.getCart();
    cart.push({ ...item, _key: Date.now() });
    utils.setCart(cart);
  },
  removeFromCart: (key) => {
    utils.setCart(utils.getCart().filter(i => i._key !== key));
  },
  cartTotal: () => utils.getCart().reduce((sum, i) => sum + i.subtotal, 0),
};

window.utils = utils;
