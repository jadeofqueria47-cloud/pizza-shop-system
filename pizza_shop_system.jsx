import { useState } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const MENU = [
  { id: 1, name: "Margherita", base: 199, img: "🍕", desc: "Classic tomato & mozzarella" },
  { id: 2, name: "Pepperoni Blast", base: 249, img: "🍕", desc: "Double pepperoni with cheddar" },
  { id: 3, name: "BBQ Chicken", base: 269, img: "🍕", desc: "Smoky BBQ with grilled chicken" },
  { id: 4, name: "Veggie Supreme", base: 219, img: "🍕", desc: "Bell peppers, mushrooms, olives" },
  { id: 5, name: "Hawaiian", base: 229, img: "🍕", desc: "Ham & pineapple with mozza" },
  { id: 6, name: "Four Cheese", base: 279, img: "🍕", desc: "Mozza, cheddar, gouda, parmesan" },
];
const SIZES = [
  { label: "Small (8\")", mult: 1 },
  { label: "Medium (10\")", mult: 1.25 },
  { label: "Large (12\")", mult: 1.5 },
];
const TOPPINGS = ["Extra Cheese", "Mushrooms", "Black Olives", "Jalapeños", "Bacon Bits", "Onions"];
const TOPPING_PRICE = 20;

const ROLES = ["Customer", "Cook", "Cashier", "Admin", "Delivery"];

const STATUS_FLOW = ["Pending", "Preparing", "Ready", "Out for Delivery", "Delivered"];
const STATUS_COLOR = {
  Pending: "#ef4444",
  Preparing: "#3b82f6",
  Ready: "#8b5cf6",
  "Out for Delivery": "#f97316",
  Delivered: "#10b981",
};

let orderIdCounter = 1000;

