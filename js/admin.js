AppReady.then(allowed => {
  if (!allowed) return;
  const lib = window.Library, ui = window.UI, page = document.body.dataset.page;
  const id = Number(new URLSearchParams(location.search).get('id'));
  const table = (heads, rows) => `<div class="table-wrap"><table><thead><tr>${heads.map(head => `<th>${head}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  const searchMatches = value => value.toLocaleLowerCase('vi').includes(document.querySelector('#admin-search').value.trim().toLocaleLowerCase('vi'));

  if (page === 'dashboard') {
    const revenue = lib.data.orders.filter(order => order.status === 'Đã giao').reduce((sum, order) => sum + order.total, 0);
    document.querySelector('#stats').innerHTML = [['Đầu sách', lib.data.books.length], ['Khách hàng', lib.data.users.length], ['Đơn chờ duyệt', lib.data.orders.filter(order => order.status === 'Đang chờ duyệt').length], ['Doanh thu đã giao', ui.money(revenue)]].map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
    document.querySelector('#top-books').innerHTML = table(['Sách', 'Đã bán', 'Còn lại'], [...lib.data.books].sort((a, b) => b.sold - a.sold).slice(0, 5).map(book => `<tr><td><a href="${ui.url(`pages/admin/book.html?id=${book.id}`)}">${ui.escape(book.title)}</a></td><td>${book.sold}</td><td>${book.stock}</td></tr>`));
  }

  if (page === 'admin-books') {
    function render() {
      const books = lib.data.books.filter(book => searchMatches(book.title));
      document.querySelector('#admin-list').innerHTML = books.length ? table(['Sách', 'Tác giả', 'Giá', 'Tồn kho', 'Thao tác'], books.map(book => `<tr><td><a class="table-book" href="${ui.url(`pages/admin/book.html?id=${book.id}`)}"><img src="${ui.image(book)}" alt=""><span>${ui.escape(book.title)}</span></a></td><td>${ui.escape(lib.data.authors.find(item => item.id === book.authorId)?.name)}</td><td>${ui.money(book.price)}</td><td>${book.stock}</td><td><div class="actions"><a class="button secondary small" href="${ui.url(`pages/admin/book.html?id=${book.id}`)}">Sửa</a><button class="danger small" data-delete="${book.id}">Xóa</button></div></td></tr>`)) : ui.empty('Không tìm thấy sách.');
      document.querySelectorAll('[data-delete]').forEach(button => { button.onclick = () => ui.run(() => { if (confirm('Xóa sách này?')) { lib.deleteBook(button.dataset.delete); render(); } }); });
    }
    document.querySelector('#admin-search').oninput = render;
    render();
  }

  if (page === 'admin-book') {
    const book = id ? lib.data.books.find(item => item.id === id) : null;
    if (id && !book) { ui.error('Không tìm thấy sách.'); document.querySelector('#book-form').hidden = true; return; }
    const form = document.querySelector('#book-form');
    document.querySelector('#editor-title').textContent = book ? 'Chỉnh sửa sách' : 'Thêm sách mới';
    form.elements.authorId.innerHTML = `<option value="">Chọn tác giả</option>${ui.options(lib.data.authors, book?.authorId)}`;
    form.elements.categoryId.innerHTML = `<option value="">Chọn danh mục</option>${ui.options(lib.data.categories, book?.categoryId)}`;
    if (book) {
      for (const field of ['title', 'price', 'stock', 'pages', 'published', 'description']) form.elements[field].value = book[field];
      document.querySelector('#image-preview').src = ui.image(book);
      document.querySelector('#image-preview').hidden = false;
    }
    const validImage = file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 500 * 1024) throw new Error('Chọn ảnh JPG, PNG hoặc WebP tối đa 500 KB.');
    };
    let previewUrl;
    form.elements.imageFile.onchange = () => ui.run(() => {
      const file = form.elements.imageFile.files[0];
      if (!file) return;
      validImage(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(file);
      document.querySelector('#image-preview').src = previewUrl;
      document.querySelector('#image-preview').hidden = false;
    });
    ui.form('#book-form', async fields => {
      const file = form.elements.imageFile.files[0];
      let image = book?.image || '';
      if (file) {
        validImage(file);
        image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Không đọc được ảnh.'));
          reader.readAsDataURL(file);
        });
      }
      lib.saveBook({ ...fields, id: book?.id, image });
      location.href = ui.url('pages/admin/books.html');
    });
  }

  if (page === 'admin-authors' || page === 'admin-categories') {
    const type = page === 'admin-authors' ? 'authors' : 'categories', label = type === 'authors' ? 'tác giả' : 'danh mục';
    const form = document.querySelector('#named-form');
    function reset() { form.reset(); document.querySelector('#named-title').textContent = `Thêm ${label}`; }
    function render() {
      const items = lib.data[type].filter(item => searchMatches(item.name));
      document.querySelector('#admin-list').innerHTML = items.length ? table(['Tên', 'Số sách', 'Thao tác'], items.map(item => `<tr><td>${ui.escape(item.name)}</td><td>${lib.data.books.filter(book => book[type === 'authors' ? 'authorId' : 'categoryId'] === item.id).length}</td><td><div class="actions"><button class="secondary small" data-edit="${item.id}">Sửa</button><button class="danger small" data-delete="${item.id}">Xóa</button></div></td></tr>`)) : '<p class="empty">Chưa có kết quả phù hợp.</p>';
      document.querySelectorAll('[data-edit]').forEach(button => { button.onclick = () => {
        const item = lib.data[type].find(item => item.id === Number(button.dataset.edit));
        form.elements.id.value = item.id;
        form.elements.name.value = item.name;
        if (form.elements.description) form.elements.description.value = item.description || '';
        document.querySelector('#named-title').textContent = `Chỉnh sửa ${label}`;
        form.querySelector('.form-message').hidden = true;
        form.elements.name.focus();
      }; });
      document.querySelectorAll('[data-delete]').forEach(button => { button.onclick = () => ui.run(() => { if (confirm(`Xóa ${label} này?`)) { lib.deleteNamed(type, button.dataset.delete); reset(); render(); } }); });
    }
    document.querySelector('#admin-search').oninput = render;
    document.querySelector('#cancel-edit').onclick = reset;
    ui.form('#named-form', fields => { lib.saveNamed(type, fields); reset(); render(); return `Đã lưu ${label}.`; });
    render();
  }

  if (page === 'admin-users') {
    function render() {
      const users = lib.data.users.filter(user => searchMatches(`${user.name} ${user.username} ${user.email}`));
      document.querySelector('#admin-list').innerHTML = users.length ? table(['Khách hàng', 'Email', 'Điện thoại', 'Thao tác'], users.map(user => `<tr><td>${ui.escape(user.name)}<br><span class="hint">${ui.escape(user.username)}</span></td><td>${ui.escape(user.email)}</td><td>${ui.escape(user.phone || '—')}</td><td><div class="actions"><a class="button secondary small" href="${ui.url(`pages/admin/user.html?id=${user.id}`)}">Sửa</a><button class="danger small" data-delete="${user.id}">Xóa</button></div></td></tr>`)) : '<p class="empty">Không tìm thấy khách hàng.</p>';
      document.querySelectorAll('[data-delete]').forEach(button => { button.onclick = () => ui.run(() => { if (confirm('Xóa khách hàng này?')) { lib.deleteUser(button.dataset.delete); render(); } }); });
    }
    document.querySelector('#admin-search').oninput = render;
    render();
  }

  if (page === 'admin-user') {
    const user = lib.data.users.find(user => user.id === id);
    if (!user) { ui.error('Không tìm thấy khách hàng.'); document.querySelector('#user-form').hidden = true; return; }
    document.querySelector('#customer-name').textContent = user.username;
    const form = document.querySelector('#user-form');
    for (const field of ['name', 'email', 'phone', 'address']) form.elements[field].value = user[field];
    ui.form('#user-form', fields => { lib.saveUser(fields, id); return 'Đã lưu thông tin khách hàng.'; });
  }

  if (page === 'admin-orders') {
    function render() {
      const status = document.querySelector('#order-status').value;
      const orders = [...lib.data.orders].reverse().filter(order => (!status || order.status === status) && searchMatches(`${order.id} ${order.name}`));
      document.querySelector('#admin-list').innerHTML = orders.length ? table(['Mã đơn', 'Người nhận', 'Ngày đặt', 'Tổng tiền', 'Trạng thái', 'Thao tác'], orders.map(order => `<tr><td>#${order.id}</td><td>${ui.escape(order.name)}</td><td>${ui.date(order.created)}</td><td>${ui.money(order.total)}</td><td><span class="badge">${ui.escape(order.status)}</span></td><td><a href="${ui.url(`pages/admin/order.html?id=${order.id}`)}">Xem chi tiết</a></td></tr>`)) : '<p class="empty">Chưa có đơn hàng phù hợp.</p>';
    }
    document.querySelector('#admin-search').oninput = render;
    document.querySelector('#order-status').onchange = render;
    render();
  }
  if (page === 'admin-order') {
    const orderRows = order => order.items.map(item => `<tr><td>${ui.escape(item.title)}</td><td>${item.quantity}</td><td>${ui.money(item.price)}</td><td>${ui.money(item.quantity * item.price)}</td></tr>`).join('');
    function render() {
      const order = lib.getOrder(id);
      document.querySelector('#order-heading').textContent = `Đơn hàng #${order.id}`;
      document.querySelector('#order-detail').innerHTML = `<dl class="order-info"><dt>Người nhận</dt><dd>${ui.escape(order.name)}</dd><dt>Điện thoại</dt><dd>${ui.escape(order.phone)}</dd><dt>Địa chỉ</dt><dd>${ui.escape(order.address)}</dd><dt>Ngày đặt</dt><dd>${ui.date(order.created)}</dd><dt>Trạng thái</dt><dd><span class="badge">${ui.escape(order.status)}</span></dd></dl><div class="table-wrap"><table><thead><tr><th>Sách</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${orderRows(order)}</tbody></table></div><p class="total">Tổng cộng: ${ui.money(order.total)}</p><div class="actions">${['Đang chờ duyệt', 'Đang giao'].includes(order.status) ? `<button id="advance-order">${order.status === 'Đang chờ duyệt' ? 'Duyệt và giao hàng' : 'Xác nhận đã giao'}</button>` : ''}${order.status === 'Đang chờ duyệt' ? '<button id="cancel-order" class="danger">Hủy đơn</button>' : ''}<a href="${ui.url('pages/admin/orders.html')}">Danh sách đơn hàng</a></div>`;
      document.querySelector('#advance-order')?.addEventListener('click', () => ui.run(() => { lib.updateOrderStatus(id, order.status === 'Đang chờ duyệt' ? 'Đang giao' : 'Đã giao'); render(); }));
      document.querySelector('#cancel-order')?.addEventListener('click', () => ui.run(() => { if (confirm('Hủy đơn hàng này?')) { lib.cancelOrder(id); render(); } }));
    }
    ui.run(render);
  }
}).catch(UI.error);
