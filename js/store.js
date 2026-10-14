(() => {
  const key = 'book-library-v1';
  let data;
  const fail = message => { throw new Error(message); };
  const nextId = list => Math.max(0, ...list.map(item => item.id)) + 1;
  const text = value => String(value ?? '').trim();
  const integer = (value, min = 0) => Number.isSafeInteger(Number(value)) && Number(value) >= min;

  function commit(next) {
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { fail('Không lưu được dữ liệu. Bộ nhớ trình duyệt có thể đã đầy hoặc bị chặn.'); }
    data = next;
  }

  const ready = Promise.resolve().then(() => {
    let saved;
    try { saved = localStorage.getItem(key); }
    catch { fail('Trình duyệt đang chặn bộ nhớ. Hãy cho phép lưu dữ liệu của trang.'); }
    let stored;
    try {
      stored = saved === null ? structuredClone(window.LibrarySeed) : JSON.parse(saved);
      if (!stored || !['books', 'authors', 'categories', 'users', 'orders'].every(name => Array.isArray(stored[name]))) throw new Error();
    } catch { fail('Dữ liệu đã lưu bị lỗi. Hãy sao lưu trước khi xóa dữ liệu trang trong trình duyệt.'); }
    // Giữ danh mục và đơn hàng đã lưu từ bản cũ, bỏ dữ liệu đăng nhập và mua hàng.
    const users = stored.users.filter(user => user.role !== 'admin').map(({ id, name, username, email, phone, address }) => ({ id, name, username, email, phone, address, role: 'user' }));
    data = { books: stored.books, authors: stored.authors, categories: stored.categories, users, orders: stored.orders };
    if (saved !== JSON.stringify(data)) commit(data);
  });

  function getOrder(id) {
    const order = data.orders.find(item => item.id === Number(id));
    if (!order) fail('Không tìm thấy đơn hàng.');
    return order;
  }

  function cancelOrder(id) {
    const order = getOrder(id);
    if (order.status !== 'Đang chờ duyệt') fail('Chỉ có thể hủy đơn đang chờ duyệt.');
    const next = structuredClone(data);
    next.orders.find(item => item.id === order.id).status = 'Đã hủy';
    for (const item of order.items) {
      const book = next.books.find(book => book.id === item.bookId);
      if (book) { book.stock += item.quantity; book.sold -= item.quantity; }
    }
    commit(next);
  }

  window.Library = {
    ready, get data() { return data; }, getOrder, cancelOrder,
    updateOrderStatus(id, status) {
      const order = getOrder(id);
      if (status === order.status) return;
      if (status === 'Đã hủy') return cancelOrder(id);
      if (!({ 'Đang chờ duyệt': ['Đang giao'], 'Đang giao': ['Đã giao'] }[order.status] || []).includes(status)) fail('Không thể chuyển sang trạng thái này.');
      const next = structuredClone(data);
      next.orders.find(item => item.id === order.id).status = status;
      commit(next);
    },
    saveUser(fields, id) {
      const next = structuredClone(data), account = next.users.find(item => item.id === Number(id));
      if (!account) fail('Không tìm thấy tài khoản.');
      const name = text(fields.name), email = text(fields.email).toLowerCase();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Họ tên và email không hợp lệ.');
      if (data.users.some(item => item.id !== account.id && item.email.toLowerCase() === email)) fail('Email đã được sử dụng.');
      Object.assign(account, { name, email, phone: text(fields.phone), address: text(fields.address) });
      commit(next);
    },
    saveBook(fields) {
      const title = text(fields.title), authorId = Number(fields.authorId), categoryId = Number(fields.categoryId);
      if (!title || !data.authors.some(item => item.id === authorId) || !data.categories.some(item => item.id === categoryId)) fail('Vui lòng chọn tiêu đề, tác giả và danh mục hợp lệ.');
      if (!integer(fields.price, 1) || !integer(fields.stock) || !integer(fields.pages, 1)) fail('Giá và số trang phải là số nguyên dương; tồn kho phải là số nguyên không âm.');
      if (data.books.some(item => item.id !== Number(fields.id) && item.title.toLowerCase() === title.toLowerCase() && item.authorId === authorId)) fail('Sách đã có cùng tiêu đề và tác giả.');
      const next = structuredClone(data), existing = next.books.find(item => item.id === Number(fields.id));
      if (fields.id && !existing) fail('Không tìm thấy sách.');
      const book = { id: existing?.id || nextId(data.books), title, authorId, categoryId, price: Number(fields.price), stock: Number(fields.stock), pages: Number(fields.pages), sold: existing?.sold || 0, published: text(fields.published), description: text(fields.description), image: fields.image || existing?.image || '' };
      if (book.image && !/^(data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]*={0,2}|[a-zA-Z0-9-]+\.(jpg|png|webp))$/.test(book.image)) fail('Ảnh bìa không hợp lệ.');
      if (existing) Object.assign(existing, book); else next.books.push(book);
      commit(next);
      return book;
    },
    deleteBook(id) {
      if (data.orders.some(order => ['Đang chờ duyệt', 'Đang giao'].includes(order.status) && order.items.some(item => item.bookId === Number(id)))) fail('Sách đang có trong đơn chưa hoàn tất.');
      const next = structuredClone(data);
      next.books = next.books.filter(item => item.id !== Number(id));
      commit(next);
    },
    saveNamed(type, fields) {
      if (!['authors', 'categories'].includes(type)) fail('Loại dữ liệu không hợp lệ.');
      const name = text(fields.name);
      if (!name || data[type].some(item => item.id !== Number(fields.id) && item.name.toLowerCase() === name.toLowerCase())) fail('Tên đang trống hoặc đã tồn tại.');
      const next = structuredClone(data), existing = next[type].find(item => item.id === Number(fields.id));
      if (fields.id && !existing) fail('Không tìm thấy mục cần sửa.');
      const item = { id: existing?.id || nextId(data[type]), name, description: text(fields.description) };
      if (existing) Object.assign(existing, item); else next[type].push(item);
      commit(next);
      return item;
    },
    deleteNamed(type, id) {
      if (!['authors', 'categories'].includes(type)) fail('Loại dữ liệu không hợp lệ.');
      const field = type === 'authors' ? 'authorId' : 'categoryId';
      if (data.books.some(book => book[field] === Number(id))) fail('Mục này đang được sử dụng bởi sách.');
      const next = structuredClone(data);
      next[type] = next[type].filter(item => item.id !== Number(id));
      commit(next);
    },
    deleteUser(id) {
      const account = data.users.find(item => item.id === Number(id));
      if (!account || account.role === 'admin') fail('Không thể xóa tài khoản quản trị.');
      if (data.orders.some(order => order.userId === account.id && ['Đang chờ duyệt', 'Đang giao'].includes(order.status))) fail('Khách hàng có đơn chưa hoàn tất.');
      const next = structuredClone(data);
      next.users = next.users.filter(item => item.id !== account.id);
      commit(next);
    },
  };
})();
