// ── State ──────────────────────────────────────────────────
let currentRole = 'customer';
let menuData    = [];

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  setupRoleSwitcher();
  await loadMenu();
  renderPage();
});

// ── Role Switcher ──────────────────────────────────────────
function setupRoleSwitcher() {
  document.querySelectorAll('.role-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRole = btn.dataset.role;
      renderPage();
    });
  });
}

// ── Router ─────────────────────────────────────────────────
function renderPage() {
  const views = document.querySelectorAll('.view');
  views.forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${currentRole}`);
  if (target) target.classList.add('active');

  if (currentRole === 'customer')  renderCustomer();
  if (currentRole === 'cook')      renderCook();
  if (currentRole === 'cashier')   renderCashier();
  if (currentRole === 'delivery')  renderDelivery();
  if (currentRole === 'admin')     renderAdmin();
}

// ── Load Menu ──────────────────────────────────────────────
async function loadMenu() {
  const res = await api.getMenu();
  if (res.success) menuData = res.data;
}

// ══════════════════════════════════════════════════════════
// CUSTOMER VIEW
// ══════════════════════════════════════════════════════════
function renderCustomer() {
  const user = utils.getUser();
  const authDiv  = document.getElementById('cust-auth');
  const shopDiv  = document.getElementById('cust-shop');

  if (!user) {
    authDiv.style.display = 'block';
    shopDiv.style.display = 'none';
    setupAuthForms();
  } else {
    authDiv.style.display = 'none';
    shopDiv.style.display = 'block';
    document.getElementById('cust-name').textContent = `👋 Hi, ${user.name}!`;
    renderMenuGrid();
    renderCart();
    setupCustomerTabs();
  }
}

function setupAuthForms() {
  document.getElementById('btn-show-register')?.addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  });
  document.getElementById('btn-show-login')?.addEventListener('click', () => {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  });
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass  = document.getElementById('login-pass').value;
    const res = await api.login(email, pass);
    if (res.success) { utils.setUser(res.data); renderCustomer(); utils.toast('Logged in!'); }
    else utils.toast(res.message, 'error');
  });
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name:    document.getElementById('reg-name').value,
      email:   document.getElementById('reg-email').value,
      password:document.getElementById('reg-pass').value,
      phone:   document.getElementById('reg-phone').value,
      address: document.getElementById('reg-address').value,
    };
    const res = await api.register(data);
    if (res.success) { utils.toast('Account created! Please log in.'); document.getElementById('btn-show-login').click(); }
    else utils.toast(res.message, 'error');
  });
}

function setupCustomerTabs() {
  document.querySelectorAll('.cust-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cust-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.cust-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`cust-panel-${btn.dataset.tab}`).classList.add('active');
      if (btn.dataset.tab === 'history') loadMyOrders();
    });
  });
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    utils.clearUser(); utils.clearCart(); renderCustomer(); utils.toast('Logged out.');
  });
}

function renderMenuGrid() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  grid.innerHTML = menuData.map(p => `
    <div class="pizza-card" onclick="openPizzaModal(${p.id})">
      <div class="pizza-emoji">🍕</div>
      <div class="pizza-info">
        <strong>${p.name}</strong>
        <p>${p.description}</p>
        <span class="price">from ₱${p.base_price}</span>
      </div>
    </div>`).join('');
}

window.openPizzaModal = function(pizzaId) {
  const pizza = menuData.find(p => p.id === pizzaId);
  if (!pizza) return;
  document.getElementById('modal-pizza-name').textContent = pizza.name;
  document.getElementById('modal-pizza-desc').textContent = pizza.description;
  document.getElementById('modal-pizza-id').value = pizzaId;
  document.getElementById('modal-base-price').value = pizza.base_price;
  updateModalPrice();
  document.getElementById('pizza-modal').style.display = 'flex';
};

window.closeModal = function() { document.getElementById('pizza-modal').style.display = 'none'; };

window.updateModalPrice = function() {
  const base = parseFloat(document.getElementById('modal-base-price').value);
  const size = document.querySelector('input[name="size"]:checked')?.value || 'Medium';
  const toppings = document.querySelectorAll('input[name="topping"]:checked').length;
  const qty = parseInt(document.getElementById('modal-qty').value) || 1;
  const unit = utils.sizePrice(base, size) + toppings * 20;
  document.getElementById('modal-price-display').textContent = utils.peso(unit * qty);
};

document.getElementById('btn-add-to-cart')?.addEventListener('click', () => {
  const pizzaId = parseInt(document.getElementById('modal-pizza-id').value);
  const pizza   = menuData.find(p => p.id === pizzaId);
  const size    = document.querySelector('input[name="size"]:checked')?.value || 'Medium';
  const toppings= [...document.querySelectorAll('input[name="topping"]:checked')].map(i => i.value);
  const qty     = parseInt(document.getElementById('modal-qty').value) || 1;
  const unit    = utils.sizePrice(pizza.base_price, size) + toppings.length * 20;
  utils.addToCart({ pizza_id: pizzaId, pizza_name: pizza.name, size, toppings, quantity: qty, unit_price: unit, subtotal: unit * qty });
  closeModal();
  renderCart();
  utils.toast(`${pizza.name} added to cart!`);
  // Switch to cart tab
  document.querySelector('.cust-tab[data-tab="cart"]')?.click();
});

function renderCart() {
  const cart = utils.getCart();
  const list = document.getElementById('cart-list');
  const totalEl = document.getElementById('cart-total');
  if (!list) return;
  if (!cart.length) { list.innerHTML = '<p class="empty">Your cart is empty.</p>'; if(totalEl) totalEl.textContent=''; return; }
  list.innerHTML = cart.map(item => `
    <div class="order-row">
      <div>
        <strong>${item.pizza_name}</strong> — ${item.size}<br>
        <small>${item.toppings.length ? item.toppings.join(', ') : 'No extra toppings'} × ${item.quantity}</small>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="price">${utils.peso(item.subtotal)}</span>
        <button class="del-btn" onclick="removeCartItem(${item._key})">✕</button>
      </div>
    </div>`).join('');
  if (totalEl) totalEl.innerHTML = `<strong>Total: <span class="price big">${utils.peso(utils.cartTotal())}</span></strong>`;
}

window.removeCartItem = function(key) { utils.removeFromCart(key); renderCart(); };

document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = utils.getUser();
  const cart = utils.getCart();
  if (!cart.length) { utils.toast('Your cart is empty!', 'error'); return; }
  const address = document.getElementById('delivery-address').value;
  const items = cart.map(i => ({ pizza_id: i.pizza_id, size: i.size, quantity: i.quantity, toppings: i.toppings }));
  const res = await api.placeOrder({ customer_id: user.id, delivery_address: address, items });
  if (res.success) {
    utils.clearCart(); renderCart();
    utils.toast(`Order #${res.order_id} placed!`);
    document.querySelector('.cust-tab[data-tab="history"]')?.click();
  } else utils.toast(res.message, 'error');
});

