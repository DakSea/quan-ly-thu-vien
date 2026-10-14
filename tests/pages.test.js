const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pages = ['index.html', ...fs.readdirSync('pages', { recursive: true }).filter(name => name.endsWith('.html')).map(name => path.join('pages', name))];

test('all pages have valid local links, assets and unique element IDs', () => {
  assert.equal(pages.length, 9);
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    assert.match(html, /<html lang="vi">/, page);
    assert.ok(!/\b(?:th:|sec:)|thymeleaf|jquery|bootstrap/i.test(html), page);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `Duplicate IDs in ${page}`);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (match[1].startsWith('#')) continue;
      const target = path.resolve(path.dirname(page), match[1].split(/[?#]/)[0]);
      assert.ok(fs.existsSync(target), `Missing link/asset in ${page}: ${match[1]}`);
    }
  }
});

test('only admin pages remain and the entry point opens the dashboard', () => {
  assert.match(fs.readFileSync('index.html', 'utf8'), /data-page="dashboard"/);
  assert.ok(pages.every(page => page === 'index.html' || page.startsWith('pages/admin/')));
  assert.ok(!fs.existsSync('js/shop.js'));
  assert.ok(!fs.existsSync('js/account.js'));
  for (const page of pages) assert.ok(!/data-auth|shop\.js|account\.js/.test(fs.readFileSync(page, 'utf8')), page);
});

test('the delivered project contains no backend or build tooling', () => {
  for (const legacy of ['src', 'bin', '.mvn', 'mvnw', 'mvnw.cmd', 'pom.xml', 'package.json']) {
    assert.ok(!fs.existsSync(legacy), `Legacy backend/build artifact remains: ${legacy}`);
  }
});
