const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const credentials = (suffix = 'one') => ({ name: `Người dùng ${suffix}`, username: `user_${suffix}`, email: `${suffix}@example.com`, password: 'Password123', confirmPassword: 'Password123' });
async function openLibrary(saved, configure = () => {}) {
  const disk = new Map();
  const session = new Map();
  if (saved) disk.set('library-management-v2', saved);
  const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) });
  const context = vm.createContext({ window: {}, crypto: webcrypto, TextEncoder, localStorage: storage(disk), sessionStorage: storage(session) });
  configure({ context, disk, session });
  for (const file of ['data.js', 'store.js']) vm.runInContext(fs.readFileSync(`js/${file}`, 'utf8'), context);
  const lib = context.window.Library;
  await lib.ready;
  return { lib, disk, session, context };
}
const admin = lib => lib.login('admin', '123', 'admin');
async function member(lib, suffix = 'one') {
  const fields = credentials(suffix);
  const user = await lib.register(fields);
  await lib.login(fields.username, fields.password);
  return user;
}
const borrow = (lib, fields = {}) => lib.createLoan({ bookId: lib.data.books[0].id, days: 14, ...fields });

test('bản mới không có người dùng hoặc phiếu mẫu, chỉ có tài khoản admin riêng', async () => {
  const { lib } = await openLibrary();
  assert.equal(lib.data.users.length, 0);
  assert.equal(lib.data.loans.length, 0);
  assert.ok(lib.data.books.length > 0);
  assert.equal(lib.data.admin.username, 'admin');
  assert.equal(lib.currentUser, null);
});

test('mật khẩu admin chuyển sang 123 một lần và giữ nguyên tài khoản người dùng', async () => {
  const { lib } = await openLibrary();
  await member(lib);
  const saved = JSON.parse(JSON.stringify(lib.data));
  delete saved.admin.passwordVersion;
  saved.admin.passwordHash = 'hash-phien-ban-cu';
  const { lib: updated, disk } = await openLibrary(JSON.stringify(saved));
  assert.equal(updated.data.users.length, 1);
  await updated.login('admin', '123', 'admin');
  await assert.rejects(updated.login('admin', 'Admin@123', 'admin'), /không đúng/);
  const next = await openLibrary(disk.get('library-management-v2'));
  assert.equal(next.lib.data.admin.passwordHash, updated.data.admin.passwordHash);
});

test('đăng ký kiểm tra trùng tên, email, mật khẩu và không nhận vai trò admin từ biểu mẫu', async () => {
  const { lib, disk } = await openLibrary();
  const fields = credentials();
  await assert.rejects(lib.register({ ...fields, confirmPassword: 'khac' }), /không khớp/);
  await assert.rejects(lib.register({ ...fields, password: '123', confirmPassword: '123' }), /8 ký tự/);
  await assert.rejects(lib.register({ ...fields, username: 'admin' }), /không dùng admin/);
  const user = await lib.register({ ...fields, role: 'admin' });
  assert.equal(user.role, 'user');
  assert.ok(user.passwordHash);
  assert.ok(!disk.get('library-management-v2').includes(fields.password));
  await assert.rejects(lib.register({ ...fields, username: 'another' }), /đã được sử dụng/);
  await assert.rejects(lib.register({ ...fields, email: 'another@example.com' }), /đã được sử dụng/);
  assert.equal(lib.currentUser, null);
});

test('đăng nhập bằng tên hoặc email, từ chối sai mật khẩu, giữ phiên qua tải trang và đăng xuất', async () => {
  const { lib, disk, session } = await openLibrary();
  await lib.register(credentials());
  await assert.rejects(lib.login('user_one', 'wrong'), /không đúng/);
  await lib.login('one@example.com', 'Password123');
  assert.equal(lib.currentUser.username, 'user_one');
  const reopened = await openLibrary(disk.get('library-management-v2'));
  reopened.session.set('library-login', session.get('library-login'));
  assert.equal(reopened.lib.currentUser.username, 'user_one');
  const validSession = reopened.session.get('library-login');
  reopened.session.set('library-login', JSON.stringify({ id: 'admin' }));
  assert.equal(reopened.lib.currentUser, null);
  reopened.session.set('library-login', JSON.stringify({ id: 'admin', token: 'khong-hop-le', role: 'admin' }));
  assert.equal(reopened.lib.currentUser, null);
  reopened.session.set('library-login', validSession);
  reopened.lib.logout();
  assert.equal(reopened.lib.currentUser, null);
  assert.throws(() => borrow(reopened.lib), /đăng nhập/);
});

