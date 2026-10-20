AppReady.then(allowed => {
  if (!allowed) return;

  const lib = window.Library;
  const ui = window.UI;
  const page = document.body.dataset.page;
  const id = Number(new URLSearchParams(location.search).get('id'));
  const { table, today, byId, isOverdue, stats } = ui;
  const readerName = loan => byId(lib.data.users, loan.userId)?.name || 'Người dùng đã xóa';
  const bookName = loan => byId(lib.data.books, loan.bookId)?.title || 'Sách đã xóa';
  const searchMatches = value => value.toLocaleLowerCase('vi').includes((document.querySelector('#admin-search')?.value || '').trim().toLocaleLowerCase('vi'));
  const readerCode = reader => `ND${String(reader.id).padStart(3, '0')}`;

  function borrowCount(bookId) {
    return lib.data.loans.filter(loan => loan.bookId === bookId).length;
  }

  if (page === 'dashboard') {
    const active = lib.data.loans.filter(loan => loan.status === 'Đang mượn');
    stats([
      ['Đầu sách', lib.data.books.length],
      ['Bản sách còn', lib.data.books.reduce((sum, book) => sum + Number(book.stock || 0), 0)],
      ['Người dùng', lib.data.users.length],
      ['Đang mượn', active.length],
      ['Quá hạn', active.filter(isOverdue).length]
    ]);

    const mostBorrowed = [...lib.data.books].sort((a, b) => borrowCount(b.id) - borrowCount(a.id)).slice(0, 5);
    document.querySelector('#top-books').innerHTML = table(
      ['Tên sách', 'Tác giả', 'Lượt mượn', 'Số bản còn'],
      mostBorrowed.map(book => `<tr><td>${ui.escape(book.title)}</td><td>${ui.escape(byId(lib.data.authors, book.authorId)?.name || '—')}</td><td>${borrowCount(book.id)}</td><td>${book.stock}</td></tr>`)
    );
  }

  if (page === 'admin-books') {
    function render() {
      const books = lib.data.books.filter(book => searchMatches(`${book.title} ${book.isbn || ''}`));
      document.querySelector('#admin-list').innerHTML = books.length ? table(
        ['Sách', 'Mã ISBN', 'Tác giả', 'Danh mục', 'Số bản còn', 'Thao tác'],
        books.map(book => `<tr><td><a class="table-book" href="${ui.url(`pages/admin/book.html?id=${book.id}`)}"><img src="${ui.image(book)}" alt=""><span>${ui.escape(book.title)}</span></a></td><td>${ui.escape(book.isbn || '—')}</td><td>${ui.escape(byId(lib.data.authors, book.authorId)?.name || '—')}</td><td>${ui.escape(byId(lib.data.categories, book.categoryId)?.name || '—')}</td><td>${book.stock}</td><td><div class="actions"><a class="button secondary small" href="${ui.url(`pages/admin/book.html?id=${book.id}`)}">Sửa</a><button class="danger small" data-delete="${book.id}">Xóa</button></div></td></tr>`)
      ) : ui.empty('Không tìm thấy sách.');
      document.querySelectorAll('[data-delete]').forEach(button => {
        button.onclick = () => ui.run(() => {
          if (confirm('Bạn có chắc muốn xóa sách này?')) {
            lib.deleteBook(button.dataset.delete);
            render();
          }
        });
      });
    }
    document.querySelector('#admin-search').oninput = render;
    render();
  }

  if (page === 'admin-book') {
    const book = id ? byId(lib.data.books, id) : null;
    const form = document.querySelector('#book-form');
    if (id && !book) {
      ui.error('Không tìm thấy sách.');
      form.hidden = true;
      return;
    }
    document.querySelector('#editor-title').textContent = book ? 'Chỉnh sửa thông tin sách' : 'Thêm sách mới';
    form.elements.authorId.innerHTML = `<option value="">Chọn tác giả</option>${ui.options(lib.data.authors, book?.authorId)}`;
    form.elements.categoryId.innerHTML = `<option value="">Chọn danh mục</option>${ui.options(lib.data.categories, book?.categoryId)}`;
    if (book) {
      for (const field of ['title', 'isbn', 'stock', 'pages', 'published', 'description']) {
        form.elements[field].value = book[field] ?? '';
      }
      document.querySelector('#image-preview').src = ui.image(book);
      document.querySelector('#image-preview').hidden = false;
    }

    const checkImage = file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 500 * 1024) {
        throw new Error('Chọn ảnh JPG, PNG hoặc WebP có dung lượng tối đa 500 KB.');
      }
    };
    let previewUrl;
    form.elements.imageFile.onchange = () => ui.run(() => {
      const file = form.elements.imageFile.files[0];
      if (!file) return;
      checkImage(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(file);
      document.querySelector('#image-preview').src = previewUrl;
      document.querySelector('#image-preview').hidden = false;
    });

    ui.form('#book-form', async fields => {
      const file = form.elements.imageFile.files[0];
      let image = book?.image || '';
      if (file) {
        checkImage(file);
        image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Không đọc được ảnh.'));
          reader.readAsDataURL(file);
        });
      }
      lib.saveBook({ ...fields, id: book?.id, image });
      location.href = ui.url('pages/admin/books.html');
      return '';
    });
  }

  if (page === 'admin-authors' || page === 'admin-categories') {
    const type = page === 'admin-authors' ? 'authors' : 'categories';
    const label = type === 'authors' ? 'tác giả' : 'danh mục';
    const form = document.querySelector('#named-form');
    function reset() {
      form.reset();
      form.querySelector('.form-message').hidden = true;
      document.querySelector('#named-title').textContent = `Thêm ${label}`;
    }
    function render() {
      const items = lib.data[type].filter(item => searchMatches(item.name));
      document.querySelector('#admin-list').innerHTML = items.length ? table(
        ['Tên', 'Số sách', 'Thao tác'],
        items.map(item => `<tr><td>${ui.escape(item.name)}</td><td>${lib.data.books.filter(book => book[type === 'authors' ? 'authorId' : 'categoryId'] === item.id).length}</td><td><div class="actions"><button class="secondary small" data-edit="${item.id}">Sửa</button><button class="danger small" data-delete="${item.id}">Xóa</button></div></td></tr>`)
      ) : ui.empty('Chưa có kết quả phù hợp.');

      document.querySelectorAll('[data-edit]').forEach(button => {
        button.onclick = () => {
          const item = byId(lib.data[type], button.dataset.edit);
          form.elements.id.value = item.id;
          form.elements.name.value = item.name;
          if (form.elements.description) form.elements.description.value = item.description || '';
          document.querySelector('#named-title').textContent = `Chỉnh sửa ${label}`;
          form.querySelector('.form-message').hidden = true;
          form.elements.name.focus();
        };
      });
      document.querySelectorAll('[data-delete]').forEach(button => {
        button.onclick = () => ui.run(() => {
          if (confirm(`Bạn có chắc muốn xóa ${label} này?`)) {
            lib.deleteNamed(type, button.dataset.delete);
            reset();
            render();
          }
        });
      });
    }
    document.querySelector('#admin-search').oninput = render;
    document.querySelector('#cancel-edit').onclick = reset;
    ui.form('#named-form', fields => {
      lib.saveNamed(type, fields);
      reset();
      render();
      return `Đã lưu ${label}.`;
    });
    render();
  }

  if (page === 'admin-users') {
    function render() {
      const readers = lib.data.users.filter(reader => searchMatches(`${reader.name} ${reader.email} ${reader.phone}`));
      document.querySelector('#admin-list').innerHTML = readers.length ? table(
        ['Mã người dùng', 'Họ tên', 'Email', 'Điện thoại', 'Thao tác'],
        readers.map(reader => `<tr><td>${readerCode(reader)}</td><td>${ui.escape(reader.name)}</td><td>${ui.escape(reader.email)}</td><td>${ui.escape(reader.phone || '—')}</td><td><div class="actions"><a class="button secondary small" href="${ui.url(`pages/admin/user.html?id=${reader.id}`)}">Sửa</a><button class="danger small" data-delete="${reader.id}">Xóa</button></div></td></tr>`)
      ) : ui.empty('Chưa có người dùng phù hợp.');
      document.querySelectorAll('[data-delete]').forEach(button => {
        button.onclick = () => ui.run(() => {
          if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
            lib.deleteReader(button.dataset.delete);
            render();
          }
        });
      });
    }
    document.querySelector('#admin-search').oninput = render;
    render();
  }

  if (page === 'admin-user') {
    const reader = byId(lib.data.users, id);
    const form = document.querySelector('#user-form');
    if (!reader) {
      ui.error('Không tìm thấy người dùng.');
      form.hidden = true;
      return;
    }
    document.querySelector('#reader-code').textContent = readerCode(reader);
    for (const field of ['name', 'email', 'phone', 'address']) form.elements[field].value = reader[field] || '';
    ui.form('#user-form', fields => {
      lib.saveReader(fields, id);
      return 'Đã lưu thông tin người dùng.';
    });
  }

  if (page === 'admin-loans') {
    function render() {
      const status = document.querySelector('#loan-status').value;
      const loans = [...lib.data.loans].reverse().filter(loan => {
        const text = `PM${String(loan.id).padStart(3, '0')} ${loan.id} ${readerName(loan)} ${bookName(loan)}`;
        const matchesStatus = !status || (status === 'Quá hạn' ? isOverdue(loan) : loan.status === status);
        return matchesStatus && searchMatches(text);
      });
      document.querySelector('#admin-list').innerHTML = loans.length ? table(
        ['Mã phiếu', 'Người dùng', 'Tên sách', 'Ngày mượn', 'Hạn trả', 'Ngày trả', 'Trạng thái', 'Thao tác'],
        loans.map(loan => `<tr><td>PM${String(loan.id).padStart(3, '0')}</td><td>${ui.escape(readerName(loan))}</td><td>${ui.escape(bookName(loan))}</td><td>${ui.date(loan.borrowDate)}</td><td>${ui.date(loan.dueDate)}</td><td>${ui.date(loan.returnDate)}</td><td><span class="badge">${isOverdue(loan) ? 'Quá hạn' : ui.escape(loan.status)}</span>${loan.returnRequested && loan.status === 'Đang mượn' ? '<br><span class="badge">Yêu cầu trả sách</span>' : ''}</td><td>${loan.status === 'Đang mượn' ? `<button class="small" data-return="${loan.id}">Xác nhận trả</button>` : '—'}</td></tr>`)
      ) : ui.empty('Không tìm thấy phiếu mượn.');
      document.querySelectorAll('[data-return]').forEach(button => {
        button.onclick = () => {
          const cell = button.parentElement;
          cell.innerHTML = '<p class="hint">Bạn đã nhận lại sách?</p><div class="actions"><button class="small" data-confirm-return>Đã nhận sách</button><button class="secondary small" data-cancel-return>Hủy</button></div>';
          cell.querySelector('[data-confirm-return]').onclick = () => ui.run(() => {
            lib.returnLoan(button.dataset.return);
            render();
          });
          cell.querySelector('[data-cancel-return]').onclick = render;
        };
      });
    }

    document.querySelector('#admin-search').oninput = render;
    document.querySelector('#loan-status').onchange = render;
    render();
  }

  if (page === 'admin-reports') {
    const active = lib.data.loans.filter(loan => loan.status === 'Đang mượn');
    const overdue = active.filter(isOverdue);
    stats([
      ['Tổng lượt mượn', lib.data.loans.length],
      ['Đang mượn', active.length],
      ['Đã trả', lib.data.loans.filter(loan => loan.status === 'Đã trả').length],
      ['Quá hạn', overdue.length]
    ]);

    const overdueRows = overdue.map(loan => {
      const soNgay = Math.floor((new Date(`${today()}T12:00:00`) - new Date(`${loan.dueDate}T12:00:00`)) / 86400000);
      return `<tr><td>PM${String(loan.id).padStart(3, '0')}</td><td>${ui.escape(readerName(loan))}</td><td>${ui.escape(bookName(loan))}</td><td>${ui.date(loan.dueDate)}</td><td>${soNgay}</td></tr>`;
    });
    document.querySelector('#overdue-list').innerHTML = overdueRows.length ? table(['Mã phiếu', 'Người dùng', 'Sách', 'Hạn trả', 'Số ngày quá hạn'], overdueRows) : ui.empty('Hiện không có sách quá hạn.');

    const books = [...lib.data.books].map(book => ({ ...book, times: borrowCount(book.id) })).sort((a, b) => b.times - a.times);
    document.querySelector('#borrowed-books').innerHTML = table(['Tên sách', 'Tác giả', 'Số lượt mượn', 'Số bản còn'], books.map(book => `<tr><td>${ui.escape(book.title)}</td><td>${ui.escape(byId(lib.data.authors, book.authorId)?.name || '—')}</td><td>${book.times}</td><td>${book.stock}</td></tr>`));

    const readers = lib.data.users.map(reader => ({ ...reader, times: lib.data.loans.filter(loan => loan.userId === reader.id).length, active: active.filter(loan => loan.userId === reader.id).length })).sort((a, b) => b.times - a.times);
    document.querySelector('#reader-stats').innerHTML = table(['Mã người dùng', 'Họ tên', 'Tổng lượt mượn', 'Đang mượn'], readers.map(reader => `<tr><td>${readerCode(reader)}</td><td>${ui.escape(reader.name)}</td><td>${reader.times}</td><td>${reader.active}</td></tr>`));
  }
}).catch(window.UI.error);
