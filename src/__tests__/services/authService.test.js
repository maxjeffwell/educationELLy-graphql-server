import jwt from 'jsonwebtoken';
import { authService } from '../../services/authService';
import { AuthenticationError } from '../../services/errors';

describe('AuthService', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
  };

  beforeAll(() => {
    // Ensure JWT_SECRET is set for tests
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  describe('createToken', () => {
    it('should create a valid JWT token', () => {
      const token = authService.createToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = jwt.decode(token);
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should include expiration in token', () => {
      const token = authService.createToken(mockUser);
      const decoded = jwt.decode(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = authService.createToken(mockUser);
      const decoded = authService.verifyToken(token);

      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should throw AuthenticationError for invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for expired token', async () => {
      // Create a token with very short expiry
      const shortLivedToken = jwt.sign(
        { id: mockUser._id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );

      // Wait for it to expire
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(() => {
        authService.verifyToken(shortLivedToken);
      }).toThrow(AuthenticationError);
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const token = authService.createToken(mockUser);
      const decoded = authService.decodeToken(token);

      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should return null for invalid token', () => {
      const result = authService.decodeToken('not-a-token');

      expect(result).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const token = authService.createToken(mockUser);
      const isExpired = authService.isTokenExpired(token);

      expect(isExpired).toBe(false);
    });

    it('should return true for expired token', () => {
      const expiredToken = jwt.sign(
        { id: mockUser._id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const isExpired = authService.isTokenExpired(expiredToken);

      expect(isExpired).toBe(true);
    });

    it('should return true for invalid token', () => {
      const isExpired = authService.isTokenExpired('invalid');

      expect(isExpired).toBe(true);
    });
  });
});
