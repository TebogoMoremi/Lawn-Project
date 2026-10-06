import assert from "node:assert/strict";

// Run against a production preview: node scripts/verify-public.mjs http://localhost:3100
const base = new URL(process.argv[2] ?? "http://localhost:3100");
const queue = [
  "/",
  "/services",
  "/areas",
  "/gallery",
  "/about",
  "/contact",
  "/quote",
];
const pages = new Map();
const assets = new Set();
const fragments = [];
for (const path of queue) {
  if (pages.has(path)) continue;
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, `${path}: expected HTTP 200`);
  const html = await response.text();
  pages.set(path, html);
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) ?? []).length,
    1,
    `${path}: one main heading`,
  );
  assert.match(html, /<title>[^<]+<\/title>/, `${path}: title`);
  assert.match(
    html,
    /<meta name="description" content="[^"]+"/,
    `${path}: description`,
  );
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const url = new URL(href.replaceAll("&amp;", "&"), new URL(path, base));
    if (url.origin !== base.origin) continue;
    if (!queue.includes(url.pathname)) queue.push(url.pathname);
    if (url.hash) fragments.push([url.pathname, url.hash.slice(1)]);
  }
  for (const [, src] of html.matchAll(/<img\b[^>]*src="([^"]+)"/g))
    assets.add(src.replaceAll("&amp;", "&"));
  console.log(`PASS ${path}: status, heading, metadata`);
}
for (const [path, id] of fragments)
  assert.ok(
    pages.get(path)?.includes(`id="${id}"`),
    `${path}#${id}: missing anchor`,
  );
for (const src of assets) {
  const response = await fetch(new URL(src, base));
  assert.equal(response.status, 200, `${src}: image unavailable`);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^image\//,
    `${src}: expected image`,
  );
}
for (const path of [
  "/services/not-a-service",
  "/areas/not-an-area",
  "/missing-page",
]) {
  assert.equal(
    (await fetch(new URL(path, base))).status,
    404,
    `${path}: expected 404`,
  );
}
assert.equal(
  pages.size,
  18,
  "Expected 18 public URLs including quote placeholder",
);
console.log(
  `Verified ${pages.size} pages, ${assets.size} images, all internal links and anchors, and three unknown-route 404s.`,
);
