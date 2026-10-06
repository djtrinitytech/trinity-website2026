import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'anugatha-gallery-test-'));
const storePath = path.join(temporaryDirectory, 'gallery.json');
process.env.GALLERY_DATA_PATH = storePath;
process.env.ADMIN_USERNAME = 'gallery-test-admin';
process.env.ADMIN_PASSWORD = 'test-only-password-4821';
process.env.NODE_ENV = 'test';

const { default: app } = await import('../src/server.js');
const optimizedDirectory = path.resolve('uploads/optimized');
const originalsDirectory = path.resolve('uploads/originals');
const originalFilesBefore = new Set(await fs.readdir(originalsDirectory));
let server;
let baseUrl;
let adminCookie;
const createdFilePaths = [];

before(async () => {
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  await Promise.all(createdFilePaths.map(filePath => fs.rm(filePath, { force: true })));
  const originalFilesAfter = await fs.readdir(originalsDirectory);
  await Promise.all(originalFilesAfter.filter(fileName => !originalFilesBefore.has(fileName))
    .map(fileName => fs.rm(path.join(originalsDirectory, fileName), { force: true })));
  await fs.rm(temporaryDirectory, { recursive: true, force: true });
});

async function request(url, options = {}) {
  return fetch(`${baseUrl}${url}`, {
    ...options,
    headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(adminCookie ? { Cookie: adminCookie } : {}), ...options.headers }
  });
}

test('public albums, protected administration, persistent uploads, and optimized image URLs', async () => {
  const initial = await request('/api/albums');
  assert.equal(initial.status, 200);
  const initialAlbums = (await initial.json()).albums;
  assert.ok(initialAlbums.length > 0, 'seed photos are migrated into published albums');

  assert.equal((await request('/api/admin/albums')).status, 401);
  assert.equal((await request('/api/admin/albums', { method: 'POST', body: JSON.stringify({ title: 'Blocked' }) })).status, 401);
  assert.equal((await request('/api/artifacts', { method: 'POST' })).status, 404, 'legacy public upload route is removed');

  const badLogin = await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: 'bad', password: 'bad' }) });
  assert.equal(badLogin.status, 401);
  const login = await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }) });
  assert.equal(login.status, 200);
  adminCookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/admin/session')).status, 200);
  assert.equal((await request('/api/admin/albums', {
    method: 'POST',
    headers: { Origin: 'https://attacker.example' },
    body: JSON.stringify({ title: 'Cross-origin blocked' })
  })).status, 403);

  const createResponse = await request('/api/admin/albums', { method: 'POST', body: JSON.stringify({ title: 'Test Festival', description: 'Integration album', published: false }) });
  assert.equal(createResponse.status, 201);
  const { album } = await createResponse.json();
  assert.equal(album.published, false);
  assert.ok(!(await (await request('/api/albums')).json()).albums.some(item => item.id === album.id));

  const fixture = await sharp({ create: { width: 3000, height: 1500, channels: 3, background: '#bb9922' } }).png().toBuffer();
  const form = new FormData();
  form.append('images', new Blob([fixture], { type: 'image/png' }), 'stage-wide.png');
  form.append('images', new Blob([fixture], { type: 'image/png' }), 'audience-wide.png');
  const upload = await request(`/api/admin/albums/${album.id}/photos`, { method: 'POST', body: form });
  assert.equal(upload.status, 201);
  const result = await upload.json();
  assert.equal(result.count, 2);

  for (const photo of result.photos) {
    for (const [url, width] of [[photo.thumbnailUrl, 480], [photo.displayUrl, 1200], [photo.largeUrl, 1920]]) {
      const imageResponse = await request(url);
      assert.equal(imageResponse.status, 200);
      const metadata = await sharp(Buffer.from(await imageResponse.arrayBuffer())).metadata();
      assert.equal(metadata.format, 'webp');
      assert.equal(metadata.width, width);
      createdFilePaths.push(path.join(optimizedDirectory, path.basename(url)));
    }
    assert.equal('originalKey' in photo, false, 'upload responses do not expose private original storage keys');
  }
  const uploadedOriginals = (await fs.readdir(originalsDirectory)).filter(fileName => !originalFilesBefore.has(fileName));
  assert.equal(uploadedOriginals.length, 2, 'high-resolution source files are retained privately');
  for (const fileName of uploadedOriginals) {
    assert.equal((await request(`/uploads/originals/${fileName}`)).status, 404, 'original source files are not statically served');
  }

  const persisted = JSON.parse(await fs.readFile(storePath, 'utf8'));
  assert.ok(persisted.albums.some(item => item.id === album.id && item.photos.length === 2));
  const publish = await request(`/api/admin/albums/${album.id}`, { method: 'PATCH', body: JSON.stringify({ published: true }) });
  assert.equal(publish.status, 200);
  const publicAlbum = await request(`/api/albums/${album.id}`);
  assert.equal(publicAlbum.status, 200);
  const publicAlbumData = (await publicAlbum.json()).album;
  assert.equal(publicAlbumData.photos.length, 2);
  const publicPhoto = publicAlbumData.photos[0];
  assert.equal('originalImageUrl' in publicPhoto, false, 'public responses do not expose original source URLs');
  assert.equal('originalKey' in publicPhoto, false, 'public responses do not expose private storage keys');
  assert.equal(publicPhoto.imageUrl, publicPhoto.displayUrl, 'public imageUrl resolves to the optimized display file');

  const photoId = result.photos[0].id;
  adminCookie = '';
  assert.equal((await request(`/api/admin/albums/${album.id}/photos/${photoId}`, { method: 'DELETE' })).status, 401);
  const relogin = await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }) });
  adminCookie = relogin.headers.get('set-cookie').split(';')[0];
  assert.equal((await request(`/api/admin/albums/${album.id}/photos/${photoId}`, { method: 'DELETE' })).status, 204);
  assert.equal((await (await request(`/api/albums/${album.id}`)).json()).album.photos.length, 1);
  assert.equal((await request(`/api/admin/albums/${album.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await request(`/api/albums/${album.id}`)).status, 404);
});