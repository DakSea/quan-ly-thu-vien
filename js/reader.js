// Các trang người dùng dùng chung dữ liệu với trang quản trị.
// Thông tin cá nhân lấy từ tài khoản đã đăng nhập.
AppReady.then(ready => {
  if (!ready) return;
  const lib = window.Library;
  const ui = window.UI;
  const page = document.body.dataset.page;
  const guideLogin = document.querySelector('#guide-login');
  if (guideLogin) guideLogin.hidden = Boolean(lib.currentUser);
  const bookId = Number(new URLSearchParams(location.search).get('id'));
  const currentReader = () => lib.currentUser?.role === 'user' ? lib.currentUser : null;
  const readerId = currentReader()?.id;
  const author = book => ui.byId(lib.data.authors, book.authorId)?.name || 'Chưa cập nhật';
  const category = book => ui.byId(lib.data.categories, book.categoryId)?.name || 'Chưa phân loại';
  const context = document.querySelector('#account-context');
  function renderContext() {
    if (context) context.innerHTML = currentReader()
      ? `<p>Xin chào, <strong>${ui.escape(currentReader().name)}</strong>. Bạn có thể mượn sách và theo dõi hạn trả trong Sách của tôi.</p>`
      : `<p>Đăng nhập để mượn sách và theo dõi tài khoản của bạn.</p><div class="actions"><a class="button small" href="${ui.url('pages/auth/login.html')}">Đăng nhập</a><a href="${ui.url('pages/auth/register.html')}">Đăng ký tài khoản</a></div>`;
  }
  renderContext();

  function bookCards(books) {
    return books.length ? books.map(book => `<article class="book-card">
      <a class="book-cover" href="${ui.url(`pages/reader/book.html?id=${book.id}`)}"><img src="${ui.image(book)}" alt="Bìa sách ${ui.escape(book.title)}" loading="lazy"></a>
      <div class="book-card-body"><p class="eyebrow">${ui.escape(category(book))}</p>
      <h2><a href="${ui.url(`pages/reader/book.html?id=${book.id}`)}">${ui.escape(book.title)}</a></h2>
      <p class="muted">${ui.escape(author(book))}</p>
      <p class="badge ${book.stock > 0 ? 'available' : 'unavailable'}">${book.stock > 0 ? `Còn ${book.stock} bản` : 'Tạm hết sách'}</p>
      <div class="actions card-actions"><a class="button small" href="${ui.url(`pages/reader/book.html?id=${book.id}#borrow-form`)}">Mượn sách</a><a class="button secondary small" href="${ui.url(`pages/reader/book.html?id=${book.id}`)}">Chi tiết</a></div></div></article>`).join('') : ui.empty('Không tìm thấy sách phù hợp. Hãy thử từ khóa hoặc danh mục khác.');
  }

  function renderCatalog() {
    const keyword = document.querySelector('#book-search').value.trim().toLocaleLowerCase('vi');
    const categoryId = Number(document.querySelector('#category-filter').value);
    const available = document.querySelector('#availability-filter').value;
    const sort = document.querySelector('#book-sort').value;
    const books = lib.data.books.filter(book => {
      const text = `${book.title} ${author(book)} ${book.isbn || ''}`.toLocaleLowerCase('vi');
      return text.includes(keyword) && (!categoryId || book.categoryId === categoryId) && (!available || book.stock > 0);
    });
    if (sort === 'title') books.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    if (sort === 'stock') books.sort((a, b) => b.stock - a.stock);
    ui.stats([['Đầu sách', lib.data.books.length], ['Danh mục', lib.data.categories.length], ['Bản sách còn', lib.data.books.reduce((sum, book) => sum + book.stock, 0)], ['Thời hạn mượn', '1–30 ngày']]);
    document.querySelector('#result-count').textContent = `${books.length} sách phù hợp`;
    document.querySelector('#book-list').innerHTML = bookCards(books);
  }

  function renderBook(days = 14) {
    const book = ui.byId(lib.data.books, bookId);
    const content = document.querySelector('#book-detail');
    if (!book) {
      content.innerHTML = ui.empty('Không tìm thấy sách. Sách có thể đã được quản trị viên xóa.');
      document.querySelector('#related-books').innerHTML = '';
      return;
    }
    document.title = `${book.title} | Thư viện`;
    content.innerHTML = `<div class="book-detail"><div class="detail-cover"><img src="${ui.image(book)}" alt="Bìa sách ${ui.escape(book.title)}"></div>
      <section><p class="eyebrow">${ui.escape(category(book))}</p><h1>${ui.escape(book.title)}</h1><p class="muted">${ui.escape(author(book))}</p>
      <p class="book-description">${ui.escape(book.description || 'Nội dung đang được cập nhật.')}</p>
      <dl class="book-meta"><div><dt>Số trang</dt><dd>${book.pages}</dd></div><div><dt>Ngày xuất bản</dt><dd>${ui.date(book.published)}</dd></div><div><dt>ISBN</dt><dd>${ui.escape(book.isbn || 'Chưa cập nhật')}</dd></div><div><dt>Số bản còn</dt><dd>${book.stock}</dd></div></dl>
      <form id="borrow-form" class="form editor"><h2>Mượn sách</h2><p>Mỗi phiếu mượn một bản sách. Bạn có thể chọn thời hạn từ 1 đến 30 ngày.</p>
      <label>Thời hạn mượn<select name="days" id="borrow-days">${Array.from({ length: 30 }, (_, index) => `<option value="${index + 1}" ${index + 1 === days ? 'selected' : ''}>${index + 1} ngày</option>`).join('')}</select></label><p class="hint">Hạn trả dự kiến: <strong id="due-preview">${ui.date(ui.today(days))}</strong></p>
      <p>${currentReader() ? `Người dùng: <strong>${ui.escape(currentReader().name)}</strong>` : 'Vui lòng đăng nhập tài khoản người dùng trước khi mượn sách.'}</p>
      ${!lib.currentUser ? `<a class="button" href="${ui.url(`pages/auth/login.html?next=${encodeURIComponent(`pages/reader/book.html?id=${book.id}`)}`)}">Đăng nhập để mượn sách</a>` : ''}
      <button type="submit" ${book.stock < 1 || !currentReader() ? 'disabled' : ''}>${book.stock < 1 ? 'Tạm hết sách' : 'Xác nhận mượn sách'}</button><p class="form-message" role="status" hidden></p>
      <a href="${ui.url('pages/reader/loans.html')}">Xem sách của tôi →</a></form></section></div>`;
    document.querySelector('#borrow-days').onchange = event => {
      document.querySelector('#due-preview').textContent = ui.date(ui.today(Number(event.target.value)));
    };
    ui.form('#borrow-form', fields => {
      if (!currentReader()) throw new Error('Vui lòng đăng nhập tài khoản người dùng.');
      const loan = lib.createLoan({ bookId, days: fields.days });
      // Dựng lại thông tin để số lượng và nút mượn luôn đúng sau khi lưu.
      renderBook(Number(fields.days));
      const message = document.querySelector('#borrow-form .form-message');
      message.textContent = `Đã tạo phiếu PM${String(loan.id).padStart(3, '0')}. Hạn trả: ${ui.date(loan.dueDate)}.`;
      message.classList.add('success');
      message.hidden = false;
    });
    document.querySelector('#related-books').innerHTML = bookCards(lib.data.books.filter(item => item.categoryId === book.categoryId && item.id !== book.id).slice(0, 4));
  }

  function renderLoans() {
    const all = lib.data.loans.filter(loan => loan.userId === readerId);
    ui.stats([['Tổng lượt mượn', all.length], ['Đang mượn', all.filter(loan => loan.status === 'Đang mượn').length], ['Đã trả', all.filter(loan => loan.status === 'Đã trả').length], ['Quá hạn', all.filter(ui.isOverdue).length]]);
    const status = document.querySelector('#status-filter').value;
    const loans = all.filter(loan => !status || (status === 'Quá hạn' ? ui.isOverdue(loan) : loan.status === status)).reverse();
    document.querySelector('#loan-list').innerHTML = !currentReader() ? ui.empty('Vui lòng đăng nhập để xem lịch sử mượn.') : !loans.length ? ui.empty('Chưa có phiếu mượn phù hợp.') : ui.table(
      ['Mã phiếu', 'Sách', 'Ngày mượn', 'Hạn trả', 'Ngày trả', 'Trạng thái', 'Trả sách'],
      loans.map(loan => {
        const book = ui.byId(lib.data.books, loan.bookId);
        return `<tr><td>PM${String(loan.id).padStart(3, '0')}</td><td>${book ? `<a href="${ui.url(`pages/reader/book.html?id=${book.id}`)}">${ui.escape(book.title)}</a>` : 'Sách không còn'}</td><td>${ui.date(loan.borrowDate)}</td><td>${ui.date(loan.dueDate)}</td><td>${ui.date(loan.returnDate)}</td><td><span class="badge ${ui.isOverdue(loan) ? 'unavailable' : ''}">${ui.isOverdue(loan) ? 'Quá hạn' : ui.escape(loan.status)}</span></td><td>${loan.status !== 'Đang mượn' ? 'Đã hoàn tất' : loan.returnRequested ? '<span class="badge">Chờ xác nhận trả</span>' : `<button class="secondary small" data-request-return="${loan.id}">Yêu cầu trả sách</button>`}</td></tr>`;
      })
    );
    document.querySelectorAll('[data-request-return]').forEach(button => {
      button.onclick = () => ui.run(() => {
        lib.requestReturn(button.dataset.requestReturn, readerId);
        renderLoans();
        const message = document.querySelector('#return-message');
        message.textContent = 'Đã gửi yêu cầu trả sách. Vui lòng mang sách đến thư viện để thủ thư nhận và xác nhận.';
        message.hidden = false;
      });
    });
  }

  function renderProfile() {
    const reader = currentReader();
    const form = document.querySelector('#profile-form');
    form.hidden = !reader;
    document.querySelector('#profile-empty').hidden = Boolean(reader);
    if (!reader) return;
    document.querySelector('#reader-code').textContent = `ND${String(reader.id).padStart(3, '0')}`;
    for (const field of ['name', 'email', 'phone', 'address']) form.elements[field].value = reader[field] || '';
    form.querySelector('.form-message').hidden = true;
  }

  function render() {
    if (page === 'reader-books') renderCatalog();
    if (page === 'reader-book') renderBook();
    if (page === 'reader-loans') renderLoans();
    if (page === 'reader-profile') renderProfile();
  }

  if (page === 'reader-books') {
    document.querySelector('#category-filter').innerHTML = `<option value="">Tất cả danh mục</option>${ui.options(lib.data.categories)}`;
    document.querySelector('#book-search').oninput = renderCatalog;
    for (const selector of ['#category-filter', '#availability-filter', '#book-sort']) document.querySelector(selector).onchange = renderCatalog;
    document.querySelector('#clear-filters').onclick = () => {
      document.querySelector('#search-form').reset();
      renderCatalog();
    };
    document.querySelector('#search-form').onsubmit = event => event.preventDefault();
  }
  if (page === 'reader-loans') document.querySelector('#status-filter').onchange = renderLoans;
  if (page === 'reader-profile') ui.form('#profile-form', fields => {
    if (!currentReader()) throw new Error('Vui lòng đăng nhập tài khoản người dùng.');
    lib.saveReader(fields, readerId);
    ui.header();
    renderContext();
    return 'Đã cập nhật hồ sơ người dùng.';
  });
  render();
}).catch(window.UI.error);
