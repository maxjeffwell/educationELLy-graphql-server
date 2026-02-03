import jwt from 'jsonwebtoken';
import { AuthenticationError } from './errors';

/**
 * Authentication Service
 * Handles JWT token operations and authentication logic
 */
class AuthService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.tokenExpiry = process.env.JWT_EXPIRY || '1d';
  }

  /**
   * Create a JWT token for a user
   * @param {Object} user - User object with _id and email
   * @returns {string} JWT token
   */
  createToken(user) {
    if (!this.secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const { _id, email } = user;
    return jwt.sign(
      { id: _id.toString(), email },
      this.secret,
      { expiresIn: this.tokenExpiry }
    );
  }

  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   * @throws {AuthenticationError} If token is invalid or expired
   */
  verifyToken(token) {
    if (!this.secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Your session has expired. Please sign in again.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid authentication token.');
      }
      throw new AuthenticationError('Authentication failed.');
    }
  }

  /**
   * Decode a token without verification (for debugging)
   * @param {string} token - JWT token to decode
   * @returns {Object|null} Decoded payload or null
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }

  /**
   * Check if a token is expired
   * @param {string} token - JWT token to check
   * @returns {boolean} True if expired
   */
  isTokenExpired(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