test('khách và người dùng không được sửa quản trị hoặc đăng nhập admin bằng tài khoản thường', async () => {
  const { lib } = await openLibrary();
  assert.throws(() => lib.saveBook(lib.data.books[0]), /quản trị/);
  assert.throws(() => borrow(lib), /đăng nhập/);
  await member(lib);
  assert.throws(() => lib.deleteBook(1), /quản trị/);
  assert.throws(() => lib.saveNamed('authors', { name: 'Mới' }), /quản trị/);
  await assert.rejects(lib.login('user_one', 'Password123', 'admin'), /không đúng/);
  await admin(lib);
  assert.equal(lib.currentUser.role, 'admin');
  assert.throws(() => borrow(lib), /tài khoản người dùng/);
});

test('admin thêm sửa sách, kiểm tra đầu vào và giữ dữ liệu sau tải lại', async () => {
  const { lib, disk } = await openLibrary();
  await admin(lib);
  const book = lib.data.books[0];
  lib.saveBook({ ...book, title: 'Tên đã sửa', stock: 0 });
  assert.throws(() => lib.saveBook({ ...book, stock: -1 }));
  assert.throws(() => lib.saveBook({ ...book, authorId: 9999 }));
  const reopened = await openLibrary(disk.get('library-management-v2'));
  assert.equal(reopened.lib.data.books[0].title, 'Tên đã sửa');
});

test('danh mục và tác giả có sách không bị xóa, mục chưa dùng xóa được', async () => {
  const { lib } = await openLibrary();
  await admin(lib);
  assert.throws(() => lib.deleteNamed('authors', lib.data.books[0].authorId));
  assert.throws(() => lib.deleteNamed('categories', lib.data.books[0].categoryId));
  const category = lib.saveNamed('categories', { name: 'Mới' });
  lib.deleteNamed('categories', category.id);
  assert.ok(!lib.data.categories.some(item => item.id === category.id));
});

test('mượn gắn đúng tài khoản và giảm số bản; không mượn thay người khác', async () => {
  const { lib } = await openLibrary();
  const user = await member(lib);
  const stock = lib.data.books[0].stock;
  assert.throws(() => borrow(lib, { userId: 9999 }), /tài khoản của mình/);
  const loan = borrow(lib);
  assert.equal(loan.userId, user.id);
  assert.equal(lib.data.books[0].stock, stock - 1);
  assert.equal(loan.status, 'Đang mượn');
});

test('mượn sách hết bản hoặc thời hạn ngoài khoảng 1–30 ngày bị chặn', async () => {
  const { lib } = await openLibrary();
  await admin(lib);
  lib.saveBook({ ...lib.data.books[0], stock: 0 });
  await member(lib);
  assert.throws(() => borrow(lib), /hết bản/);
  assert.throws(() => borrow(lib, { bookId: lib.data.books[1].id, days: 31 }), /1 đến 30/);
});

test('thời hạn mượn chấp nhận 1 và 30 ngày, từ chối giá trị ngoài khoảng hoặc không nguyên', async () => {
  const { lib } = await openLibrary();
  await member(lib);
  for (const days of [0, 31, -1, 1.5, 'abc', '']) assert.throws(() => borrow(lib, { days }), /1 đến 30/);
  assert.equal(lib.data.loans.length, 0);
  for (const days of [1, 30]) {
    const loan = borrow(lib, { days });
    assert.equal((Date.parse(loan.dueDate) - Date.parse(loan.borrowDate)) / 86400000, days);
  }
});

test('yêu cầu trả thuộc đúng tài khoản, không tăng stock trước khi admin xác nhận', async () => {
  const { lib, disk } = await openLibrary();
  await member(lib);
  const loan = borrow(lib);
  const stock = lib.data.books[0].stock;
  await member(lib, 'two');
  assert.throws(() => lib.requestReturn(loan.id), /không thuộc/);
  await lib.login('user_one', 'Password123');
  lib.requestReturn(loan.id);
  assert.equal(lib.data.books[0].stock, stock);
  assert.throws(() => lib.requestReturn(loan.id), /đã gửi/);
  assert.throws(() => lib.returnLoan(loan.id), /quản trị/);
  const reopened = await openLibrary(disk.get('library-management-v2'));
  assert.equal(reopened.lib.data.loans[0].returnRequested, true);
  await admin(reopened.lib);
  reopened.lib.returnLoan(loan.id);
  assert.equal(reopened.lib.data.books[0].stock, stock + 1);
  assert.equal(reopened.lib.data.loans[0].status, 'Đã trả');
  assert.throws(() => reopened.lib.returnLoan(loan.id), /trước đó/);
});