const sampleOrders = [
  {
    id: ++orderIdCounter, customer: "Maria Santos", items: [{ pizza: MENU[0], size: SIZES[1], toppings: ["Extra Cheese"], qty: 2 }],
    status: "Preparing", total: Math.round(MENU[0].base * SIZES[1].mult + TOPPING_PRICE) * 2,
    paid: false, address: "123 Rizal St, Iloilo", time: "10:32 AM",
  },
  {
    id: ++orderIdCounter, customer: "Juan dela Cruz", items: [{ pizza: MENU[1], size: SIZES[2], toppings: [], qty: 1 }],
    status: "Ready", total: Math.round(MENU[1].base * SIZES[2].mult),
    paid: true, address: "45 Mabini Ave, Iloilo", time: "10:45 AM",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const itemTotal = (item) =>
  Math.round(item.pizza.base * item.size.mult + item.toppings.length * TOPPING_PRICE) * item.qty;

// ── Sub-components ────────────────────────────────────────────────────────────

function CustomerView({ orders, setOrders }) {
  const [page, setPage] = useState("menu"); // menu | cart | history
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [size, setSize] = useState(SIZES[1]);
  const [toppings, setToppings] = useState([]);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("Maria Santos");
  const [address, setAddress] = useState("");
  const [receipt, setReceipt] = useState(null);

  const openPizza = (p) => { setSelected(p); setSize(SIZES[1]); setToppings([]); setQty(1); };
  const toggleTopping = (t) => setToppings(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const addToCart = () => {
    setCart(prev => [...prev, { pizza: selected, size, toppings: [...toppings], qty, _key: Date.now() }]);
    setSelected(null);
  };
  const cartTotal = cart.reduce((s, i) => s + itemTotal(i), 0);
  const placeOrder = () => {
    if (!address.trim()) { alert("Please enter your delivery address."); return; }
    const order = {
      id: ++orderIdCounter, customer: name,
      items: cart, status: "Pending", total: cartTotal,
      paid: false, address, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setOrders(prev => [...prev, order]);
    setReceipt(order);
    setCart([]);
    setPage("history");
  };

  const myOrders = orders.filter(o => o.customer === name);

  return (
    <div className="view-wrap">
      <div className="tab-bar">
        {["menu","cart","history"].map(p => (
          <button key={p} className={`tab-btn ${page===p?"active":""}`} onClick={() => setPage(p)}>
            {p === "cart" ? `🛒 Cart (${cart.length})` : p === "menu" ? "🍕 Menu" : "📋 My Orders"}
          </button>
        ))}
      </div>

      {page === "menu" && (
        <div>
          <h2 className="section-title">Our Pizza Menu</h2>
          <div className="pizza-grid">
            {MENU.map(p => (
              <div key={p.id} className="pizza-card" onClick={() => openPizza(p)}>
                <div className="pizza-emoji">{p.img}</div>
                <div className="pizza-info">
                  <strong>{p.name}</strong>
                  <p>{p.desc}</p>
                  <span className="price">from ₱{p.base}</span>
                </div>
              </div>
            ))}
          </div>
          {selected && (
            <div className="modal-overlay" onClick={() => setSelected(null)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>{selected.name}</h3>
                <p style={{color:"#888",marginBottom:12}}>{selected.desc}</p>
                <label className="form-label">Size</label>
                <div className="btn-group">
                  {SIZES.map(s => <button key={s.label} className={`opt-btn ${size===s?"active":""}`} onClick={() => setSize(s)}>{s.label}</button>)}
                </div>
                <label className="form-label">Extra Toppings <span style={{color:"#888",fontSize:12}}>(+₱{TOPPING_PRICE} each)</span></label>
                <div className="btn-group wrap">
                  {TOPPINGS.map(t => <button key={t} className={`opt-btn ${toppings.includes(t)?"active":""}`} onClick={() => toggleTopping(t)}>{t}</button>)}
                </div>
                <label className="form-label">Quantity</label>
                <div className="qty-row">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1,q-1))}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => q+1)}>+</button>
                </div>
                <div className="modal-footer">
                  <span className="price big">₱{Math.round(selected.base*size.mult+toppings.length*TOPPING_PRICE)*qty}</span>
                  <button className="primary-btn" onClick={addToCart}>Add to Cart</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {page === "cart" && (
        <div>
          <h2 className="section-title">Your Cart</h2>
          {cart.length === 0 ? <p className="empty">Your cart is empty.</p> : (
            <>
              {cart.map((item, i) => (
                <div key={item._key} className="order-row">
                  <div>
                    <strong>{item.pizza.name}</strong> – {item.size.label}<br/>
                    <span style={{fontSize:12,color:"#888"}}>{item.toppings.length ? item.toppings.join(", ") : "No extra toppings"} × {item.qty}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span className="price">₱{itemTotal(item)}</span>
                    <button className="del-btn" onClick={() => setCart(c => c.filter((_,j)=>j!==i))}>✕</button>
                  </div>
                </div>
              ))}
              <div className="total-row"><strong>Total</strong><span className="price big">₱{cartTotal}</span></div>
              <div className="form-section">
                <label className="form-label">Your Name</label>
                <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/>
                <label className="form-label">Delivery Address</label>
                <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street, City"/>
              </div>
              <button className="primary-btn full" onClick={placeOrder}>Place Order 🍕</button>
            </>
          )}
        </div>
      )}

      {page === "history" && (
        <div>
          <h2 className="section-title">My Orders</h2>
          {receipt && (
            <div className="receipt-banner">
              ✅ Order #{receipt.id} placed! Total: ₱{receipt.total}. Track it below.
            </div>
          )}
          {myOrders.length === 0 ? <p className="empty">No orders yet.</p> : myOrders.slice().reverse().map(o => (
            <div key={o.id} className="order-card">
              <div className="order-card-head">
                <span>Order #{o.id}</span>
                <span className="status-badge" style={{background:STATUS_COLOR[o.status]}}>{o.status}</span>
              </div>
              {o.items.map((item,i) => <div key={i} className="order-item-line">{item.pizza.name} {item.size.label} ×{item.qty}</div>)}
              <div className="order-card-foot">
                <span>{o.time} · {o.address}</span>
                <strong>₱{o.total}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CookView({ orders, setOrders }) {
  const active = orders.filter(o => ["Pending","Preparing","Ready"].includes(o.status));
  const advance = (id) => setOrders(prev => prev.map(o => {
    if (o.id !== id) return o;
    const idx = STATUS_FLOW.indexOf(o.status);
    return { ...o, status: STATUS_FLOW[Math.min(idx+1, STATUS_FLOW.length-1)] };
  }));
  return (
    <div className="view-wrap">
      <h2 className="section-title">Kitchen Display</h2>
      {active.length === 0 ? <p className="empty">No active orders. 🎉</p> : active.map(o => (
        <div key={o.id} className="order-card kitchen">
          <div className="order-card-head">
            <span>Order #{o.id} — <strong>{o.customer}</strong></span>
            <span className="status-badge" style={{background:STATUS_COLOR[o.status]}}>{o.status}</span>
          </div>
          {o.items.map((item,i) => (
            <div key={i} className="order-item-line">
              🍕 {item.pizza.name} — {item.size.label} × {item.qty}
              {item.toppings.length > 0 && <span style={{color:"#ef4444"}}> + {item.toppings.join(", ")}</span>}
            </div>
          ))}
          <div style={{marginTop:12}}>
            {o.status !== "Ready" && o.status !== "Out for Delivery" && o.status !== "Delivered" && (
              <button className="primary-btn" onClick={() => advance(o.id)}>
                {o.status === "Pending" ? "▶ Start Preparing" : "✅ Mark as Ready"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CashierView({ orders, setOrders }) {
  const unpaid = orders.filter(o => o.status === "Ready" && !o.paid);
  const recent = orders.filter(o => o.paid);
  const [receipt, setReceipt] = useState(null);
  const processPayment = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? {...o, paid: true, status: "Out for Delivery"} : o));
    const order = orders.find(o => o.id === id);
    setReceipt(order);
  };
  return (
    <div className="view-wrap">
      <h2 className="section-title">Cashier — Payments</h2>
      {receipt && (
        <div className="receipt-box">
          <h3>🧾 Receipt — Order #{receipt.id}</h3>
          <p><strong>Customer:</strong> {receipt.customer}</p>
          {receipt.items.map((item,i) => (
            <div key={i} className="receipt-line">
              <span>{item.pizza.name} {item.size.label} ×{item.qty}</span>
              <span>₱{itemTotal(item)}</span>
            </div>
          ))}
          <div className="receipt-line total"><strong>TOTAL</strong><strong>₱{receipt.total}</strong></div>
          <p style={{fontSize:12,color:"#888",marginTop:8,textAlign:"center"}}>Thank you for your order!</p>
          <button className="primary-btn full" onClick={() => setReceipt(null)}>Close Receipt</button>
        </div>
      )}
      <h3 style={{marginTop:20,marginBottom:8,color:"#ef4444"}}>Awaiting Payment ({unpaid.length})</h3>
      {unpaid.length === 0 ? <p className="empty">No orders awaiting payment.</p> : unpaid.map(o => (
        <div key={o.id} className="order-card">
          <div className="order-card-head">
            <span>Order #{o.id} — {o.customer}</span>
            <span className="price big">₱{o.total}</span>
          </div>
          {o.items.map((item,i)=><div key={i} className="order-item-line">{item.pizza.name} × {item.qty}</div>)}
          <button className="primary-btn" style={{marginTop:10}} onClick={() => processPayment(o.id)}>✅ Confirm Payment & Issue Receipt</button>
        </div>
      ))}
      <h3 style={{marginTop:20,marginBottom:8,color:"#10b981"}}>Paid Orders ({recent.length})</h3>
      {recent.map(o => (
        <div key={o.id} className="order-card paid">
          <div className="order-card-head">
            <span>#{o.id} — {o.customer}</span>
            <span className="status-badge" style={{background:STATUS_COLOR[o.status]}}>{o.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeliveryView({ orders, setOrders }) {
  const active = orders.filter(o => o.status === "Out for Delivery");
  const done = orders.filter(o => o.status === "Delivered");
  const markDelivered = (id) => setOrders(prev => prev.map(o => o.id === id ? {...o, status:"Delivered"} : o));
  return (
    <div className="view-wrap">
      <h2 className="section-title">Delivery Dashboard</h2>
      <h3 style={{color:"#f97316",marginBottom:8}}>Out for Delivery ({active.length})</h3>
      {active.length === 0 ? <p className="empty">No active deliveries.</p> : active.map(o => (
        <div key={o.id} className="order-card">
          <div className="order-card-head">
            <span>Order #{o.id} — {o.customer}</span>
            <span className="status-badge" style={{background:STATUS_COLOR[o.status]}}>{o.status}</span>
          </div>
          <p style={{fontSize:13,color:"#aaa",margin:"4px 0"}}>📍 {o.address}</p>
          {o.items.map((item,i)=><div key={i} className="order-item-line">{item.pizza.name} × {item.qty}</div>)}
          <button className="primary-btn" style={{marginTop:10}} onClick={() => markDelivered(o.id)}>🏠 Mark as Delivered</button>
        </div>
      ))}
      <h3 style={{color:"#10b981",marginTop:20,marginBottom:8}}>Delivered ({done.length})</h3>
      {done.map(o => (
        <div key={o.id} className="order-card paid">
          <div className="order-card-head">
            <span>#{o.id} — {o.customer}</span>
            <span style={{fontSize:12,color:"#888"}}>{o.address}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminView({ orders }) {
  const today = orders;
  const totalSales = today.filter(o=>o.paid).reduce((s,o)=>s+o.total,0);
  const totalOrders = today.length;
  const delivered = today.filter(o=>o.status==="Delivered").length;
  const pending = today.filter(o=>["Pending","Preparing"].includes(o.status)).length;

  const pizzaCounts = {};
  today.forEach(o => o.items.forEach(item => {
    pizzaCounts[item.pizza.name] = (pizzaCounts[item.pizza.name]||0) + item.qty;
  }));
  const topPizzas = Object.entries(pizzaCounts).sort((a,b)=>b[1]-a[1]);

  return (
    <div className="view-wrap">
      <h2 className="section-title">Admin — Sales Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num">₱{totalSales.toLocaleString()}</div><div className="stat-label">Total Revenue</div></div>
        <div className="stat-card"><div className="stat-num">{totalOrders}</div><div className="stat-label">Total Orders</div></div>
        <div className="stat-card"><div className="stat-num">{delivered}</div><div className="stat-label">Delivered</div></div>
        <div className="stat-card"><div className="stat-num">{pending}</div><div className="stat-label">In Progress</div></div>
      </div>
      <h3 style={{marginTop:24,marginBottom:12}}>Top Selling Pizzas</h3>
      {topPizzas.length === 0 ? <p className="empty">No sales data yet.</p> : topPizzas.map(([name, count]) => (
        <div key={name} className="bar-row">
          <span style={{width:160,fontSize:13}}>{name}</span>
          <div className="bar-track"><div className="bar-fill" style={{width:`${Math.min(100,(count/Math.max(...topPizzas.map(x=>x[1])))*100)}%`}}/></div>
          <span style={{fontSize:13,color:"#ef4444",marginLeft:8}}>{count} pcs</span>
        </div>
      ))}
      <h3 style={{marginTop:24,marginBottom:12}}>All Orders</h3>
      <table className="orders-table">
        <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Paid</th></tr></thead>
        <tbody>
          {today.slice().reverse().map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer}</td>
              <td>{o.items.map(i=>i.pizza.name).join(", ")}</td>
              <td>₱{o.total}</td>
              <td><span className="status-badge sm" style={{background:STATUS_COLOR[o.status]}}>{o.status}</span></td>
              <td>{o.paid ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState("Customer");
  const [orders, setOrders] = useState(sampleOrders);

  const ROLE_ICONS = { Customer:"👤", Cook:"👨‍🍳", Cashier:"💰", Admin:"📊", Delivery:"🛵" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0d0d0d;color:#f0ede8;font-family:'DM Sans',sans-serif;min-height:100vh}
        .app{max-width:900px;margin:0 auto;padding:0 16px 60px}
        .hero{padding:32px 0 24px;text-align:center}
        .hero h1{font-family:'Syne',sans-serif;font-size:clamp(28px,5vw,48px);font-weight:800;letter-spacing:-1px;color:#fff}
        .hero h1 span{color:#ef4444}
        .hero p{color:#888;font-size:14px;margin-top:4px}
        .role-bar{display:flex;gap:8px;overflow-x:auto;padding:4px 0 16px;scrollbar-width:none}
        .role-bar::-webkit-scrollbar{display:none}
        .role-chip{flex-shrink:0;padding:8px 18px;border-radius:99px;border:1.5px solid #2a2a2a;background:#141414;color:#aaa;font-size:13px;font-family:'Syne',sans-serif;font-weight:600;cursor:pointer;transition:all .2s}
        .role-chip.active{background:#ef4444;border-color:#ef4444;color:#fff}
        .view-wrap{padding:4px 0}
        .section-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:16px}
        .tab-bar{display:flex;gap:8px;margin-bottom:20px;border-bottom:1.5px solid #1e1e1e;padding-bottom:12px}
        .tab-btn{padding:7px 16px;border-radius:8px;border:none;background:transparent;color:#666;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .2s}
        .tab-btn.active{background:#1e1e1e;color:#f0ede8}
        .pizza-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
        .pizza-card{background:#141414;border:1.5px solid #1e1e1e;border-radius:14px;padding:16px;cursor:pointer;transition:all .2s;display:flex;gap:12px;align-items:center}
        .pizza-card:hover{border-color:#ef4444;transform:translateY(-2px)}
        .pizza-emoji{font-size:36px;flex-shrink:0}
        .pizza-info strong{font-size:14px;display:block}
        .pizza-info p{font-size:12px;color:#666;margin:2px 0 4px}
        .price{color:#ef4444;font-weight:600;font-size:13px}
        .price.big{font-size:18px}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px}
        .modal{background:#141414;border:1.5px solid #2a2a2a;border-radius:18px;padding:24px;width:100%;max-width:420px}
        .modal h3{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:4px}
        .form-label{display:block;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px}
        .btn-group{display:flex;flex-wrap:wrap;gap:6px}
        .btn-group.wrap{flex-wrap:wrap}
        .opt-btn{padding:6px 12px;border-radius:8px;border:1.5px solid #2a2a2a;background:#0d0d0d;color:#aaa;font-size:12px;cursor:pointer;transition:all .15s}
        .opt-btn.active{border-color:#ef4444;color:#ef4444;background:#1a0000}
        .qty-row{display:flex;align-items:center;gap:12px;margin:4px 0}
        .qty-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid #2a2a2a;background:#0d0d0d;color:#f0ede8;font-size:18px;cursor:pointer}
        .qty-val{font-size:16px;font-weight:600;min-width:20px;text-align:center}
        .modal-footer{display:flex;align-items:center;justify-content:space-between;margin-top:20px}
        .primary-btn{padding:10px 20px;border-radius:10px;border:none;background:#ef4444;color:#000;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s}
        .primary-btn:hover{background:#f87171}
        .primary-btn.full{width:100%;margin-top:12px;padding:12px;font-size:15px}
        .order-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #1e1e1e}
        .del-btn{width:28px;height:28px;border-radius:6px;border:1px solid #2a2a2a;background:transparent;color:#888;cursor:pointer;font-size:12px}
        .total-row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #2a2a2a;margin-bottom:16px}
        .form-section{margin-bottom:12px}
        .input{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #2a2a2a;background:#0d0d0d;color:#f0ede8;font-size:14px;margin-top:2px;font-family:'DM Sans',sans-serif}
        .input:focus{outline:none;border-color:#ef4444}
        .receipt-banner{background:#052e16;border:1px solid #10b981;border-radius:10px;padding:12px 16px;color:#10b981;font-size:14px;margin-bottom:16px}
        .order-card{background:#141414;border:1.5px solid #1e1e1e;border-radius:14px;padding:16px;margin-bottom:12px}
        .order-card.kitchen{border-color:#3b82f633}
        .order-card.paid{opacity:.6}
        .order-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:14px}
        .order-card-foot{display:flex;justify-content:space-between;font-size:12px;color:#666;margin-top:8px}
        .order-item-line{font-size:13px;color:#aaa;padding:2px 0}
        .status-badge{padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;color:#fff;font-family:'Syne',sans-serif}
        .status-badge.sm{padding:2px 8px;font-size:10px}
        .receipt-box{background:#0a0a0a;border:1.5px solid #2a2a2a;border-radius:14px;padding:20px;margin-bottom:20px}
        .receipt-box h3{font-family:'Syne',sans-serif;margin-bottom:12px}
        .receipt-line{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid #1e1e1e}
        .receipt-line.total{font-size:15px;border-bottom:none;margin-top:8px;padding-top:8px;border-top:1px solid #2a2a2a}
        .stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        .stat-card{background:#141414;border:1.5px solid #1e1e1e;border-radius:14px;padding:20px;text-align:center}
        .stat-num{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#ef4444}
        .stat-label{font-size:12px;color:#666;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}
        .bar-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
        .bar-track{flex:1;height:10px;background:#1e1e1e;border-radius:99px;overflow:hidden}
        .bar-fill{height:100%;background:#ef4444;border-radius:99px;transition:width .5s}
        .orders-table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
        .orders-table th{text-align:left;padding:8px 10px;background:#141414;color:#666;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
        .orders-table td{padding:10px 10px;border-bottom:1px solid #1a1a1a;color:#ccc}
        .orders-table tr:hover td{background:#141414}
        .empty{color:#555;font-size:14px;padding:32px 0;text-align:center}
      `}</style>
      <div className="app">
        <div className="hero">
          <h1>🍕 <span>Slice</span> & Spice</h1>
          <p>Online Pizza Ordering System</p>
        </div>
        <div className="role-bar">
          {ROLES.map(r => (
            <button key={r} className={`role-chip ${role===r?"active":""}`} onClick={() => setRole(r)}>
              {ROLE_ICONS[r]} {r}
            </button>
          ))}
        </div>
        {role === "Customer" && <CustomerView orders={orders} setOrders={setOrders} />}
        {role === "Cook" && <CookView orders={orders} setOrders={setOrders} />}
        {role === "Cashier" && <CashierView orders={orders} setOrders={setOrders} />}
        {role === "Delivery" && <DeliveryView orders={orders} setOrders={setOrders} />}
        {role === "Admin" && <AdminView orders={orders} />}
      </div>
    </>
  );
}