async function loadMyOrders() {
  const user = utils.getUser();
  if (!user) return;
  const res = await api.getMyOrders(user.id);
  const list = document.getElementById('my-orders-list');
  if (!list) return;
  if (!res.success || !res.data.length) { list.innerHTML = '<p class="empty">No orders yet.</p>'; return; }
  list.innerHTML = res.data.map(o => `
    <div class="order-card">
      <div class="order-card-head">
        <span>Order #${o.id}</span>
        <span class="status-badge" style="background:${utils.statusColor(o.status)}">${o.status}</span>
      </div>
      <div class="order-card-foot"><span>${new Date(o.created_at).toLocaleString()}</span><strong>${utils.peso(o.total_amount)}</strong></div>
    </div>`).join('');
}

// ══════════════════════════════════════════════════════════
// COOK VIEW
// ══════════════════════════════════════════════════════════
async function renderCook() {
  const res = await api.getOrders();
  const list = document.getElementById('cook-orders');
  if (!list) return;
  const active = res.data?.filter(o => ['Pending','Preparing'].includes(o.status)) || [];
  if (!active.length) { list.innerHTML = '<p class="empty">No active orders. 🎉</p>'; return; }
  list.innerHTML = active.map(o => `
    <div class="order-card kitchen">
      <div class="order-card-head">
        <span>Order #${o.id} — <strong>${o.customer_name}</strong></span>
        <span class="status-badge" style="background:${utils.statusColor(o.status)}">${o.status}</span>
      </div>
      <p style="font-size:13px;color:#aaa;margin:4px 0">📍 ${o.delivery_address}</p>
      <div style="margin-top:10px">
        ${o.status === 'Pending'
          ? `<button class="primary-btn" onclick="cookAction(${o.id},'Preparing')">▶ Start Preparing</button>`
          : `<button class="primary-btn" onclick="cookAction(${o.id},'Ready')">✅ Mark as Ready</button>`}
      </div>
    </div>`).join('');
}

window.cookAction = async function(id, status) {
  const res = await api.updateStatus(id, status);
  if (res.success) { utils.toast(`Order #${id} → ${status}`); renderCook(); }
  else utils.toast(res.message, 'error');
};

