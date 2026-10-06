import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.join(__dirname, '../../uploads');
const originalsDirectory = path.join(uploadsDirectory, 'originals');
const optimizedDirectory = path.join(uploadsDirectory, 'optimized');
const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif', 'image/tiff']);
const fileExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/tiff': '.tiff'
};

await Promise.all([fs.mkdir(originalsDirectory, { recursive: true }), fs.mkdir(optimizedDirectory, { recursive: true })]);

const diskUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, originalsDirectory),
    filename: (_req, file, callback) => callback(null, `photo-${randomUUID()}${fileExtensions[file.mimetype] || '.bin'}`)
  }),
  limits: { fileSize: 30 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, callback) => {
    if (!acceptedMimeTypes.has(file.mimetype)) return callback(new Error('Use JPEG, PNG, WebP, AVIF, HEIC, or TIFF images.'));
    callback(null, true);
  }
});

export const receivePhotoUploads = diskUpload.array('images', 20);

export function uploadErrorMessage(error) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') return 'Each image must be 30 MB or smaller.';
    return 'Upload up to 20 images at a time.';
  }
  return error.message || 'Could not process the upload.';
}

export async function processUploadedPhoto(file) {
  const variantFiles = [
    { width: 480, suffix: 'thumb', quality: 78 },
    { width: 1200, suffix: 'display', quality: 82 },
    { width: 1920, suffix: 'large', quality: 85 }
  ];
  const generatedPaths = [];

  try {
    const metadata = await sharp(file.path, { limitInputPixels: 100_000_000 }).metadata();
    if (!metadata.width || !metadata.height || !['jpeg', 'png', 'webp', 'avif', 'heif', 'tiff', 'gif'].includes(metadata.format)) {
      throw new Error('One or more files are not supported image files.');
    }

    const baseName = path.parse(file.filename).name;
    const urls = {};
    for (const variant of variantFiles) {
      const outputPath = path.join(optimizedDirectory, `${baseName}-${variant.suffix}.webp`);
      generatedPaths.push(outputPath);
      await sharp(file.path, { limitInputPixels: 100_000_000 })
        .rotate()
        .resize({ width: variant.width, height: variant.width, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: variant.quality, effort: 4 })
        .toFile(outputPath);
      urls[variant.suffix] = `/uploads/${path.basename(outputPath)}`;
    }

    return {
      id: randomUUID(),
      title: path.parse(file.originalname).name.slice(0, 180),
      description: '',
      category: 'Events',
      date: '',
      venue: '',
      photographer: '',
      imageUrl: urls.display,
      originalKey: file.filename,
      thumbnailUrl: urls.thumb,
      displayUrl: urls.display,
      largeUrl: urls.large,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: `${metadata.width}/${metadata.height}`,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    await Promise.all([file.path, ...generatedPaths].map(filePath => fs.rm(filePath, { force: true })));
    throw error;
  }
}

export async function removeUploadedFiles(files = []) {
  await Promise.all(files.map(file => fs.rm(file.path, { force: true })));
}

export async function removePhotoAssets(photoOrAlbum) {
  const photos = photoOrAlbum.photos || [photoOrAlbum];
  const urls = photos.flatMap(photo => [photo.imageUrl, photo.thumbnailUrl, photo.displayUrl, photo.largeUrl]);
  const optimizedFiles = urls.filter(url => typeof url === 'string' && url.startsWith('/uploads/'))
    .map(url => fs.rm(path.join(optimizedDirectory, path.basename(url)), { force: true }));
  const originalFiles = photos.filter(photo => photo.originalKey)
    .map(photo => fs.rm(path.join(originalsDirectory, path.basename(photo.originalKey)), { force: true }));
  await Promise.all([...optimizedFiles, ...originalFiles]);
}

export function mountImageStorage(app) {
  app.use('/uploads', express.static(optimizedDirectory, { maxAge: '1y', immutable: true }));
}