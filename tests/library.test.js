const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function openLibrary(saved) {
  const disk = new Map(saved ? [['book-library-v1', saved]] : []);
  const context = vm.createContext({ window: {}, localStorage: { getItem: key => disk.get(key) ?? null, setItem: (key, value) => disk.set(key, value) }, structuredClone });
  for (const file of ['data.js', 'store.js']) vm.runInContext(fs.readFileSync(`js/${file}`, 'utf8'), context);
  const library = context.window.Library;
  await library.ready;
  return { library, disk, context };
}

test('admin data opens directly without accounts, session storage or crypto', async () => {
  const { library: lib } = await openLibrary();
  assert.ok(lib.data.books.length);
  assert.ok(lib.data.orders.length);
  assert.equal(lib.login, undefined);
  assert.equal(lib.cartItems, undefined);
});

test('book edits persist while invalid references, quantities and duplicates are rejected', async () => {
  const { library: lib, disk } = await openLibrary();
  const book = lib.data.books[0];
  assert.throws(() => lib.saveBook({ ...book, authorId: 9999 }));
  assert.throws(() => lib.saveBook({ ...book, stock: -1 }));
  assert.throws(() => lib.saveBook({ ...book, id: undefined }));
  lib.saveBook({ ...book, title: 'Tên sách đã sửa', price: 100000 });
  const restored = await openLibrary(disk.get('book-library-v1'));
  assert.equal(restored.library.data.books[0].title, 'Tên sách đã sửa');
  assert.equal(restored.library.data.books[0].price, 100000);
});

test('categories and authors in use cannot be deleted', async () => {
  const { library: lib } = await openLibrary();
  assert.throws(() => lib.deleteNamed('categories', lib.data.books[0].categoryId));
  assert.throws(() => lib.deleteNamed('authors', lib.data.books[0].authorId));
  const category = lib.saveNamed('categories', { name: 'Danh mục mới' });
  lib.deleteNamed('categories', category.id);
  assert.ok(!lib.data.categories.some(item => item.id === category.id));
});

test('pending orders protect books and customers from deletion', async () => {
  const { library: lib } = await openLibrary();
  const order = lib.data.orders.find(item => item.status === 'Đang chờ duyệt');
  assert.throws(() => lib.deleteBook(order.items[0].bookId));
  assert.throws(() => lib.deleteUser(order.userId));
});

test('order cancellation restores stock exactly once', async () => {
  const { library: lib } = await openLibrary();
  const order = lib.data.orders.find(item => item.status === 'Đang chờ duyệt');
  const item = order.items[0], stock = lib.data.books.find(book => book.id === item.bookId).stock;
  lib.cancelOrder(order.id);
  assert.equal(lib.getOrder(order.id).status, 'Đã hủy');
  assert.equal(lib.data.books.find(book => book.id === item.bookId).stock, stock + item.quantity);
  assert.throws(() => lib.cancelOrder(order.id));
});

test('orders progress through shipping and delivered without changing purchase prices', async () => {
  const { library: lib } = await openLibrary();
  const order = lib.data.orders.find(item => item.status === 'Đang chờ duyệt');
  const price = order.items[0].price, book = lib.data.books.find(book => book.id === order.items[0].bookId);
  lib.saveBook({ ...book, price: 999999 });
  assert.equal(lib.getOrder(order.id).items[0].price, price);
  assert.throws(() => lib.updateOrderStatus(order.id, 'Đã giao'));
  lib.updateOrderStatus(order.id, 'Đang giao');
  lib.updateOrderStatus(order.id, 'Đã giao');
  assert.throws(() => lib.cancelOrder(order.id));
});

test('customer edits validate duplicate emails', async () => {
  const { library: lib } = await openLibrary();
  const [first, second] = lib.data.users;
  assert.throws(() => lib.saveUser({ ...first, email: second.email }, first.id));
  lib.saveUser({ ...first, name: 'Khách hàng đã sửa' }, first.id);
  assert.equal(lib.data.users[0].name, 'Khách hàng đã sửa');
});

test('failed storage writes preserve stock and order status', async () => {
  const { library: lib, context } = await openLibrary();
  const order = lib.data.orders.find(item => item.status === 'Đang chờ duyệt');
  const stock = lib.data.books.find(book => book.id === order.items[0].bookId).stock;
  context.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => lib.cancelOrder(order.id));
  assert.equal(lib.getOrder(order.id).status, 'Đang chờ duyệt');
  assert.equal(lib.data.books.find(book => book.id === order.items[0].bookId).stock, stock);
});

test('old catalog data is preserved while customer login and shopping data are removed', async () => {
  const { library: original } = await openLibrary();
  const saved = structuredClone(original.data);
  saved.books[0].title = 'Sách đã lưu';
  saved.users.push({ id: 999, role: 'admin', name: 'Old admin' });
  saved.users[0].passwordHash = 'old-hash';
  saved.cart = [];
  saved.reviews = [];
  const { library: restored } = await openLibrary(JSON.stringify(saved));
  assert.equal(restored.data.books[0].title, 'Sách đã lưu');
  assert.ok(!restored.data.users.some(user => user.role === 'admin'));
  assert.equal(restored.data.users[0].passwordHash, undefined);
  assert.equal(restored.data.cart, undefined);
  assert.equal(restored.data.reviews, undefined);
});

test('corrupt saved data is reported', async () => {
  await assert.rejects(() => openLibrary('{broken'), /dữ liệu/i);
});
