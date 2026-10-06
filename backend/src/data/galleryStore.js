import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = process.env.GALLERY_DATA_PATH || path.join(__dirname, 'gallery.json');
const seedPath = path.join(__dirname, 'seedData.json');
let loadedGallery;
let mutationQueue = Promise.resolve();

function albumsFromSeed(photos) {
  const albumMap = new Map();
  for (const photo of photos) {
    const key = photo.eventName || photo.title || photo.id;
    let album = albumMap.get(key);
    if (!album) {
      album = {
        id: `album-${photo.id}`,
        title: photo.eventName || photo.title,
        description: photo.description || '',
        published: true,
        createdAt: new Date(0).toISOString(),
        photos: []
      };
      albumMap.set(key, album);
    }
    album.photos.push({
      id: photo.id || randomUUID(),
      title: photo.title || photo.eventName,
      description: photo.description || '',
      category: photo.category || 'Events',
      date: photo.date || '',
      venue: photo.venue || '',
      photographer: photo.photographer || '',
      imageUrl: photo.imageUrl,
      originalImageUrl: photo.originalImageUrl || photo.imageUrl,
      thumbnailUrl: photo.thumbnailUrl || '',
      displayUrl: photo.displayUrl || '',
      largeUrl: photo.largeUrl || '',
      aspectRatio: photo.aspectRatio || '4/3',
      createdAt: photo.createdAt || new Date(0).toISOString()
    });
  }
  return [...albumMap.values()];
}

async function loadGallery() {
  if (loadedGallery) return loadedGallery;
  try {
    loadedGallery = JSON.parse(await fs.readFile(storePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const seedPhotos = JSON.parse(await fs.readFile(seedPath, 'utf8'));
    loadedGallery = { albums: albumsFromSeed(seedPhotos) };
    await persistGallery(loadedGallery);
  }
  if (!Array.isArray(loadedGallery.albums)) loadedGallery = { albums: [] };
  return loadedGallery;
}

async function persistGallery(gallery) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const tempPath = `${storePath}.${process.pid}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(gallery, null, 2), { mode: 0o600 });
  await fs.rename(tempPath, storePath);
}

export async function getGallery() {
  const gallery = await loadGallery();
  return structuredClone(gallery);
}

export async function mutateGallery(mutator) {
  const operation = mutationQueue.then(async () => {
    const gallery = await loadGallery();
    const result = await mutator(gallery);
    await persistGallery(gallery);
    return structuredClone(result);
  });
  mutationQueue = operation.catch(() => {});
  return operation;
}

export function createAlbumRecord({ title, description, published = false }) {
  return {
    id: randomUUID(),
    title: title.trim(),
    description: description.trim(),
    published: Boolean(published),
    createdAt: new Date().toISOString(),
    photos: []
  };
}