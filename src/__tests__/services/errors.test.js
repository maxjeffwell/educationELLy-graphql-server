import {
  ServiceError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  ForbiddenError,
  DuplicateError,
  handleMongooseError,
} from '../../services/errors';

describe('Service Errors', () => {
  describe('ServiceError', () => {
    it('should create error with message and default code', () => {
      const error = new ServiceError('Something went wrong');

      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.name).toBe('ServiceError');
      expect(error instanceof Error).toBe(true);
    });

    it('should accept custom error code', () => {
      const error = new ServiceError('Custom error', 'CUSTOM_CODE');

      expect(error.code).toBe('CUSTOM_CODE');
    });
  });

  describe('ValidationError', () => {
    it('should create error with BAD_USER_INPUT code', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('BAD_USER_INPUT');
      expect(error.name).toBe('ValidationError');
      expect(error instanceof ServiceError).toBe(true);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with NOT_FOUND code', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });

    it('should use default message', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
    });
  });

  describe('AuthenticationError', () => {
    it('should create error with UNAUTHENTICATED code', () => {
      const error = new AuthenticationError('Please sign in');

      expect(error.message).toBe('Please sign in');
      expect(error.code).toBe('UNAUTHENTICATED');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should use default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication required');
    });
  });

  describe('ForbiddenError', () => {
    it('should create error with FORBIDDEN code', () => {
      const error = new ForbiddenError('Not allowed');

      expect(error.message).toBe('Not allowed');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.name).toBe('ForbiddenError');
    });

    it('should use default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Access denied');
    });
  });

  describe('DuplicateError', () => {
    it('should create error with BAD_USER_INPUT code', () => {
      const error = new DuplicateError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.code).toBe('BAD_USER_INPUT');
      expect(error.name).toBe('DuplicateError');
    });

    it('should use default message', () => {
      const error = new DuplicateError();

      expect(error.message).toBe('Resource already exists');
    });
  });

  describe('handleMongooseError', () => {
    it('should convert ValidationError to service ValidationError', () => {
      const mongooseError = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' },
        },
      };

      expect(() => handleMongooseError(mongooseError)).toThrow(ValidationError);
      expect(() => handleMongooseError(mongooseError)).toThrow(
        'Email is required. Password is required'
      );
    });

    it('should convert CastError to service ValidationError', () => {
      const castError = {
        name: 'CastError',
        message: 'Cast to ObjectId failed',
      };

      expect(() => handleMongooseError(castError)).toThrow(ValidationError);
      expect(() => handleMongooseError(castError)).toThrow('Invalid ID format');
    });

    it('should convert duplicate key error to DuplicateError', () => {
      const duplicateError = {
        code: 11000,
        keyPattern: { email: 1 },
      };

      expect(() => handleMongooseError(duplicateError)).toThrow(DuplicateError);
      expect(() => handleMongooseError(duplicateError)).toThrow('email');
    });

    it('should re-throw unknown errors', () => {
      const unknownError = new Error('Unknown error');

      expect(() => handleMongooseError(unknownError)).toThrow('Unknown error');
    });
  });
});
