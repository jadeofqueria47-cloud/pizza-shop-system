const BASE = '/api';

const api = {
  // ── Menu ──────────────────────────────────────────────────
  getMenu: () =>
    fetch(`${BASE}/menu`).then(r => r.json()),

  // ── Customers ─────────────────────────────────────────────
  register: (data) =>
    fetch(`${BASE}/customers/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${BASE}/customers/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),

  getMyOrders: (customerId) =>
    fetch(`${BASE}/customers/${customerId}/orders`).then(r => r.json()),

  // ── Orders ────────────────────────────────────────────────
  placeOrder: (data) =>
    fetch(`${BASE}/orders`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  getOrders: (status = '') =>
    fetch(`${BASE}/orders${status ? '?status=' + status : ''}`).then(r => r.json()),

  getOrder: (id) =>
    fetch(`${BASE}/orders/${id}`).then(r => r.json()),

  updateStatus: (id, status) =>
    fetch(`${BASE}/orders/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(r => r.json()),

  // ── Payments ──────────────────────────────────────────────
  confirmPayment: (orderId, data) =>
    fetch(`${BASE}/orders/${orderId}/pay`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  getReceipt: (orderId) =>
    fetch(`${BASE}/orders/${orderId}/receipt`).then(r => r.json()),

  // ── Admin ─────────────────────────────────────────────────
  getDailyReport: (date = '') =>
    fetch(`${BASE}/reports/daily-report${date ? '?date=' + date : ''}`).then(r => r.json()),
};

window.api = api;
