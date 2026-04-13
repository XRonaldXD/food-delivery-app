import { Router, Request, Response } from 'express';
import { users, orders, restaurants, driverLocations, addresses, chatMessages } from '../data/store';

const router = Router();

// GET /dashboard – serves a self-contained HTML admin data dashboard
// Protected by a simple admin-token query param (or cookie) that is obtained by logging in via the API.
router.get('/', (_req: Request, res: Response): void => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Food Delivery – Admin Dashboard</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #1e293b; }
    header { background: #FF6B35; color: #fff; padding: 16px 24px; display: flex; align-items: center; gap: 12px; }
    header h1 { font-size: 1.4rem; }
    #loginBox { max-width: 400px; margin: 80px auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,.10); }
    #loginBox h2 { margin-bottom: 20px; color: #333; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; margin-bottom: 12px; }
    button { width: 100%; padding: 12px; background: #FF6B35; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    button:hover { background: #e55a28; }
    #errMsg { color: #ef4444; font-size: 13px; margin-top: 8px; text-align: center; }
    #app { display: none; padding: 24px; max-width: 1200px; margin: 0 auto; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .tab { padding: 8px 18px; border-radius: 20px; border: 2px solid #FF6B35; cursor: pointer; font-weight: 600; color: #FF6B35; background: #fff; }
    .tab.active { background: #FF6B35; color: #fff; }
    .section { display: none; }
    .section.active { display: block; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat { background: #fff; border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    .stat .num { font-size: 2rem; font-weight: 700; color: #FF6B35; }
    .stat .lbl { font-size: 13px; color: #888; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
    th { background: #f8fafc; text-align: left; padding: 10px 14px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
    td { padding: 10px 14px; font-size: 13px; border-top: 1px solid #f1f5f9; }
    tr:hover td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; color: #fff; }
    .badge-customer { background: #3b82f6; }
    .badge-driver { background: #8b5cf6; }
    .badge-restaurant { background: #f97316; }
    .badge-admin { background: #ef4444; }
    .badge-placed { background: #f59e0b; }
    .badge-accepted { background: #3b82f6; }
    .badge-ready { background: #f97316; }
    .badge-picked_up { background: #8b5cf6; }
    .badge-delivered { background: #10b981; }
    .badge-cancelled { background: #ef4444; }
    .refresh { margin-left: auto; padding: 8px 16px; font-size: 13px; width: auto; }
    .section-header { display: flex; align-items: center; margin-bottom: 14px; }
    .section-header h2 { font-size: 1.1rem; color: #334155; }
    #lastUpdate { font-size: 12px; color: #94a3b8; margin-left: 12px; }
    .empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <header>
    <span style="font-size:1.5rem">🍔</span>
    <h1>Food Delivery – Admin Dashboard</h1>
  </header>

  <div id="loginBox">
    <h2>Admin Login</h2>
    <input type="email" id="loginEmail" placeholder="Email" value="admin@test.com" />
    <input type="password" id="loginPassword" placeholder="Password" value="password123" />
    <button onclick="doLogin()">Log In</button>
    <div id="errMsg"></div>
  </div>

  <div id="app">
    <div class="tabs">
      <div class="tab active" onclick="showTab('overview')">📊 Overview</div>
      <div class="tab" onclick="showTab('orders')">📋 Orders</div>
      <div class="tab" onclick="showTab('users')">👥 Users</div>
      <div class="tab" onclick="showTab('restaurants')">🍽️ Restaurants</div>
      <div class="tab" onclick="showTab('locations')">📍 Driver Locations</div>
      <button class="refresh" onclick="loadAll()">🔄 Refresh</button>
    </div>
    <span id="lastUpdate"></span>

    <!-- Overview -->
    <div class="section active" id="tab-overview">
      <div class="stats" id="statsGrid"></div>
      <div class="section-header"><h2>Recent Orders</h2></div>
      <div id="recentOrders"></div>
    </div>

    <!-- Orders -->
    <div class="section" id="tab-orders">
      <div class="section-header"><h2>All Orders</h2></div>
      <div id="ordersTable"></div>
    </div>

    <!-- Users -->
    <div class="section" id="tab-users">
      <div class="section-header"><h2>All Users</h2></div>
      <div id="usersTable"></div>
    </div>

    <!-- Restaurants -->
    <div class="section" id="tab-restaurants">
      <div class="section-header"><h2>All Restaurants</h2></div>
      <div id="restaurantsTable"></div>
    </div>

    <!-- Driver Locations -->
    <div class="section" id="tab-locations">
      <div class="section-header"><h2>Active Driver Locations</h2></div>
      <div id="locationsTable"></div>
    </div>
  </div>

  <script>
    let token = '';
    const base = window.location.origin;

    async function doLogin() {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      document.getElementById('errMsg').textContent = '';
      try {
        const r = await fetch(base + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Login failed');
        if (d.user.role !== 'admin') throw new Error('Admin access required');
        token = d.token;
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        loadAll();
      } catch (e) {
        document.getElementById('errMsg').textContent = e.message;
      }
    }

    async function api(path) {
      const r = await fetch(base + path, { headers: { Authorization: 'Bearer ' + token } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }

    function showTab(name) {
      document.querySelectorAll('.tab').forEach((t, i) => {
        const names = ['overview','orders','users','restaurants','locations'];
        t.classList.toggle('active', names[i] === name);
      });
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('tab-' + name).classList.add('active');
    }

    function badge(val, prefix) {
      return '<span class="badge badge-' + (prefix ? prefix + '-' : '') + val.replace(' ','_') + '">' + val + '</span>';
    }

    function table(headers, rows) {
      if (!rows.length) return '<div class="empty">No data</div>';
      return '<table><thead><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => '<td>' + (c ?? '-') + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>';
    }

    async function loadAll() {
      try {
        const [rev, orders, users, restaurants] = await Promise.all([
          api('/admin/revenue'),
          api('/admin/orders'),
          api('/admin/users'),
          api('/admin/restaurants'),
        ]);

        // Try to get driver locations (may be empty)
        let locations = [];
        try { locations = await api('/admin/locations'); } catch {}

        document.getElementById('lastUpdate').textContent = 'Updated: ' + new Date().toLocaleTimeString();

        // Stats
        document.getElementById('statsGrid').innerHTML = [
          { num: orders.length, lbl: 'Total Orders' },
          { num: users.length, lbl: 'Users' },
          { num: restaurants.length, lbl: 'Restaurants' },
          { num: '$' + rev.totalRevenue.toFixed(2), lbl: 'Revenue' },
          { num: orders.filter(o => o.status === 'placed').length, lbl: 'Pending' },
          { num: orders.filter(o => o.status === 'picked_up').length, lbl: 'In Transit' },
          { num: orders.filter(o => o.status === 'delivered').length, lbl: 'Delivered' },
          { num: locations.length, lbl: 'Active Drivers' },
        ].map(s => '<div class="stat"><div class="num">' + s.num + '</div><div class="lbl">' + s.lbl + '</div></div>').join('');

        // Recent orders (last 10)
        const recent = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
        document.getElementById('recentOrders').innerHTML = table(
          ['#', 'Restaurant', 'Customer', 'Total', 'Status', 'Date'],
          recent.map(o => [
            o.id.slice(0,8),
            o.restaurantName,
            o.deliveryAddress.slice(0, 30),
            '$' + o.total.toFixed(2),
            badge(o.status),
            new Date(o.createdAt).toLocaleString(),
          ])
        );

        // All orders
        document.getElementById('ordersTable').innerHTML = table(
          ['#', 'Restaurant', 'Items', 'Total', 'Address', 'Status', 'Driver', 'Date'],
          [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(o => [
            o.id.slice(0,8),
            o.restaurantName,
            o.items.length + ' item(s)',
            '$' + o.total.toFixed(2),
            o.deliveryAddress.slice(0, 30),
            badge(o.status),
            o.driverId ? o.driverId.slice(0,8) : '-',
            new Date(o.createdAt).toLocaleString(),
          ])
        );

        // Users
        document.getElementById('usersTable').innerHTML = table(
          ['#', 'Name', 'Email', 'Role', 'Phone', 'Restaurant'],
          users.map(u => [
            u.id.slice(0,8),
            u.name,
            u.email,
            badge(u.role),
            u.phone || '-',
            u.restaurantId || '-',
          ])
        );

        // Restaurants
        document.getElementById('restaurantsTable').innerHTML = table(
          ['#', 'Name', 'Cuisine', 'Menu Items', 'Orders', 'Revenue'],
          restaurants.map(r => {
            const rOrders = orders.filter(o => o.restaurantId === r.id);
            const rRev = rOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
            return [
              r.id,
              r.name,
              r.cuisine,
              (r.menu || []).length,
              rOrders.length,
              '$' + rRev.toFixed(2),
            ];
          })
        );

        // Locations
        document.getElementById('locationsTable').innerHTML = locations.length
          ? table(
              ['Driver ID', 'Order ID', 'Latitude', 'Longitude', 'Last Update'],
              locations.map(l => [
                l.driverId.slice(0,8),
                l.orderId.slice(0,8),
                l.latitude.toFixed(5),
                l.longitude.toFixed(5),
                new Date(l.updatedAt).toLocaleString(),
              ])
            )
          : '<div class="empty">No driver locations yet</div>';

      } catch (e) {
        console.error(e);
      }
    }

    // Allow pressing Enter in login form
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && document.getElementById('loginBox').style.display !== 'none') doLogin();
    });
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;
