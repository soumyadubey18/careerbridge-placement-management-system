import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { db, DBUser } from './db';
import { Role } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'northstar-careerbridge-secret-2026';

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

// Sign JWT using HMAC-SHA256
export function signToken(user: DBUser): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + 60 * 60 * 24 * 7, // 7 days
  };
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payloadEncoded}`)
    .digest('base64url');

  return `${header}.${payloadEncoded}.${signature}`;
}

// Verify JWT
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;
    const decoded: TokenPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}

// Express Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: DBUser;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no token, check if there's a fallback query or header, otherwise return 401
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  const user = db.findUserById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  req.user = user;
  next();
}
