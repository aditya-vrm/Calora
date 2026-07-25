import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'calora_default_secret_key_123';

/**
 * Verifies the JWT session token from request cookies.
 * Awaits the Next.js 15/16 cookies() storage and parses it.
 * @returns {Promise<string|null>} The verified userId, or null if invalid.
 */
export async function getSessionUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error('Authentication helper error:', error.message);
    return null;
  }
}