test('chỉ sửa hồ sơ của mình, email duy nhất, thông tin đăng nhập còn nguyên', async () => {
  const { lib } = await openLibrary();
  const one = await member(lib);
  const two = await member(lib, 'two');
  assert.throws(() => lib.saveReader({ name: 'Sửa hộ', email: 'other@example.com' }, one.id), /hồ sơ của mình/);
  assert.throws(() => lib.saveReader({ name: two.name, email: one.email }, two.id), /đã được sử dụng/);
  lib.saveReader({ name: 'Tên mới', email: 'new@example.com' }, two.id);
  lib.logout();
  await lib.login('user_two', 'Password123');
  assert.equal(lib.currentUser.name, 'Tên mới');
});

test('admin không xóa sách và người dùng có lịch sử, xóa được tài khoản mới chưa mượn', async () => {
  const { lib } = await openLibrary();
  const one = await member(lib);
  borrow(lib);
  const two = await member(lib, 'two');
  await admin(lib);
  assert.throws(() => lib.deleteReader(one.id));
  assert.throws(() => lib.deleteBook(lib.data.books[0].id));
  lib.deleteReader(two.id);
  assert.ok(!lib.data.users.some(user => user.id === two.id));
});

test('lỗi ghi bộ nhớ không làm giảm số bản hoặc tạo phiếu dang dở', async () => {
  const { lib, context } = await openLibrary();
  await member(lib);
  const stock = lib.data.books[0].stock;
  context.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => borrow(lib), /Không lưu được/);
  assert.equal(lib.data.books[0].stock, stock);
  assert.equal(lib.data.loans.length, 0);
});

test('dữ liệu lưu sai định dạng được báo lỗi và giữ nguyên để kiểm tra', async () => {
  const { lib } = await openLibrary();
  for (const saved of ['{json-loi', JSON.stringify({ ...lib.data, loans: {} })]) {
    let disk;
    await assert.rejects(openLibrary(saved, state => { disk = state.disk; }), /Dữ liệu đã lưu bị lỗi/);
    assert.equal(disk.get('library-management-v2'), saved);
  }
});

test('đăng nhập lỗi ghi dữ liệu vẫn giữ phiên và dữ liệu trước đó', async () => {
  const { lib, context, disk, session } = await openLibrary();
  const user = await member(lib);
  const oldData = disk.get('library-management-v2');
  const oldSession = session.get('library-login');
  context.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  await assert.rejects(admin(lib), /Không lưu được/);
  assert.equal(session.get('library-login'), oldSession);
  assert.equal(disk.get('library-management-v2'), oldData);
  assert.equal(lib.currentUser.id, user.id);
});

test('hai yêu cầu đăng ký cùng tài khoản không tạo người dùng trùng', async () => {
  const { lib } = await openLibrary();
  const results = await Promise.allSettled([lib.register(credentials()), lib.register(credentials())]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(lib.data.users.length, 1);
});

test('xác nhận trả lỗi ghi dữ liệu không tăng số bản hoặc đổi trạng thái phiếu', async () => {
  const { lib, context, disk } = await openLibrary();
  await member(lib);
  const loan = borrow(lib);
  lib.requestReturn(loan.id);
  await admin(lib);
  const oldData = disk.get('library-management-v2');
  const stock = lib.data.books[0].stock;
  context.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => lib.returnLoan(loan.id), /Không lưu được/);
  assert.equal(lib.data.books[0].stock, stock);
  assert.equal(lib.data.loans[0].status, 'Đang mượn');
  assert.equal(lib.data.loans[0].returnRequested, true);
  assert.equal(disk.get('library-management-v2'), oldData);
});

test('nâng cấp xóa tài khoản và phiếu cũ một lần, hoàn số bản đang mượn, giữ sách', async () => {
  const { lib } = await openLibrary();
  const legacy = JSON.parse(JSON.stringify(lib.data));
  delete legacy.version;
  delete legacy.admin;
  legacy.users = [{ id: 2, name: 'Tài khoản cũ', email: 'cu@example.com', role: 'reader' }];
  legacy.loans = [{ id: 1, userId: 2, bookId: 1, status: 'Đang mượn' }, { id: 2, userId: 2, bookId: 1, status: 'Đã trả' }];
  const stock = legacy.books[0].stock;
  const migrated = await openLibrary(JSON.stringify(legacy));
  assert.equal(migrated.lib.data.users.length, 0);
  assert.equal(migrated.lib.data.loans.length, 0);
  assert.equal(migrated.lib.data.books[0].stock, stock + 1);
  await member(migrated.lib);
  const reopened = await openLibrary(migrated.disk.get('library-management-v2'));
  assert.equal(reopened.lib.data.users.length, 1);
  assert.equal(reopened.lib.data.books[0].stock, stock + 1);
});
