(function () {
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCount();
  }

  function updateCount() {
    var el = document.getElementById('cart-count');
    if (el) el.textContent = getCart().reduce(function (n, i) { return n + i.quantity; }, 0);
  }

  function postJson(url, data) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().then(function (body) { return { ok: r.ok, body: body }; });
    });
  }

  function formData(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    return data;
  }

  function show(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderCart() {
    var table = document.querySelector('#cart-table tbody');
    if (!table) return;
    var cart = getCart();
    var total = 0;
    table.innerHTML = '';
    cart.forEach(function (item, idx) {
      var sub = item.unitPrice * item.quantity;
      total += sub;
      var tr = document.createElement('tr');
      [item.name, item.unitPrice.toFixed(2), String(item.quantity), sub.toFixed(2)].forEach(function (text) {
        var td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      });
      var td = document.createElement('td');
      var btn = document.createElement('button');
      btn.textContent = 'Remove';
      btn.addEventListener('click', function () {
        cart.splice(idx, 1);
        saveCart(cart);
        renderCart();
      });
      td.appendChild(btn);
      tr.appendChild(td);
      table.appendChild(tr);
    });
    show('cart-total', total.toFixed(2));
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateCount();
    renderCart();

    document.querySelectorAll('.add-to-cart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cart = getCart();
        var id = Number(btn.dataset.id);
        var existing = cart.find(function (i) { return i.productId === id; });
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({ productId: id, name: btn.dataset.name, unitPrice: Number(btn.dataset.price), quantity: 1 });
        }
        saveCart(cart);
      });
    });

    var logout = document.getElementById('logout-link');
    if (logout) {
      logout.addEventListener('click', function (e) {
        e.preventDefault();
        postJson('/api/auth/logout', {}).then(function () { location.href = '/'; });
      });
    }

    var login = document.getElementById('login-form');
    if (login) {
      login.addEventListener('submit', function (e) {
        e.preventDefault();
        postJson('/api/auth/login', formData(login)).then(function (r) {
          if (r.ok) location.href = '/account';
          else show('form-message', r.body.error);
        });
      });
    }

    var register = document.getElementById('register-form');
    if (register) {
      register.addEventListener('submit', function (e) {
        e.preventDefault();
        postJson('/api/auth/register', formData(register)).then(function (r) {
          if (r.ok) location.href = '/account';
          else show('form-message', r.body.error);
        });
      });
    }

    var checkout = document.getElementById('checkout-form');
    if (checkout) {
      checkout.addEventListener('submit', function (e) {
        e.preventDefault();
        var cart = getCart();
        postJson('/api/orders/checkout', { items: cart, phone: formData(checkout).phone }).then(function (r) {
          if (r.ok) {
            saveCart([]);
            renderCart();
            show('checkout-message', 'Order #' + r.body.orderId + ' placed. Total: €' + r.body.total.toFixed(2));
          } else {
            show('checkout-message', r.body.error);
          }
        });
      });
    }

    var profile = document.getElementById('profile-form');
    if (profile) {
      profile.addEventListener('submit', function (e) {
        e.preventDefault();
        postJson('/api/account/profile', formData(profile)).then(function (r) {
          show('profile-message', r.ok ? 'Profile saved.' : r.body.error);
        });
      });
    }

    var voucher = document.getElementById('voucher-form');
    if (voucher) {
      voucher.addEventListener('submit', function (e) {
        e.preventDefault();
        postJson('/api/vouchers/redeem', formData(voucher)).then(function (r) {
          show('voucher-message', r.ok ? 'Credited €' + r.body.credited.toFixed(2) : r.body.error);
        });
      });
    }

    var spec = document.getElementById('spec-form');
    if (spec) {
      spec.addEventListener('submit', function (e) {
        e.preventDefault();
        postJson('/api/tools/fetch-spec', formData(spec)).then(function (r) {
          show('spec-result', r.ok ? r.body.spec : r.body.error);
        });
      });
    }
  });
})();
