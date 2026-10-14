(() => {
  const root = new URL('../', document.currentScript.src);
  const lib = window.Library;
  const url = path => new URL(path, root).href;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const date = value => new Date(value).toLocaleDateString('vi-VN');
  const image = book => book.image?.startsWith('data:image/') ? book.image : book.image ? url(`images/books/${book.image}`) : url('images/books/de-men.jpg');

  function error(message) {
    const notice = document.querySelector('#notice');
    notice.hidden = false;
    notice.textContent = message instanceof Error ? message.message : String(message);
    notice.scrollIntoView({ block: 'nearest' });
  }

  function header() {
    const nav = [['index.html', 'Tổng quan'], ['pages/admin/books.html', 'Sách'], ['pages/admin/categories.html', 'Danh mục'], ['pages/admin/authors.html', 'Tác giả'], ['pages/admin/users.html', 'Khách hàng'], ['pages/admin/orders.html', 'Đơn hàng']];
    document.querySelector('#header').innerHTML = `<div class="container"><div class="header-top"><a class="brand" href="${url('index.html')}">BOOK <span>LIBRARY</span></a><span class="hint">Quản trị</span><button class="menu-toggle secondary small" aria-expanded="false" aria-controls="navigation">Menu</button></div><nav id="navigation" class="nav" aria-label="Điều hướng quản trị">${nav.map(([path, label]) => `<a href="${url(path)}" ${location.pathname === new URL(url(path)).pathname || (path === 'index.html' && location.pathname === root.pathname) ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav></div>`;
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
      button.disabled = true;
      message.hidden = true;
      try {
        const result = await handler(Object.fromEntries(new FormData(element)), element);
        if (result) { message.textContent = result; message.classList.add('success'); message.hidden = false; }
      } catch (err) { message.textContent = err.message; message.classList.remove('success'); message.hidden = false; }
      finally { button.disabled = false; }
    });
  }

  window.UI = { url, escape, money, date, image, error, header, form,
    empty: message => `<div class="empty"><p>${escape(message)}</p></div>`,
    options: (items, selected) => items.map(item => `<option value="${item.id}" ${Number(selected) === item.id ? 'selected' : ''}>${escape(item.name)}</option>`).join(''),
    run: action => { try { action(); } catch (err) { error(err); } }
  };

  window.AppReady = lib.ready.then(() => {
    header();
    document.querySelector('#footer').innerHTML = '<div class="container"><span>BOOK LIBRARY · Trang quản trị</span><span>Dữ liệu mẫu trong trình duyệt</span></div>';
    return true;
  }).catch(err => { error(err); return false; });
})();