// ══════════════════════════════════════════════════════════
// CASHIER VIEW
// ══════════════════════════════════════════════════════════
async function renderCashier() {
  const res = await api.getOrders('Ready');
  const list = document.getElementById('cashier-orders');
  if (!list) return;
  const unpaid = res.data?.filter(o => !o.paid) || [];
  if (!unpaid.length) { list.innerHTML = '<p class="empty">No orders awaiting payment.</p>'; return; }
  list.innerHTML = unpaid.map(o => `
    <div class="order-card">
      <div class="order-card-head">
        <span>Order #${o.id} — ${o.customer_name}</span>
        <span class="price big">${utils.peso(o.total_amount)}</span>
      </div>
      <p style="font-size:13px;color:#aaa;margin:4px 0">📍 ${o.delivery_address}</p>
      <div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <select id="method-${o.id}" class="input" style="width:120px">
          <option>Cash</option><option>GCash</option><option>Card</option>
        </select>
        <input id="paid-${o.id}" class="input" style="width:130px" type="number" placeholder="Amount paid" value="${o.total_amount}">
        <button class="primary-btn" onclick="processPayment(${o.id}, ${o.total_amount})">✅ Confirm & Receipt</button>
      </div>
    </div>`).join('');
}

window.processPayment = async function(orderId, total) {
  const method = document.getElementById(`method-${orderId}`).value;
  const amount = parseFloat(document.getElementById(`paid-${orderId}`).value);
  if (amount < total) { utils.toast('Amount paid is less than total!', 'error'); return; }
  const res = await api.confirmPayment(orderId, { method, amount_paid: amount, processed_by: 'Cashier' });
  if (res.success) {
    utils.toast(`Payment confirmed! Change: ${utils.peso(res.change_given)}`);
    showReceipt(orderId);
    renderCashier();
  } else utils.toast(res.message, 'error');
};

async function showReceipt(orderId) {
  const res = await api.getReceipt(orderId);
  if (!res.success) return;
  const d = res.data;
  const win = window.open('', '_blank', 'width=400,height=600');
  win.document.write(`
    <html><head><title>Receipt #${d.order_id}</title>
    <style>body{font-family:monospace;padding:24px;background:#fff;color:#000}
    hr{border:1px dashed #000}.total{font-size:18px;font-weight:bold}</style></head>
    <body>
      <h2>🍕 Slice & Spice</h2>
      <p>Order #${d.order_id}<br>${d.customer_name}<br>${d.delivery_address}</p><hr>
      ${d.items.map(i=>`<p>${i.pizza_name} (${i.size}) x${i.quantity} — ₱${i.subtotal}</p>`).join('')}
      <hr><p class="total">TOTAL: ₱${d.total_amount}</p>
      <p>Payment: ${d.payment_method}<br>Paid: ₱${d.amount_paid}<br>Change: ₱${d.change_given}</p>
      <hr><p>Processed by: ${d.processed_by}<br>${new Date(d.processed_at).toLocaleString()}</p>
      <script>window.print()</script>
    </body></html>`);
}

// ══════════════════════════════════════════════════════════
// DELIVERY VIEW
// ══════════════════════════════════════════════════════════
async function renderDelivery() {
  const res = await api.getOrders('Out for Delivery');
  const list = document.getElementById('delivery-orders');
  if (!list) return;
  const active = res.data || [];
  if (!active.length) { list.innerHTML = '<p class="empty">No active deliveries.</p>'; return; }
  list.innerHTML = active.map(o => `
    <div class="order-card">
      <div class="order-card-head">
        <span>Order #${o.id} — <strong>${o.customer_name}</strong></span>
        <span class="status-badge" style="background:${utils.statusColor(o.status)}">${o.status}</span>
      </div>
      <p style="font-size:13px;color:#aaa;margin:4px 0">📍 ${o.delivery_address}</p>
      <button class="primary-btn" style="margin-top:10px" onclick="markDelivered(${o.id})">🏠 Mark as Delivered</button>
    </div>`).join('');
}

window.markDelivered = async function(id) {
  const res = await api.updateStatus(id, 'Delivered');
  if (res.success) { utils.toast(`Order #${id} Delivered!`); renderDelivery(); }
  else utils.toast(res.message, 'error');
};

// ══════════════════════════════════════════════════════════
// ADMIN VIEW
// ══════════════════════════════════════════════════════════
async function renderAdmin() {
  const res = await api.getDailyReport();
  if (!res.success) { utils.toast('Could not load report.', 'error'); return; }
  const d = res.data;
  document.getElementById('stat-revenue').textContent = utils.peso(d.total_revenue);
  document.getElementById('stat-orders').textContent  = d.total_orders;
  document.getElementById('stat-paid').textContent    = d.paid_orders || d.by_status?.Delivered || 0;
  document.getElementById('stat-pending').textContent = d.by_status?.Pending || 0;

  const topList = document.getElementById('top-pizzas');
  if (topList) topList.innerHTML = (d.top_pizzas || []).map(p => `
    <div class="bar-row">
      <span style="width:160px;font-size:13px">${p.name}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, (p.qty_sold / (d.top_pizzas[0]?.qty_sold||1)) * 100)}%"></div></div>
      <span style="font-size:13px;color:#ef4444;margin-left:8px">${p.qty_sold} pcs</span>
    </div>`).join('');
}
