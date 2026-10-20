(() => {
  const key = 'library-management-v2';
  const oldKey = 'book-library-v1';
  let data;
  const sessionKey = 'library-login';

  function currentUser() {
    let session;
    try { session = JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); }
    catch (error) { return null; }
    if (!session || typeof session.token !== 'string' || !session.token || !data) return null;
    // Vai trò lấy từ tài khoản đã lưu, không lấy từ biểu mẫu đăng ký.
    const account = session.id === 'admin' ? data.admin : data.users.find(user => user.id === session.id);
    return account && account.sessionToken === session.token ? account : null;
  }
  function requireAdmin() {
    if (currentUser()?.role !== 'admin') fail('Chức năng này chỉ dành cho quản trị viên.');
  }
  function requireUser() {
    const user = currentUser();
    if (!user || user.role !== 'user') fail('Vui lòng đăng nhập tài khoản người dùng.');
    return user;
  }
  async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
    return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), byte => byte.toString(16).padStart(2, '0')).join('');

  const text = value => String(value || '').trim();
  const clone = value => JSON.parse(JSON.stringify(value));
  const nextId = list => Math.max(0, ...list.map(item => Number(item.id) || 0)) + 1;
  const fail = message => { throw new Error(message); };
  const homNay = () => {
    const date = new Date();
    const thang = String(date.getMonth() + 1).padStart(2, '0');
    const ngay = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${thang}-${ngay}`;
  };

  function commit(next) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch (error) {
      fail('Không lưu được dữ liệu. Hãy kiểm tra bộ nhớ trình duyệt.');
    }
    data = next;
  }

  const ready = Promise.resolve().then(async () => {
    let saved;
    try {
      saved = localStorage.getItem(key) || localStorage.getItem(oldKey);
    } catch (error) {
      fail('Trình duyệt đang chặn bộ nhớ. Hãy cho phép lưu dữ liệu của trang.');
    }

    let stored;
    try {
      stored = saved ? JSON.parse(saved) : clone(window.LibrarySeed);
      if (!stored || !['books', 'authors', 'categories', 'users'].every(name => Array.isArray(stored[name])) ||
          (stored.loans !== undefined && !Array.isArray(stored.loans))) {
        throw new Error('Dữ liệu không hợp lệ');
      }
    } catch (error) {
      fail('Dữ liệu đã lưu bị lỗi. Hãy kiểm tra dữ liệu Local Storage của trang.');
    }

    // Phiên bản tài khoản mới: xóa người dùng và phiếu cũ đúng yêu cầu.
    // Hoàn lại các bản đang cho mượn trước khi xóa phiếu để số lượng không bị hụt.
    if (stored.version !== 3) {
      for (const loan of stored.loans || []) {
        const book = stored.books.find(item => item.id === loan.bookId);
        if (book && loan.status === 'Đang mượn') book.stock++;
      }
      stored.users = [];
      stored.loans = [];
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem('library-reader-id');
    }
    // Cập nhật mật khẩu admin một lần; giữ nguyên người dùng và lịch sử hiện có.
    if (!stored.admin || stored.admin.passwordVersion !== 2) {
      const salt = randomToken();
      stored.admin = { id: 'admin', username: 'admin', name: 'Quản trị viên', role: 'admin', salt, passwordHash: await hashPassword('123', salt), passwordVersion: 2 };
    }
    data = {
      version: 3,
      books: stored.books,
      authors: stored.authors,
      categories: stored.categories,
      users: stored.users,
      loans: stored.loans || [],
      admin: stored.admin
    };
    commit(data);
    localStorage.removeItem(oldKey);
  });

  function getLoan(id) {
    const loan = data.loans.find(item => item.id === Number(id));
    if (!loan) fail('Không tìm thấy phiếu mượn.');
    return loan;
  }

  function saveReader(fields, id) {
    const actor = currentUser();
    if (!id || !actor || (actor.role !== 'admin' && actor.id !== Number(id))) fail('Bạn chỉ được cập nhật hồ sơ của mình.');
    const name = text(fields.name);
    const email = text(fields.email).toLowerCase();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fail('Vui lòng nhập họ tên và email hợp lệ.');
    }
    const oldReader = id ? data.users.find(user => user.id === Number(id)) : null;
    if (id && !oldReader) fail('Không tìm thấy người dùng.');
    if (data.users.some(user => user.id !== Number(id) && user.email.toLowerCase() === email)) {
      fail('Email này đã được sử dụng.');
    }

    const next = clone(data);
    const reader = next.users.find(user => user.id === Number(id));
    Object.assign(reader, {
      name,
      email,
      phone: text(fields.phone),
      address: text(fields.address),
      role: 'user'
    });
    commit(next);
    return reader;
  }

  window.Library = {
    ready,
    get data() { return data; },
    get currentUser() { return currentUser(); },

    async register(fields) {
      const name = text(fields.name);
      const email = text(fields.email).toLowerCase();
      const username = text(fields.username).toLowerCase();
      const password = String(fields.password || '');
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Vui lòng nhập họ tên và email hợp lệ.');
      if (!/^[a-z0-9_]{4,30}$/.test(username) || username === 'admin') fail('Tên đăng nhập gồm 4–30 chữ cái không dấu, số hoặc dấu gạch dưới; không dùng admin.');
      if (password.length < 8) fail('Mật khẩu cần ít nhất 8 ký tự.');
      if (password !== fields.confirmPassword) fail('Mật khẩu xác nhận không khớp.');
      const salt = randomToken();
      const passwordHash = await hashPassword(password, salt);
      if (data.users.some(user => user.username === username || user.email.toLowerCase() === email)) fail('Tên đăng nhập hoặc email đã được sử dụng.');
      const next = clone(data);
      const user = { id: nextId(next.users), name, username, email, phone: text(fields.phone), address: text(fields.address), role: 'user', salt, passwordHash };
      next.users.push(user);
      commit(next);
      return user;
    },

    async login(username, password, role = 'user') {
      const account = role === 'admin' ? data.admin : data.users.find(user => user.username === text(username).toLowerCase() || user.email === text(username).toLowerCase());
      if (!account || (role === 'admin' && account.username !== text(username).toLowerCase())) fail('Tên đăng nhập hoặc mật khẩu không đúng.');
      if (await hashPassword(String(password), account.salt) !== account.passwordHash) fail('Tên đăng nhập hoặc mật khẩu không đúng.');
      const token = randomToken();
      const next = clone(data);
      const target = role === 'admin' ? next.admin : next.users.find(user => user.id === account.id);
      target.sessionToken = token;
      // Lưu phiên trước, khôi phục nếu không ghi được dữ liệu.
      const oldSession = sessionStorage.getItem(sessionKey);
      sessionStorage.setItem(sessionKey, JSON.stringify({ id: account.id, token }));
      try { commit(next); } catch (error) {
        if (oldSession) sessionStorage.setItem(sessionKey, oldSession);
        else sessionStorage.removeItem(sessionKey);
        throw error;
      }
      return currentUser();
    },

    logout() { sessionStorage.removeItem(sessionKey); },

    saveBook(fields) {
      requireAdmin();
      const title = text(fields.title);
      const authorId = Number(fields.authorId);
      const categoryId = Number(fields.categoryId);
      const stock = Number(fields.stock);
      const pages = Number(fields.pages);
      if (!title || !data.authors.some(item => item.id === authorId) || !data.categories.some(item => item.id === categoryId)) {
        fail('Vui lòng nhập tên sách và chọn tác giả, danh mục.');
      }
      if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(pages) || pages < 1) {
        fail('Số lượng sách phải từ 0 trở lên và số trang phải lớn hơn 0.');
      }
      if (data.books.some(item => item.id !== Number(fields.id) && item.title.toLowerCase() === title.toLowerCase() && item.authorId === authorId)) {
        fail('Sách này đã có trong danh sách.');
      }

      const next = clone(data);
      const oldBook = next.books.find(item => item.id === Number(fields.id));
      if (fields.id && !oldBook) fail('Không tìm thấy sách cần sửa.');
      // stock là số bản CÒN, không bao gồm các bản đang cho mượn.
      const book = {
        id: oldBook ? oldBook.id : nextId(next.books),
        title,
        authorId,
        categoryId,
        isbn: text(fields.isbn),
        stock,
        pages,
        published: text(fields.published),
        description: text(fields.description),
        image: fields.image || (oldBook ? oldBook.image : '') || ''
      };
      if (oldBook) Object.assign(oldBook, book);
      else next.books.push(book);
      commit(next);
      return book;
    },

    deleteBook(id) {
      requireAdmin();
      const bookId = Number(id);
      if (data.loans.some(loan => loan.bookId === bookId)) {
        fail('Không thể xóa sách đã có lịch sử mượn để giữ nguyên báo cáo thư viện.');
      }
      const next = clone(data);
      next.books = next.books.filter(book => book.id !== bookId);
      commit(next);
    },

    saveReader,
    saveUser: saveReader,

    deleteReader(id) {
      requireAdmin();
      const readerId = Number(id);
      if (!data.users.some(user => user.id === readerId)) fail('Không tìm thấy người dùng.');
      if (data.loans.some(loan => loan.userId === readerId)) {
        fail('Không thể xóa người dùng đã có lịch sử mượn để giữ nguyên báo cáo thư viện.');
      }
      const next = clone(data);
      next.users = next.users.filter(user => user.id !== readerId);
      commit(next);
    },
    deleteUser(id) { this.deleteReader(id); },

    saveNamed(type, fields) {
      requireAdmin();
      if (!['authors', 'categories'].includes(type)) fail('Loại dữ liệu không hợp lệ.');
      const name = text(fields.name);
      if (!name || data[type].some(item => item.id !== Number(fields.id) && item.name.toLowerCase() === name.toLowerCase())) {
        fail('Tên không được để trống hoặc trùng với dữ liệu đã có.');
      }
      const next = clone(data);
      const oldItem = next[type].find(item => item.id === Number(fields.id));
      if (fields.id && !oldItem) fail('Không tìm thấy mục cần sửa.');
      const item = { id: oldItem ? oldItem.id : nextId(next[type]), name, description: text(fields.description) };
      if (oldItem) Object.assign(oldItem, item);
      else next[type].push(item);
      commit(next);
      return item;
    },

    deleteNamed(type, id) {
      requireAdmin();
      if (!['authors', 'categories'].includes(type)) fail('Loại dữ liệu không hợp lệ.');
      const field = type === 'authors' ? 'authorId' : 'categoryId';
      if (data.books.some(book => book[field] === Number(id))) fail('Không thể xóa vì mục này đang được sách sử dụng.');
      const next = clone(data);
      next[type] = next[type].filter(item => item.id !== Number(id));
      commit(next);
    },

    createLoan(fields) {
      const userId = requireUser().id;
      if (fields.userId && Number(fields.userId) !== userId) fail('Bạn chỉ được mượn sách cho tài khoản của mình.');
      const bookId = Number(fields.bookId);
      const days = Number(fields.days);
      if (!Number.isInteger(days) || days < 1 || days > 30) fail('Thời hạn mượn phải là số nguyên từ 1 đến 30 ngày.');
      const borrowDate = homNay();
      const due = new Date(`${borrowDate}T12:00:00`);
      due.setDate(due.getDate() + days);
      const dueDate = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
      const reader = data.users.find(user => user.id === userId);
      const book = data.books.find(item => item.id === bookId);
      if (!reader || !book) fail('Tài khoản hoặc sách không còn tồn tại.');
      if (book.stock < 1) fail('Sách này hiện đã hết bản có thể mượn.');

      const next = clone(data);
      const loan = {
        id: nextId(next.loans),
        userId,
        bookId,
        borrowDate,
        dueDate,
        returnDate: '',
        status: 'Đang mượn'
      };
      next.loans.push(loan);
      next.books.find(item => item.id === bookId).stock--;
      commit(next);
      return loan;
    },

    requestReturn(id, userId) {
      const user = requireUser();
      const loan = getLoan(id);
      if (loan.userId !== user.id || (userId && user.id !== Number(userId))) fail('Phiếu mượn không thuộc tài khoản của bạn.');
      if (loan.status !== 'Đang mượn') fail('Phiếu mượn này đã được trả.');
      if (loan.returnRequested) fail('Bạn đã gửi yêu cầu trả cho phiếu này.');
      const next = clone(data);
      next.loans.find(item => item.id === loan.id).returnRequested = true;
      commit(next);
    },

    returnLoan(id) {
      requireAdmin();
      const loan = getLoan(id);
      if (loan.status !== 'Đang mượn') fail('Phiếu mượn này đã được trả trước đó.');
      const next = clone(data);
      const currentLoan = next.loans.find(item => item.id === loan.id);
      const book = next.books.find(item => item.id === currentLoan.bookId);
      if (book) book.stock++;
      currentLoan.status = 'Đã trả';
      currentLoan.returnDate = homNay();
      currentLoan.returnRequested = false;
      commit(next);
    }
  };
})();
