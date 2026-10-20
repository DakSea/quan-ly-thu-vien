const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pages = ['index.html', ...fs.readdirSync('pages', { recursive: true }).filter(name => name.endsWith('.html')).map(name => path.join('pages', name))];

test('mọi trang có liên kết và tài nguyên nội bộ tồn tại, ID không trùng nhau', () => {
  assert.equal(pages.length, 18);
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    assert.match(html, /<html lang="vi">/, page);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `ID trùng trong ${page}`);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (match[1].startsWith('#') || /^(https?:|mailto:|tel:)/.test(match[1])) continue;
      const target = path.resolve(path.dirname(page), match[1].split(/[?#]/)[0]);
      assert.ok(fs.existsSync(target), `Thiếu đường dẫn trong ${page}: ${match[1]}`);
    }
  }
});

test('dự án có các trang chính của hệ thống quản lý thư viện', () => {
  assert.match(fs.readFileSync('index.html', 'utf8'), /data-page="reader-books"/);
  assert.match(fs.readFileSync('pages/admin/index.html', 'utf8'), /data-require="admin"/);
  for (const page of pages.filter(page => page.startsWith(path.join('pages', 'admin')))) {
    assert.match(fs.readFileSync(page, 'utf8'), /data-require="admin"/);
  }
  assert.ok(fs.existsSync('pages/auth/login.html'));
  assert.ok(fs.existsSync('pages/auth/register.html'));
  assert.match(fs.readFileSync('pages/admin/books.html', 'utf8'), /Quản lý sách/);
  assert.match(fs.readFileSync('pages/admin/users.html', 'utf8'), /Quản lý người dùng/);
  assert.match(fs.readFileSync('pages/admin/loans.html', 'utf8'), /Quản lý mượn/);
  assert.match(fs.readFileSync('pages/admin/reports.html', 'utf8'), /Báo cáo và thống kê/);
  assert.ok(!fs.existsSync('pages/admin/orders.html'));
  assert.ok(!fs.existsSync('pages/admin/order.html'));
});

test('dự án dùng frontend tĩnh, không bắt buộc backend hoặc bước build', () => {
  for (const legacy of ['src', 'bin', '.mvn', 'mvnw', 'mvnw.cmd', 'pom.xml', 'package.json']) {
    assert.ok(!fs.existsSync(legacy), `Không mong đợi có file: ${legacy}`);
  }
});
