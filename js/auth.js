AppReady.then(ready => {
  if (!ready) return;
  const ui = window.UI;
  const lib = window.Library;
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);

  function destination(role) {
    const fallback = ui.url(role === 'admin' ? 'pages/admin/index.html' : 'index.html');
    const next = params.get('next');
    if (!next) return fallback;
    // Chỉ quay lại những trang nội bộ được phép, không chuyển tới website khác.
    let target;
    try { target = new URL(next, ui.url('index.html')); }
    catch (error) { return fallback; }
    const paths = role === 'admin'
      ? ['index', 'books', 'book', 'users', 'user', 'loans', 'authors', 'categories', 'reports'].map(name => `pages/admin/${name}.html`)
      : ['index.html', ...['books', 'book', 'loans', 'profile', 'guide'].map(name => `pages/reader/${name}.html`)];
    return paths.some(path => new URL(ui.url(path)).pathname === target.pathname) && target.origin === new URL(fallback).origin ? target.href : fallback;
  }

  if (page === 'register') {
    const loginUrl = ui.url(`pages/auth/login.html${params.has('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`);
    document.querySelector('#auth-switch').href = loginUrl;
    ui.form('#register-form', async fields => {
      await lib.register(fields);
      const target = new URL(loginUrl);
      target.searchParams.set('registered', '1');
      location.href = target.href;
    });
  } else {
    const role = page === 'admin-login' ? 'admin' : 'user';
    if (page === 'login' && params.has('next')) {
      document.querySelector('#auth-switch').href = ui.url(`pages/auth/register.html?next=${encodeURIComponent(params.get('next'))}`);
    }
    if (params.has('registered')) {
      const notice = document.querySelector('#notice');
      notice.textContent = 'Đăng ký thành công. Bạn có thể đăng nhập bằng tài khoản vừa tạo.';
      notice.className = 'form-message success';
      notice.hidden = false;
    }
    ui.form('#login-form', async fields => {
      await lib.login(fields.username, fields.password, role);
      location.href = destination(role);
    });
  }
}).catch(window.UI.error);
