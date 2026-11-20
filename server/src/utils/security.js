import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'teachspace_dev_jwt_secret_change_in_prod';
const CSRF_SECRET = process.env.CSRF_SECRET || 'teachspace_dev_csrf_secret_change_in_prod';

export function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function generateCsrfToken() {
  const nonce = crypto.randomBytes(24).toString('hex');
  const sig = crypto.createHmac('sha256', CSRF_SECRET).update(nonce).digest('hex');
  return `${nonce}.${sig}`;
}

export function verifyCsrfToken(token) {
  if (!token || !token.includes('.')) return false;
  const [nonce, sig] = token.split('.');
  if (!nonce || !sig) return false;
  const expected = crypto.createHmac('sha256', CSRF_SECRET).update(nonce).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function extractRequestToken(req) {
  if (req.cookies?.ts_token) return req.cookies.ts_token;
  const authHeader = req.headers.authorization;
  const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (raw && raw.startsWith('Bearer ')) {
    const token = raw.slice(7).trim();
    if (token) return token;
  }
  return undefined;
}

export function getCookieOptions(req) {
  const isProd = process.env.NODE_ENV === 'production';
  const proto = req.headers['x-forwarded-proto'];
  const protoStr = Array.isArray(proto) ? proto[0] : proto || '';
  const origin = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin || '';
  const referer = Array.isArray(req.headers.referer) ? req.headers.referer[0] : req.headers.referer || '';
  const isHttps = Boolean(
    req.secure ||
      protoStr.toLowerCase().includes('https') ||
      origin.startsWith('https://') ||
      referer.startsWith('https://')
  );
  return {
    httpOnly: true,
    secure: isProd || isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
