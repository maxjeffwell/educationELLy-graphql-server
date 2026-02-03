import { GraphQLError } from 'graphql';
import { ServiceError } from '../services/errors';

/**
 * Convert a service error to a GraphQL error
 * @param {Error} error - Error to convert
 * @returns {GraphQLError} GraphQL error
 */
export const toGraphQLError = (error) => {
  if (error instanceof GraphQLError) {
    return error;
  }

  if (error instanceof ServiceError) {
    return new GraphQLError(error.message, {
      extensions: { code: error.code },
    });
  }

  // Unknown error - log and return generic message in production
  console.error('Unexpected error:', error);

  if (process.env.NODE_ENV === 'production') {
    return new GraphQLError('An unexpected error occurred', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }

  return new GraphQLError(error.message, {
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  });
};

/**
 * Wrap an async resolver function to automatically convert service errors
 * @param {Function} fn - Resolver function
 * @returns {Function} Wrapped resolver
 */
export const withErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw toGraphQLError(error);
    }
  };
};

export default { toGraphQLError, withErrorHandling };
