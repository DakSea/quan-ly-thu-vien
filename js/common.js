(() => {
  const root = new URL('../', document.currentScript.src);
  const lib = window.Library;
  const url = path => new URL(path, root).href;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const date = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN') : '—';
  const image = book => book.image?.startsWith('data:image/') ? book.image : book.image ? url(`images/books/${book.image}`) : url('images/books/de-men.jpg');
  // Ngày dùng chung cho cả trang quản trị và trang người dùng.
  function today(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  const byId = (items, id) => items.find(item => item.id === Number(id));
  const isOverdue = loan => loan.status === 'Đang mượn' && loan.dueDate < today();
  const table = (heads, rows) => `<div class="table-wrap"><table><thead><tr>${heads.map(head => `<th scope="col">${escape(head)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  function stats(items) {
    document.querySelector('#stats').innerHTML = items.map(([label, value]) => `<div class="stat"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('');
  }

  function error(message) {
    const notice = document.querySelector('#notice');
    if (!notice) return;
    notice.hidden = false;
    notice.textContent = message instanceof Error ? message.message : String(message);
    notice.scrollIntoView({ block: 'nearest' });
  }

  function header() {
    const reader = document.body.dataset.area !== 'admin' && document.body.dataset.page !== 'admin-login';
    const account = lib.currentUser;
    const guestActions = reader ? `<a href="${url('pages/auth/login.html')}">Đăng nhập</a><a class="button small" href="${url('pages/auth/register.html')}">Đăng ký</a>` : '<span class="hint">Khu vực quản trị</span>';
    const home = reader ? 'index.html' : 'pages/admin/index.html';
    const nav = reader ? [
      ['pages/reader/books.html', 'Tra cứu sách'],
      ['pages/reader/loans.html', 'Sách của tôi'],
      ['pages/reader/profile.html', 'Hồ sơ người dùng'],
      ['pages/reader/guide.html', 'Hướng dẫn'],
      ...(account?.role === 'admin' ? [['pages/admin/index.html', 'Trang quản trị']] : [])
    ] : [
      ['pages/admin/index.html', 'Tổng quan'],
      ['pages/admin/books.html', 'Quản lý sách'],
      ['pages/admin/users.html', 'Người dùng'],
      ['pages/admin/loans.html', 'Mượn - trả'],
      ['pages/admin/categories.html', 'Danh mục'],
      ['pages/admin/authors.html', 'Tác giả'],
      ['pages/admin/reports.html', 'Báo cáo'],
      ['pages/reader/books.html', 'Trang người dùng']
    ];
    document.querySelector('#header').innerHTML = `<div class="container"><div class="header-top"><a class="brand" href="${url(home)}">${reader ? '<span>THƯ VIỆN</span>' : 'QUẢN LÝ <span>THƯ VIỆN</span>'}</a><div class="actions">${account ? `<span class="hint">Xin chào, ${escape(account.name)}</span><button id="logout" class="secondary small">Đăng xuất</button>` : guestActions}</div><button class="menu-toggle secondary small" aria-expanded="false" aria-controls="navigation">Menu</button></div><nav id="navigation" class="nav" aria-label="Điều hướng chính">${nav.map(([path, label]) => `<a href="${url(path)}" ${(location.pathname === new URL(url(path)).pathname || (reader && path === 'pages/reader/books.html' && ['reader-book', 'reader-books'].includes(document.body.dataset.page))) ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav></div>`;
    document.querySelector('#logout')?.addEventListener('click', () => {
      lib.logout();
      location.href = url('index.html');
    });
    document.querySelector('.menu-toggle').onclick = event => {
      const open = document.querySelector('#navigation').classList.toggle('open');
      event.currentTarget.setAttribute('aria-expanded', open);
    };
  }

  function form(selector, handler) {
    const element = document.querySelector(selector);
    element.addEventListener('submit', async event => {
      event.preventDefault();
      const button = element.querySelector('[type="submit"]');
      const message = element.querySelector('.form-message');
      if (button.disabled) return;
      button.disabled = true;
      message.hidden = true;
      message.classList.remove('success');
      try {
        const result = await handler(Object.fromEntries(new FormData(element)), element);
        if (result) {
          message.textContent = result;
          message.classList.add('success');
          message.hidden = false;
        }
      } catch (err) {
        message.textContent = err.message;
        message.hidden = false;
      } finally {
        button.disabled = false;
      }
    });
  }

  window.UI = {
    url, escape, date, image, error, header, form, today, byId, isOverdue, table, stats,
    empty: message => `<div class="empty"><p>${escape(message)}</p></div>`,
    options: (items, selected, labelField = 'name') => items.map(item => `<option value="${item.id}" ${Number(selected) === item.id ? 'selected' : ''}>${escape(item[labelField])}</option>`).join(''),
    run: action => { try { action(); } catch (err) { error(err); } }
  };

  window.AppReady = lib.ready.then(() => {
    const required = document.body.dataset.require;
    const account = lib.currentUser;
    if (required && !account) {
      const next = location.href.slice(root.href.length);
      location.replace(url(`pages/auth/${required === 'admin' ? 'admin-login' : 'login'}.html?next=${encodeURIComponent(next)}`));
      return false;
    }
    if (required && account.role !== required) {
      location.replace(url(account.role === 'admin' ? 'pages/admin/index.html' : 'index.html'));
      return false;
    }
    document.body.dataset.authorized = 'true';
    header();
    const adminArea = document.body.dataset.area === 'admin' || document.body.dataset.page === 'admin-login';
    document.querySelector('#footer').innerHTML = `<div class="container"><span>${adminArea ? 'QUẢN LÝ THƯ VIỆN' : 'THƯ VIỆN'}</span></div>`;
    return true;
  }).catch(err => {
    // Hiện lỗi khởi tạo nhưng vẫn ẩn nội dung của trang cần đăng nhập.
    document.body.dataset.loadError = 'true';
    error(err);
    return false;
  });
  window.addEventListener('storage', event => {
    if (event.storageArea === localStorage && (event.key === 'library-management-v2' || event.key === null)) location.reload();
  });
})();
