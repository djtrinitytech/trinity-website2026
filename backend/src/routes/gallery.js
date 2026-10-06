import express from 'express';
import { clearAdminSession, createAdminSession, hasAdminSession, requireAdmin, validateAdminCredentials } from '../auth.js';
import { createAlbumRecord, getGallery, mutateGallery } from '../data/galleryStore.js';
import { processUploadedPhoto, receivePhotoUploads, removePhotoAssets, removeUploadedFiles, uploadErrorMessage } from '../storage/localImageStorage.js';

const router = express.Router();
const loginAttempts = new Map();

function publicPhoto(photo) {
  const { originalImageUrl, originalKey, imageUrl, ...photoDetails } = photo;
  return { ...photoDetails, imageUrl: photo.displayUrl || photo.thumbnailUrl || imageUrl };
}

function publicAlbum(album) {
  const { photos, ...details } = album;
  const visiblePhotos = photos.map(publicPhoto);
  return { ...details, photoCount: photos.length, coverPhoto: visiblePhotos[0] || null, photos: visiblePhotos };
}

router.post('/admin/login', (req, res) => {
  const key = req.ip || 'unknown';
  const attempt = loginAttempts.get(key) || { count: 0, resetAt: Date.now() + 15 * 60 * 1000 };
  if (attempt.resetAt <= Date.now()) {
    attempt.count = 0;
    attempt.resetAt = Date.now() + 15 * 60 * 1000;
  }
  if (attempt.count >= 8) return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
  attempt.count += 1;
  loginAttempts.set(key, attempt);

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin credentials are not configured on the server.' });
  }
  if (!validateAdminCredentials(req.body?.username, req.body?.password)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  loginAttempts.delete(key);
  createAdminSession(res);
  res.json({ authenticated: true });
});

router.get('/admin/session', (req, res) => res.json({ authenticated: hasAdminSession(req) }));
router.post('/admin/logout', (req, res) => {
  clearAdminSession(req, res);
  res.status(204).end();
});

router.get('/albums', async (_req, res, next) => {
  try {
    const { albums } = await getGallery();
    res.json({ albums: albums.filter(album => album.published).map(publicAlbum) });
  } catch (error) {
    next(error);
  }
});

router.get('/albums/:albumId', async (req, res, next) => {
  try {
    const { albums } = await getGallery();
    const album = albums.find(item => item.id === req.params.albumId && item.published);
    if (!album) return res.status(404).json({ error: 'Album not found.' });
    res.json({ album: publicAlbum(album) });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const { albums } = await getGallery();
    const categories = [...new Set(albums.filter(album => album.published).flatMap(album => album.photos.map(photo => photo.category)))];
    res.json({ categories: categories.map(name => ({ name })) });
  } catch (error) {
    next(error);
  }
});

router.get('/artifacts', async (_req, res, next) => {
  try {
    const { albums } = await getGallery();
    const artifacts = albums.filter(album => album.published).flatMap(album => album.photos.map(photo => ({ ...photo, albumId: album.id, eventName: album.title })));
    res.json({ count: artifacts.length, artifacts });
  } catch (error) {
    next(error);
  }
});

router.get('/artifacts/:photoId', async (req, res, next) => {
  try {
    const { albums } = await getGallery();
    const photo = albums.filter(album => album.published).flatMap(album => album.photos).find(item => item.id === req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found.' });
    res.json(photo);
  } catch (error) {
    next(error);
  }
});

router.use('/admin', requireAdmin);

router.get('/admin/albums', async (_req, res, next) => {
  try {
    const { albums } = await getGallery();
    res.json({ albums: albums.map(publicAlbum) });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/albums', async (req, res, next) => {
  try {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
    if (!title || title.length > 160) return res.status(400).json({ error: 'Album title is required and must be 160 characters or fewer.' });
    if (description.length > 2000) return res.status(400).json({ error: 'Album description must be 2000 characters or fewer.' });
    const album = createAlbumRecord({ title, description, published: req.body?.published === true });
    await mutateGallery(gallery => gallery.albums.unshift(album));
    res.status(201).json({ album: publicAlbum(album) });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/albums/:albumId', async (req, res, next) => {
  try {
    const updated = await mutateGallery(gallery => {
      const album = gallery.albums.find(item => item.id === req.params.albumId);
      if (!album) return null;
      if (typeof req.body?.title === 'string') {
        const title = req.body.title.trim();
        if (!title || title.length > 160) return { error: 'Album title is required and must be 160 characters or fewer.' };
        album.title = title;
      }
      if (typeof req.body?.description === 'string') album.description = req.body.description.slice(0, 2000);
      if (typeof req.body?.published === 'boolean') album.published = req.body.published;
      return album;
    });
    if (!updated) return res.status(404).json({ error: 'Album not found.' });
    if (updated.error) return res.status(400).json({ error: updated.error });
    res.json({ album: publicAlbum(updated) });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/albums/:albumId', async (req, res, next) => {
  try {
    const album = await mutateGallery(gallery => {
      const index = gallery.albums.findIndex(item => item.id === req.params.albumId);
      return index < 0 ? null : gallery.albums.splice(index, 1)[0];
    });
    if (!album) return res.status(404).json({ error: 'Album not found.' });
    await removePhotoAssets(album);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post('/admin/albums/:albumId/photos', (req, res, next) => {
  receivePhotoUploads(req, res, error => {
    if (error) return res.status(400).json({ error: uploadErrorMessage(error) });
    next();
  });
}, async (req, res, next) => {
  const uploadedFiles = req.files || [];
  const photos = [];
  try {
    if (!uploadedFiles.length) return res.status(400).json({ error: 'Select at least one image.' });
    const gallery = await getGallery();
    if (!gallery.albums.some(album => album.id === req.params.albumId)) {
      await removeUploadedFiles(uploadedFiles);
      return res.status(404).json({ error: 'Album not found.' });
    }

    for (const file of uploadedFiles) photos.push(await processUploadedPhoto(file));

    const updated = await mutateGallery(store => {
      const album = store.albums.find(item => item.id === req.params.albumId);
      if (!album) return false;
      album.photos.push(...photos);
      return true;
    });
    if (!updated) {
      await Promise.all([removeUploadedFiles(uploadedFiles), ...photos.map(removePhotoAssets)]);
      return res.status(404).json({ error: 'Album not found.' });
    }
    res.status(201).json({ photos: photos.map(publicPhoto), count: photos.length });
  } catch (error) {
    await Promise.all([removeUploadedFiles(uploadedFiles), ...photos.map(removePhotoAssets)]);
    if (error.message?.includes('pixel limit')) return res.status(400).json({ error: 'Image dimensions exceed the supported limit.' });
    if (error.message?.includes('Input file')) return res.status(400).json({ error: 'One or more files could not be decoded as images.' });
    next(error);
  }
});

router.delete('/admin/albums/:albumId/photos/:photoId', async (req, res, next) => {
  try {
    const photo = await mutateGallery(gallery => {
      const album = gallery.albums.find(item => item.id === req.params.albumId);
      if (!album) return null;
      const index = album.photos.findIndex(item => item.id === req.params.photoId);
      return index < 0 ? null : album.photos.splice(index, 1)[0];
    });
    if (!photo) return res.status(404).json({ error: 'Photo not found.' });
    await removePhotoAssets(photo);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;