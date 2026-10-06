import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'node:url';
import galleryRouter from './routes/gallery.js';
import { mountImageStorage } from './storage/localImageStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || false,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// The local adapter can be replaced when image storage moves to an object store.
mountImageStorage(app);

// Mount routes
app.use('/api', galleryRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    sanctum: 'Anugatha Civilizational Archive API',
    timestamp: new Date().toISOString()
  });
});

app.use((err, _req, res, _next) => {
  console.error('Request failed:', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  app.listen(PORT, () => {
    console.log(`Anugatha Gallery API running at http://localhost:${PORT}`);
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.warn('Admin login is disabled until ADMIN_USERNAME and ADMIN_PASSWORD are configured.');
    }
  });
}

export default app;
