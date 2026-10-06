import { randomBytes, timingSafeEqual } from 'node:crypto';

const sessions = new Map();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const COOKIE_NAME = 'anugatha_admin';

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateAdminCredentials(username, password) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function createAdminSession(res) {
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  const sameSite = ['Strict', 'Lax', 'None'].includes(process.env.ADMIN_COOKIE_SAME_SITE) ? process.env.ADMIN_COOKIE_SAME_SITE : 'Strict';
  const secure = process.env.NODE_ENV === 'production' || sameSite === 'None' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

export function clearAdminSession(req, res) {
  const token = getSessionToken(req);
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

function getSessionToken(req) {
  const cookies = (req.headers.cookie || '').split(';');
  const sessionCookie = cookies.map(cookie => cookie.trim()).find(cookie => cookie.startsWith(`${COOKIE_NAME}=`));
  return sessionCookie?.slice(COOKIE_NAME.length + 1);
}

export function hasAdminSession(req) {
  const token = getSessionToken(req);
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt || expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function requireAdmin(req, res, next) {
  if (!hasAdminSession(req)) return res.status(401).json({ error: 'Admin authentication required.' });
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    const expectedOrigin = process.env.FRONTEND_ORIGIN || `${req.protocol}://${req.get('host')}`;
    if (origin && origin !== expectedOrigin) return res.status(403).json({ error: 'Request origin is not allowed.' });
  }
  next();
}