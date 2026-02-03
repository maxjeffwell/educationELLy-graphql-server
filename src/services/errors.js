/**
 * Custom error classes for service layer
 * These are converted to GraphQL errors by resolvers
 */

// Base service error
export class ServiceError extends Error {
  constructor(message, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

// Validation error (bad user input)
export class ValidationError extends ServiceError {
  constructor(message) {
    super(message, 'BAD_USER_INPUT');
    this.name = 'ValidationError';
  }
}

// Not found error
export class NotFoundError extends ServiceError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Authentication error
export class AuthenticationError extends ServiceError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED');
    this.name = 'AuthenticationError';
  }
}

// Authorization error
export class ForbiddenError extends ServiceError {
  constructor(message = 'Access denied') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

// Duplicate resource error
export class DuplicateError extends ServiceError {
  constructor(message = 'Resource already exists') {
    super(message, 'BAD_USER_INPUT');
    this.name = 'DuplicateError';
  }
}

/**
 * Convert Mongoose errors to service errors
 */
export const handleMongooseError = (error) => {
  // Validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
      .map((e) => e.message)
      .join('. ');
    throw new ValidationError(messages);
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    throw new ValidationError('Invalid ID format');
  }

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    throw new DuplicateError(`A record with this ${field} already exists`);
  }

  // Re-throw unknown errors
  throw error;
};
